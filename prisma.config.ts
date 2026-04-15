import { defineConfig } from '@prisma/config'
import * as dotenv from 'dotenv'

// Zwingt Prisma, die .env Datei zu lesen!
dotenv.config()

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrate: {
    url: process.env.DATABASE_URL,
  },
})