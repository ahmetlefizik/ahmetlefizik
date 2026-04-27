"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Atom, Palette, Zap, LogOut, Settings, Moon, Sun, User, Image as ImageIcon, CalendarDays, Mail, KeyRound } from "lucide-react";
import { useAppContext } from "@/components/session-provider";

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function Header() {
  const { user, updateUserProfile } = useAppContext();
  const { theme, setTheme } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#7c3aed");
  const pickerRef = useRef<HTMLDivElement>(null);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editImage, setEditImage] = useState(user?.image || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [editPassword, setEditPassword] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowPicker(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    
    // Set date
    setCurrentDate(new Date().toLocaleDateString('tr-TR', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    }));

    // Load saved theme color
    const savedColor = localStorage.getItem("theme-color");
    if (savedColor) {
      applyColor(savedColor);
    }
    
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditImage(user.image || "");
      setEditEmail(user.email || "");
    }
  }, [user]);

  const applyColor = (hex: string) => {
    setSelectedColor(hex);
    localStorage.setItem("theme-color", hex);
    const { h, s, l } = hexToHSL(hex);
    const hslVal = `${h} ${s}% ${l}%`;
    document.documentElement.style.setProperty("--primary", hslVal);
    document.documentElement.style.setProperty("--ring", hslVal);
    document.documentElement.style.setProperty("--sidebar-primary", hslVal);
    document.documentElement.style.setProperty("--sidebar-ring", hslVal);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveSettings = () => {
    updateUserProfile(editName, editImage);
    setSettingsOpen(false);
  };

  const presetColors = [
    "#7c3aed", "#6366f1", "#3b82f6", "#06b6d4",
    "#10b981", "#f59e0b", "#ef4444", "#ec4899",
    "#8b5cf6", "#14b8a6", "#f97316", "#64748b",
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 border border-primary/20">
            <Atom className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">ahmetle<span className="text-primary">fizik</span></h1>
            <p className="text-[10px] text-muted-foreground -mt-0.5">İşbirlikçi Çalışma Platformu</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <>
              {currentDate && (
                <div className="hidden md:flex items-center gap-1.5 text-xs font-medium text-muted-foreground mr-2">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {currentDate}
                </div>
              )}
              <Badge variant="outline" className="gap-1.5 border-primary/30 text-primary hidden sm:flex">
                <Zap className="h-3 w-3" />
                <span className="text-xs">Aktif</span>
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" className="h-10 p-1.5 pr-3 flex items-center gap-2 rounded-lg border border-border/30 bg-muted/20 hover:bg-muted/40 transition-all" />}>
                  <Avatar className="h-7 w-7">
                    {user.image && <AvatarImage src={user.image} alt={user.name} />}
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Hesabım</div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Profil Ayarları
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                    {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                    {theme === "dark" ? "Açık Tema" : "Karanlık Tema"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Profil Ayarları</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" /> İsim
                      </label>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="İsminiz..."
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" /> E-posta
                      </label>
                      <Input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="E-posta adresiniz..."
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-primary" /> Şifre Güncelle (Opsiyonel)
                      </label>
                      <Input
                        type="password"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        placeholder="Yeni şifreniz (değiştirmek istemiyorsanız boş bırakın)..."
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-primary" /> Avatar
                      </label>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-14 w-14 border-2 border-primary/20 shrink-0">
                            {editImage && <AvatarImage src={editImage} className="object-cover" />}
                            <AvatarFallback className="bg-primary/10 text-primary">{editName.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="h-9 cursor-pointer text-xs file:mr-2 file:h-full file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-xs file:font-medium file:text-primary hover:file:bg-primary/20"
                            />
                            <div className="relative">
                              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50"></span></div>
                              <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-background px-2 text-muted-foreground">veya link kullan</span></div>
                            </div>
                            <Input
                              value={editImage}
                              onChange={(e) => setEditImage(e.target.value)}
                              placeholder="https://..."
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button onClick={saveSettings} className="w-full">Değişiklikleri Kaydet</Button>
                </DialogContent>
              </Dialog>
            </>
          )}

          {/* Social Links */}
          <div className="hidden md:flex items-center gap-1.5 mr-4 border-r border-border/50 pr-4">
            <a href="https://youtube.com/@ahmetlefizik" target="_blank" rel="noopener noreferrer" title="YouTube">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
                </svg>
              </Button>
            </a>
            <a href="https://instagram.com/ahmetlefizik" target="_blank" rel="noopener noreferrer" title="Instagram">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-pink-500 hover:bg-pink-500/10">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </Button>
            </a>
            <a href="https://tiktok.com/@ahmetlefizik" target="_blank" rel="noopener noreferrer" title="TikTok">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-foreground/10">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
              </Button>
            </a>
            <a href="https://whatsapp.com/channel/0029VaW3wIl8vd1QsO1N2h1u" target="_blank" rel="noopener noreferrer" title="WhatsApp Kanalı">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </Button>
            </a>
          </div>

          <div className="relative" ref={pickerRef}>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary" onClick={() => setShowPicker(!showPicker)}>
              <Palette className="h-4 w-4" />
            </Button>
            {showPicker && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border/50 bg-card/95 backdrop-blur-lg p-4 shadow-2xl animate-in slide-in-from-top-2 fade-in duration-200">
                <p className="text-xs font-medium text-muted-foreground mb-3">Tema Rengi</p>
                <div className="grid grid-cols-6 gap-2 mb-3">
                  {presetColors.map((c) => (
                    <button key={c} className={`h-7 w-7 rounded-lg border-2 transition-all hover:scale-110 ${selectedColor === c ? "border-foreground scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} onClick={() => applyColor(c)} />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input type="color" value={selectedColor} onChange={(e) => applyColor(e.target.value)} className="h-8 w-8 rounded cursor-pointer border-0 bg-transparent" />
                  <span className="text-xs text-muted-foreground font-mono">{selectedColor}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
