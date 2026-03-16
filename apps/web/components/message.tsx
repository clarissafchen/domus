import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { MessageType } from "@/app/page";
import { PaperclipIcon } from "lucide-react";

export default function Message({
  message,
  size,
}: {
  message: MessageType;
  size?: string;
}) {
  return (
    <div>
      <div
        className={clsx(
          "px-4",
          message.role === "assistant" ? "" : "flex flex-row-reverse",
        )}
      >
        {message.role === "assistant" ? (
          <div>
            <img
              src="/domus-bot.svg"
              alt="Domus"
              className="mt-1 size-8 shrink-0"
            />
          </div>
        ) : (
          ""
        )}
        <div
          className={clsx(
            "flex flex-col gap-2 text-sm",
            message.role === "assistant"
              ? "max-w-[520px] py-3 text-slate-800"
              : "max-w-[320px] rounded-tl-md rounded-b-md border border-blue-100 bg-blue-50 p-2 text-blue-900",
            message.role === "user" && size === "lg" ? "max-w-[420px]" : "",
          )}
        >
          {message.role === "assistant" ? (
            <div>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.text}
              </ReactMarkdown>
            </div>
          ) : (
            <>
              {message.text ? <p>{message.text}</p> : null}
              {message.attachmentName ? (
                <div className="max-w-[260px] truncate text-sm text-blue-700/80">
                  <PaperclipIcon className="mr-2 inline size-4" />
                  <span>{message.attachmentName}</span>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
