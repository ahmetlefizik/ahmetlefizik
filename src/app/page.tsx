"use client";

import { useState, useEffect } from "react";
import { PomodoroTimer } from "@/components/pomodoro-timer";
import { GroupTasks } from "@/components/group-tasks";
import { ParticipantsList } from "@/components/participants-list";
import { GroupChat } from "@/components/group-chat";
import { LoginScreen } from "@/components/login-screen";
import { GroupManager } from "@/components/group-manager";
import { StudyAnalytics } from "@/components/study-analytics";
import { StudyPlanner } from "@/components/study-planner";
import { useAppContext } from "@/components/session-provider";
import { Loader2, GripHorizontal, LayoutGrid, Focus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable and Resizable item wrapper
function SortableWidget({ id, children }: { id: string; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group break-inside-avoid ${isDragging ? "opacity-75 scale-[1.02] shadow-2xl" : ""}`}
    >
      <div
        className="w-full h-full min-h-[250px] min-w-[300px] relative overflow-hidden transition-shadow bg-card rounded-xl border border-border/50"
        style={{ resize: "both", paddingBottom: "8px", paddingRight: "8px" }} // Using CSS resize for height and width
      >
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 z-50 p-1.5 rounded-md bg-background/80 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing hover:bg-primary/20 hover:text-primary backdrop-blur-sm shadow-sm"
        >
          <GripHorizontal className="h-4 w-4" />
        </div>
        <div className="h-full w-full">{children}</div>
        
        {/* Resize handle visual cue */}
        <div className="absolute bottom-0 right-0 w-4 h-4 cursor-ns-resize opacity-0 group-hover:opacity-100 pointer-events-none" style={{
          background: "linear-gradient(135deg, transparent 50%, hsl(var(--primary)) 50%)",
          opacity: 0.3,
          bottom: "2px",
          right: "2px",
          borderRadius: "0 0 4px 0"
        }} />
      </div>
    </div>
  );
}

export default function Home() {
  const { user, isLoading, activeGroup } = useAppContext();

  const defaultOrder = ["manager", "analytics", "timer", "tasks", "participants", "chat"];
  const [layout, setLayout] = useState<string[]>(defaultOrder);
  const [isClient, setIsClient] = useState(false);
  const [presetMode, setPresetMode] = useState<"default" | "focus" | "social">("default");
  const [remountKey, setRemountKey] = useState(0);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("dashboard-layout");
    if (saved) {
      try { setLayout(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setLayout((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        const newArray = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem("dashboard-layout", JSON.stringify(newArray));
        return newArray;
      });
    }
  };

  if (isLoading || !isClient) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const renderWidget = (id: string) => {
    if (!activeGroup && ["timer", "tasks", "participants", "chat"].includes(id)) {
      return null;
    }

    switch (id) {
      case "manager": return <GroupManager />;
      case "analytics": return <StudyAnalytics />;
      case "timer": return <PomodoroTimer />;
      case "tasks": return <GroupTasks />;
      case "participants": return <ParticipantsList />;
      case "chat": return <GroupChat />;
      default: return null;
    }
  };

  const applyPreset = (mode: "default" | "focus" | "social") => {
    setPresetMode(mode);
    setRemountKey(prev => prev + 1); // Reset inline resize styles
    if (mode === "default") {
      setLayout(["manager", "analytics", "timer", "tasks", "participants", "chat"]);
    } else if (mode === "focus") {
      setLayout(["timer", "tasks", "manager", "analytics", "participants", "chat"]);
    } else if (mode === "social") {
      setLayout(["chat", "participants", "timer", "tasks", "manager", "analytics"]);
    }
  };

  const getWidgetClass = (id: string) => {
    if (presetMode === "focus" && (id === "timer" || id === "tasks")) return "w-full md:w-[calc(50%-12px)]";
    if (presetMode === "social" && (id === "chat" || id === "participants")) return "w-full md:w-[calc(50%-12px)]";
    return "flex-grow max-w-full"; // Default flexible behavior
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      {activeGroup && (
        <div className="flex items-center gap-2 mb-6 p-2 rounded-xl bg-muted/20 border border-border/30 w-fit">
          <span className="text-xs font-semibold text-muted-foreground mr-2 px-2">Düzen:</span>
          <Button variant={presetMode === "default" ? "secondary" : "ghost"} size="sm" className="h-8 text-xs gap-1.5" onClick={() => applyPreset("default")}>
            <LayoutGrid className="h-3.5 w-3.5" /> Standart
          </Button>
          <Button variant={presetMode === "focus" ? "secondary" : "ghost"} size="sm" className="h-8 text-xs gap-1.5" onClick={() => applyPreset("focus")}>
            <Focus className="h-3.5 w-3.5" /> Odak Modu
          </Button>
          <Button variant={presetMode === "social" ? "secondary" : "ghost"} size="sm" className="h-8 text-xs gap-1.5" onClick={() => applyPreset("social")}>
            <MessageSquare className="h-3.5 w-3.5" /> Sosyal
          </Button>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={layout} strategy={rectSortingStrategy}>
          <div key={remountKey} className="flex flex-wrap gap-6 items-start">
            {layout.map((id) => {
              const widget = renderWidget(id);
              if (!widget) return null;
              return (
                <div key={id} className={getWidgetClass(id)}>
                  <SortableWidget id={id}>
                    {widget}
                  </SortableWidget>
                </div>
              );
            })}
          </div>

          {!activeGroup && (
            <div className="mt-8">
              <StudyPlanner />
            </div>
          )}
        </SortableContext>
      </DndContext>

      {activeGroup && (
        <div className="mt-12 pt-8 border-t border-border/30">
          <StudyPlanner />
        </div>
      )}
    </div>
  );
}
