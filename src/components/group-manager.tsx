"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, LogIn, Users, Copy, Check, DoorOpen, Crown, Sparkles } from "lucide-react";
import { useAppContext } from "@/components/session-provider";

export function GroupManager() {
  const { user, groups, activeGroup, setActiveGroupId, createGroup, joinGroup } = useAppContext();

  const [newGroupName, setNewGroupName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinError, setJoinError] = useState("");

  const myGroups = groups.filter((g) => g.members.some((m) => m.id === user?.id));

  const handleCreate = () => {
    if (!newGroupName.trim()) return;
    createGroup(newGroupName.trim());
    setNewGroupName("");
    setCreateOpen(false);
  };

  const handleJoin = () => {
    setJoinError("");
    const ok = joinGroup(joinCode);
    if (ok) {
      setJoinCode("");
      setJoinOpen(false);
    } else {
      setJoinError("Geçersiz oda kodu. Tekrar deneyin.");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <Card className="h-full flex flex-col relative overflow-hidden border-border/50 bg-card shadow-sm">
      <CardHeader className="relative flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <DoorOpen className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold">Çalışma Odaları</CardTitle>
        </div>
        <div className="flex gap-2">
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger render={<Button size="sm" className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20" />}>
              <Plus className="h-3.5 w-3.5" />
              Oda Oluştur
            </DialogTrigger>
            <DialogContent className="bg-card border-border/50">
              <DialogHeader>
                <DialogTitle>Yeni Çalışma Odası</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Oda Adı</label>
                  <Input placeholder="Örn: Fizik Çalışma Grubu" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }} className="bg-background/40" autoFocus />
                </div>
                <Button onClick={handleCreate} className="w-full gap-2 bg-primary hover:bg-primary/90" disabled={!newGroupName.trim()}>
                  <Sparkles className="h-4 w-4" /> Oda Oluştur
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
            <DialogTrigger render={<Button size="sm" variant="outline" className="gap-1.5" />}>
              <LogIn className="h-3.5 w-3.5" /> Katıl
            </DialogTrigger>
            <DialogContent className="bg-card border-border/50">
              <DialogHeader>
                <DialogTitle>Odaya Katıl</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Oda Kodu</label>
                  <Input placeholder="Örn: FZK101" value={joinCode} onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setJoinError(""); }} onKeyDown={(e) => { if (e.key === "Enter") handleJoin(); }} className="bg-background/40 font-mono tracking-widest text-center text-lg" maxLength={8} autoFocus />
                  {joinError && <p className="text-xs text-destructive">{joinError}</p>}
                </div>
                <Button onClick={handleJoin} className="w-full gap-2 bg-primary hover:bg-primary/90" disabled={joinCode.trim().length < 3}>
                  <LogIn className="h-4 w-4" /> Odaya Katıl
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="relative">
        {myGroups.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/30"><Users className="h-6 w-6 text-muted-foreground/50" /></div>
            <div><p className="text-sm font-medium text-muted-foreground">Henüz bir odanız yok</p><p className="text-xs text-muted-foreground/70">Bir oda oluşturun veya koda katılın</p></div>
          </div>
        ) : (
          <ScrollArea className="max-h-[200px]">
            <div className="space-y-2">
              {myGroups.map((g) => {
                const isActive = activeGroup?.id === g.id;
                const isOwner = g.ownerId === user?.id;
                return (
                  <div key={g.id} className={`flex items-center gap-3 rounded-lg p-3 cursor-pointer transition-all duration-200 border ${isActive ? "bg-primary/10 border-primary/30" : "bg-muted/10 border-transparent hover:bg-muted/20 hover:border-border/30"}`} onClick={() => setActiveGroupId(isActive ? null : g.id)}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm shrink-0">{g.name.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5"><p className="text-sm font-semibold truncate">{g.name}</p>{isOwner && <Crown className="h-3 w-3 text-amber-400 shrink-0" />}</div>
                      <p className="text-xs text-muted-foreground">{g.members.length} üye</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="font-mono text-[10px] px-2 py-0.5 h-5">{g.code}</Badge>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={(e) => { e.stopPropagation(); copyCode(g.code); }} title="Kodu kopyala">
                        {copiedCode === g.code ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
