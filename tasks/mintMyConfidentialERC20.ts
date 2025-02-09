import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { AuctionFactory, ConfidentialWETH } from "../types";

task("create-auction")
  .addParam("title", "Title of the auction")
  .addParam("description", "Description of the auction")
  .addParam("deadline", "Auction deadline in seconds")
  .addParam("supply", "Token supply for the auction")
  .setAction(async function (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) {
    const { ethers, deployments } = hre;
    const factory = await deployments.get("AuctionFactory");
    const signers = await ethers.getSigners();
    const auctionFactory = (await ethers.getContractAt("AuctionFactory", factory.address)) as AuctionFactory;
    
    const tx = await auctionFactory.connect(signers[0]).createAuction(
      taskArguments.title,
      taskArguments.description,
      taskArguments.deadline,
      taskArguments.supply
    );
    
    const receipt = await tx.wait();
    const event = receipt?.logs.find(log => 
      log.topics[0] === auctionFactory.interface.getEventTopic('AuctionCreated')
    );
    
    if (event) {
      const decodedEvent = auctionFactory.interface.decodeEventLog(
        'AuctionCreated',
        event.data,
        event.topics
      );
      console.info("Auction created successfully!");
      console.info("Auction address:", decodedEvent.auctionAddress);
      console.info("Title:", decodedEvent.title);
      console.info("Description:", decodedEvent.desc);
      console.info("Start time:", new Date(Number(decodedEvent.startTime) * 1000).toLocaleString());
      console.info("End time:", new Date(Number(decodedEvent.endTime) * 1000).toLocaleString());
    }
  });

task("wrap-eth")
  .addParam("amount", "Amount of ETH to wrap (in ether)")
  .setAction(async function (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) {
    const { ethers, deployments } = hre;
    const factory = await deployments.get("AuctionFactory");
    const signers = await ethers.getSigners();
    const auctionFactory = (await ethers.getContractAt("AuctionFactory", factory.address)) as AuctionFactory;
    
    const paymentTokenAddress = await auctionFactory.paymentToken();
    const confidentialWETH = (await ethers.getContractAt("ConfidentialWETH", paymentTokenAddress)) as ConfidentialWETH;
    
    const tx = await confidentialWETH.connect(signers[0]).wrap({
      value: ethers.parseEther(taskArguments.amount)
    });
    
    const receipt = await tx.wait();
    console.info("Successfully wrapped", taskArguments.amount, "ETH to ConfidentialWETH");
    console.info("Transaction hash:", receipt?.hash);
  });
