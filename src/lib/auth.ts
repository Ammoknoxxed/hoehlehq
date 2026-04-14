// src/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

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
        
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) return null;

        return { id: user.id, email: user.email, name: user.name };
      }
    })
  ],
  session: { strategy: "jwt" },
  // Wir stellen sicher, dass das Secret IMMER da ist
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/login' }
};