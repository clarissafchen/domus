import { MessageType } from "@/app/page";

export default function Message({ message } : {message: MessageType}) {
  return <div>{message.text}</div>
}
