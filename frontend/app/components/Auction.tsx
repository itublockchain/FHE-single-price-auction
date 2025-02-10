"use client";

import hourglass from "../../public/HourglassMedium.svg";
import rocket from "../../public/RocketLaunch.svg";
import { ForwardReadOnlyRefEditor } from "../components";
import { LoadingScreen } from "../components";
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

const CONTRACT_ADDRESS = `0x${"c0A08fA8fAb6E4F43327AA3F94F95463790FBa48"}`;

export default function Auction({ slug }: { slug: string }) {
  const { data, isLoading } = useReadContract({
    abi,
    address: CONTRACT_ADDRESS,
    functionName: "auctions",
    args: [toBigInt(Number(slug) - 1)],
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <div className="w-3/4 h-3/4 bg-background dark:text-foreground p-8 rounded-lg flex justify-center items-left flex-col gap-4">
        <div>
          <h1 className="text-7xl font-bold mb-2">
            {data[0]}
            <span className="text-3xl font-normal ml-2">x{data[7]}</span>
          </h1>
          <span className="text-foreground/50">
            by<span className="ml-1 text-foreground">0xabc783...d84</span>
          </span>
        </div>
        <ForwardReadOnlyRefEditor markdown={data[1]} />
        <div className="flex justify-between items-center w-full">
          <div className="flex items-left gap-8">
            <p className="text-lg flex gap-1 text-foreground/60">
              <Image alt="rocket" src={rocket} />
              {new Date(Number(data[2]) * 1000).toLocaleDateString()}
            </p>
            <p className="text-lg flex gap-1 text-foreground/60">
              <Image alt="hourglass" src={hourglass} />
              {new Date(Number(data[3]) * 1000 + 32 * 60 * 60 * 1000).toLocaleDateString()}
            </p>
            <p className="text-lg">
              {Math.floor((Number(data[3]) * 1000 - Date.now()) / 1000 / 60 / 60) > 0
                ? Math.floor((Number(data[3]) * 1000 - Date.now()) / 1000 / 60 / 60) + "h" + " "
                : null}
              {Math.ceil(((Number(data[3]) * 1000 - Date.now()) / 1000 / 60) % 60) > 0
                ? Math.ceil(((Number(data[3]) * 1000 - Date.now()) / 1000 / 60) % 60) + "m"
                : "No Time"}
              <span className="text-foreground/60 ml-2">Left</span>
            </p>
          </div>
          <div>
            <Drawer>
              <DrawerTrigger asChild>
                <Button>Place Bid</Button>
              </DrawerTrigger>
              <DrawerContent className="flex flex-col justify-center items-center">
                <DrawerHeader className="w-1/4">
                  <DrawerTitle>Place a Bid</DrawerTitle>
                  <DrawerDescription>Enter bid price and quantity. The cost will be calculated.</DrawerDescription>
                  <div className="flex justify-between items-center gap-4">
                    <label className="text-sm">Amount</label>
                    <Input className="w-[250px]" placeholder="Enter amount" />
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <label className="text-sm">Price</label>
                    <Input className="w-[250px]" placeholder="Enter price" />
                  </div>
                  <div className="h-[1px] w-full bg-white/20 my-4"></div>
                  <p>Total Cost: 1.0 ETH</p>
                </DrawerHeader>
                <DrawerFooter className="w-1/4">
                  <Button className="w-full">Confirm Bid</Button>
                  <DrawerClose className="w-full">
                    <Button variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </>
  );
}
