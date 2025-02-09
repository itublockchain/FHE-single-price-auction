// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Auction.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "fhevm/lib/TFHE.sol";
import "fhevm/config/ZamaFHEVMConfig.sol";
import "fhevm-contracts/contracts/token/ERC20/extensions/ConfidentialERC20Mintable.sol";

//Burası confidential yapılabilir
contract AuctionToken is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        uint64 initialSupply,
        address auctionContract
    ) ERC20(name, symbol) {
        _mint(auctionContract, initialSupply);
    }
}

contract ConfidentialWETH is SepoliaZamaFHEVMConfig, ConfidentialERC20Mintable {
    /// @notice Constructor to initialize the token's name and symbol, and set up the owner
    /// @param name_ The name of the token
    /// @param symbol_ The symbol of the token
    constructor(string memory name_, string memory symbol_) ConfidentialERC20Mintable(name_, symbol_, msg.sender) {}
}

contract AuctionFactory {
    //Title aynı zamanda coin sembolü ve adı olcak
    struct AuctionStruct {
        string title;
        string desc;
        uint256 startTime;
        uint256 endTime;
        address seller;
        address contractAddress;
        address tokenAddress;
        uint256 supply;
        bool isAvailable;
    }

    //public for now
    uint256 public counter;
    mapping(uint256 => AuctionStruct) public auctions;
    address payable public paymentToken;

    constructor() {
        counter = 1;
        ConfidentialWETH paymentTokenContract = new ConfidentialWETH("Confidential Wrapped ETH", "cWETH");
        paymentToken = payable(address(paymentTokenContract));
    }

    event AuctionCreated(
        address indexed auctionAddress,
        string title,
        string desc,
        uint256 startTime,
        uint256 endTime,
        address indexed seller
    );

    function createAuction(
        string memory _title,
        string memory _desc,
        uint256 deadline,
        uint64 _supply
    ) external returns (address auctionAddress, uint256 _auctionId) {
        AuctionToken newToken = new AuctionToken(_title, _title, _supply, address(this));
        address tokenAddress = address(newToken);

        Auction newAuction = new Auction(_title, _desc, deadline, _supply, msg.sender, tokenAddress, paymentToken);

        auctionAddress = address(newAuction);
        newToken.transfer(auctionAddress, _supply);

        _auctionId = counter;
        auctions[_auctionId] = AuctionStruct(
            _title,
            _desc,
            block.timestamp,
            block.timestamp + deadline,
            msg.sender,
            auctionAddress,
            address(newToken),
            _supply,
            true
        );
        counter++;

        emit AuctionCreated(auctionAddress, _title, _desc, block.timestamp, block.timestamp + deadline, msg.sender);
    }

    function mintConfidentialToken(uint64 amount) external {
        ConfidentialWETH(paymentToken).mint(msg.sender, amount);
    }
}
