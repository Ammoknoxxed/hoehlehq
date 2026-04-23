import { defineConfig } from '@prisma/config'
import * as dotenv from 'dotenv'

// Lädt die Umgebungsvariablen (lokal .env, auf Railway die System-Variablen)
dotenv.config()

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    // Dieser Befehl führt das Seed-Skript mit tsx aus
    seed: 'npx tsx ./prisma/seed.ts',
  },
} as any) // Der "as any" Cast bleibt bestehen, um Typ-Konflikte zu vermeiden