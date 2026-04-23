"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircleMore, Send, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const { connection } = useSignalR();
  const pathname = usePathname();

  const isGame = pathname?.split("/").includes("game");
  const positionClass = isGame ? "bottom-2 right-2" : "bottom-4 right-4";
  const buttonSize = isGame ? "w-10 h-10" : "w-12 h-12";

  useEffect(() => {
    setUser(getUserData());
  }, []);

  useEffect(() => {
    if (initialChatHistory.length > 0) setMessages(initialChatHistory);
  }, [initialChatHistory]);

  useEffect(() => {
    if (!connection) return;

    const handleReceiveMessage = (msg: Message) => {
      setMessages(prev => [...prev, msg]);

      setUnread(prev => {
        const isMe = msg.playerChat.playerId === user?.Id;
        if (!open && !isMe) return prev + 1;
        return prev;
      });
    };

    connection.on("ReceiveMessage", handleReceiveMessage);
    return () => connection.off("ReceiveMessage", handleReceiveMessage);
  }, [connection, open, user]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  };

  useEffect(() => {
    if (open) scrollToBottom();
  }, [messages, open]);
  useEffect(() => {
    if (open) {
      setUnread(0);
      scrollToBottom();
    }
  }, [open]);

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
      scrollToBottom();
    } catch (err) {
      console.error("SendMessage failed:", err);
    }
  };

  return (
    <>
      {/* OVERLAY — chỉ mobile */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[9990] md:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={cn(
              // ── MOBILE ──
              // Chiếm toàn màn hình, dùng flex column
              // Header + Footer cố định, content flex-1
              "fixed inset-0 z-[10000] flex flex-col bg-white",

              // ── DESKTOP ──
              "md:inset-auto md:shadow-2xl md:border",
              "md:right-5 md:w-[380px] md:h-[520px]",
              isGame ? "md:bottom-[52px]" : "md:bottom-[68px]"
            )}
          >
            {/* ── HEADER — cố định trên cùng ── */}
            <div className="flex-none px-5 py-4 flex justify-between items-center  bg-white">
              <div className="flex items-center gap-2">
                <MessageCircleMore size={20} className="text-blue-500" />
                <span className="font-bold text-base text-gray-800">
                  {isGame ? "Game Chat" : "Lobby Chat"}
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* ── CONTENT — tự co giãn, chỉ vùng này scroll ── */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 space-y-2"
              style={{ overscrollBehavior: "contain" }}
            >
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                  <MessageCircleMore size={36} className="opacity-30" />
                  <p className="text-sm">Chưa có tin nhắn nào</p>
                </div>
              )}

              {messages.map((m, i) => {
                const isMe = m.playerChat.playerId === user?.Id;

                const prev = messages[i - 1];
                const next = messages[i + 1];

                const isSameUser =
                  prev && prev.playerChat.playerId === m.playerChat.playerId;

                const isLastOfGroup =
                  !next || next.playerChat.playerId !== m.playerChat.playerId;

                return (
                  <div
                    key={m.id}
                    className={cn(
                      "flex items-end gap-2",
                      isMe ? "justify-end" : "justify-start"
                    )}
                  >
                    {/* Avatar */}
                    {!isMe && !isSameUser && (
                      <div
                        className={cn(
                          "w-9 h-9 rounded-full text-white text-sm font-semibold",
                          "flex items-center justify-center shrink-0",
                          getAvatarColor(m.playerChat.name)
                        )}
                      >
                        {m.playerChat.name[0].toUpperCase()}
                      </div>
                    )}

                    {!isMe && isSameUser && <div className="w-9 shrink-0" />}

                    {/* Message block */}
                    <div
                      className={cn(
                        "flex flex-col max-w-[72%]",
                        isMe && "items-end"
                      )}
                    >
                      {/* 👥 Header (người khác) */}
                      {!isMe && !isSameUser && (
                        <div className="text-xs text-gray-500 ml-1 mb-1 font-medium">
                          {m.playerChat.name},{m.time}
                          {
                            <span className="font-normal ml-1 text-gray-400">
                              · {m.time}
                            </span>
                          }
                        </div>
                      )}

                      {/* 💬 Bubble + hover time */}
                      <div className="group relative">
                        <div
                          className={cn(
                            "px-4 py-2.5 break-words w-fit text-[15px] leading-snug",
                            isMe
                              ? "bg-blue-500 text-white rounded-2xl rounded-br-sm"
                              : "bg-white text-gray-800 rounded-2xl rounded-bl-sm border border-gray-100 shadow-sm"
                          )}
                        >
                          {m.message}
                        </div>

                        {/* ⏱ Tooltip time (hover từng message) */}
                        {!isLastOfGroup && (
                          <div
                            className={cn(
                              "absolute bottom-full mb-1 text-xs text-white bg-black/70 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap",
                              isMe ? "right-0" : "left-0"
                            )}
                          >
                            {m.time}
                          </div>
                        )}
                      </div>

                      {/* 👤 Time của mình (chỉ message cuối) */}
                      {isMe && isLastOfGroup && (
                        <div className="text-xs text-gray-400 mt-1 mr-1">
                          {m.time}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── FOOTER — cố định dưới cùng, keyboard đẩy lên ── */}
            <div className="flex-none px-4 py-3 flex gap-3 border-t bg-white">
              <input
                ref={inputRef}
                className="flex-1 bg-gray-100 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="Nhập tin nhắn..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                onFocus={scrollToBottom}
                style={{ fontSize: "16px" }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || !connection || !user}
                className={cn(
                  "w-12 h-12 flex items-center justify-center rounded-full shrink-0 transition",
                  input.trim()
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-gray-200 text-gray-400"
                )}
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WIDGET BUTTON */}
      <div
        className={`fixed ${positionClass} z-[9999]`}
        onClick={() => setOpen(prev => !prev)}
      >
        <motion.div
          whileHover={{ scale: 1.12, rotate: 6 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className={cn(
            "flex items-center justify-center relative",
            buttonSize,
            "rounded-xl bg-gradient-to-br from-blue-400 to-blue-600",
            "shadow-lg shadow-blue-500/40 cursor-pointer"
          )}
        >
          <MessageCircleMore className="text-white" size={22} />
          {unread > 0 && !open && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-bold px-1"
            >
              {unread > 9 ? "9+" : unread}
            </motion.div>
          )}
        </motion.div>
      </div>
    </>
  );
}
