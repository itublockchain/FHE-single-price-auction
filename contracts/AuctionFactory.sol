// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Auction.sol";
import "fhevm/lib/TFHE.sol";
import "fhevm/config/ZamaFHEVMConfig.sol";
import "fhevm-contracts/contracts/token/ERC20/extensions/ConfidentialERC20Mintable.sol";

contract ConfidentialWETH is SepoliaZamaFHEVMConfig, ConfidentialERC20Mintable {
    constructor(
        string memory name_,
        string memory symbol_
    ) ConfidentialERC20Mintable(name_, symbol_, msg.sender) {}
}

contract AuctionFactory {
    struct AuctionStruct {
        string title;
        string desc;
        uint256 startTime;
        uint256 endTime;
        address seller;
        address contractAddress;
        address tokenAddress;
        uint256 supply;
        bool isAvailable;
    }

    uint256 public counter;
    mapping(uint256 => AuctionStruct) public auctions;
    address payable public paymentToken;

    event AuctionCreated(
        address indexed auctionAddress,
        string title,
        string desc,
        uint256 startTime,
        uint256 endTime,
        address indexed seller
    );

    constructor() {
        counter = 1;
        ConfidentialWETH paymentTokenContract = new ConfidentialWETH(
            "Confidential Wrapped ETH",
            "cWETH"
        );
        paymentToken = payable(address(paymentTokenContract));
    }

    function createAuction(
        string memory _title,
        string memory _desc,
        uint256 auctionDuration,
        uint64 _supply
    ) external returns (address auctionAddress, uint256 _auctionId) {
        ConfidentialWETH sellingToken = new ConfidentialWETH(
            _title,
            _title
        );
        
        Auction newAuction = new Auction(
            _title,
            _desc,
            auctionDuration,
            _supply,
            msg.sender,
            address(sellingToken),
            paymentToken
        );

        auctionAddress = address(newAuction);
        _auctionId = counter;

        sellingToken.mint(auctionAddress, _supply);

        auctions[_auctionId] = AuctionStruct({
            title: _title,
            desc: _desc,
            startTime: block.timestamp,
            endTime: block.timestamp + auctionDuration,
            seller: msg.sender,
            contractAddress: auctionAddress,
            tokenAddress: address(sellingToken),
            supply: _supply,
            isAvailable: true
        });

        emit AuctionCreated(
            auctionAddress,
            _title,
            _desc,
            block.timestamp,
            block.timestamp + auctionDuration,
            msg.sender
        );

        counter++;
    }

    function mintConfidentialToken(uint64 amount) external {
        ConfidentialWETH(paymentToken).mint(msg.sender, amount);
    }
}
