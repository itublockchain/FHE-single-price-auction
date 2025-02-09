import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { AuctionFactory, ConfidentialWETH } from "../types";

task("create-auction")
  .addParam("title", "Title of the auction")
  .addParam("desc", "Description of the auction")
  .addParam("deadline", "Auction deadline in hours")
  .addParam("supply", "Token supply for the auction")
  .setAction(async function (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) {
    const { ethers, deployments } = hre;
    const factory = await deployments.get("AuctionFactory");
    const signers = await ethers.getSigners();
    const auctionFactory = (await ethers.getContractAt("AuctionFactory", factory.address)) as AuctionFactory;
    
    const tx = await auctionFactory.connect(signers[0]).createAuction(
      taskArguments.title,
      taskArguments.desc,
      Number(taskArguments.deadline) * 3600, // Convert hours to seconds
      BigInt(taskArguments.supply)
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
      console.info("Seller:", decodedEvent.seller);
    }
  });

task("mint-confidential-weth")
  .addParam("amount", "Amount of tokens to mint")
  .setAction(async function (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) {
    const { ethers, deployments } = hre;
    const factory = await deployments.get("AuctionFactory");
    const signers = await ethers.getSigners();
    const auctionFactory = (await ethers.getContractAt("AuctionFactory", factory.address)) as AuctionFactory;
    
    try {
      const tx = await auctionFactory.connect(signers[0]).mintConfidentialToken(BigInt(taskArguments.amount));
      const receipt = await tx.wait();
      console.info("Successfully minted", taskArguments.amount, "Confidential WETH tokens");
      console.info("Transaction hash:", receipt?.hash);
    } catch (error) {
      console.error("Failed to mint Confidential WETH:", error.message);
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
    
    try {
      const tx = await confidentialWETH.connect(signers[0]).wrap({
        value: ethers.parseEther(taskArguments.amount)
      });
      
      const receipt = await tx.wait();
      console.info("Successfully wrapped", taskArguments.amount, "ETH to ConfidentialWETH");
      console.info("Transaction hash:", receipt?.hash);
    } catch (error) {
      console.error("Failed to wrap ETH:", error.message);
    }
  });
