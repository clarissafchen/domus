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
          "mb-4 flex items-start gap-3",
          message.role === "assistant" ? "" : "flex-row-reverse",
        )}
      >
        {message.role === "assistant" ? (
          <img
            src="/domus-bot.svg"
            alt="Domus"
            className="mt-1 size-10 shrink-0"
          />
        ) : (
          ""
        )}
        <div
          className={clsx(
            "text-sm",
            message.role === "assistant"
              ? "max-w-[520px] rounded-tr-xl rounded-br-xl rounded-bl-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 shadow-sm"
              : "max-w-[320px] rounded-tl-md rounded-b-md border border-blue-100 bg-blue-50 p-2 text-blue-900",
            message.role === "user" && size === "lg" ? "max-w-[420px]" : "",
          )}
        >
          {message.role === "assistant" ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.text}
            </ReactMarkdown>
          ) : (
            <div>
              {message.text ? <p>{message.text}</p> : null}
              {message.attachmentName ? (
                <p className="mt-2 text-sm text-blue-700/80 truncate max-w-[260px]">
                  📎 {message.attachmentName}
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
