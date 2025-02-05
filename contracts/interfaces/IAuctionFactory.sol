pragma solidity ^0.8.24;

interface IAuctionFactory {
    event AuctionCreated(
        address indexed auctionAddress,
        string title,
        string desc,
        uint256 startTime,
        uint256 endTime,
        address seller
    );

    function createAuction(
        string memory title,
        string memory desc,
        uint256 deadline,
        uint256 supply
    ) external returns (address auctionAddress);

    //getauction falan filan eklenebilir
}
