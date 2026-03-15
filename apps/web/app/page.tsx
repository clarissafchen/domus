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
    { text: string; status: "active" | "completed" }[]
  >([]);
  // Visual state to let UI show checkmarks before disappearing
  const [pendingUpdates, setPendingUpdates] = useState<
    Record<string, "active" | "completed">
  >({});
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

    await getMemory(); // Refresh the list after deleting
  };

  const updateMemory = async (text: string, status: "active" | "completed") => {
    // Show the checkmark locally right away
    setPendingUpdates((prev) => ({ ...prev, [text]: status }));

    try {
      await fetch(`${API_URL}/memory`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, status }),
      });

      // Filter it out of the master list after seeing the checkmark
      setTimeout(() => {
        setItems((prev) =>
          prev.map((item) => (item.text === text ? { ...item, status } : item)),
        );
        // Clean up our floating visual state once it is officially recorded
        setPendingUpdates((prev) => {
          const newState = { ...prev };
          delete newState[text];
          return newState;
        });
      }, 1500);
    } catch (err) {
      console.error("Failed to update memory:", err);
      // Revert visual state
      setPendingUpdates((prev) => {
        const newState = { ...prev };
        delete newState[text];
        return newState;
      });
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

  return (
    <div className="relative flex h-[100dvh] flex-col items-center justify-center py-8">
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/10-4.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 1,
        }}
      />
      <main className="z-10 flex w-full max-w-6xl flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 w-full flex-1 overflow-hidden">
          {/* Main Chat Panel */}
          <div
            className={clsx(
              "flex flex-col overflow-hidden border border-blue-100 bg-white transition-all duration-300 ease-in-out",
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant={"ghost"} size={"icon"}>
                      <SettingsIcon />
                    </Button>
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
              </div>
            </div>

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
                ? "w-1/2 rounded-r-md border-t border-r border-b border-blue-100 opacity-100"
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
                      // Overlay pending state if item is animating out
                      const visualStatus =
                        pendingUpdates[item.text] ?? item.status;

                      return (
                        <li key={item.text} className="list-none">
                          <Field orientation="horizontal">
                            <Checkbox
                              id={`toggle-checkbox-${item.text.replace(/\s+/g, "-")}`}
                              name="toggle-checkbox"
                              className="bg-white"
                              checked={visualStatus === "completed"}
                              onCheckedChange={(checked) => {
                                updateMemory(
                                  item.text,
                                  checked ? "completed" : "active",
                                );
                              }}
                            />
                            <FieldLabel
                              htmlFor={`toggle-checkbox-${item.text.replace(/\s+/g, "-")}`}
                              className={clsx(
                                visualStatus === "active"
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
                                  <DropdownMenuItem
                                    onClick={() => deleteMemory(item.text)}
                                  >
                                    <SquarePenIcon className="mr-2" />
                                    Edit
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() => deleteMemory(item.text)}
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
      </main>
    </div>
  );
}
