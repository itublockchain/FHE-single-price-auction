// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "fhevm/lib/TFHE.sol";
import { SepoliaZamaFHEVMConfig } from "fhevm/config/ZamaFHEVMConfig.sol";
import { SepoliaZamaGatewayConfig } from "fhevm/config/ZamaGatewayConfig.sol";
import "fhevm/gateway/GatewayCaller.sol";
import "./interfaces/IAuction.sol";


contract Auction is SepoliaZamaFHEVMConfig, SepoliaZamaGatewayConfig, GatewayCaller, IAuction{

    struct Bid {
        address bidder;
        euint32 e_pricePerToken;
        uint32 pricePerToken;
        euint32 e_amount;
        uint32 amount;
        uint256 timestamp;
        bool isRevealed;
    }

    //Token adresini de buraya ekleyebilirim
    string public title;
    string public desc;
    uint256 public immutable startTime;
    uint256 public immutable endTime;
    uint256 public immutable supply;
    address public immutable seller;
    bool public isAvailable;
    address public tokenAddress; //Auction factory için de güncelle bunu

    mapping(uint256 => Bid) public bids;
    uint256[] public bidIds; 
    mapping(address => bool) public hasBid;

    uint256 public counter; 
    mapping(uint256 => uint256) public requestToBidId;
    mapping(uint256 => bool) public isPriceRequest;

    constructor(
        string memory _title,
        string memory _desc,
        uint256 _deadline,
        uint256 _supply,
        address _seller,
        address _tokenAddress
    ) {
        require(_seller != address(0), "Invalid seller");
        require(_deadline >= 1 hours, "Time is too short");
        require(_supply > 0, "Invalid token amount");
        require(_tokenAddress != address(0), "Invalid token address");

        title = _title;
        desc = _desc;
        startTime = block.timestamp;
        endTime = block.timestamp + _deadline;
        supply = _supply;
        seller = _seller;
        tokenAddress = _tokenAddress;
        isAvailable = true;
        counter = 0;
    }

    function submitBid(
        einput encPrice,
        bytes calldata priceProof,
        einput encAmount,
        bytes calldata amountProof
    ) external payable override returns(uint256 bidId) {
        require(isAvailable, "Auction is not available");
        require(block.timestamp >= startTime, "Auction not started");
        require(block.timestamp < endTime, "Auction ended");
        require(!hasBid[msg.sender], "You have already a bid");
    
        euint32 price = TFHE.asEuint32(encPrice, priceProof);
        euint32 amount = TFHE.asEuint32(encAmount, amountProof);
        require(TFHE.isSenderAllowed(price), "Unauthorized access");
        require(TFHE.isSenderAllowed(amount), "Unauthorized access");
        require(TFHE.isInitialized(price), "Price not encrypted properly!");
        require(TFHE.isInitialized(amount), "Amount not encrypted properly!");

        //TFHE.allowThis(price); GEREK YOK SANKİ BUNLARA
        
        ebool isValidPrice = TFHE.gt(price, TFHE.asEuint32(0));
        TFHE.allowThis(isValidPrice);
        requestBool(isValidPrice);
        require(decValue, "Invalid price");
        ebool isValidAmount = TFHE.gt(amount, TFHE.asEuint32(0));
        TFHE.allowThis(isValidAmount);
        requestBool(isValidAmount);
        require(decValue, "Invalid amount");

        uint256 lockedAmount = msg.value;
        ebool isValidLock = TFHE.eq(TFHE.asEuint32(lockedAmount), TFHE.mul(price, amount));  
        TFHE.allowThis(isValidLock);
        requestBool(isValidLock);
        require(isValidLock, "Insufficient locked");

        bidId = counter;
        bids[bidId] = Bid(
            msg.sender,
            price,
            0,
            amount,
            0,
            block.timestamp,
            false
        );
        TFHE.allowThis(bids[bidId].e_pricePerToken);
        TFHE.allowThis(bids[bidId].e_amount);
        
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
                    bids[bidId].e_pricePerToken,
                    bids[bidIds[mid]].e_pricePerToken
                );
                TFHE.allowThis(isGreater);
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

    function finalizeAuction(

    ) external payable override returns() {
        require(block.timestamp >= endTime, "Auction still active");
        require(isAvailable, "Auction is already finalized");

        if(bidIds.length == 0) {
            //emit AuctionFinalized();
            return;
        }

        for(uint256 i = 0; i < bidIds.length; i++) {
            Bid storage bid = bids[bidIds[i]];
            requestInt(bid.e_pricePerToken);
            bid.pricePerToken = decInt;
            requestInt(bid.e_amount);
            bid.amount = decInt;
        }

        uint32 minPrice;
        uint32 totalAllocated = 0;
        uint32 lastAmount;
        uint256 index;
        for(uint256 i = 0; i < bidIds.length; i++) {
            Bid storage bid = bids[bidIds[i]];
            totalAllocated += bid.amount; 
            if(totalAllocated >= supply) {
                minPrice = bid.pricePerToken;
                lastAmount = bid.amount - (totalAllocated - supply);
                index = i;
                break;
            }    
        }

        for(uint256 i = 0; i <= index; i++) {
            Bid storage bid = bids[bidIds[i]];

            if(i == index) {
                IERC20(tokenAddress).transfer(bid.bidder, lastAmount);
            }
            
            else {
                IERC20(tokenAddress).transfer(bid.bidder, bid.amount);
            }
        }
    }

    //These are will be internal later
    function requestBool(ebool encValue) public {
        uint256[] memory cts = new uint256[](1);
        cts[0] = Gateway.toUint256(encValue);
        Gateway.requestDecryption(cts, this.callbackBool.selector, 0, block.timestamp + 100, false);
    }

    function requestInt(uint256 bidId) public {
        require(!bids[bidId].isRevealed, "Already revealed");
        require(block.timestamp >= endTime, "Auction is not finished");

        uint256[] memory cts = new uint256[](1);

        cts[0] = Gateway.toUint256(bids[bidId].e_pricePerToken);
        uint256 priceRequestId = Gateway.requestDecryption(cts, this.callbackInt.selector, bidId, block.timestamp + 100, false);

        requestToBidId[priceRequestId] = bidId;
        isPriceRequest[priceRequestId] = true;

        cts[0] = Gateway.toUint256(bids[bidId].e_amount);
        uint256 amountRequestId = Gateway.requestDecryption(cts, this.callbackInt.selector, bidId, block.timestamp + 100, false);

        requestToBidId[amountRequestId] = bidId;
        isPriceRequest[amountRequestId] = false;
    }

    function callbackBool(uint256 /*requestID*/, bool decryptedInput) public onlyGateway returns (bool) {
        decValue = decryptedInput;
        return decValue;
    }

    function callbackInt(uint256 requestId, uint32 decryptedInput) public onlyGateway {
        uint256 bidId = requestToBidId[requestId];
        if (isPriceRequest[requestId]) {
            bids[bidId].pricePerToken = decryptedInput;
        } else {
            bids[bidId].amount = decryptedInput;
        }

        if (bids[bidId].pricePerToken != 0 && bids[bidId].amount != 0) {
            bids[bidId].isRevealed = true;
        }
    }
}

