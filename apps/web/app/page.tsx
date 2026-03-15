"use client";

import Message from "@/components/message";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldLabel } from "@/components/ui/field";

import { ScrollArea } from "@/components/ui/scroll-area";

import { Textarea } from "@/components/ui/textarea";
import clsx from "clsx";

import {
  AudioLinesIcon,
  EllipsisIcon,
  PanelRightClose,
  PanelRightOpen,
  PlusIcon,
  SendHorizonalIcon,
  TrashIcon,
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";

export type MessageType = {
  role: "user" | "assistant";

  text: string;
};

export default function Home() {
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [items, setItems] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([
    {
      role: "assistant",
      text: "Hi, I'm Domus. Ask me about your household tasks or tell me something to remember.",
    },
  ]);

  const API_URL = "http://127.0.0.1:8000";

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

    console.log({ payload });

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

        body: JSON.stringify({
          message: payload,
          user_id: "clarissa",
          session_id: "domus-demo",
        }),
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

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    const payload = input.trim();

    if (payload) {
      createMemory(payload);
    } else {
      // Execute Voice Recording / AudioLinesIcon logic
      console.log("Initialize Web Audio API sequence");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
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
      <main className="flex w-full max-w-6xl flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between">
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

          <div className="flex items-center">
            <Button
              variant={"secondary"}
              size={"icon"}
              className="size-7"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              {showSidebar ? <PanelRightClose /> : <PanelRightOpen />}
            </Button>
          </div>
        </div>

        <div className="mt-6 flex min-h-0 flex-1 w-full overflow-hidden">
          {/* Main Chat Panel */}
          <div
            className={clsx(
              "flex flex-col overflow-hidden border bg-white transition-all duration-300 ease-in-out",
              showSidebar ? "w-1/2 rounded-l-md" : "w-full rounded-md"
            )}
          >
            <ScrollArea className="min-h-0 w-full flex-1">
              <div className="space-y-6 p-4">
                {messages.map((message, index) => (
                  <Message key={index} message={message} />
                ))}
              </div>
            </ScrollArea>

            <form
              className="grid w-full shrink-0 gap-2 p-4"
              onSubmit={handleSubmit}
            >
              <Textarea
                placeholder="What do I need to know?"
                className="bg-muted rounded-md border-none shadow-none"
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                value={input}
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
                      <DropdownMenuItem>
                        Add photos &amp; files
                      </DropdownMenuItem>
                      <DropdownMenuItem>Add from Drive</DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button type="submit" className="rounded-md" size={"icon"}>
                  {input ? <SendHorizonalIcon /> : <AudioLinesIcon />}
                </Button>
              </div>
            </form>
          </div>

          {/* Sidebar Panel */}
          <div
            className={clsx(
              "flex flex-col overflow-hidden bg-white/40 transition-all duration-300 ease-in-out",
              showSidebar
                ? "w-1/2 rounded-r-md border-t border-r border-b opacity-100"
                : "w-0 border-none opacity-0"
            )}
          >
            {/* Fixed-width inner wrapper to prevent text reflow during transition */}
            <div className="flex h-full w-[575px] flex-col">
              <ScrollArea className="min-h-0 w-full flex-1">
                <div className="space-y-4 p-4">
                  {items.map((item, i) => (
                    <li key={i} className="list-none">
                      <Field orientation="horizontal">
                        <Checkbox
                          id={`toggle-checkbox-${i}`}
                          name="toggle-checkbox"
                          className="bg-white"
                        />
                        <FieldLabel htmlFor={`toggle-checkbox-${i}`}>
                          {item}
                        </FieldLabel>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant={"ghost"} size={"icon"}>
                              <EllipsisIcon />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuGroup>
                              <DropdownMenuItem
                                onClick={() => deleteMemory(item)}
                              >
                                <TrashIcon className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </Field>
                    </li>
                  ))}
                </div>
              </ScrollArea>
              <div className="shrink-0 p-4">
                <div className="flex flex-row-reverse">
                  <Button variant={"secondary"}>Show Completed</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
