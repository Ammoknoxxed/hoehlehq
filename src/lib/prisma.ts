// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Die Datenbank-URL aus der Railway/lokalen .env holen
const connectionString = `${process.env.DATABASE_URL}`;

// Einen Connection-Pool für die PostgreSQL Datenbank aufbauen
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Globales Prisma-Objekt (verhindert hunderte parallele Verbindungen im Dev-Modus)
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Den PrismaClient MIT dem neuen Adapter initialisieren
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;