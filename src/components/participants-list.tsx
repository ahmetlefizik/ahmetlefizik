"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Users, Circle, Crown, UserX, Flame, MoreVertical, ShieldCheck, Ban, Cat, BellRing } from "lucide-react";
import { useAppContext } from "@/components/session-provider";

function formatTimeShort(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ParticipantsList() {
  const { user, activeGroup, isGroupOwner, isModerator, kickMember, assignModerator, sendMessage } = useAppContext();

  const handlePoke = (targetName: string) => {
    if (!user || !activeGroup) return;
    const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");
    audio.play().catch(() => {});
    sendMessage(activeGroup.id, `${user.name}, ${targetName} adlı kullanıcıyı dürttü! 👉`, true);
  };

  if (!activeGroup) {
    return (
      <Card className="relative overflow-hidden border-border/50 bg-card shadow-sm">
        <CardHeader className="relative flex flex-row items-center gap-2 pb-3">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold">Katılımcılar</CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Users className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Bir oda seçin</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const members = activeGroup.members;
  const ownerIsMe = isGroupOwner(activeGroup.id);

  return (
    <Card className="h-full flex flex-col relative overflow-hidden border-border/50 bg-card shadow-sm">
      <CardHeader className="relative flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold">Katılımcılar</CardTitle>
        </div>
        <Badge variant="outline" className="text-xs">{members.length} kişi</Badge>
      </CardHeader>
      <CardContent className="relative">
        <ScrollArea className="h-[280px]">
          <div className="space-y-1">
            {members.map((m) => {
              const isMe = m.id === user?.id;
              const isOwner = m.id === activeGroup.ownerId;
              return (
                <div key={m.id} className={`flex items-center gap-3 rounded-lg p-2.5 transition-all duration-200 hover:bg-muted/30 group ${isMe ? "bg-primary/5 border border-primary/10" : ""}`}>
                  <div className="relative">
                    <Avatar className="h-9 w-9">
                      {m.image && <AvatarImage src={m.image} alt={m.name} />}
                      <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">{m.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <Circle className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card fill-emerald-500 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium truncate">{m.name}</p>
                      {isOwner && <Crown className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                      {!isOwner && activeGroup.moderators.includes(m.id) && <ShieldCheck className="h-3 w-3 text-blue-400 shrink-0" title="Moderatör" />}
                      {isMe && <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/30 text-primary">Sen</Badge>}
                      {m.streak !== undefined && m.streak > 0 && (
                        <div className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20" title={`${m.streak} gün seri`}>
                          {m.streak >= 30 ? <Cat className="h-3 w-3 -ml-0.5 text-orange-500" /> : <Flame className="h-3 w-3 -ml-0.5" />}
                          {m.streak}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{m.timerActive ? "Çalışıyor..." : "Boşta"}</p>
                  </div>
                  {m.timerActive && m.timeLeft !== undefined && (
                    <Badge className="bg-primary/15 text-primary border border-primary/25 text-xs font-mono tabular-nums animate-pulse">
                      {formatTimeShort(m.timeLeft)}
                    </Badge>
                  )}
                  {!isMe && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary hover:bg-primary/10 mr-1" onClick={() => handlePoke(m.name)} title={`${m.name} adlı kullanıcıyı dürt`}>
                      <BellRing className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {ownerIsMe && !isOwner && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        {!activeGroup.moderators.includes(m.id) && (
                          <DropdownMenuItem onClick={() => assignModerator(activeGroup.id, m.id)} className="cursor-pointer">
                            <ShieldCheck className="h-3.5 w-3.5 mr-2" />
                            Moderatör Yap
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => kickMember(activeGroup.id, m.id)} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                          <UserX className="h-3.5 w-3.5 mr-2" />
                          Odadan Çıkar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => kickMember(activeGroup.id, m.id, true)} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                          <Ban className="h-3.5 w-3.5 mr-2" />
                          Gruptan Engelle
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
