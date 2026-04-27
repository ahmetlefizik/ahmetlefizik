"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useSession as useNextAuthSession } from "next-auth/react";

export interface GroupMember {
  id: string;
  name: string;
  email: string;
  image?: string;
  timerActive: boolean;
  timeLeft?: number;
  joinedAt: Date;
  streak?: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  time: string;
  isSystem?: boolean;
}

export interface StudyGroup {
  id: string;
  name: string;
  code: string;
  ownerId: string;
  moderators: string[];
  bannedMembers: string[];
  members: GroupMember[];
  messages: ChatMessage[];
  timerState: { isRunning: boolean; timeLeft: number; mode: 'study' | 'break'; updatedAt: number };
  createdAt: Date;
}

export interface StudyRecord {
  date: string;
  minutes: number;
}

interface AppContextValue {
  user: { id: string; name: string; email: string; image?: string } | null;
  isLoading: boolean;
  groups: StudyGroup[];
  activeGroup: StudyGroup | null;
  setActiveGroupId: (id: string | null) => void;
  createGroup: (name: string) => string;
  joinGroup: (code: string) => boolean;
  leaveGroup: (groupId: string) => void;
  kickMember: (groupId: string, memberId: string, ban?: boolean) => void;
  assignModerator: (groupId: string, memberId: string) => void;
  isGroupOwner: (groupId: string) => boolean;
  isModerator: (groupId: string) => boolean;
  sendMessage: (groupId: string, text: string, isSystem?: boolean) => void;
  updateTimerState: (groupId: string, isRunning: boolean, timeLeft: number, mode: 'study' | 'break') => void;
  studyRecords: StudyRecord[];
  addStudyMinutes: (minutes: number) => void;
  getStats: () => { today: number; thisWeek: number; thisMonth: number; thisYear: number; total: number; currentStreak: number; };
  updateUserProfile: (name: string, image: string) => void;
}

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateStudyRecords(): StudyRecord[] {
  const records: StudyRecord[] = [];
  const now = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const minutes = i === 0 ? 45 : Math.floor(Math.random() * 180) + 10;
    records.push({ date: d.toISOString().split("T")[0], minutes });
  }
  return records;
}

