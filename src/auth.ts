import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "missing",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "missing",
    }),
    Credentials({
      id: "demo",
      name: "Demo Girişi (Test İçin)",
      credentials: {
        name: { label: "Adınız", type: "text", placeholder: "Ahmet Yılmaz" }
      },
      async authorize(credentials) {
        if (!credentials?.name) return null;
        return {
          id: `demo-${Date.now()}`,
          name: credentials.name as string,
          email: "demo@ahmetlefizik.com",
          image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.name}`
        };
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  secret: "ahmetlefizik-secret-key-change-in-production"
});
