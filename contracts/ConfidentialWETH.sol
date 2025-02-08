// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import "fhevm/gateway/GatewayCaller.sol";
import { ReentrancyGuardTransient } from "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";
import "fhevm-contracts/contracts/token/ERC20/extensions/ConfidentialERC20Mintable.sol";

/**
 * @title   ConfidentialWETH.
 * @notice  This contract allows users to wrap/unwrap trustlessly
 *          ETH (or other native tokens) to ConfidentialERC20 tokens.
 */
abstract contract ConfidentialWETH is
    ConfidentialERC20,
    IConfidentialERC20Wrapped,
    ReentrancyGuardTransient,
    GatewayCaller
{
    /// @notice Returned if ETH transfer fails.
    error ETHTransferFail();

    /// @notice Returned if the maximum decryption delay is higher than 1 day.
    error MaxDecryptionDelayTooHigh();

    /// @notice Tracks whether the account can move funds.
    mapping(address account => bool isRestricted) public isAccountRestricted;

    /// @notice Tracks the unwrap request to a unique request id.
    mapping(uint256 requestId => UnwrapRequest unwrapRequest) public unwrapRequests;

    /**
     * @notice                          Deposit/withdraw ethers (or other native tokens).
     * @dev                             The name/symbol are autogenerated.
     * @param maxDecryptionDelay_       Maximum delay for the Gateway to decrypt.
     * @dev                             Do not use a small value in production to avoid security issues if the response
     *                                  cannot be processed because the block time is higher than the delay.
     *                                  The current implementation expects the Gateway to always return a decrypted
     *                                  value within the delay specified, as long as it is sufficient enough.
     */
    constructor(
        uint256 maxDecryptionDelay_
    ) ConfidentialERC20(string(abi.encodePacked("Confidential Wrapped Ether")), string(abi.encodePacked("WETHc"))) {
        /// @dev The maximum delay is set to 1 day.
        if (maxDecryptionDelay_ > 1 days) {
            revert MaxDecryptionDelayTooHigh();
        }
    }

    /**
     * @notice  Receive function calls wrap().
     */
    receive() external payable {
        wrap();
    }

    /**
     * @notice         Unwrap ConfidentialERC20 tokens to ether (or other native tokens).
     * @param amount   Amount to unwrap.
     */
    function unwrap(uint64 amount) public virtual {
        _canTransferOrUnwrap(msg.sender);

        /// @dev Once this function is called, it becomes impossible for the sender to move any token.
        isAccountRestricted[msg.sender] = true;
        ebool canUnwrap = TFHE.le(amount, _balances[msg.sender]);

        uint256[] memory cts = new uint256[](1);
        cts[0] = Gateway.toUint256(canUnwrap);

        uint256 requestId = Gateway.requestDecryption(
            cts,
            this.callbackUnwrap.selector,
            0,
            block.timestamp + 100,
            false
        );

        unwrapRequests[requestId] = UnwrapRequest({ account: msg.sender, amount: amount });
    }

    /**
     * @notice Wrap ether (or other native token) to an encrypted format.
     */
    function wrap() public payable virtual {
        uint256 amountAdjusted = (msg.value) / (10 ** (18 - decimals()));

        if (amountAdjusted > type(uint64).max) {
            revert AmountTooHigh();
        }

        uint64 amountUint64 = uint64(amountAdjusted);

        _unsafeMint(msg.sender, amountUint64);
        _totalSupply += amountUint64;

        emit Wrap(msg.sender, amountUint64);
    }

    /**
     * @notice            Callback function for the gateway.
     * @param requestId   Request id.
     * @param canUnwrap   Whether it can be unwrapped.
     */
    function callbackUnwrap(uint256 requestId, bool canUnwrap) public virtual nonReentrant onlyGateway {
        UnwrapRequest memory unwrapRequest = unwrapRequests[requestId];

        if (canUnwrap) {
            /// @dev It does a supply adjustment.
            uint256 amountUint256 = unwrapRequest.amount * (10 ** (18 - decimals()));

            /* solhint-disable avoid-call-value*/
            /* solhint-disable avoid-low-level-calls*/
            (bool callSuccess, ) = unwrapRequest.account.call{ value: amountUint256 }("");

            if (callSuccess) {
                _unsafeBurn(unwrapRequest.account, unwrapRequest.amount);
                _totalSupply -= unwrapRequest.amount;
                emit Unwrap(unwrapRequest.account, unwrapRequest.amount);
            } else {
                emit UnwrapFailTransferFail(unwrapRequest.account, unwrapRequest.amount);
            }
        } else {
            emit UnwrapFailNotEnoughBalance(unwrapRequest.account, unwrapRequest.amount);
        }

        delete unwrapRequests[requestId];
        delete isAccountRestricted[unwrapRequest.account];
    }

    function _canTransferOrUnwrap(address account) internal virtual {
        if (isAccountRestricted[account]) {
            revert CannotTransferOrUnwrap();
        }
    }

    function _transferNoEvent(
        address from,
        address to,
        euint64 amount,
        ebool isTransferable
    ) internal virtual override {
        _canTransferOrUnwrap(from);
        super._transferNoEvent(from, to, amount, isTransferable);
    }

    function _unsafeBurn(address account, uint64 amount) internal {
        euint64 newBalanceAccount = TFHE.sub(_balances[account], amount);
        _balances[account] = newBalanceAccount;
        TFHE.allowThis(newBalanceAccount);
        TFHE.allow(newBalanceAccount, account);
        emit Transfer(account, address(0), _PLACEHOLDER);
    }
}