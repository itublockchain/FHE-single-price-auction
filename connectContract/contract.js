import { ethers } from 'ethers';
import AuctionFactoryABI from './AuctionFactoryABI.json';
import dotenv from 'dotenv';

dotenv.config();

const AUCTION_FACTORY_ADDRESS = "0xa92a4eD7A934cd4E8111Af8F7D6d8D0406674372";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;

const provider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC_URL);

const getAuctionFactoryContract = (signer) => {
    return new ethers.Contract(AUCTION_FACTORY_ADDRESS, AuctionFactoryABI, signer);
};

const getAuctionContract = (auctionAddress, signer) => {
    return new ethers.Contract(auctionAddress, AuctionFactoryABI, signer);
};

const connectWallet = async () => {
    try {
        if (typeof window.ethereum !== 'undefined') {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            return signer;
        } else {
            throw new Error("Please install MetaMask!");
        }
    } catch (error) {
        console.error("Error connecting wallet:", error);
        throw error;
    }
};

const createAuction = async (title, desc, deadline, supply) => {
    try {
        const signer = await connectWallet();
        const factory = getAuctionFactoryContract(signer);
        
        const tx = await factory.createAuction(
            title,
            desc,
            deadline,
            supply
        );
        
        const receipt = await tx.wait();
        const event = receipt.events?.find(e => e.event === 'AuctionCreated');
        
        if (event) {
            return {
                auctionAddress: event.args.auctionAddress,
                title: event.args.title,
                desc: event.args.desc,
                startTime: event.args.startTime,
                endTime: event.args.endTime,
                seller: event.args.seller
            };
        }
        throw new Error("Auction creation event not found");
    } catch (error) {
        console.error("Error creating auction:", error);
        throw error;
    }
};

const getAuction = async (auctionId) => {
    try {
        const signer = await connectWallet();
        const factory = getAuctionFactoryContract(signer);
        const auction = await factory.auctions(auctionId);
        return auction;
    } catch (error) {
        console.error("Error getting auction:", error);
        throw error;
    }
};

const getAuctionCount = async () => {
    try {
        const signer = await connectWallet();
        const factory = getAuctionFactoryContract(signer);
        const count = await factory.counter();
        return count;
    } catch (error) {
        console.error("Error getting auction count:", error);
        throw error;
    }
};

const submitBid = async (auctionAddress, encPrice, priceProof, encAmount, amountProof) => {
    try {
        const signer = await connectWallet();
        const auction = getAuctionContract(auctionAddress, signer);
        
        const tx = await auction.submitBid(encPrice, priceProof, encAmount, amountProof);
        const receipt = await tx.wait();
        
        const event = receipt.events?.find(e => e.event === 'BidSubmitted');
        if (event) {
            return {
                bidId: event.args.bidId,
                bidder: event.args.bidder,
                timestamp: event.args.timestamp
            };
        }
        throw new Error("Bid submission event not found");
    } catch (error) {
        console.error("Error submitting bid:", error);
        throw error;
    }
};

const finalizeAuction = async (auctionAddress) => {
    try {
        const signer = await connectWallet();
        const auction = getAuctionContract(auctionAddress, signer);
        
        const tx = await auction.finalizeAuction();
        const receipt = await tx.wait();
        
        return receipt;
    } catch (error) {
        console.error("Error finalizing auction:", error);
        throw error;
    }
};

const getAuctionDetails = async (auctionAddress) => {
    try {
        const signer = await connectWallet();
        const auction = getAuctionContract(auctionAddress, signer);
        
        const [
            title,
            desc,
            startTime,
            endTime,
            supply,
            seller,
            isAvailable,
            token,
            paymentToken
        ] = await Promise.all([
            auction.title(),
            auction.desc(),
            auction.startTime(),
            auction.endTime(),
            auction.supply(),
            auction.seller(),
            auction.isAvailable(),
            auction.token(),
            auction.paymentToken()
        ]);

        return {
            title,
            desc,
            startTime: startTime.toString(),
            endTime: endTime.toString(),
            supply: supply.toString(),
            seller,
            isAvailable,
            token,
            paymentToken
        };
    } catch (error) {
        console.error("Error getting auction details:", error);
        throw error;
    }
};

export {
    connectWallet,
    createAuction,
    getAuction,
    getAuctionCount,
    submitBid,
    finalizeAuction,
    getAuctionDetails
};
