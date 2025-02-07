import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import auctionImage from "../public/auction.svg";
import hourglass from "../public/HourglassMedium.svg";
import Image from "next/image";
import Link from "next/link";

const auctions = [
  {
    title: "Car Auction 1",
    description: "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(),
  },
  {
    title: "Car Auction 2",
    description: "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(),
  },
  {
    title: "Car Auction 3",
    description: "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(),
  },
  {
    title: "Car Auction 4",
    description: "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(),
  },
  {
    title: "Car Auction 5",
    description: "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(),
  },
  {
    title: "Car Auction 6",
    description: "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(),
  },
  {
    title: "Car Auction 7",
    description: "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(),
  },
  {
    title: "Car Auction 8",
    description: "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(),
  },
  {
    title: "Car Auction 9",
    description: "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(),
  },
  {
    title: "Car Auction 10",
    description: "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(),
  },
  {
    title: "Car Auction 1",
    description: "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(),
  },
  {
    title: "Car Auction 2",
    description: "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(),
  },
  {
    title: "Car Auction 3",
    description: "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(),
  },
  {
    title: "Car Auction 4",
    description: "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(),
  },
  {
    title: "Car Auction 5",
    description: "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(),
  },
  {
    title: "Car Auction 6",
    description: "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(),
  },
  {
    title: "Car Auction 7",
    description: "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(),
  },
  {
    title: "Car Auction 8",
    description: "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(),
  },
  {
    title: "Car Auction 9",
    description: "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(),
  },
  {
    title: "Car Auction 10",
    description: "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(),
  },
];

export default function Home() {
  return (
    <div className="w-full h-screen flex flex-col justify-start items-center overflow-y-scroll">
      <h1 className="w-4/5 text-5xl font-bold text-left mt-[20px]">Live Auctions</h1>
      <div className="w-4/5 grid grid-cols-3 gap-8 mt-[20px]">
      {auctions.map((auction, index) => (<Card key={index} className="flex flex-col border-foreground/20">
        <CardHeader>
          <CardTitle className="text-3xl">{auction.title}<span className="text-sm ml-1">x{auction.amount}</span></CardTitle>
          <CardDescription>{auction.description}</CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-between items-center">
          <Button><Image alt="Auction Image" src={auctionImage} />
          <Link href={`/${index + 1}`}>View Auction</Link></Button>
          <p className="text-md flex">
            <Image alt="hourglass" src={hourglass} className="mr-2"/>
              {"4h 20m"}
              <span className="text-foreground/60 ml-2">Left</span>
            </p>
        </CardFooter>
      </Card>))}
      </div>
      <h1 className="w-4/5 text-5xl font-bold text-left mt-[20px]">Past Auctions</h1>
      <div className="w-4/5 grid grid-cols-3 gap-8 mt-[20px]">
      {auctions.map((auction, index) => (<Card key={index} className="flex flex-col border-foreground/20">
        <CardHeader>
          <CardTitle className="text-3xl">{auction.title}<span className="text-sm ml-1">x{auction.amount}</span></CardTitle>
          <CardDescription>{auction.description}</CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-between items-center">
          <Button variant={"outline"}>
          <Link href={`/${index + 1}`}>Show Details</Link></Button>
          <p className="text-md flex">
            <Image alt="hourglass" src={hourglass} className="mr-2"/>
              <span className="text-foreground/60 ">Auction Ended</span>
            </p>
        </CardFooter>
      </Card>))}
      </div>
    </div>
  );
}
