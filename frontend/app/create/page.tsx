"use client";

import emojiImage from "../../public/smile-plus.svg";
import { ForwardRefEditor } from "../components";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import EmojiPicker from "emoji-picker-react";
import { Theme } from "emoji-picker-react";
import Image from "next/image";
import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  title: z
    .string()
    .min(5, {
      message: "Title must be at least 5 characters.",
    })
    .max(20, {
      message: "Title can be at most 20 characters.",
    }),
  amount: z.string(),
  description: z.string(),
  date: z.date(),
  emoji: z.string().min(1, { message: "You need to select an emoji." }),
});

export default function Create() {
  const [date, setDate] = React.useState<Date | undefined>();
  const [emojiData, setEmojiData] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      amount: "",
      emoji: "",
      description: "",
      date: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = { ...values, emoji: emojiData };
    console.log(formData);
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
                    <Input placeholder="Enter amount" {...field} />
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