function calculateStreak(records: StudyRecord[]): number {
  if (records.length === 0) return 0;
  const sorted = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  let streak = 0;
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const firstDate = new Date(sorted[0].date);
  firstDate.setHours(0,0,0,0);
  const diffDays = Math.floor((today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > 1) return 0;

  let currentDate = firstDate;
  streak = 1;

  for (let i = 1; i < sorted.length; i++) {
    const d = new Date(sorted[i].date);
    d.setHours(0,0,0,0);
    const diff = Math.floor((currentDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      streak++;
      currentDate = d;
    } else if (diff === 0) {
      continue;
    } else {
      break;
    }
  }
  return streak;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useNextAuthSession();
  const isLoading = status === "loading";

  const [userState, setUserState] = useState<{ id: string; name: string; email: string; image?: string } | null>(null);

  // Initialize from session only once
  useEffect(() => {
    if (session?.user && !userState) {
      setUserState({
        id: session.user.id ?? session.user.email ?? "unknown",
        name: session.user.name ?? "Kullanıcı",
        email: session.user.email ?? "",
        image: session.user.image ?? undefined,
      });
    }
  }, [session, userState]);

  const user = userState;

  const [groups, setGroups] = useState<StudyGroup[]>(() => {
    return [{
      id: "demo-group",
      name: "Fizik Çalışma Grubu",
      code: "FZK101",
      ownerId: "demo-owner",
      moderators: [],
      bannedMembers: [],
      members: [],
      messages: [],
      timerState: { isRunning: false, timeLeft: 1500, mode: 'study', updatedAt: Date.now() },
      createdAt: new Date(),
    }];
  });

  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [studyRecords, setStudyRecords] = useState<StudyRecord[]>(generateStudyRecords);

  const activeGroup = groups.find((g) => g.id === activeGroupId) ?? null;

  const createGroup = useCallback((name: string): string => {
    if (!user) return "";
    const code = generateCode();
    const newGroup: StudyGroup = {
      id: `g-${Date.now()}`,
      name,
      code,
      ownerId: user.id,
      moderators: [],
      bannedMembers: [],
      messages: [{ id: `m${Date.now()}`, senderId: 'system', senderName: 'Sistem', text: `Oda oluşturuldu: ${name}`, time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }), isSystem: true }],
      timerState: { isRunning: false, timeLeft: 1500, mode: 'study', updatedAt: Date.now() },
      members: [{ id: user.id, name: user.name, email: user.email, image: user.image, timerActive: false, joinedAt: new Date(), streak: calculateStreak(studyRecords) }],
      createdAt: new Date(),
    };
    setGroups((prev) => [...prev, newGroup]);
    setActiveGroupId(newGroup.id);
    return code;
  }, [user]);

  const joinGroup = useCallback((code: string): boolean => {
    if (!user) return false;
    const trimmed = code.trim().toUpperCase();
    const groupIndex = groups.findIndex((g) => g.code === trimmed);
    if (groupIndex === -1) return false;

    const group = groups[groupIndex];
    if (group.bannedMembers.includes(user.id)) return false; // Banned check

    if (group.members.some((m) => m.id === user.id)) {
      setActiveGroupId(group.id);
      return true;
    }

    const time = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    setGroups((prev) =>
      prev.map((g) =>
        g.id === group.id
          ? { ...g, 
              members: [...g.members, { id: user.id, name: user.name, email: user.email, image: user.image, timerActive: false, joinedAt: new Date(), streak: calculateStreak(studyRecords) }],
              messages: [...g.messages, { id: `m${Date.now()}`, senderId: 'system', senderName: 'Sistem', text: `${user.name} odaya katıldı`, time, isSystem: true }] 
            }
          : g
      )
    );
    setActiveGroupId(group.id);
    return true;
  }, [user, groups]);

  const leaveGroup = useCallback((groupId: string) => {
    if (!user) return;
    setGroups((prev) =>
      prev.map((g) => g.id === groupId ? { ...g, members: g.members.filter((m) => m.id !== user.id), messages: [...g.messages, { id: `m${Date.now()}`, senderId: 'system', senderName: 'Sistem', text: `${user.name} odadan ayrıldı`, time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }), isSystem: true }] } : g)
          .filter((g) => g.members.length > 0)
    );
    if (activeGroupId === groupId) setActiveGroupId(null);
  }, [user, activeGroupId]);

  const kickMember = useCallback((groupId: string, memberId: string, ban?: boolean) => {
    if (!user) return;
    const group = groups.find((g) => g.id === groupId);
    if (!group || (group.ownerId !== user.id && !group.moderators.includes(user.id))) return;
    if (memberId === user.id) return;
    const memberName = group.members.find(m => m.id === memberId)?.name || 'Birisi';
    const time = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    setGroups((prev) =>
      prev.map((g) => g.id === groupId ? { 
        ...g, 
        members: g.members.filter((m) => m.id !== memberId),
        bannedMembers: ban ? [...g.bannedMembers, memberId] : g.bannedMembers,
        messages: [...g.messages, { id: `m${Date.now()}`, senderId: 'system', senderName: 'Sistem', text: `${user.name}, ${memberName} adlı kişiyi ${ban ? 'engelledi' : 'çıkardı'}.`, time, isSystem: true }] 
      } : g)
    );
  }, [user, groups]);

  const assignModerator = useCallback((groupId: string, memberId: string) => {
    if (!user) return;
    const group = groups.find((g) => g.id === groupId);
    if (!group || group.ownerId !== user.id) return;
    const memberName = group.members.find(m => m.id === memberId)?.name || 'Birisi';
    const time = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    setGroups((prev) =>
      prev.map((g) => g.id === groupId ? { 
        ...g, 
        moderators: [...new Set([...g.moderators, memberId])],
        messages: [...g.messages, { id: `m${Date.now()}`, senderId: 'system', senderName: 'Sistem', text: `${user.name}, ${memberName} adlı kişiyi moderatör yaptı.`, time, isSystem: true }] 
      } : g)
    );
  }, [user, groups]);

  const sendMessage = useCallback((groupId: string, text: string, isSystem?: boolean) => {
    if (!user) return;
    const time = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    setGroups(prev => prev.map(g => g.id === groupId ? {
      ...g,
      messages: [...g.messages, { id: `m${Date.now()}`, senderId: isSystem ? 'system' : user.id, senderName: isSystem ? 'Sistem' : user.name, text, time, isSystem }]
    } : g));
  }, [user]);

  const updateTimerState = useCallback((groupId: string, isRunning: boolean, timeLeft: number, mode: 'study' | 'break') => {
    if (!user) return;
    const group = groups.find((g) => g.id === groupId);
    if (!group || (group.ownerId !== user.id && !group.moderators.includes(user.id))) return;
    
    setGroups(prev => prev.map(g => g.id === groupId ? {
      ...g,
      timerState: { isRunning, timeLeft, mode, updatedAt: Date.now() }
    } : g));
  }, [user, groups]);

  const isGroupOwner = useCallback((groupId: string): boolean => {
    if (!user) return false;
    const group = groups.find((g) => g.id === groupId);
    return group?.ownerId === user.id;
  }, [user, groups]);

  const addStudyMinutes = useCallback((minutes: number) => {
    const today = new Date().toISOString().split("T")[0];
    setStudyRecords((prev) => {
      const existing = prev.find((r) => r.date === today);
      if (existing) {
        return prev.map((r) => r.date === today ? { ...r, minutes: r.minutes + minutes } : r);
      }
      return [{ date: today, minutes }, ...prev];
    });
  }, []);

  const getStats = useCallback(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const weekStartStr = weekStart.toISOString().split("T")[0];
    const monthStartStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const yearStartStr = `${now.getFullYear()}-01-01`;

    let today = 0, thisWeek = 0, thisMonth = 0, thisYear = 0, total = 0;

    for (const r of studyRecords) {
      total += r.minutes;
      if (r.date === todayStr) today += r.minutes;
      if (r.date >= weekStartStr) thisWeek += r.minutes;
      if (r.date >= monthStartStr) thisMonth += r.minutes;
      if (r.date >= yearStartStr) thisYear += r.minutes;
    }

    return { today, thisWeek, thisMonth, thisYear, total, currentStreak: calculateStreak(studyRecords) };
  }, [studyRecords]);

  const updateUserProfile = useCallback((name: string, image: string) => {
    setUserState((prev) => prev ? { ...prev, name, image } : null);
    // Also update in all groups the user is part of
    setGroups((prev) => prev.map(g => ({
      ...g,
      members: g.members.map(m => m.id === user?.id ? { ...m, name, image } : m)
    })));
  }, [user]);

  const isModerator = useCallback((groupId: string): boolean => {
    if (!user) return false;
    const group = groups.find((g) => g.id === groupId);
    return group?.moderators.includes(user.id) || false;
  }, [user, groups]);

  return (
    <AppContext.Provider value={{ user, isLoading, groups, activeGroup, setActiveGroupId, createGroup, joinGroup, leaveGroup, kickMember, assignModerator, isGroupOwner, isModerator, sendMessage, updateTimerState, studyRecords, addStudyMinutes, getStats, updateUserProfile }}>
      {children}
    </AppContext.Provider>
  );
}
