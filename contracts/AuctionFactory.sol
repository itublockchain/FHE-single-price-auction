// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Auction.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./interfaces/IAuctionFactory.sol";

//Burası confidential yapılabilir
contract AuctionToken is ERC20 {
    constructor(
        string memory name, 
        string memory symbol, 
        uint256 initialSupply, 
        address auctionContract
    ) ERC20(name, symbol) {
        _mint(auctionContract, initialSupply);
    }
}

contract AuctionFactory is IAuctionFactory {
    
    //Title aynı zamanda coin sembolü ve adı olcak
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
    
    //public for now
    uint256 public counter;
    mapping(uint256 => AuctionStruct) public auctions;   
    
    constructor() {
        counter = 1;
    }

    function createAuction(
        string memory _title,
        string memory _desc,
        uint256 deadline,
        uint256 _supply
    ) external override returns (address auctionAddress, uint256 _auctionId) {
        Auction newAuction = new Auction(
            _title,
            _desc,
            deadline,
            _supply,
            msg.sender
        );

        auctionAddress = address(newAuction);  

        AuctionToken newToken = new AuctionToken(_title, _title, _supply, auctionAddress);

        _auctionId = counter;
        auctions[_auctionId] = AuctionStruct(
            _title,
            _desc,
            block.timestamp,
            block.timestamp + deadline,
            msg.sender,
            auctionAddress,
            address(newToken),
            _supply,
            true
        );
        counter++;

        emit AuctionCreated(
            auctionAddress,
            _title, 
            _desc, 
            block.timestamp, 
            block.timestamp + deadline,
            msg.sender
        );
    }
}