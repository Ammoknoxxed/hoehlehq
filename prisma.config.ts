import { defineConfig } from '@prisma/config'
import * as dotenv from 'dotenv'

// Lädt die Umgebungsvariablen (lokal .env, auf Railway die System-Variablen)
dotenv.config()

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
} as any) // Der "as any" Cast zwingt TypeScript, diese Konfiguration ohne Fehler zu schlucken