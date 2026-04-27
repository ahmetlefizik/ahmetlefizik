"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send } from "lucide-react";
import { useAppContext } from "@/components/session-provider";

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  time: string;
}

export function GroupChat() {
  const { user, activeGroup, sendMessage } = useAppContext();
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeGroup?.messages]);

  if (!activeGroup) return null;

  const handleSendMessage = () => {
    const text = newMessage.trim();
    if (!text || !user) return;
    sendMessage(activeGroup.id, text);
    setNewMessage("");
  };

  return (
    <Card className="h-full flex flex-col relative overflow-hidden border-border/50 bg-card shadow-sm">
      <CardHeader className="relative flex flex-row items-center gap-2 pb-3">
        <MessageCircle className="h-5 w-5 text-primary" />
        <CardTitle className="text-lg font-semibold">Grup Sohbeti</CardTitle>
      </CardHeader>
      <CardContent className="relative flex-1 flex flex-col gap-3">
        <ScrollArea className="h-[320px] pr-2" ref={scrollRef}>
          <div className="space-y-3">
            {activeGroup.messages.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-10">Sohbete ilk mesajı sen gönder!</p>
            ) : (
              activeGroup.messages.map((msg) => {
                const isSelf = msg.senderId === user?.id;
                if (msg.isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center my-2">
                      <span className="bg-muted/50 px-3 py-1 rounded-full text-[10px] text-muted-foreground/80 font-medium">
                        {msg.text} • {msg.time}
                      </span>
                    </div>
                  );
                }
                return (
                  <div key={msg.id} className={`flex ${isSelf ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${isSelf ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted/50 text-foreground rounded-bl-md"}`}>
                      {!isSelf && <p className="text-xs font-semibold mb-0.5 text-primary/80">{msg.senderName}</p>}
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${isSelf ? "text-primary-foreground/60" : "text-muted-foreground/60"}`}>{msg.time}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
        <div className="flex gap-2">
          <Input placeholder="Mesaj yaz..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }} className="bg-background/40 border-border/30 placeholder:text-muted-foreground/40" />
          <Button size="icon" onClick={handleSendMessage} className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"><Send className="h-4 w-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}
