// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Auction.sol";
import "fhevm/lib/TFHE.sol";
import "fhevm/config/ZamaFHEVMConfig.sol";
import "fhevm-contracts/contracts/token/ERC20/extensions/ConfidentialERC20Mintable.sol";

contract ConfidentialWETH is SepoliaZamaFHEVMConfig, ConfidentialERC20Mintable {
    address public factory;

    constructor(
        string memory name_,
        string memory symbol_,
        address _factory
    ) ConfidentialERC20Mintable(name_, symbol_, _factory) {
        factory = _factory;
    }

    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory can call");
        _;
    }
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
        counter = 0;
        ConfidentialWETH paymentTokenContract = new ConfidentialWETH(
            "Confidential Wrapped ETH",
            "cWETH",
            address(this)
        );
        paymentToken = payable(address(paymentTokenContract));
    }

    function createAuction(
        string memory _title,
        string memory _desc,
        uint256 auctionDuration,
        uint64 _supply
    ) external returns (address auctionAddress, uint256 _auctionId) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_supply > 0, "Supply must be greater than 0");
        require(auctionDuration >= 1 hours, "Duration too short");

        // Create selling token with unique name
        string memory tokenName = string(abi.encodePacked(_title, " Token"));
        ConfidentialWETH sellingToken = new ConfidentialWETH(
            tokenName,
            _title,
            address(this)
        );
        
        // Create auction contract
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

        // Mint tokens to auction contract
        try sellingToken.mint(auctionAddress, _supply) {
            // Update auction data only if mint is successful
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
        } catch Error(string memory reason) {
            revert(string(abi.encodePacked("Failed to mint tokens: ", reason)));
        }

        return (auctionAddress, _auctionId);
    }

    function mintConfidentialToken(uint64 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        try ConfidentialWETH(paymentToken).mint(msg.sender, amount) {
            // Mint successful
        } catch Error(string memory reason) {
            revert(string(abi.encodePacked("Failed to mint tokens: ", reason)));
        }
    }
}
