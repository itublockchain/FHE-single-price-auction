// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "fhevm/lib/TFHE.sol";
import { SepoliaZamaFHEVMConfig } from "fhevm/config/ZamaFHEVMConfig.sol";
import { SepoliaZamaGatewayConfig } from "fhevm/config/ZamaGatewayConfig.sol";
import "fhevm/gateway/GatewayCaller.sol";
import "./interfaces/IAuction.sol";
import "./ConfidentialWETH.sol";


contract Auction is SepoliaZamaFHEVMConfig, SepoliaZamaGatewayConfig, GatewayCaller, IAuction{

    string public title;
    string public desc;
    uint256 public immutable startTime;
    uint256 public immutable endTime;
    uint256 public immutable supply;
    address public immutable seller;
    bool public isAvailable;
    IERC20 public token; //Auction factory için de güncelle bunu
    ConfidentialERC20 public paymentToken;

    struct Bid {
        address bidder;
        euint64 e_pricePerToken;
        uint64 pricePerToken;
        euint64 e_amount;
        uint64 amount;
        uint256 timestamp;
        bool isRevealed;
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
        uint256 _deadline,
        uint256 _supply,
        address _seller,
        address _tokenAddress,
        address _paymentToken
    ) {
        require(_seller != address(0), "Invalid seller");
        require(_deadline >= 1 hours, "Time is too short");
        require(_supply > 0, "Invalid token amount");
        require(_tokenAddress != address(0), "Invalid token address");
        require(_paymentToken != address(0), "Invalid WETH address");

        title = _title;
        desc = _desc;
        startTime = block.timestamp;
        endTime = block.timestamp + _deadline;
        supply = _supply;
        seller = _seller;
        token = IERC20(_tokenAddress);
        paymentToken = ConfidentialWETH(_paymentToken);
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
    
        euint64 price = TFHE.asEuint64(encPrice, priceProof);
        euint64 amount = TFHE.asEuint64(encAmount, amountProof);
        require(TFHE.isSenderAllowed(price), "Unauthorized access");
        require(TFHE.isSenderAllowed(amount), "Unauthorized access");
        require(TFHE.isInitialized(price), "Price not encrypted properly!");
        require(TFHE.isInitialized(amount), "Amount not encrypted properly!");

        //TFHE.allowThis(price); GEREK YOK SANKİ BUNLARA
        
        ebool isValidPrice = TFHE.gt(price, TFHE.asEuint64(0));
        TFHE.allowThis(isValidPrice);
        requestBool(isValidPrice);
        require(decValue, "Invalid price");
        ebool isValidAmount = TFHE.gt(amount, TFHE.asEuint64(0));
        TFHE.allowThis(isValidAmount);
        requestBool(isValidAmount);
        require(decValue, "Invalid amount");

        euint64 amount = TFHE.mul(price, amount);
        TFHE.allowThis(amount);
        isLockDone = paymentToken.transferFrom(msg.sender, address(this), amount);  
        require(isLockDone, "Locked is not done");

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

        uint64 minPrice;
        uint64 totalAllocated = 0;
        uint64 lastAmount;
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
                token.transfer(bid.bidder, lastAmount);
            }
            
            else {
                token.transfer(bid.bidder, bid.amount);
            }
        }
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

