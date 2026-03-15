import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { MessageType } from "@/app/page";

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
          message.role === "assistant" ? "" : "flex flex-row-reverse",
        )}
      >
        {message.role === "assistant" ? (
          <div className="mb-4 size-4 bg-black"></div>
        ) : (
          ""
        )}
        <div
          className={clsx(
            "text-sm",
            message.role === "assistant"
              ? "prose prose-sm prose-blue max-w-none"
              : "max-w-[320px] rounded-tl-md rounded-b-md border border-blue-100 bg-blue-50 p-2 text-blue-900",
            message.role === "user" && size === "lg" ? "max-w-[420px]" : "",
          )}
        >
          {message.role === "assistant" ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.text}
            </ReactMarkdown>
          ) : (
            message.text
          )}
        </div>
      </div>
    </div>
  );
}
