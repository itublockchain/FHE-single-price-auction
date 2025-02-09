import { ethers } from "hardhat";
import { Auction, AuctionFactory, AuctionToken, ConfidentialWETH } from "../../types";

export async function deployAuctionFixture() {
  const [deployer] = await ethers.getSigners();

  // Deploy AuctionFactory
  const auctionFactory = await ethers.deployContract("AuctionFactory") as AuctionFactory;
  await auctionFactory.waitForDeployment();

  // Get ConfidentialWETH address
  const wethAddress = await auctionFactory.paymentToken();
  const weth = await ethers.getContractAt("ConfidentialWETH", wethAddress) as ConfidentialWETH;

  return {
    auctionFactory,
    weth,
    deployer
  };
}

export async function createAuctionFixture() {
  const { auctionFactory, weth, deployer } = await deployAuctionFixture();

  // Create an auction
  const tx = await auctionFactory.createAuction(
    "Test Auction",
    "Test Description",
    86400, // 1 day
    1000 // supply
  );
  const receipt = await tx.wait();

  // Get the auction address from the event
  const event = receipt?.logs.find(log => 
    log.topics[0] === auctionFactory.interface.getEventTopic('AuctionCreated')
  );
  
  if (!event) {
    throw new Error("Auction creation event not found");
  }

  const decodedEvent = auctionFactory.interface.decodeEventLog(
    'AuctionCreated',
    event.data,
    event.topics
  );

  const auction = await ethers.getContractAt("Auction", decodedEvent.auctionAddress) as Auction;
  const tokenAddress = await auction.tokenAddress();
  const token = await ethers.getContractAt("AuctionToken", tokenAddress) as AuctionToken;

  return {
    auctionFactory,
    weth,
    auction,
    token,
    deployer
  };
}
