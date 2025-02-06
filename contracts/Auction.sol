// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import { SepoliaZamaFHEVMConfig } from "fhevm/config/ZamaFHEVMConfig.sol";
import { SepoliaZamaGatewayConfig } from "fhevm/config/ZamaGatewayConfig.sol";
import "fhevm/gateway/GatewayCaller.sol";
import "./interfaces/IAuction.sol";

contract Auction is SepoliaZamaFHEVMConfig, SepoliaZamaGatewayConfig, GatewayCaller, IAuction{

    struct Bid {
        address bidder;
        euint32 pricePerToken;
        // euint32 amount
        uint256 amount;
        uint256 timestamp;
        //sonradan dataları dec ederiz belki
        //bool isRevealed;
    }

    //Token adresini de buraya ekleyebilirim
    string public title;
    string public desc;
    uint256 public immutable startTime;
    uint256 public immutable endTime;
    uint256 public immutable supply;
    address public immutable seller;
    bool public isAvailable;


    mapping(uint256 => Bid) private bids;
    uint256[] private bidIds; 
    uint256 private counter;
    mapping(address => bool) public hasBid;

    bool decValue;

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

    //einput encPrice,
    //bytes calldata priceProof,
    function submitBid(
        uint32 encPrice,
        uint256 _amount
    ) external override returns(uint256 bidId) {
        require(isAvailable, "Auction is not available");
        require(block.timestamp >= startTime, "Auction not started");
        require(block.timestamp < endTime, "Auction ended");
        require(!hasBid[msg.sender], "You have already a bid");
    
        //euint32 price = TFHE.asEuint32(encPrice, priceProof);

        euint32 price = TFHE.asEuint32(encPrice);
        //require(TFHE.isInitialized(price), "Price not encrypted properly!");

        //TFHE.allowThis(price)
    
        //ebool isValidPrice = TFHE.gt(price, TFHE.asEuint32(0));
        //decrypt kısmı karışık hatalı olabilir bu
        //require(TFHE.decrypt(isValidPrice), "Invalid price");

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
                requestBool(isGreater);
                if (decValue) {
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

    function requestBool(ebool encValue) public {
        uint256[] memory cts = new uint256[](1);
        cts[0] = Gateway.toUint256(encValue);
        Gateway.requestDecryption(cts, this.myCustomCallback.selector, 0, block.timestamp + 100, false);
    }

    function myCustomCallback(uint256 /*requestID*/, bool decryptedInput) public onlyGateway returns (bool) {
        decValue = decryptedInput;
        return decValue;
    }
}

