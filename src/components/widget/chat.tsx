"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircleMore, X } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/src/utils";
import { usePathname } from "next/navigation";
import { useSignalR } from "@/src/components/signalR/signalRProvider";
import { Message, UserData } from "@/src/types/chat";

type ChatWidgetProps = {
  roomId: string;
  initialChatHistory?: Message[];
};

const getAvatarColor = (name: string) => {
  const colors = [
    "bg-red-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-yellow-500",
    "bg-pink-500"
  ];
  return colors[name.charCodeAt(0) % colors.length];
};

const getUserData = (): UserData | null => {
  try {
    const raw = localStorage.getItem("user_data");
    if (!raw) return null;
    return JSON.parse(raw) as UserData;
  } catch {
    return null;
  }
};

export default function ChatWidget({
  roomId,
  initialChatHistory = []
}: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(0);
  const [user, setUser] = useState<UserData | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const { connection } = useSignalR();
  const pathname = usePathname();

  const isGame = pathname?.split("/").includes("game");
  const sizeClass = isGame ? "sm:w-8 sm:h-8 w-10 h-10" : "w-12 h-12";
  const positionClass = isGame ? "bottom-2 right-2" : "bottom-4 right-4";
  const bottomChatClass = isGame ? "md:bottom-[42px]" : "md:bottom-[68px]";

  useEffect(() => {
    setUser(getUserData());
  }, []);

  useEffect(() => {
    if (initialChatHistory.length > 0) {
      setMessages(initialChatHistory);
    }
  }, [initialChatHistory]);

  useEffect(() => {
    if (!connection) return;

    const handleReceiveMessage = (msg: Message) => {
      setMessages(prev => [...prev, msg]);
      setUnread(prev => prev + 1);
    };

    connection.on("ReceiveMessage", handleReceiveMessage);

    return () => {
      connection.off("ReceiveMessage", handleReceiveMessage);
    };
  }, [connection]); // ← bỏ open ra

  // ── Auto scroll ──
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages, open]);

  // ── Reset unread khi mở ──
  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  // ── Gửi tin nhắn ──
  const sendMessage = async () => {
    if (!input.trim() || !connection || !user) return;

    try {
      await connection.invoke(
        "SendMessage",
        roomId,
        user.Id,
        user.Name,
        input.trim()
      );
      setInput("");
    } catch (err) {
      console.error("SendMessage failed:", err);
    }
  };

  return (
    <>
      {/* OVERLAY mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9990] md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* CHAT PANEL */}
      {open && (
        <div
          className={cn(
            "fixed z-[10000] flex flex-col transition-all duration-300",
            "left-0 right-0 bottom-0 top-0 sm:rounded-t-2xl bg-white",
            "md:top-auto md:left-auto md:right-5   md:w-[380px] md:h-[560px] md:rounded-2xl md:shadow-2xl md:border",
            bottomChatClass
          )}
        >
          {/* Header */}
          <div className="px-4 py-3 flex justify-between items-center border-b">
            <span className="font-semibold text-gray-800">
              {isGame ? "Game Chat" : "Lobby Chat"}
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-3 py-4 bg-gray-50 space-y-1"
          >
            {messages.length === 0 && (
              <div className="text-center text-gray-400 text-sm mt-8">
                Chưa có tin nhắn nào
              </div>
            )}

            {messages.map((m, i) => {
              const isMe = m.playerChat.playerId === user?.Id;
              const prev = messages[i - 1];
              const isSameUser =
                prev && prev.playerChat.name === m.playerChat.name;

              return (
                <div
                  key={m.id}
                  className={cn(
                    "flex items-end gap-2",
                    isMe ? "justify-end" : "justify-start"
                  )}
                >
                  {!isMe && !isSameUser && (
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full text-white text-xs flex items-center justify-center shrink-0",
                        getAvatarColor(m.playerChat.name)
                      )}
                    >
                      {m.playerChat.name[0]}
                    </div>
                  )}
                  {!isMe && isSameUser && <div className="w-8 shrink-0" />}

                  <div className="flex flex-col">
                    {!isMe && !isSameUser && (
                      <div className="text-xs text-gray-500 ml-1 mb-1">
                        {m.playerChat.name} · {m.time}
                      </div>
                    )}
                    <div
                      className={cn(
                        "px-4 py-2 text-sm max-w-[260px] break-words w-fit",
                        isMe
                          ? "bg-blue-500 text-white rounded-2xl rounded-br-md"
                          : "bg-white text-gray-800 rounded-2xl rounded-bl-md shadow"
                      )}
                    >
                      {m.message}
                    </div>
                    {isMe && (
                      <div className="text-xs text-gray-400 text-right mt-1 mr-1">
                        {m.time}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div className="p-3 flex gap-2 border-t">
            <input
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || !connection || !user}
              className="bg-blue-500 text-white px-4 py-2 rounded-full disabled:opacity-50 transition"
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* WIDGET BUTTON */}
      <div
        className={`fixed ${positionClass} z-[9999]`}
        onClick={() => setOpen(prev => !prev)}
      >
        <motion.div
          whileHover={{ scale: 1.15, rotate: 8 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className={cn(
            "flex items-center justify-center relative",
            sizeClass,
            "rounded-sm sm:rounded-lg",
            "bg-gradient-to-br from-blue-400 to-blue-700",
            "shadow-lg shadow-black/50",
            "ring-1 ring-white/20",
            "cursor-pointer"
          )}
        >
          <MessageCircleMore className="text-white" size={26} />

          {unread > 0 && !open && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {unread > 9 ? "9+" : unread}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}
