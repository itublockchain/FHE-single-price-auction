pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import {SepoliaZamaFHEVMConfig} from "fhevm/config/ZamaFHEVMConfig.sol";
import "./interfaces/IAuction.sol";
import "./libraries/BidSorting.sol";

contract Auction is SepoliaZamaFHEVMConfig {

    struct Bid {
        address bidder;
        euint32 pricePerToken;
        // euint32 amount
        uint32 amount;
        uint256 timestamp;
        //sonradan dataları dec ederiz belki
        bool isRevealed;
    }

    //Token adresini de buraya ekleyebilirim
    string public immutable title;
    string public immutable desc;
    uint256 public immutable startTime;
    uint256 public immutable endTime;
    uint256 public immutable supply;
    address public immutable seller;
    bool public isAvailable;


    mapping(uint256 => Bid) private bids;
    uint256[] private bidIds; 
    uint256 private counter;
    mapping(address => bool) public hasBid;

    //Yeni eventler eklenebilir
    event BidSubmitted(
        uint256 indexed bidId,
        address indexed bidder,
        uint256 timestamp
    );

    constructor(
        string _title,
        string _desc,
        uint256 _deadline,
        uint256 _supply,
        address _seller
    ) {
        require(_seller != address(0), "Invalid seller");
        require(_deadline >= 1 hours, "Time is too short");
        require(_supply > 0, "Invalid token amount");

        title = _title;
        desc = _desc;
        startTime = block.timestamp;
        endTime = block.timestamp + _deadline;
        supply = _supply;
        seller = _seller;
        isAvailable = true;
        counter = 0;
    }

    function submitBid(
        bytes calldata encPrice,
        bytes calldata priceProof
    ) external returns() {
        require(block.timestamp >= startTime, "Auction not started");
        require(block.timestamp < endTime, "Auction ended");
        require(!hasBid[msg.sender], "You have already a bid");
    
        euint32 price = TFHE.asEuint32(encPrice, priceProof);
    

        //......
    
    }
    


}