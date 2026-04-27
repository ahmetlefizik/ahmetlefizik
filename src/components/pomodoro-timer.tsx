"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Coffee, Timer, Settings, Maximize2, Minimize2, CloudRain, Flame, Waves, Music, Volume2, VolumeX } from "lucide-react";
import { useAppContext } from "@/components/session-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function PomodoroTimer() {
  const { user, activeGroup, isGroupOwner, isModerator, updateTimerState, addStudyMinutes } = useAppContext();
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [showSettings, setShowSettings] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  
  const [localTimeLeft, setLocalTimeLeft] = useState(1500);
  const [isZenMode, setIsZenMode] = useState(false);
  const [activeAmbient, setActiveAmbient] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);

  const ambientSounds = {
    rain: "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg",
    fire: "https://actions.google.com/sounds/v1/ambiences/fire.ogg",
    ocean: "https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg",
    lofi: [
      "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
      "https://cdn.pixabay.com/download/audio/2022/01/21/audio_31093f416e.mp3",
      "https://cdn.pixabay.com/download/audio/2022/03/02/audio_c35f29f0f9.mp3",
      "https://cdn.pixabay.com/download/audio/2023/10/05/audio_e2697b0933.mp3"
    ]
  };

  const isOwnerOrMod = activeGroup ? (isGroupOwner(activeGroup.id) || isModerator(activeGroup.id)) : false;

  if (!activeGroup) return null;

  const timerState = activeGroup.timerState;
  const mode = timerState.mode;
  const isActive = timerState.isRunning;
  const totalSeconds = mode === "study" ? workMinutes * 60 : breakMinutes * 60;
  
  // Sync local timer with global timer state
  useEffect(() => {
    if (timerState.isRunning) {
      const elapsed = Math.floor((Date.now() - timerState.updatedAt) / 1000);
      const remaining = Math.max(0, timerState.timeLeft - elapsed);
      setLocalTimeLeft(remaining);
    } else {
      setLocalTimeLeft(timerState.timeLeft);
    }
  }, [timerState]);

  // Ambient Audio Controller
  useEffect(() => {
    if (activeAmbient) {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
      }
      
      let sourceUrl = "";
      if (activeAmbient === 'lofi') {
        const tracks = ambientSounds.lofi;
        sourceUrl = tracks[Math.floor(Math.random() * tracks.length)];
      } else {
        sourceUrl = ambientSounds[activeAmbient as keyof typeof ambientSounds] as string;
      }

      const audio = new Audio(sourceUrl);
      audio.loop = activeAmbient !== 'lofi'; // Loop nature sounds, not music
      audio.volume = volume;
      audio.play().catch(() => {});
      
      if (activeAmbient === 'lofi') {
        audio.onended = () => {
          // Play another random track when music ends
          const newTracks = ambientSounds.lofi;
          const nextTrack = newTracks[Math.floor(Math.random() * newTracks.length)];
          audio.src = nextTrack;
          audio.play().catch(() => {});
        };
      }

      ambientAudioRef.current = audio;
    } else {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current = null;
      }
    }
    return () => {
      if (ambientAudioRef.current) ambientAudioRef.current.pause();
    };
  }, [activeAmbient]);

  useEffect(() => {
    if (ambientAudioRef.current) {
      ambientAudioRef.current.volume = volume;
    }
  }, [volume]);

  const progress = totalSeconds > 0 ? ((totalSeconds - localTimeLeft) / totalSeconds) * 100 : 0;

  const formatTime = useCallback((secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    if (isActive && localTimeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setLocalTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (localTimeLeft <= 0 && isActive) {
      // Timer finished!
      const finishSound = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");
      finishSound.play().catch(() => {});
      
      if (isOwnerOrMod) {
        if (mode === "study") {
          setSessionsCompleted((prev) => prev + 1);
          addStudyMinutes(workMinutes);
          const breakSecs = breakMinutes * 60;
          updateTimerState(activeGroup.id, false, breakSecs, "break");
        } else {
          const workSecs = workMinutes * 60;
          updateTimerState(activeGroup.id, false, workSecs, "study");
        }
      } else {
        // Just stop local interval
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isActive, localTimeLeft, mode, workMinutes, breakMinutes, addStudyMinutes, isOwnerOrMod, updateTimerState, activeGroup.id]);

  const handleStart = () => {
    if (!isOwnerOrMod) return;
    updateTimerState(activeGroup.id, true, localTimeLeft, mode);
  };
  const handlePause = () => {
    if (!isOwnerOrMod) return;
    updateTimerState(activeGroup.id, false, localTimeLeft, mode);
  };
  const handleReset = () => {
    if (!isOwnerOrMod) return;
    const secs = mode === "study" ? workMinutes * 60 : breakMinutes * 60;
    updateTimerState(activeGroup.id, false, secs, mode);
  };
  const handleBreak = () => {
    if (!isOwnerOrMod) return;
    if (mode === "study" && localTimeLeft < workMinutes * 60) {
      addStudyMinutes(workMinutes - Math.ceil(localTimeLeft / 60));
    }
    const secs = breakMinutes * 60;
    updateTimerState(activeGroup.id, false, secs, "break");
  };

  return (
    <Card className="h-full flex flex-col relative overflow-hidden border-border/50 bg-card shadow-sm">
      <CardHeader className="relative flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold">Pomodoro Zamanlayıcı</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={mode === "study" ? "default" : "secondary"} className={`transition-all duration-300 ${mode === "study" ? "bg-primary/20 text-primary border border-primary/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"}`}>
            {mode === "study" ? "Çalışma" : "Mola"}
          </Badge>
          <Badge variant="outline" className="text-xs text-muted-foreground">{sessionsCompleted} oturum</Badge>
          
          <Button variant={isZenMode ? "secondary" : "ghost"} size="icon" className={`h-8 w-8 transition-all ${isZenMode ? "text-primary scale-110" : "text-muted-foreground hover:text-primary"}`} onClick={() => setIsZenMode(true)}>
            <Maximize2 className="h-4 w-4" />
          </Button>

          {isOwnerOrMod && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="relative space-y-4">
        {/* Ambient Sound Widget Panel */}
        <div className="flex flex-col gap-3 p-3 rounded-xl bg-muted/20 border border-border/50">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Ambiyans & Müzik</span>
            <div className="flex items-center gap-2 min-w-[80px]">
              <Volume2 className="h-3 w-3 text-muted-foreground/50" />
              <input 
                type="range" 
                min="0" max="1" step="0.01" 
                value={volume} 
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <Button 
              variant={activeAmbient === 'rain' ? 'secondary' : 'outline'} 
              size="sm" 
              className={`h-8 px-2 gap-1.5 text-[10px] rounded-lg transition-all duration-300 ${activeAmbient === 'rain' ? 'border-primary/60 text-primary bg-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]' : 'border-border/40'}`}
              onClick={() => setActiveAmbient(activeAmbient === 'rain' ? null : 'rain')}
            >
              <CloudRain className={`h-3.5 w-3.5 ${activeAmbient === 'rain' ? 'animate-bounce' : ''}`} /> Yağmur
            </Button>
            <Button 
              variant={activeAmbient === 'fire' ? 'secondary' : 'outline'} 
              size="sm" 
              className={`h-8 px-2 gap-1.5 text-[10px] rounded-lg transition-all duration-300 ${activeAmbient === 'fire' ? 'border-primary/60 text-primary bg-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]' : 'border-border/40'}`}
              onClick={() => setActiveAmbient(activeAmbient === 'fire' ? null : 'fire')}
            >
              <Flame className={`h-3.5 w-3.5 ${activeAmbient === 'fire' ? 'animate-pulse' : ''}`} /> Ateş
            </Button>
            <Button 
              variant={activeAmbient === 'ocean' ? 'secondary' : 'outline'} 
              size="sm" 
              className={`h-8 px-2 gap-1.5 text-[10px] rounded-lg transition-all duration-300 ${activeAmbient === 'ocean' ? 'border-primary/60 text-primary bg-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]' : 'border-border/40'}`}
              onClick={() => setActiveAmbient(activeAmbient === 'ocean' ? null : 'ocean')}
            >
              <Waves className={`h-3.5 w-3.5 ${activeAmbient === 'ocean' ? 'animate-spin-slow' : ''}`} /> Okyanus
            </Button>
            <Button 
              variant={activeAmbient === 'lofi' ? 'secondary' : 'outline'} 
              size="sm" 
              className={`h-8 px-2 gap-1.5 text-[10px] rounded-lg transition-all duration-300 ${activeAmbient === 'lofi' ? 'border-primary/60 text-primary bg-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]' : 'border-border/40'}`}
              onClick={() => setActiveAmbient(activeAmbient === 'lofi' ? null : 'lofi')}
            >
              <Music className={`h-3.5 w-3.5 ${activeAmbient === 'lofi' ? 'animate-spin' : ''}`} /> Lo-Fi
            </Button>
          </div>
        </div>

        {isZenMode && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/90 backdrop-blur-2xl animate-in fade-in duration-500">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-8 right-8 h-12 w-12 text-muted-foreground hover:text-primary hover:bg-primary/10" 
              onClick={() => setIsZenMode(false)}
            >
              <Minimize2 className="h-8 w-8" />
            </Button>
            
            <div className="text-center space-y-8 w-full max-w-4xl px-4">
              <Badge variant={mode === "study" ? "default" : "secondary"} className="px-6 py-2 text-lg rounded-full">
                {mode === "study" ? "Çalışma Vakti" : "Mola Vakti"}
              </Badge>
              
              <div className={`text-[12rem] md:text-[20rem] font-mono font-bold leading-none tracking-tighter ${mode === "study" ? "text-primary" : "text-emerald-400"} drop-shadow-2xl`}>
                {formatTime(localTimeLeft)}
              </div>
              
              <div className="w-full space-y-4">
                <Progress value={progress} className="h-4 bg-muted/30" />
                <div className="flex justify-between text-xl font-medium text-muted-foreground">
                  <span>%{Math.round(progress)} tamamlandı</span>
                  <span>{formatTime(localTimeLeft)} kaldı</span>
                </div>
              </div>

              {isOwnerOrMod && (
                <div className="flex items-center justify-center gap-6 pt-8">
                  {!isActive ? (
                    <Button onClick={handleStart} size="lg" className="h-16 px-12 text-xl gap-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/40"><Play className="h-8 w-8" /> Başlat</Button>
                  ) : (
                    <Button onClick={handlePause} size="lg" variant="secondary" className="h-16 px-12 text-xl gap-3 shadow-xl"><Pause className="h-8 w-8" /> Duraklat</Button>
                  )}
                  <Button onClick={handleReset} size="lg" variant="outline" className="h-16 px-8 text-xl gap-3"><RotateCcw className="h-6 w-6" /> Sıfırla</Button>
                </div>
              )}
            </div>
          </div>
        )}
        {showSettings && (
          <div className="flex gap-4 rounded-lg border border-border/50 bg-muted/30 p-3 animate-in slide-in-from-top-2 duration-200">
            <div className="flex-1 space-y-1">
              <label className="text-xs text-muted-foreground">Çalışma (dk)</label>
              <Input type="number" min={1} max={600} value={workMinutes} onChange={(e) => { const n = Math.min(600, Math.max(1, parseInt(e.target.value) || 1)); setWorkMinutes(n); if (mode === "study" && !isActive) updateTimerState(activeGroup.id, false, n * 60, "study"); }} className="h-8 text-sm bg-background/50" disabled={isActive} />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs text-muted-foreground">Mola (dk)</label>
              <Input type="number" min={1} max={60} value={breakMinutes} onChange={(e) => { const n = Math.min(60, Math.max(1, parseInt(e.target.value) || 1)); setBreakMinutes(n); if (mode === "break" && !isActive) updateTimerState(activeGroup.id, false, n * 60, "break"); }} className="h-8 text-sm bg-background/50" disabled={isActive} />
            </div>
          </div>
        )}
        <div className="flex flex-col items-center gap-4">
          <div className={`text-8xl font-mono font-bold tracking-wider transition-colors duration-500 ${mode === "study" ? "text-primary" : "text-emerald-400"} ${isActive ? "animate-pulse-glow" : ""}`} style={{ textShadow: isActive ? (mode === "study" ? "0 0 40px oklch(0.65 0.25 270 / 30%)" : "0 0 40px oklch(0.7 0.2 160 / 30%)") : "none" }}>
            {formatTime(localTimeLeft)}
          </div>
          <div className="w-full space-y-1">
            <Progress value={progress} className="h-2 bg-muted/50" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round(progress)}% tamamlandı</span>
              <span>{formatTime(localTimeLeft)} kaldı</span>
            </div>
          </div>
        </div>
        {isOwnerOrMod ? (
          <div className="flex items-center justify-center gap-3">
            {!isActive ? (
              <Button onClick={handleStart} size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"><Play className="h-5 w-5" /> Başlat</Button>
            ) : (
              <Button onClick={handlePause} size="lg" variant="secondary" className="gap-2"><Pause className="h-5 w-5" /> Duraklat</Button>
            )}
            <Button onClick={handleReset} size="lg" variant="outline" className="gap-2"><RotateCcw className="h-4 w-4" /> Sıfırla</Button>
            {mode === "study" && (
              <Button onClick={handleBreak} size="lg" variant="outline" className="gap-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"><Coffee className="h-4 w-4" /> Mola Ver</Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-2 border-t border-border/30 mt-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Ortak Sayaç</span> • Yalnızca grup sahibi ve moderatörler kontrol edebilir.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
