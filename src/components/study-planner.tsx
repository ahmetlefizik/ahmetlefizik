"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { BookOpen, Target, Trophy, GraduationCap, ChevronRight, Folder, Plus, Trash2, Edit2, GripVertical } from "lucide-react";
import { FULL_CURRICULUM, Curriculum, Topic, Subject } from "@/lib/curriculum-data";
import { useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableTopic({ 
  topic, 
  onToggle, 
  onDelete 
}: { 
  topic: Topic; 
  onToggle: () => void; 
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: topic.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 group ${
        topic.completed 
          ? "bg-emerald-500/5 border-emerald-500/20" 
          : "bg-background border-border/50 hover:border-primary/30"
      }`}
    >
      <div className="flex items-center gap-3 flex-1">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-primary transition-colors">
          <GripVertical className="h-4 w-4" />
        </div>
        <Checkbox
          id={topic.id}
          checked={topic.completed}
          onCheckedChange={onToggle}
          className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
        />
        <label
          htmlFor={topic.id}
          className={`text-sm font-medium cursor-pointer transition-colors ${
            topic.completed ? "text-emerald-600 line-through opacity-60" : "text-foreground"
          }`}
        >
          {topic.name}
        </label>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all" 
        onClick={onDelete}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export function StudyPlanner() {
  const [data, setData] = useState<Curriculum[]>(FULL_CURRICULUM);
  const [activeTab, setActiveTab] = useState("tyt");
  const [activeSubject, setActiveSubject] = useState<string | null>("tyt-mat");
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newTopicName, setNewTopicName] = useState("");

  // Persistence logic
  useEffect(() => {
    const savedData = localStorage.getItem("user-curriculum");
    if (savedData) {
      try {
        setData(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to load curriculum data", e);
      }
    }
  }, []);

  const saveData = (newData: Curriculum[]) => {
    setData(newData);
    localStorage.setItem("user-curriculum", JSON.stringify(newData));
  };

  const toggleTopic = (curriculumId: string, subjectId: string, topicId: string) => {
    const newData = data.map(curr => {
      if (curr.id === curriculumId) {
        return {
          ...curr,
          subjects: curr.subjects.map(subj => {
            if (subj.id === subjectId) {
              return {
                ...subj,
                topics: subj.topics.map(t => t.id === topicId ? { ...t, completed: !t.completed } : t)
              };
            }
            return subj;
          })
        };
      }
      return curr;
    });
    saveData(newData);
  };

  const addSubject = () => {
    if (!newSubjectName.trim()) return;
    const newData = data.map(curr => {
      if (curr.id === activeTab) {
        const newSubj: Subject = {
          id: `custom-subj-${Date.now()}`,
          name: newSubjectName,
          topics: []
        };
        return { ...curr, subjects: [...curr.subjects, newSubj] };
      }
      return curr;
    });
    saveData(newData);
    setNewSubjectName("");
  };

  const deleteSubject = (subjectId: string) => {
    const newData = data.map(curr => {
      if (curr.id === activeTab) {
        return { ...curr, subjects: curr.subjects.filter(s => s.id !== subjectId) };
      }
      return curr;
    });
    saveData(newData);
    if (activeSubject === subjectId) setActiveSubject(null);
  };

  const addTopic = (subjectId: string) => {
    if (!newTopicName.trim()) return;
    const newData = data.map(curr => {
      if (curr.id === activeTab) {
        return {
          ...curr,
          subjects: curr.subjects.map(subj => {
            if (subj.id === subjectId) {
              const newTop: Topic = {
                id: `custom-topic-${Date.now()}`,
                name: newTopicName,
                completed: false
              };
              return { ...subj, topics: [...subj.topics, newTop] };
            }
            return subj;
          })
        };
      }
      return curr;
    });
    saveData(newData);
    setNewTopicName("");
  };

  const deleteTopic = (subjectId: string, topicId: string) => {
    const newData = data.map(curr => {
      if (curr.id === activeTab) {
        return {
          ...curr,
          subjects: curr.subjects.map(subj => {
            if (subj.id === subjectId) {
              return { ...subj, topics: subj.topics.filter(t => t.id !== topicId) };
            }
            return subj;
          })
        };
      }
      return curr;
    });
    saveData(newData);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !currentSubject) return;

    const oldIndex = currentSubject.topics.findIndex(t => t.id === active.id);
    const newIndex = currentSubject.topics.findIndex(t => t.id === over.id);

    const newData = data.map(curr => {
      if (curr.id === activeTab) {
        return {
          ...curr,
          subjects: curr.subjects.map(subj => {
            if (subj.id === currentSubject.id) {
              return {
                ...subj,
                topics: arrayMove(subj.topics, oldIndex, newIndex)
              };
            }
            return subj;
          })
        };
      }
      return curr;
    });

    saveData(newData);
  };

  const calculateProgress = (topics: Topic[]) => {
    if (topics.length === 0) return 0;
    return Math.round((topics.filter(t => t.completed).length / topics.length) * 100);
  };

  const activeCurriculum = data.find(c => c.id === activeTab);
  const currentSubject = activeCurriculum?.subjects.find(s => s.id === activeSubject);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-primary" />
            Koçluk & Müfredat
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Sınav alanını seç, konularını takip et ve oyunlaştırma ile motivasyonunu yüksek tut!</p>
        </div>
      </div>

      <Card className="border-border/50 bg-card shadow-sm relative overflow-hidden">
        <CardHeader className="border-b border-border/30 pb-4">
          <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setActiveSubject(null); }} className="w-full">
            <TabsList className="w-full sm:w-auto flex overflow-x-auto justify-start">
              {data.map(c => (
                <TabsTrigger key={c.id} value={c.id} className="min-w-[100px]">{c.name}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0 flex flex-col md:flex-row h-[450px]">
          <div className="w-full md:w-1/3 border-r border-border/30 p-4 flex flex-col bg-muted/10">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Folder className="h-4 w-4" /> Ders Klasörleri
            </h3>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-1">
              {activeCurriculum?.subjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSubject(s.id)}
                  className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeSubject === s.id
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Folder className={`h-4 w-4 ${activeSubject === s.id ? "text-primary-foreground" : "text-primary"}`} />
                    <span className="truncate">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeSubject === s.id ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
                      {Math.round(calculateProgress(s.topics))}%
                    </span>
                    {activeSubject === s.id && s.id.startsWith('custom-subj') && (
                      <Trash2 className="h-3.5 w-3.5 hover:text-red-300 transition-colors" onClick={(e) => { e.stopPropagation(); deleteSubject(s.id); }} />
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            <div className="pt-4 mt-2 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Input 
                  placeholder="Yeni Ders..." 
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="h-8 text-xs bg-background/50"
                />
                <Button size="icon" className="h-8 w-8 shrink-0" onClick={addSubject}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="w-full md:w-2/3 p-6 overflow-y-auto">
            {currentSubject ? (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-primary" />
                    {currentSubject.name} Konuları
                  </h3>
                  <Badge variant="secondary" className="text-[10px]">
                    {currentSubject.topics.length} Konu
                  </Badge>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                  {currentSubject.topics.length > 0 ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={currentSubject.topics.map(t => t.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {currentSubject.topics.map((t) => (
                          <SortableTopic
                            key={t.id}
                            topic={t}
                            onToggle={() => toggleTopic(activeTab!, currentSubject.id, t.id)}
                            onDelete={() => deleteTopic(currentSubject.id, t.id)}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border/40 rounded-2xl">
                      <BookOpen className="h-10 w-10 text-muted-foreground/20 mb-3" />
                      <p className="text-sm text-muted-foreground">Henüz konu eklenmemiş.</p>
                    </div>
                  )}
                </div>

                <div className="pt-6 mt-2 border-t border-border/50">
                  <div className="flex items-center gap-3">
                    <Input 
                      placeholder="Yeni Konu Ekle..." 
                      value={newTopicName}
                      onChange={(e) => setNewTopicName(e.target.value)}
                      className="bg-background/50"
                    />
                    <Button onClick={() => addTopic(currentSubject.id)} className="gap-2 shrink-0">
                      <Plus className="h-4 w-4" /> Ekle
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <Target className="h-12 w-12 opacity-20 mb-4" />
                <p>İlerlemeyi görmek için bir ders klasörü seçin.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
