"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useSession as useNextAuthSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";

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
  createGroup: (name: string) => Promise<string>;
  joinGroup: (code: string) => Promise<boolean>;
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
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [studyRecords, setStudyRecords] = useState<StudyRecord[]>([]);

  // Initialize from session
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

  // Real-time Supabase Fetching
  const fetchGroups = useCallback(async () => {
    if (!user) return;

    // Fetch groups where user is a member or owner
    const { data: memberGroups, error: memberError } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', user.id);

    const { data: ownedGroups, error: ownerError } = await supabase
      .from('study_groups')
      .select('id')
      .eq('owner_id', user.id);

    const groupIds = [...new Set([
      ...(memberGroups?.map(m => m.group_id) || []),
      ...(ownedGroups?.map(o => o.id) || []),
      // Also include the GENEL group
    ])];

    // Get the GENEL group ID
    const { data: genelGroup } = await supabase.from('study_groups').select('id').eq('code', 'GENEL').single();
    if (genelGroup) groupIds.push(genelGroup.id);

    const { data: allGroupsData, error: groupsError } = await supabase
      .from('study_groups')
      .select(`
        *,
        group_members(*),
        messages(*)
      `)
      .in('id', groupIds);

    if (allGroupsData) {
      const formattedGroups: StudyGroup[] = allGroupsData.map(g => ({
        id: g.id,
        name: g.name,
        code: g.code,
        ownerId: g.owner_id,
        moderators: g.moderators || [],
        bannedMembers: g.banned_members || [],
        timerState: g.timer_state,
        createdAt: new Date(g.created_at),
        members: g.group_members.map((m: any) => ({
          id: m.user_id,
          name: m.name,
          email: m.email || "",
          image: m.image,
          timerActive: m.timer_active,
          joinedAt: new Date(m.joined_at),
          streak: m.streak
        })),
        messages: g.messages.map((m: any) => ({
          id: m.id,
          senderId: m.sender_id,
          senderName: m.sender_name,
          text: m.text,
          time: new Date(m.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          isSystem: m.is_system
        }))
      }));
      setGroups(formattedGroups);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchGroups();

      // Subscribe to all relevant tables
      const channel = supabase.channel('app-sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'study_groups' }, fetchGroups)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'group_members' }, fetchGroups)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchGroups)
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchGroups]);

  const createGroup = useCallback(async (name: string): Promise<string> => {
    if (!user) return "";
    const code = generateCode();
    
    const { data: group, error } = await supabase.from('study_groups').insert({
      name,
      code,
      owner_id: user.id,
      timer_state: { isRunning: false, timeLeft: 1500, mode: 'study', updatedAt: Date.now() }
    }).select().single();

    if (error) {
      console.error("Create group error:", error);
      return "";
    }

    // Add owner as a member
    await supabase.from('group_members').insert({
      group_id: group.id,
      user_id: user.id,
      name: user.name,
      streak: calculateStreak(studyRecords)
    });

    // Add system message
    await supabase.from('messages').insert({
      group_id: group.id,
      sender_id: 'system',
      sender_name: 'Sistem',
      text: `Oda oluşturuldu: ${name}`,
      is_system: true
    });

    fetchGroups();
    setActiveGroupId(group.id);
    return code;
  }, [user, studyRecords, fetchGroups]);

  const joinGroup = useCallback(async (code: string): Promise<boolean> => {
    if (!user) return false;
    const trimmed = code.trim().toUpperCase();

    const { data: group, error: fetchError } = await supabase
      .from('study_groups')
      .select('*')
      .eq('code', trimmed)
      .single();

    if (fetchError || !group) {
      alert("Grup bulunamadı! Lütfen kodu kontrol edin.");
      return false;
    }

    if (group.banned_members?.includes(user.id)) {
      alert("Bu gruptan engellenmişsiniz.");
      return false;
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', group.id)
      .eq('user_id', user.id)
      .single();

    if (!existingMember) {
      await supabase.from('group_members').insert({
        group_id: group.id,
        user_id: user.id,
        name: user.name,
        streak: calculateStreak(studyRecords)
      });

      await supabase.from('messages').insert({
        group_id: group.id,
        sender_id: 'system',
        sender_name: 'Sistem',
        text: `${user.name} odaya katıldı`,
        is_system: true
      });
    }

    fetchGroups();
    setActiveGroupId(group.id);
    return true;
  }, [user, studyRecords, fetchGroups]);

  const leaveGroup = useCallback(async (groupId: string) => {
    if (!user) return;
    await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', user.id);
    
    await supabase.from('messages').insert({
      group_id: groupId,
      sender_id: 'system',
      sender_name: 'Sistem',
      text: `${user.name} odadan ayrıldı`,
      is_system: true
    });

    fetchGroups();
    if (activeGroupId === groupId) setActiveGroupId(null);
  }, [user, activeGroupId, fetchGroups]);

  const kickMember = useCallback(async (groupId: string, memberId: string, ban?: boolean) => {
    if (!user) return;
    const group = groups.find((g) => g.id === groupId);
    if (!group || (group.ownerId !== user.id && !group.moderators.includes(user.id))) return;
    
    await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', memberId);
    
    if (ban) {
      await supabase.from('study_groups').update({
        banned_members: [...group.bannedMembers, memberId]
      }).eq('id', groupId);
    }

    await supabase.from('messages').insert({
      group_id: groupId,
      sender_id: 'system',
      sender_name: 'Sistem',
      text: `${user.name} bir üyeyi ${ban ? 'engelledi' : 'çıkardı'}.`,
      is_system: true
    });

    fetchGroups();
  }, [user, groups, fetchGroups]);

  const assignModerator = useCallback(async (groupId: string, memberId: string) => {
    if (!user) return;
    const group = groups.find((g) => g.id === groupId);
    if (!group || group.ownerId !== user.id) return;

    await supabase.from('study_groups').update({
      moderators: [...new Set([...group.moderators, memberId])]
    }).eq('id', groupId);

    await supabase.from('messages').insert({
      group_id: groupId,
      sender_id: 'system',
      sender_name: 'Sistem',
      text: `${user.name} bir üyeyi moderatör yaptı.`,
      is_system: true
    });

    fetchGroups();
  }, [user, groups, fetchGroups]);

  const sendMessage = useCallback(async (groupId: string, text: string, isSystem?: boolean) => {
    if (!user) return;
    await supabase.from('messages').insert({
      group_id: groupId,
      sender_id: isSystem ? 'system' : user.id,
      sender_name: isSystem ? 'Sistem' : user.name,
      text,
      is_system: !!isSystem
    });
  }, [user]);

  const updateTimerState = useCallback(async (groupId: string, isRunning: boolean, timeLeft: number, mode: 'study' | 'break') => {
    if (!user) return;
    const group = groups.find((g) => g.id === groupId);
    if (!group || (group.ownerId !== user.id && !group.moderators.includes(user.id))) return;
    
    await supabase.from('study_groups').update({
      timer_state: { isRunning, timeLeft, mode, updatedAt: Date.now() }
    }).eq('id', groupId);
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
    // In a real app, we'd also sync this to Supabase profile/stats table
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
  }, []);

  const isModerator = useCallback((groupId: string): boolean => {
    if (!user) return false;
    const group = groups.find((g) => g.id === groupId);
    return group?.moderators.includes(user.id) || false;
  }, [user, groups]);

  const activeGroup = groups.find((g) => g.id === activeGroupId) ?? null;

  return (
    <AppContext.Provider value={{ user, isLoading, groups, activeGroup, setActiveGroupId, createGroup, joinGroup, leaveGroup, kickMember, assignModerator, isGroupOwner, isModerator, sendMessage, updateTimerState, studyRecords, addStudyMinutes, getStats, updateUserProfile }}>
      {children}
    </AppContext.Provider>
  );
}
