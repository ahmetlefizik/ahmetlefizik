"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, ClipboardList, Sparkles } from "lucide-react";
import { useAppContext } from "@/components/session-provider";

export function GroupTasks() {
  const { activeGroup } = useAppContext();
  const [tasks, setTasks] = useState<Record<string, { id: string; text: string; completed: boolean }[]>>({
    "demo-owner": [
      { id: "t1", text: "Proje planı hazırla", completed: true },
      { id: "t2", text: "OAuth ayarlarını yap", completed: false },
    ],
  });
  const [newTasks, setNewTasks] = useState<Record<string, string>>({});

  if (!activeGroup) return null;

  const getProgress = (userTasks: any[]) => {
    if (!userTasks || userTasks.length === 0) return 0;
    return Math.round((userTasks.filter((t: any) => t.completed).length / userTasks.length) * 100);
  };

  const toggleTask = (userId: string, taskId: string) => {
    setTasks((prev) => {
      const userTasks = prev[userId] || [];
      return {
        ...prev,
        [userId]: userTasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
      };
    });
  };

  const addTask = (userId: string) => {
    const text = newTasks[userId]?.trim();
    if (!text) return;

    setTasks((prev) => ({
      ...prev,
      [userId]: [...(prev[userId] || []), { id: `t${Date.now()}`, text, completed: false }],
    }));
    setNewTasks((prev) => ({ ...prev, [userId]: "" }));
  };

  return (
    <Card className="h-full flex flex-col relative overflow-hidden border-border/50 bg-card shadow-sm">
      <CardHeader className="relative flex flex-row items-center gap-2 pb-3">
        <ClipboardList className="h-5 w-5 text-primary" />
        <CardTitle className="text-lg font-semibold">Grup Görevleri</CardTitle>
        <Sparkles className="ml-auto h-4 w-4 text-primary/50" />
      </CardHeader>
      <CardContent className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeGroup.members.map((user) => {
            const userTasks = tasks[user.id] || [];
            const progressVal = getProgress(userTasks);
            return (
              <Card key={user.id} className="border-border/30 bg-muted/20 backdrop-blur-sm">
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      {user.image && <AvatarImage src={user.image} alt={user.name} />}
                      <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">{user.name.slice(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-semibold truncate">{user.name}</p>
                      <div className="flex items-center gap-2">
                        <Progress value={progressVal} className="h-1.5 flex-1 bg-muted/50" />
                        <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">% {progressVal}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-3">
                  <ScrollArea className="h-[140px] pr-2">
                    <div className="space-y-2">
                      {userTasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-2 group">
                          <Checkbox id={`task-${task.id}`} checked={task.completed} onCheckedChange={() => toggleTask(user.id, task.id)} className="border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                          <label htmlFor={`task-${task.id}`} className={`text-sm cursor-pointer transition-all duration-200 ${task.completed ? "line-through text-muted-foreground/50" : "text-foreground group-hover:text-primary"}`}>{task.text}</label>
                        </div>
                      ))}
                      {userTasks.length === 0 && <p className="text-xs text-muted-foreground italic">Henüz görev yok</p>}
                    </div>
                  </ScrollArea>
                  <div className="mt-3 flex gap-2">
                    <Input placeholder="Yeni görev ekle..." value={newTasks[user.id] || ""} onChange={(e) => setNewTasks((prev) => ({ ...prev, [user.id]: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") addTask(user.id); }} className="h-8 text-sm bg-background/40 border-border/30 placeholder:text-muted-foreground/40" />
                    <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => addTask(user.id)}><Plus className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
