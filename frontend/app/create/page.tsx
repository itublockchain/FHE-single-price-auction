"use client";

import emojiImage from "../../public/smile-plus.svg";
import { ForwardRefEditor } from "../components";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { abi } from "@/lib/abi/abi";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, min } from "date-fns";
import EmojiPicker from "emoji-picker-react";
import { Theme } from "emoji-picker-react";
import { toBigInt } from "ethers";
import Image from "next/image";
import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useWriteContract } from "wagmi";
import { z } from "zod";

const CONTRACT_ADDRESS = `0x${"c0A08fA8fAb6E4F43327AA3F94F95463790FBa48"}`;

const formSchema = z.object({
  title: z
    .string()
    .min(5, {
      message: "Title must be at least 5 characters.",
    })
    .max(20, {
      message: "Title can be at most 20 characters.",
    }),
  amount: z
    .number()
    .min(1, { message: "Amount must be at least 1." })
    .max(1000000, { message: "Amount can be at most 1,000,000." }),
  description: z.string(),
  date: z.date(),
  emoji: z.string().min(1, { message: "You need to select an emoji." }),
});

export default function Create() {
  const [emojiData, setEmojiData] = useState("");

  const { toast } = useToast();
  const { writeContract } = useWriteContract();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      amount: 0,
      emoji: "",
      description: "",
      date: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = { ...values, emoji: emojiData };
    console.log(formData);
    console.log(Math.floor(formData.date.getTime() / 1000 - Date.now() / 1000)),
      writeContract(
        {
          abi,
          address: CONTRACT_ADDRESS,
          functionName: "createAuction",
          args: [
            formData.title,
            formData.description,
            toBigInt(Math.floor(formData.date.getTime() / 1000 - Date.now() / 1000)),
            toBigInt(formData.amount),
          ],
        },
        {
          onError: (error) => {
            toast({
              title: "Unable to create auction",
              description: error.message,
              variant: "destructive",
            });
          },
          onSuccess: () => {
            toast({
              title: "Auction created",
              description: "Your auction has been created successfully.",
            });
          },
        },
      );
  }

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center bg-background dark text-foreground -mt-[80px]">
      <Form {...form}>
        <h1 className="text-7xl w-2/3 pl-4 mb-4 text-left">Create Auction</h1>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-6 rounded-lg w-2/3">
          <div className="grid w-full justify-between items-end grid-cols-4 gap-4">
            {emojiData ? (
              <span className="text-3xl flex justify-center items-center">{emojiData}</span>
            ) : (
              <FormField
                control={form.control}
                name="emoji"
                render={({ field }) => (
                  <FormItem className="justify-center items-center flex flex-col">
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant={"outline"} className="">
                            <Image src={emojiImage} alt="emoji" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <EmojiPicker
                            theme={Theme.DARK}
                            searchDisabled={true}
                            onEmojiClick={(emoji, e) => {
                              setEmojiData(emoji.emoji);
                              field.onChange(emoji.emoji);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Name of your project" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-center text-left font-normal",
                            !field.value && "text-foreground",
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            if (!date) return;
                            if (date?.getTime() < Date.now()) return;
                            console.log(date);
                            field.onChange(date);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <ForwardRefEditor markdown="" placeholder="Enter your description here" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-between space-x-4">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit">Create Auction</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
