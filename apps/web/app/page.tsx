"use client";

import Message from "@/components/message";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldLabel } from "@/components/ui/field";

import { ScrollArea } from "@/components/ui/scroll-area";

import { Textarea } from "@/components/ui/textarea";
import clsx from "clsx";

import {
  AudioLinesIcon,
  BirdhouseIcon,
  EllipsisIcon,
  LogOutIcon,
  PanelRightClose,
  PanelRightOpen,
  PaperclipIcon,
  PlusIcon,
  SendHorizonalIcon,
  Settings2Icon,
  SettingsIcon,
  SquarePenIcon,
  TrashIcon,
  UserIcon,
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";

export type MessageType = {
  role: "user" | "assistant";
  text: string;
  status?: "active" | "completed";
};

export default function Home() {
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [showCompleted, setShowCompleted] = useState<boolean>(false);
  const [items, setItems] = useState<
    { id: string; text: string; status: "active" | "completed" }[]
  >([]);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([
    {
      role: "assistant",
      text: "Hi, I'm Domus. Ask me about your household tasks or tell me something to remember.",
    },
  ]);
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setTime(new Date());
    }, 0);

    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

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

  const deleteMemory = async (id: string) => {
    await fetch(`${API_URL}/memory`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    await getMemory();
  };

  const updateMemory = async (id: string, status: "active" | "completed") => {
    try {
      await fetch(`${API_URL}/memory`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      });

      await getMemory();
    } catch (err) {
      console.error("Failed to update memory:", err);
      await getMemory();
    }
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
          status: "active",
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

  const menuItems = ["File", "Edit", "View", "Go", "Window", "Help"];

  return (
    <div className="relative flex h-[100dvh] flex-col items-center justify-center">
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/10-4.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 1,
        }}
      />
      <div className="z-20 flex h-[22px] w-full items-center justify-between border-b border-[#8e8e8e] bg-gradient-to-b from-[#f9f9f9] via-[#e2e2e2] to-[#c9c9c9] px-4 text-[13px] text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] select-none">
        <div className="flex cursor-default items-center [text-shadow:0_1px_0_rgba(255,255,255,0.7)]">
          <div className="mr-2 size-3 -translate-y-[1px] bg-black"></div>
          <span className="px-2 font-bold tracking-wide hover:bg-blue-500 hover:text-white hover:[text-shadow:none]">
            Domus
          </span>

          <ul className="flex gap-2">
            {menuItems.map((item) => (
              <li
                key={item}
                className="px-1.5 font-medium hover:bg-blue-500 hover:text-white hover:[text-shadow:none]"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex cursor-default items-center space-x-2 font-medium [text-shadow:0_1px_0_rgba(255,255,255,0.7)]">
          <span>
            {time
              ? `${time.toLocaleDateString("en-US", { weekday: "short" })} ${time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
              : ""}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="px-2 hover:bg-blue-500 hover:text-white hover:[text-shadow:none]">
                clarissa
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <UserIcon className="mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings2Icon className="mr-2" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOutIcon className="mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex size-4 items-center justify-center rounded-full border border-blue-700 bg-blue-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
            <svg
              className="h-2.5 w-2.5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      <div className="z-10 flex w-full max-w-6xl flex-1 flex-col overflow-hidden py-8">
        <div className="flex min-h-0 w-full flex-1 overflow-hidden">
          {/* Main Chat Panel */}
          <div
            className={clsx(
              "flex flex-col overflow-hidden border bg-white transition-all duration-300 ease-in-out",
              showSidebar ? "w-1/2 rounded-l-md" : "w-full rounded-md",
            )}
          >
            <div className="flex items-center justify-between border-b px-4 py-2">
              <div className="flex items-center gap-2">
                <BirdhouseIcon className="size-[20px]" />
                <label className="text-lg font-bold">My Family</label>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant={"ghost"}
                  size={"icon"}
                  onClick={() => setShowSidebar(!showSidebar)}
                >
                  {showSidebar ? <PanelRightClose /> : <PanelRightOpen />}
                </Button>
              </div>
            </div>

            <ScrollArea className="min-h-0 w-full flex-1">
              <div className="space-y-6 p-4">
                {messages.map((message, index) => (
                  <Message
                    key={index}
                    message={message}
                    size={showSidebar ? "default" : "lg"}
                  />
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

                  <DropdownMenuContent
                    side="top"
                    align="start"
                    className="w-56"
                  >
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <PaperclipIcon className="mr-2" />
                        Add photos &amp; files
                      </DropdownMenuItem>
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
              "flex flex-col overflow-hidden bg-white/40 backdrop-blur-lg transition-all duration-300 ease-in-out",
              showSidebar
                ? "w-1/2 rounded-r-md border-t border-r border-b opacity-100"
                : "w-0 border-none opacity-0",
            )}
          >
            {/* Fixed-width inner wrapper to prevent text reflow during transition */}
            <div className="flex h-full w-[575px] flex-col">
              <ScrollArea className="min-h-0 w-full flex-1">
                <div className="space-y-4 p-4">
                  {items
                    .filter((item) => showCompleted || item.status === "active")
                    .sort((a, b) => {
                      // Sort by the *real* status, not the pending optimistic one,
                      // so it stays in place until the 1.5s delay finishes
                      if (a.status === "active" && b.status === "completed")
                        return -1;
                      if (a.status === "completed" && b.status === "active")
                        return 1;
                      return 0;
                    })
                  .map((item) => {
                    return (
                      <li key={item.id} className="list-none">
                        <Field orientation="horizontal">
                          <Checkbox
                            id={`toggle-checkbox-${item.id}`}
                            name="toggle-checkbox"
                            className="bg-white"
                            checked={item.status === "completed"}
                            onCheckedChange={(checked) => {
                              updateMemory(
                                item.id,
                                checked === true ? "completed" : "active",
                              );
                            }}
                          />
                          <FieldLabel
                            htmlFor={`toggle-checkbox-${item.id}`}
                            className={clsx(
                              item.status === "active"
                                ? ""
                                : "text-muted-foreground",
                            )}
                          >
                            {item.text}
                          </FieldLabel>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant={"ghost"}
                                size={"icon"}
                                className="hover:bg-white/20 aria-expanded:bg-white/20"
                              >
                                <EllipsisIcon />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuGroup>
                                <DropdownMenuItem disabled>
                                  <SquarePenIcon className="mr-2" />
                                  Edit (soon)
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => deleteMemory(item.id)}
                                >
                                  <TrashIcon className="mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </Field>
                      </li>
                    );
                  })}
                </div>
              </ScrollArea>
              <div className="shrink-0 p-4">
                <div className="flex flex-row-reverse">
                  <Button
                    variant={"ghost"}
                    className="hover:bg-white/20"
                    onClick={() => setShowCompleted(!showCompleted)}
                  >
                    {showCompleted ? "Hide Completed" : "Show Completed"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="z-20 h-16 w-200 bg-white/60 backdrop-blur-lg"></div> */}
    </div>
  );
}
