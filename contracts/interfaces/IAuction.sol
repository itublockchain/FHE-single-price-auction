// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IAuction {
    event BidSubmitted(uint256 indexed bidId, address indexed bidder, uint256 timestamp);
    event AuctionFinalized();

    function submitBid(
        einput encPrice,
        bytes calldata priceProof,
        einput encAmount,
        bytes calldata amountProof
    ) external returns (uint256 bidId);

    function finalizeAuction() external;

//     function getBid(uint256 bidId) external view returns (
//         address bidder,
//         uint64 pricePerToken,
//         uint64 amount,
//         uint256 timestamp,
//         bool isRevealed
//     );
    
//     function getTotalBids() external view returns (uint256);
    
//     function getBidderBid(address bidder) external view returns (uint256 bidId, bool exists);
}
