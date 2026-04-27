"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Atom, Users, Timer, BarChart3, MessageCircle, Sparkles, LogIn } from "lucide-react";

export function LoginScreen() {
  const [demoName, setDemoName] = useState("");

  const handleDemoLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoName.trim()) return;
    signIn("demo", { name: demoName, callbackUrl: "/" });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 h-60 w-60 rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg space-y-8">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/15 border border-primary/20 shadow-2xl shadow-primary/10">
            <Atom className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              ahmetle<span className="text-primary">fizik</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              Birlikte çalış, birlikte başar
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Users, label: "Çalışma Odaları", desc: "Grup oluştur & katıl" },
            { icon: Timer, label: "Senkron Timer", desc: "Pomodoro zamanlayıcı" },
            { icon: MessageCircle, label: "Canlı Sohbet", desc: "Gerçek zamanlı mesajlaşma" },
            { icon: BarChart3, label: "İstatistikler", desc: "Günlük/haftalık analiz" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-3 rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-[11px] text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-xl">
          <CardContent className="relative p-6 space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold">Hemen Başla</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Google hesabınla giriş yaparak çalışmaya başlayabilirsin
              </p>
            </div>

            <Button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              size="lg"
              className="w-full h-12 gap-3 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 shadow-sm transition-all hover:shadow-md"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google ile Giriş Yap
            </Button>

            <div className="flex items-center justify-center gap-2 pt-2">
              <Sparkles className="h-3 w-3 text-primary/50 shrink-0" />
              <p className="text-[11px] text-muted-foreground">
                Güvenli giriş için Google altyapısı kullanılmaktadır.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
