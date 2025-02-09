import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { execute, log } = hre.deployments;
  const { seller1 } = await hre.getNamedAccounts();

  try {
    const auctionFactory = await hre.deployments.get("AuctionFactory");
    log(`AuctionFactory found at: ${auctionFactory.address}`);

    const factory = await hre.ethers.getContractAt("AuctionFactory", auctionFactory.address);
    
    const paymentToken = await factory.paymentToken();
    log(`Payment Token address: ${paymentToken}`);

    // Get current network gas price
    const feeData = await hre.ethers.provider.getFeeData();
    const maxFeePerGas = feeData.maxFeePerGas || BigInt(5000000000);
    log(`Using maxFeePerGas: ${maxFeePerGas.toString()} wei`);

    // Get all signers and find the one matching our seller
    const signers = await hre.ethers.getSigners();
    log("Available signer addresses:");
    for (const signer of signers) {
      log(`- ${await signer.getAddress()}`);
    }

    const auctionData = [
      { seller: seller1, title: "Art", desc: "Oil Painting", duration: 7200, supply: 10 },
    ];

    for (const { seller, title, desc, duration, supply } of auctionData) {
      try {
        log(`Creating auction with seller: ${seller}`);
        
        // Find the matching signer
        const signer = signers.find(s => s.address.toLowerCase() === seller.toLowerCase());
        if (!signer) {
          throw new Error(`No matching signer found for seller address ${seller}`);
        }
        log(`Found matching signer: ${signer.address}`);
        
        const balance = await signer.provider.getBalance(signer.address);
        log(`Seller balance: ${hre.ethers.formatEther(balance)} ETH`);

        try {
          const factoryWithSigner = factory.connect(signer);
          
          // Estimate gas with the correct signer
          const gasEstimate = await factoryWithSigner.createAuction.estimateGas(
            title,
            desc,
            duration,
            supply
          );
          log(`Estimated gas needed: ${gasEstimate.toString()}`);

          const totalCost = gasEstimate * maxFeePerGas;
          log(`Estimated total cost: ${hre.ethers.formatEther(totalCost)} ETH`);

          if (balance < totalCost) {
            throw new Error(`Insufficient funds. Need ${hre.ethers.formatEther(totalCost)} ETH but have ${hre.ethers.formatEther(balance)} ETH`);
          }

          log("Attempting to create auction via direct contract call...");
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

          log("Waiting for transaction confirmation...");
          const receipt = await tx.wait();
          
          if (receipt.status === 1) {
            log(`Success! Transaction hash: ${receipt.hash}`);
            log(`Auction created by ${seller} with title "${title}", duration: ${duration / 3600} hours`);
          } else {
            throw new Error("Transaction failed");
          }

        } catch (error: any) {
          log("------------------------");
          log("Detailed Error Information:");
          log(`Error message: ${error.message}`);
          
          if (error.error) {
            log(`Internal error: ${error.error.message}`);
          }
          
          if (error.receipt) {
            log("Transaction Receipt:");
            log(`Status: ${error.receipt.status}`);
            log(`Gas Used: ${error.receipt.gasUsed.toString()}`);
            log(`Block Number: ${error.receipt.blockNumber}`);
          }

          if (error.data) {
            try {
              const decodedError = factory.interface.parseError(error.data);
              log(`Decoded error: ${decodedError.name} - ${decodedError.args}`);
            } catch (decodeError) {
              log("Could not decode error data");
            }
          }
          
          log("------------------------");
          throw error;
        }

      } catch (error: any) {
        log(`Failed to create auction for seller ${seller}`);
        log(`Complete error: ${JSON.stringify(error, null, 2)}`);
        continue;
      }
    }

    log("Deployment completed!");
  } catch (error: any) {
    log(`Error in deployment: ${error.message}`);
    throw error;
  }
};

export default func;
func.id = "deploy_auctions";
func.tags = ["Auctions"];
func.dependencies = ["AuctionFactory"];
