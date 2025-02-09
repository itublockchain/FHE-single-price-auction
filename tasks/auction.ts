import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Auction, AuctionFactory, ConfidentialWETH } from "../types";
import { getEncryptedValue } from "../utils/fhe";

task("create-auction")
  .addParam("title", "Title of the auction")
  .addParam("desc", "Description of the auction")
  .addParam("deadline", "Deadline in hours")
  .addParam("supply", "Supply amount of tokens")
  .setAction(async function (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) {
    const { ethers } = hre;
    const signers = await ethers.getSigners();
    const factory = (await ethers.getContractAt("AuctionFactory", process.env.AUCTION_FACTORY_ADDRESS!)) as AuctionFactory;
    
    try {
      const tx = await factory.connect(signers[0]).createAuction(
        taskArguments.title,
        taskArguments.desc,
        Number(taskArguments.deadline) * 3600, // Convert hours to seconds
        BigInt(taskArguments.supply)
      );
      const receipt = await tx.wait();
      console.info("Auction created successfully!");
      console.info("Transaction hash:", receipt?.hash);
    } catch (error) {
      console.error("Failed to create auction:", error.message);
    }
  });

task("submit-bid")
  .addParam("auction", "Address of the auction contract")
  .addParam("price", "Price per token")
  .addParam("amount", "Amount of tokens to bid")
  .setAction(async function (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) {
    const { ethers } = hre;
    const signers = await ethers.getSigners();
    const auction = (await ethers.getContractAt("Auction", taskArguments.auction)) as Auction;
    
    try {
      // Get encrypted values and proofs
      const { encryptedValue: encPrice, proof: priceProof } = await getEncryptedValue(BigInt(taskArguments.price));
      const { encryptedValue: encAmount, proof: amountProof } = await getEncryptedValue(BigInt(taskArguments.amount));

      const tx = await auction.connect(signers[0]).submitBid(encPrice, priceProof, encAmount, amountProof);
      const receipt = await tx.wait();
      console.info("Bid submitted successfully!");
      console.info("Transaction hash:", receipt?.hash);
    } catch (error) {
      console.error("Failed to submit bid:", error.message);
    }
  });

task("finalize-auction")
  .addParam("auction", "Address of the auction contract")
  .setAction(async function (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) {
    const { ethers } = hre;
    const signers = await ethers.getSigners();
    const auction = (await ethers.getContractAt("Auction", taskArguments.auction)) as Auction;
    
    try {
      const tx = await auction.connect(signers[0]).finalizeAuction();
      const receipt = await tx.wait();
      console.info("Auction finalized successfully!");
      console.info("Transaction hash:", receipt?.hash);
    } catch (error) {
      console.error("Failed to finalize auction:", error.message);
    }
  });

task("get-auction-info")
  .addParam("auction", "Address of the auction contract")
  .setAction(async function (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) {
    const { ethers } = hre;
    const auction = (await ethers.getContractAt("Auction", taskArguments.auction)) as Auction;
    
    try {
      const [title, desc, startTime, endTime, seller, isAvailable, supply] = await Promise.all([
        auction.title(),
        auction.desc(),
        auction.startTime(),
        auction.endTime(),
        auction.seller(),
        auction.isAvailable(),
        auction.supply()
      ]);
      
      console.info("Auction Information:");
      console.info("Title:", title);
      console.info("Description:", desc);
      console.info("Start Time:", new Date(Number(startTime) * 1000).toLocaleString());
      console.info("End Time:", new Date(Number(endTime) * 1000).toLocaleString());
      console.info("Seller:", seller);
      console.info("Is Available:", isAvailable);
      console.info("Supply:", supply.toString());
    } catch (error) {
      console.error("Failed to get auction info:", error.message);
    }
  });

task("mint-confidential-token")
  .addParam("amount", "Amount of tokens to mint")
  .setAction(async function (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) {
    const { ethers } = hre;
    const signers = await ethers.getSigners();
    const factory = (await ethers.getContractAt("AuctionFactory", process.env.AUCTION_FACTORY_ADDRESS!)) as AuctionFactory;
    
    try {
      const tx = await factory.connect(signers[0]).mintConfidentialToken(BigInt(taskArguments.amount));
      const receipt = await tx.wait();
      console.info("Confidential tokens minted successfully!");
      console.info("Transaction hash:", receipt?.hash);
    } catch (error) {
      console.error("Failed to mint confidential tokens:", error.message);
    }
  });
