import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Wir exportieren authOptions separat, damit wir sie in der page.tsx (Dashboard) importieren können
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Passwort", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        // Suche den User in der Railway-Datenbank
        const user = await prisma.user.findUnique({ 
          where: { email: credentials.email } 
        });

        if (!user) return null;

        // Passwort-Vergleich mit dem gehashten Wert
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) return null;

        // Gib die Session-Daten zurück
        return { 
          id: user.id, 
          email: user.email, 
          name: user.name 
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };