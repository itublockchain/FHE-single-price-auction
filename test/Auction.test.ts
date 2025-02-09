import { expect } from "chai";
import { ethers } from "hardhat";
import { createInstance } from "./instance";
import { debug, waitNBlocks } from "./utils";
import { Auction, AuctionFactory, ConfidentialWETH } from "../types";
import { FhevmInstance } from "fhevmjs/node";

describe("Auction System", function () {
  let auctionFactory: AuctionFactory;
  let auction: Auction;
  let confidentialWETH: ConfidentialWETH;
  let owner: any;
  let bidder1: any;
  let bidder2: any;
  let instance: FhevmInstance;

  const AUCTION_TITLE = "Test Auction";
  const AUCTION_DESC = "Test Description";
  const AUCTION_DEADLINE = 24; // 24 hours
  const TOKEN_SUPPLY = 1000n;
  const BID_PRICE = 100n;
  const BID_AMOUNT = 5n;

  beforeEach(async function () {
    [owner, bidder1, bidder2] = await ethers.getSigners();

    // Deploy AuctionFactory
    const AuctionFactory = await ethers.getContractFactory("AuctionFactory");
    auctionFactory = await AuctionFactory.deploy();
    await auctionFactory.waitForDeployment();

    // Create new auction
    const tx = await auctionFactory.createAuction(
      AUCTION_TITLE,
      AUCTION_DESC,
      AUCTION_DEADLINE * 3600, // Convert hours to seconds
      TOKEN_SUPPLY
    );
    const receipt = await tx.wait();

    // Get auction address from event
    const event = receipt?.logs.find(log => 
      log.topics[0] === auctionFactory.interface.getEventTopic('AuctionCreated')
    );
    const decodedEvent = auctionFactory.interface.decodeEventLog(
      'AuctionCreated',
      event!.data,
      event!.topics
    );
    
    // Get auction contract instance
    auction = await ethers.getContractAt("Auction", decodedEvent.auctionAddress) as Auction;

    // Get Confidential WETH instance
    const paymentTokenAddress = await auctionFactory.paymentToken();
    confidentialWETH = await ethers.getContractAt("ConfidentialWETH", paymentTokenAddress) as ConfidentialWETH;

    // Create FHE instance
    instance = await createInstance();
  });

  describe("Auction Creation", function () {
    it("Should create auction with correct parameters", async function () {
      const title = await auction.title();
      const desc = await auction.desc();
      const supply = await auction.supply();
      const seller = await auction.seller();
      const isAvailable = await auction.isAvailable();

      expect(title).to.equal(AUCTION_TITLE);
      expect(desc).to.equal(AUCTION_DESC);
      expect(supply).to.equal(TOKEN_SUPPLY);
      expect(seller).to.equal(owner.address);
      expect(isAvailable).to.be.true;
    });
  });

  describe("Bidding", function () {
    beforeEach(async function () {
      // Mint and approve tokens for bidders
      await auctionFactory.connect(bidder1).mintConfidentialToken(BID_PRICE * BID_AMOUNT);
      await auctionFactory.connect(bidder2).mintConfidentialToken(BID_PRICE * BID_AMOUNT);
    });

    it("Should allow placing encrypted bids", async function () {
      // Create encrypted values for bidder1
      const { encryptedValue: encPrice1, proof: priceProof1 } = await instance.createEncryptedInput(BID_PRICE);
      const { encryptedValue: encAmount1, proof: amountProof1 } = await instance.createEncryptedInput(BID_AMOUNT);

      // Submit bid from bidder1
      await auction.connect(bidder1).submitBid(encPrice1, priceProof1, encAmount1, amountProof1);

      // Verify bid was recorded
      const bid = await auction.bids(0);
      expect(bid.bidder).to.equal(bidder1.address);
      expect(bid.isRevealed).to.be.false;

      // Verify encrypted values (this is for testing only)
      if (process.env.NODE_ENV === "test") {
        const decryptedPrice = await debug.decrypt64(bid.e_pricePerToken);
        const decryptedAmount = await debug.decrypt64(bid.e_amount);
        expect(decryptedPrice).to.equal(BID_PRICE);
        expect(decryptedAmount).to.equal(BID_AMOUNT);
      }
    });

    it("Should prevent bidding after deadline", async function () {
      // Fast forward past deadline
      await waitNBlocks(AUCTION_DEADLINE * 3600 / 12); // Assuming 12 second block time

      // Try to place bid
      const { encryptedValue: encPrice, proof: priceProof } = await instance.createEncryptedInput(BID_PRICE);
      const { encryptedValue: encAmount, proof: amountProof } = await instance.createEncryptedInput(BID_AMOUNT);

      await expect(
        auction.connect(bidder1).submitBid(encPrice, priceProof, encAmount, amountProof)
      ).to.be.revertedWith("Auction ended");
    });
  });

  describe("Auction Finalization", function () {
    beforeEach(async function () {
      // Setup bids
      const { encryptedValue: encPrice1, proof: priceProof1 } = await instance.createEncryptedInput(BID_PRICE);
      const { encryptedValue: encAmount1, proof: amountProof1 } = await instance.createEncryptedInput(BID_AMOUNT);
      await auction.connect(bidder1).submitBid(encPrice1, priceProof1, encAmount1, amountProof1);

      const { encryptedValue: encPrice2, proof: priceProof2 } = await instance.createEncryptedInput(BID_PRICE * 2n);
      const { encryptedValue: encAmount2, proof: amountProof2 } = await instance.createEncryptedInput(BID_AMOUNT);
      await auction.connect(bidder2).submitBid(encPrice2, priceProof2, encAmount2, amountProof2);
    });

    it("Should only allow finalization after deadline", async function () {
      await expect(
        auction.finalizeAuction()
      ).to.be.revertedWith("Auction still active");

      // Fast forward past deadline
      await waitNBlocks(AUCTION_DEADLINE * 3600 / 12);

      await expect(
        auction.finalizeAuction()
      ).to.not.be.reverted;
    });

    it("Should mark auction as unavailable after finalization", async function () {
      // Fast forward past deadline
      await waitNBlocks(AUCTION_DEADLINE * 3600 / 12);

      await auction.finalizeAuction();
      const isAvailable = await auction.isAvailable();
      expect(isAvailable).to.be.false;
    });
  });
});
