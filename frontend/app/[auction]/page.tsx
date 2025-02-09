import hourglass from "../../public/HourglassMedium.svg";
import rocket from "../../public/RocketLaunch.svg";
import { ForwardReadOnlyRefEditor } from "../components";
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
import Image from "next/image";

const auctionDetails = {
  title: "Car Auction",
  description: `1. denem3\n2. dededed\n3. dededede\n4. dededede`,
  amount: "10000",
  date: new Date(),
};

export default async function Page({ params }: { params: Promise<{ auction: string }> }) {
  const slug = (await params).auction;
  return (
    <div className="flex justify-center items-center w-full h-screen">
      <div className="w-3/4 h-3/4 bg-background dark:text-foreground p-8 rounded-lg flex justify-center items-left flex-col gap-4">
        <div>
          <h1 className="text-7xl font-bold mb-2">
            {auctionDetails.title + " " + slug}
            <span className="text-3xl font-normal ml-2">x{auctionDetails.amount}</span>
          </h1>
          <span className="text-foreground/50">
            by<span className="ml-1 text-foreground">0xabc783...d84</span>
          </span>
        </div>
        <ForwardReadOnlyRefEditor markdown={auctionDetails.description} />
        <div className="flex justify-between items-center w-full">
          <div className="flex items-left gap-8">
            <p className="text-lg flex gap-1 text-foreground/60">
              <Image alt="rocket" src={rocket} />
              {auctionDetails.date.toLocaleDateString()}
            </p>
            <p className="text-lg flex gap-1 text-foreground/60">
              <Image alt="hourglass" src={hourglass} />
              {auctionDetails.date.toLocaleDateString()}
            </p>
            <p className="text-lg">
              {"4h 20m"}
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
    </div>
  );
}
