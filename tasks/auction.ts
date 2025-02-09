import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { Auction } from "../types";

task("place-bid")
  .addParam("auction", "Address of the auction contract")
  .addParam("amount", "Bid amount in WETH")
  .setAction(async function (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) {
    const { ethers } = hre;
    const signers = await ethers.getSigners();
    const auction = (await ethers.getContractAt("Auction", taskArguments.auction)) as Auction;
    
    // Convert amount to proper format (assuming 18 decimals)
    const amount = ethers.parseEther(taskArguments.amount);
    
    try {
      const tx = await auction.connect(signers[0]).placeBid(amount);
      const receipt = await tx.wait();
      console.info("Bid placed successfully!");
      console.info("Transaction hash:", receipt?.hash);
    } catch (error) {
      console.error("Failed to place bid:", error.message);
    }
  });

task("end-auction")
  .addParam("auction", "Address of the auction contract")
  .setAction(async function (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) {
    const { ethers } = hre;
    const signers = await ethers.getSigners();
    const auction = (await ethers.getContractAt("Auction", taskArguments.auction)) as Auction;
    
    try {
      const tx = await auction.connect(signers[0]).endAuction();
      const receipt = await tx.wait();
      console.info("Auction ended successfully!");
      console.info("Transaction hash:", receipt?.hash);
    } catch (error) {
      console.error("Failed to end auction:", error.message);
    }
  });

task("get-auction-info")
  .addParam("auction", "Address of the auction contract")
  .setAction(async function (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) {
    const { ethers } = hre;
    const auction = (await ethers.getContractAt("Auction", taskArguments.auction)) as Auction;
    
    try {
      const [title, desc, startTime, endTime, seller] = await Promise.all([
        auction.title(),
        auction.description(),
        auction.startTime(),
        auction.endTime(),
        auction.seller()
      ]);
      
      console.info("Auction Information:");
      console.info("Title:", title);
      console.info("Description:", desc);
      console.info("Start Time:", new Date(Number(startTime) * 1000).toLocaleString());
      console.info("End Time:", new Date(Number(endTime) * 1000).toLocaleString());
      console.info("Seller:", seller);
    } catch (error) {
      console.error("Failed to get auction info:", error.message);
    }
  });
