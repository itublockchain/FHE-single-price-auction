// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IAuction {
    event BidSubmitted(uint256 indexed bidId, address indexed bidder, uint256 timestamp);

    function submitBid(
        einput encPrice,
        bytes calldata priceProof,
        einput encAmount,
        bytes calldata amountProof
    ) external returns (uint256 bidId);

    //get falan eklenebilir
}
