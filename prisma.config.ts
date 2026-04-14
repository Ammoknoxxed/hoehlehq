// prisma.config.ts
import 'dotenv/config'; // Das zwingt das System, die .env Datei SOFORT zu laden
import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL as string,
  },
});