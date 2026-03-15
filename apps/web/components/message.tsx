import { MessageType } from "@/app/page";
import clsx from "clsx";

export default function Message({ message }: { message: MessageType }) {
  return (
    <div>
      <div
        className={clsx(
          message.role === "assistant" ? "" : "flex flex-row-reverse",
        )}
      >
        {message.role === "assistant" ? (
          <div className="size-4 bg-black mb-4"></div>
        ) : (
          ""
        )}
        <div
          className={clsx(
            "text-sm",
            message.role === "assistant"
              ? ""
              : "w-[320px] rounded-tl-md rounded-b-md border border-blue-100 bg-blue-50 p-2 text-blue-900",
          )}
        >
          {message.text}
        </div>
      </div>
    </div>
  );
}
