"use client";

import Message from "@/components/message";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ScrollArea } from "@/components/ui/scroll-area";

import { Textarea } from "@/components/ui/textarea";

import { PlusIcon, SendHorizonalIcon } from "lucide-react";

import { useCallback, useEffect, useState } from "react";

export type MessageType = {
  role: "user" | "assistant";

  text: string;
};

export default function Home() {
  const [items, setItems] = useState<string[]>([]);

  const [input, setInput] = useState("");

  const [messages, setMessages] = useState<MessageType[]>([
    {
      role: "assistant",

      text: "Hi, I&apos;m Domus. Ask me about your household tasks or tell me something to remember",
    },
  ]);

  const API_URL = "http://127.0.0.1:8000";

  const loadMemory = async () => {
    try {
      const res = await fetch(`${API_URL}/memory`);

      const data = await res.json();

      setItems(data.items || []);
    } catch (err) {
      console.error("Failed to load memory:", err);
    }
  };

  const getMemory = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/memory`);

      const data = await res.json();

      setItems(data.items || []);
    } catch (err) {
      console.error("Failed to load memory: ", err);
    }
  }, []);

  const deleteMemory = async (text: string) => {
    await fetch(`${API_URL}/memory`, {
      method: "DELETE",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({ text }),
    });
  };

  const createMemory = async (text: string) => {
    const payload = text.trim();

    if (!payload) return;

    //TODO: Set "loading" state for messages that are still processing

    setMessages((prev) => [...prev, { role: "user", text: payload as string }]);

    setInput("");

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({ text: payload }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,

        { role: "assistant", text: data.reply ?? "No response from Domus" },
      ]);

      await getMemory();
    } catch (err) {
      console.log("Chat failed: ", err);

      setMessages((prev) => [
        ...prev,

        {
          role: "assistant",

          text: "Something went wrong.",
        },
      ]);
    }
  };

  useEffect(() => {
    let isMounted = true;

    fetch(`${API_URL}/memory`)
      .then((res) => res.json())

      .then((data) => {
        if (isMounted) setItems(data.items || []);
      })

      .catch((err) => console.error("Memory fetch failed:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bg-muted flex h-[100dvh] flex-col items-center justify-center py-8">
      <main className="flex w-full max-w-5xl flex-1 flex-col overflow-hidden">
        <div className="flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size={"sm"}
                variant="ghost"
                className="hover:bg-muted hover:text-foreground"
              >
                <label className="text-lg font-bold">My Family</label>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem>Profile</DropdownMenuItem>

                <DropdownMenuItem>Billing</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-6 flex flex-1 columns-2">
          <div className="flex w-full flex-1 flex-col overflow-hidden rounded-l-md border bg-white">
            <ScrollArea className="min-h-0 w-full flex-1 gap-5 p-4">
              <div className="space-y-4">
                <Message message={{ role: "user", text: "Question" }} />

                <Message message={{ role: "assistant", text: "Response" }} />
              </div>
            </ScrollArea>

            {/* shrink-0 prevents the input block from compressing */}

            <div className="grid w-full shrink-0 gap-2 p-2">
              <Textarea
                placeholder="Type your message here."
                className="bg-muted rounded-md border-none shadow-none"
              />

              <div className="flex justify-between">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="rounded-md"
                      size={"icon"}
                      variant={"ghost"}
                    >
                      <PlusIcon />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent side="top" align="start">
                    <DropdownMenuGroup>
                      <DropdownMenuItem>Profile</DropdownMenuItem>

                      <DropdownMenuItem>Billing</DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button className="rounded-md" size={"icon"}>
                  <SendHorizonalIcon />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-1 flex-col overflow-hidden rounded-r-md border-t border-r border-b">
            <ScrollArea className="min-h-0 w-full flex-1 gap-5 px-2 py-4">
              <div className="space-y-4"></div>
            </ScrollArea>
          </div>
        </div>
      </main>
    </div>
  );
}
