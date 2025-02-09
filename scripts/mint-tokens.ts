import { ethers } from "hardhat";

async function main() {
  const [deployer, seller1] = await ethers.getSigners();
  
  // AuctionFactory adresini kullan
  const factoryAddress = "0xa92a4eD7A934cd4E8111Af8F7D6d8D0406674372";
  const factory = await ethers.getContractAt("AuctionFactory", factoryAddress);
  
  // Payment token adresini al
  const paymentTokenAddress = await factory.paymentToken();
  console.log("Payment Token address:", paymentTokenAddress);
  
  try {
    // Her seller için token mint et
    const amount = 1000n; // 1000 token
    console.log(`Minting ${amount} tokens for seller1...`);
    const tx = await factory.connect(seller1).mintConfidentialToken(amount);
    await tx.wait();
    console.log("Tokens minted successfully!");
    
  } catch (error) {
    console.error("Error minting tokens:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 