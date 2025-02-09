// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";
import { SepoliaZamaFHEVMConfig } from "fhevm/config/ZamaFHEVMConfig.sol";
import { SepoliaZamaGatewayConfig } from "fhevm/config/ZamaGatewayConfig.sol";
import "fhevm/gateway/GatewayCaller.sol";
import { ConfidentialWETH } from "./AuctionFactory.sol";


contract Auction is SepoliaZamaFHEVMConfig, SepoliaZamaGatewayConfig, GatewayCaller {

    string public title;
    string public desc;
    uint256 public immutable startTime;
    uint256 public immutable endTime;
    uint64 public immutable supply;
    address public immutable seller;
    bool public isAvailable;
    ConfidentialWETH public sellingToken;
    ConfidentialWETH public paymentToken;

    struct Bid {
        address bidder;
        euint64 e_pricePerToken;
        euint64 e_amount;
        uint256 timestamp;
    }

    mapping(uint256 => Bid) public bids;
    uint256[] public bidIds; 
    mapping(address => bool) public hasBid;
    uint256 public counter; 
    bool decValue;
    uint64 decInt; 

    constructor(
        string memory _title,
        string memory _desc,
        uint256 _auctionDuration,
        uint64 _supply,
        address _seller,
        address _tokenAddress,
        address payable _paymentToken
    ) {
        require(_seller != address(0), "Invalid seller");
        require(_auctionDuration >= 1 hours, "Time is too short");
        require(_supply > 0, "Invalid token amount");
        require(_tokenAddress != address(0), "Invalid token address");
        require(_paymentToken != address(0), "Invalid WETH address");

        title = _title;
        desc = _desc;
        startTime = block.timestamp;
        endTime = block.timestamp + _auctionDuration;
        supply = _supply;
        seller = _seller;
        sellingToken = ConfidentialWETH(_tokenAddress);
        paymentToken = ConfidentialWETH(_paymentToken);
        isAvailable = true;
        counter = 0;
    }

    event BidSubmitted(uint256 indexed bidId, address indexed bidder, uint256 timestamp);
    event AuctionFinalized();

    function submitBid(
        einput encPrice,
        bytes calldata priceProof,
        einput encAmount,
        bytes calldata amountProof
    ) external payable returns(uint256 bidId) {
        require(isAvailable, "Auction is not available");
        require(block.timestamp >= startTime, "Auction not started");
        require(block.timestamp < endTime, "Auction ended");
        require(!hasBid[msg.sender], "You have already a bid");
    
        euint64 price = TFHE.asEuint64(encPrice, priceProof);
        euint64 amount = TFHE.asEuint64(encAmount, amountProof);
        require(TFHE.isSenderAllowed(price), "Unauthorized access");
        require(TFHE.isSenderAllowed(amount), "Unauthorized access");
        require(TFHE.isInitialized(price), "Price not encrypted properly!");
        require(TFHE.isInitialized(amount), "Amount not encrypted properly!");
        
        ebool isValidPrice = TFHE.gt(price, TFHE.asEuint64(0));
        TFHE.allowThis(isValidPrice);
        requestBool(isValidPrice);
        require(decValue, "Invalid price");
        ebool isValidAmount = TFHE.gt(amount, TFHE.asEuint64(0));
        TFHE.allowThis(isValidAmount);
        requestBool(isValidAmount);
        require(decValue, "Invalid amount");

        euint64 totalLocked = TFHE.mul(price, amount);
        TFHE.allowThis(totalLocked);
        bool isLockDone = paymentToken.transferFrom(msg.sender, address(this), totalLocked);  
        require(isLockDone, "Locked is not done");

        bidId = counter;
        bids[bidId] = Bid(
            msg.sender,
            price,
            amount,
            block.timestamp
        );
        TFHE.allowThis(bids[bidId].e_pricePerToken);
        TFHE.allowThis(bids[bidId].e_amount);
        
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

    function finalizeAuction() external payable {
        require(block.timestamp >= endTime, "Auction still active");
        require(isAvailable, "Auction is already finalized");

        if(bidIds.length == 0) {
            emit AuctionFinalized();
            return;
        }

        euint64 e_totalAllocated = TFHE.asEuint64(0);
        euint64 e_supply = TFHE.asEuint64(supply);
        euint64 e_minPrice = TFHE.asEuint64(0);
        uint64 minPrice;
        uint256 index;
        
        for(uint256 i = 0; i < bidIds.length; i++) {
            Bid storage currentBid = bids[bidIds[i]];
            e_totalAllocated = TFHE.add(e_totalAllocated, currentBid.e_amount);
            
            e_minPrice = currentBid.e_pricePerToken;
            TFHE.allowThis(e_minPrice);

            ebool isDone = TFHE.ge(e_totalAllocated, e_supply);
            TFHE.allowThis(isDone);            
            requestBool(isDone);

            if(decValue) {
                euint64 e_excess = TFHE.sub(e_totalAllocated, e_supply);
                TFHE.allowThis(e_excess);
                currentBid.e_amount = TFHE.sub(currentBid.e_amount, e_excess);
                TFHE.allowThis(currentBid.e_amount);
                euint64 sendingAmount = TFHE.mul(currentBid.e_pricePerToken, e_excess);
                paymentToken.transfer(currentBid.bidder, sendingAmount);
                index = i;
                break;
            } 

        requestInt(e_minPrice);
        minPrice = decInt;
        }

        for(uint256 i = 0; i <= index; i++) {
            Bid storage currentBid = bids[bidIds[i]];
            euint64 sendingAmount = TFHE.mul(currentBid.e_pricePerToken, currentBid.e_amount);
            sellingToken.transfer(currentBid.bidder, sendingAmount);

        }

        isAvailable = false;
        emit AuctionFinalized();
    }

    function requestBool(ebool encValue) public {
        uint256[] memory cts = new uint256[](1);
        cts[0] = Gateway.toUint256(encValue);
        Gateway.requestDecryption(cts, this.callbackBool.selector, 0, block.timestamp + 100, false);
    }

    function requestInt(euint64 encValue) public {
        uint256[] memory cts = new uint256[](1);
        cts[0] = Gateway.toUint256(encValue);
        Gateway.requestDecryption(cts, this.callbackInt.selector, 0, block.timestamp + 100, false);
    }

    function callbackBool(uint256 /*requestID*/, bool decryptedInput) public onlyGateway returns (bool) {
        decValue = decryptedInput;
        return decValue;
    }

    function callbackInt(uint256, uint64 decryptedInput) public onlyGateway returns(uint64) {
        decInt = decryptedInput;
        return decInt;
    }
}
