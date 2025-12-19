import { Header } from "@/components/layout/header"
import { ChatContainer } from "@/components/chat/chat-container"

export const metadata = {
  title: "Chat - Wisconsin Legal AI",
  description: "Ask questions about Wisconsin law enforcement legal matters",
}

export default function ChatPage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 relative">
        <ChatContainer />
      </main>
    </div>
  )
}
