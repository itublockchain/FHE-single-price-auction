pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import {SepoliaZamaFHEVMConfig} from "fhevm/config/ZamaFHEVMConfig.sol";
import "./interfaces/IAuction.sol";

contract Auction is SepoliaZamaFHEVMConfig, IAuction{

    struct Bid {
        address bidder;
        euint32 pricePerToken;
        // euint32 amount
        uint32 amount;
        uint256 timestamp;
        //sonradan dataları dec ederiz belki
        //bool isRevealed;
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
        string memory _title,
        string memory _desc,
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
        einput encPrice,
        bytes calldata priceProof,
        uint256 _amount
    ) external override returns(uint256 bidId) {
        require(isAvailable, "Auction is not available");
        require(block.timestamp >= startTime, "Auction not started");
        require(block.timestamp < endTime, "Auction ended");
        require(!hasBid[msg.sender], "You have already a bid");
    
    
        euint32 price = TFHE.asEuint32(encPrice, priceProof);
        //TFHE.allowThis(price)
    
        ebool isValidPrice = TFHE.gt(price, TFHE.asEuint32(0));
        //decrypt kısmı karışık hatalı olabilir bu
        require(TFHE.decrypt(isValidPrice), "Invalid price");

        bidId = counter;
        bids[bidId] = Bid(
            msg.sender,
            price,
            _amount,
            block.timestamp
            //false
        );
        
        //insert part 

        if(bidIds.length == 0) {
            bidIds.push(bidId);
        }

        else {
            uint256 low = 0;
            uint256 high = bidIds.length;
        
            while (low < high) {
                uint256 mid = (low + high) / 2;
            
                ebool isGreater = TFHE.gt(
                    bids[bidId].pricePerToken,
                    bids[bidIds[mid]].pricePerToken
                );
            
                if (TFHE.decrypt(isGreater)) {
                    high = mid;
                } else {
                    low = mid + 1;
                }
            }

            bidIds.push(0); 
            for (uint256 i = bidIds.length - 1; i > low; i--) {
                bidIds[i] = bidIds[i - 1];
            }
            bidIds[low] = bidId;        
        }
    
        hasBid[msg.sender] = true;
        counter++;

        emit BidSubmitted(bidId, msg.sender, block.timestamp);
    }
}