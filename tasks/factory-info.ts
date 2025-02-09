import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("factory-info", "Gets AuctionFactory information")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    // Get the latest deployment address
    const auctionFactory = await hre.deployments.get("AuctionFactory");
    const factory = await hre.ethers.getContractAt(
      "AuctionFactory",
      auctionFactory.address
    );
    
    try {
      // Payment token adresini al
      const paymentToken = await factory.paymentToken();
      console.log("Payment Token:", paymentToken);
      
      // Counter'ı kontrol et
      const counter = await factory.counter();
      console.log("Auction Counter:", counter.toString());
      
      // Son auction'ı kontrol et
      if (counter > 0) {
        const lastAuction = await factory.auctions(counter - 1n);
        console.log("Last Auction:", {
          title: lastAuction.title,
          seller: lastAuction.seller,
          contractAddress: lastAuction.contractAddress,
          tokenAddress: lastAuction.tokenAddress,
          supply: lastAuction.supply.toString(),
          isAvailable: lastAuction.isAvailable,
          startTime: new Date(Number(lastAuction.startTime) * 1000).toLocaleString(),
          endTime: new Date(Number(lastAuction.endTime) * 1000).toLocaleString()
        });
      } else {
        console.log("No auctions created yet");
      }
      
    } catch (error) {
      console.error("Error:", error);
    }
});

export {}; 