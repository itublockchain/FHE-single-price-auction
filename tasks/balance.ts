import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("check-balance", "Checks token balance")
  .addParam("account", "The account's address")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const factory = await hre.ethers.getContractAt(
      "AuctionFactory",
      "0xc0A08fA8fAb6E4F43327AA3F94F95463790FBa48"
    );
    
    try {
      const paymentToken = await factory.paymentToken();
      console.log("Payment Token address:", paymentToken);
      
      const token = await hre.ethers.getContractAt("ConfidentialWETH", paymentToken);
      console.log("Checking balance for:", taskArgs.account);
      
      // ETH balance
      const ethBalance = await hre.ethers.provider.getBalance(taskArgs.account);
      console.log("ETH balance:", hre.ethers.formatEther(ethBalance), "ETH");
      
      // Token balance
      const tokenBalance = await token.balanceOf(taskArgs.account);
      console.log("Token balance:", tokenBalance.toString());
      
    } catch (error) {
      console.error("Error:", error);
    }
});

export {}; 