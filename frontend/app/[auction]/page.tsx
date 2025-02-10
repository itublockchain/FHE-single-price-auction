import hourglass from "../../public/HourglassMedium.svg";
import rocket from "../../public/RocketLaunch.svg";
import { ForwardReadOnlyRefEditor } from "../components";
import { LoadingScreen } from "../components";
import { Auction } from "../components";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { abi } from "@/lib/abi/abi";
import { toBigInt } from "ethers";
import Image from "next/image";
import { useReadContract } from "wagmi";

const auctionDetails = {
  title: "Car Auction",
  description: `1. denem3\n2. dededed\n3. dededede\n4. dededede`,
  amount: "10000",
  date: new Date(),
};

const CONTRACT_ADDRESS = `0x${"c0A08fA8fAb6E4F43327AA3F94F95463790FBa48"}`;

export default async function Page({ params }: { params: Promise<{ auction: string }> }) {
  const slug = (await params).auction;

  return (
    <div className="flex justify-center items-center w-full h-screen">
      <Auction slug={slug} />
    </div>
  );
}
