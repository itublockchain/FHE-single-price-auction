import chalk from "chalk";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from "hardhat";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { execute, log } = hre.deployments;
  const { seller1 } = await hre.getNamedAccounts();

  try {
    const auctionFactory = await hre.deployments.get("AuctionFactory");
    log(chalk.green(`✅ AuctionFactory found at: ${auctionFactory.address}`));

    const factory = await hre.ethers.getContractAt("AuctionFactory", auctionFactory.address);
    
    const paymentToken = await factory.paymentToken();
    log(chalk.blue(`💰 Payment Token address: ${paymentToken}`));

    // Get current network gas price
    const feeData = await hre.ethers.provider.getFeeData();
    const maxFeePerGas = feeData.maxFeePerGas || BigInt(5000000000);
    log(chalk.yellow(`⛽ Using maxFeePerGas: ${maxFeePerGas.toString()} wei`));

    // Get all signers and find the one matching our seller
    const signers = await hre.ethers.getSigners();
    log(chalk.cyan("🔎 Available signer addresses:"));
    for (const signer of signers) {
      log(`- ${chalk.magenta(await signer.getAddress())}`);
    }

    const auctionData = [
      { seller: seller1, title: "Statue", desc: "They are statue from 200 BC", duration: 7200, supply: 10 },
      { seller: seller1, title: "Book", desc: "The first edition of a book written by a famous author", duration: 604800, supply: 6 },
      { seller: seller1, title: "Rosary", desc: "a rare rosary made of precious stones", duration: 172800, supply: 78 }
    ];

    for (const { seller, title, desc, duration, supply } of auctionData) {
      try {
        log(chalk.green(`🚀 Creating auction with seller: ${chalk.bold(seller)}`));
        
        // Find the matching signer
        const signer = signers.find(s => s.address.toLowerCase() === seller.toLowerCase());
        if (!signer) {
          throw new Error(chalk.red(`❌ No matching signer found for seller address ${seller}`));
        }
        log(chalk.green(`✅ Found matching signer: ${chalk.bold(signer.address)}`));
        
        const balance = await signer.provider.getBalance(signer.address);
        log(chalk.blue(`💵 Seller balance: ${chalk.bold(hre.ethers.formatEther(balance))} ETH`));

        try {
          const factoryWithSigner = factory.connect(signer);
          
          // Estimate gas with the correct signer
          const gasEstimate = await factoryWithSigner.createAuction.estimateGas(
            title,
            desc,
            duration,
            supply
          );
          log(chalk.yellow(`⛽ Estimated gas needed: ${gasEstimate.toString()}`));

          const totalCost = gasEstimate * maxFeePerGas;
          log(chalk.red(`💰 Estimated total cost: ${hre.ethers.formatEther(totalCost)} ETH`));

          if (balance < totalCost) {
            throw new Error(chalk.red(`❌ Insufficient funds. Need ${hre.ethers.formatEther(totalCost)} ETH but have ${hre.ethers.formatEther(balance)} ETH`));
          }
          const a = ethers.getCreateAddress({from: await factory.getAddress(), nonce:await hre.ethers.provider.getTransactionCount(await factory.getAddress())});
          log(chalk.green("⚡ Attempting to create auction via direct contract call..."));
          const tx = await factoryWithSigner.createAuction(
            title,
            desc,
            duration,
            supply,
            {
              gasLimit: gasEstimate * BigInt(12) / BigInt(10), // 20% buffer
              maxFeePerGas
            }
          );

          log(chalk.yellow("⏳ Waiting for transaction confirmation..."));
          const receipt = await tx.wait();
          
          if (receipt.status === 1) {
            log(chalk.green(`✅ Success! Transaction hash: ${chalk.bold(receipt.hash)}`));
            log(chalk.green(`🎉 Auction created by ${chalk.bold(seller)} with title "${chalk.bold(title)}", duration: ${chalk.bold(duration / 3600)} hours`));
          } else {
            throw new Error(chalk.red("❌ Transaction failed"));
          }

        } catch (error: any) {
          log(chalk.red("------------------------"));
          log(chalk.red("❗ Detailed Error Information:"));
          log(chalk.red(`Error message: ${error.message}`));
          
          if (error.error) {
            log(chalk.red(`Internal error: ${error.error.message}`));
          }
          
          if (error.receipt) {
            log(chalk.red("📜 Transaction Receipt:"));
            log(chalk.red(`Status: ${error.receipt.status}`));
            log(chalk.red(`Gas Used: ${error.receipt.gasUsed.toString()}`));
            log(chalk.red(`Block Number: ${error.receipt.blockNumber}`));
          }

          if (error.data) {
            try {
              const decodedError = factory.interface.parseError(error.data);
              log(chalk.red(`Decoded error: ${decodedError.name} - ${decodedError.args}`));
            } catch (decodeError) {
              log(chalk.red("❌ Could not decode error data"));
            }
          }
          
          log(chalk.red("------------------------"));
          throw error;
        }

      } catch (error: any) {
        log(chalk.red(`🚨 Failed to create auction for seller ${seller}`));
        log(chalk.red(`Complete error: ${JSON.stringify(error, null, 2)}`));
        continue;
      }
    }

    log(chalk.green("✅ Deployment completed!"));
  } catch (error: any) {
    log(chalk.red(`❌ Error in deployment: ${error.message}`));
    throw error;
  }
};

export default func;
func.id = "deploy_auctions";
func.tags = ["Auctions"];
func.dependencies = ["AuctionFactory"];
