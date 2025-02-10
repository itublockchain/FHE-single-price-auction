"use client";

import { abi } from "../lib/abi/abi";
import hourglass from "../public/HourglassMedium.svg";
import auctionImage from "../public/auction.svg";
import { LoadingScreen } from "./components";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { set } from "date-fns";
import { toBigInt } from "ethers";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, ReactHTMLElement, ReactElement } from "react";
import { Abi } from "viem";
import { useReadContract, useReadContracts, UseReadContractReturnType, UseReadContractsReturnType } from "wagmi";

const CONTRACT_ADDRESS = `0x${"c0A08fA8fAb6E4F43327AA3F94F95463790FBa48"}`;

const auctions = [
  {
    title: "Car Auction 1",
    description:
      "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(1739027335738),
  },
  {
    title: "Car Auction 2",
    description:
      "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(1739027335738),
  },
  {
    title: "Car Auction 3",
    description:
      "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(1739027335738),
  },
  {
    title: "Car Auction 4",
    description:
      "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(1739027335738),
  },
  {
    title: "Car Auction 5",
    description:
      "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(1739027335738),
  },
  {
    title: "Car Auction 6",
    description:
      "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(1739027335738),
  },
  {
    title: "Car Auction 7",
    description:
      "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(1739027335738),
  },
  {
    title: "Car Auction 8",
    description:
      "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(1739027335738),
  },
  {
    title: "Car Auction 9",
    description:
      "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(1739027335738),
  },
  {
    title: "Car Auction 10",
    description:
      "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(1739027335738),
  },
  {
    title: "Car Auction 11",
    description:
      "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(1),
  },
  {
    title: "Car Auction 12",
    description:
      "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(1),
  },
  {
    title: "Car Auction 13",
    description:
      "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(1),
  },
  {
    title: "Car Auction 14",
    description:
      "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(1),
  },
  {
    title: "Car Auction 15",
    description:
      "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(1),
  },
  {
    title: "Car Auction 16",
    description:
      "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(1),
  },
  {
    title: "Car Auction 17",
    description:
      "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(1),
  },
  {
    title: "Car Auction 18",
    description:
      "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(1),
  },
  {
    title: "Car Auction 19",
    description:
      "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(1),
  },
  {
    title: "Car Auction 20",
    description:
      "Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet.",
    amount: "10000",
    date: new Date(1),
  },
];

const factoryContract: { abi: Abi; address: `0x${string}` } = {
  abi: abi,
  address: CONTRACT_ADDRESS,
};

export default function Home() {
  const { data: counter, isLoading: counterLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: abi,
    functionName: "counter",
  });

  console.log("Counter", Number(counter));

  const parameters = [];

  for (let i = 0; i < Number(counter); i++) {
    parameters.push({
      ...factoryContract,
      functionName: "auctions",
      args: [toBigInt(i)],
    });
  }

  const {
    data,
    isFetched,
    isLoading: datasLoading,
  } = useReadContracts({
    contracts: parameters,
  });

  if (counterLoading || datasLoading) {
    return <LoadingScreen />;
  }

  const liveAuctions = [];
  const pastAuctions = [];

  data.map((auction, index) => {
    if (Number(auction.result[3]) * 1000 > Date.now()) {
      liveAuctions.push(
        <Card key={index} className="flex flex-col border-foreground/20 not-ended">
          <CardHeader>
            <CardTitle className="text-3xl">
              {auction.result[0]}
              <span className="text-sm ml-1">x{auction.result[7]}</span>
            </CardTitle>
            <CardDescription>
              {auction.result[1].slice(0, 50) + (auction.result[1].length > 50 ? "..." : "")}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-between items-center">
            <Button>
              <Image alt="Auction Image" src={auctionImage} />
              <Link href={`/${index + 1}`}>View Auction</Link>
            </Button>
            <p className="text-md flex">
              <Image alt="hourglass" src={hourglass} className="mr-2" />
              {/* Get Hours and minutes */}
              {Math.floor((Number(auction.result[3]) * 1000 - Date.now()) / 1000 / 60 / 60) + "h" + " "}
              {Math.ceil(((Number(auction.result[3]) * 1000 - Date.now()) / 1000 / 60) % 60) + "m"}
              <span className="text-foreground/60 ml-2">Left</span>
            </p>
          </CardFooter>
        </Card>,
      );
    } else {
      pastAuctions.push(
        <Card key={index} className="flex flex-col border-foreground/20 ended">
          <CardHeader>
            <CardTitle className="text-3xl">
              {auction.result[0]}
              <span className="text-sm ml-1">x{auction.result[7].toString()}</span>
            </CardTitle>
            <CardDescription>{auction.result[1].slice(0, 20)}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-between items-center">
            <Button variant={"outline"}>
              <Link href={`/${index + 1}`}>Show Details</Link>
            </Button>
            <p className="text-md flex">
              <Image alt="hourglass" src={hourglass} className="mr-2" />
              <span className="text-foreground/60 ">Auction Ended</span>
            </p>
          </CardFooter>
        </Card>,
      );
    }
  });

  console.log(liveAuctions);

  return (
    <div className="w-full h-screen flex flex-col justify-start items-center overflow-y-scroll">
      {data.filter((auction) => Number(auction.result[3]) * 1000 > Date.now()).length > 0 ? (
        <h1 className="w-4/5 text-5xl font-bold text-left mt-[20px]">Live Auctions</h1>
      ) : null}
      <div className="w-4/5 grid grid-cols-3 gap-8 mt-[20px]">{liveAuctions}</div>
      {data.filter((auction) => Number(auction.result[3]) * 1000 < Date.now()).length > 0 ? (
        <h1 className="w-4/5 text-5xl font-bold text-left mt-[20px]">Past Auctions</h1>
      ) : null}
      <div className="w-4/5 grid grid-cols-3 gap-8 mt-[20px]">{pastAuctions}</div>
    </div>
  );
}
