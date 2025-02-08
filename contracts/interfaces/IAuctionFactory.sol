// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IAuctionFactory {
    event AuctionCreated(
        address indexed auctionAddress,
        string title,
        string desc,
        uint256 startTime,
        uint256 endTime,
        address indexed seller
    );

    function createAuction(
        string memory title,
        string memory desc,
        uint256 deadline,
        uint256 supply
    ) external returns (address auctionAddress, uint256 auctionId);

    // function getAuction(uint256 auctionId) external view returns (
    //     string memory title,
    //     string memory desc,
    //     uint256 startTime,
    //     uint256 endTime,
    //     address seller,
    //     address contractAddress,
    //     address tokenAddress,
    //     uint256 supply,
    //     bool isAvailable
    // );
    
    // function getTotalAuctions() external view returns (uint256);
}

