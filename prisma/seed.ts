import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

// 1. Umgebungsvariablen laden
dotenv.config();

// 2. Adapter-Setup (identisch zu src/lib/prisma.ts)
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// 3. Prisma Client mit Adapter initialisieren
const prisma = new PrismaClient({ adapter });

const masterPantryList = [
  // --- BASIS & GETREIDE ---
  { name: "Nudeln (Spaghetti/Penne)", minCount: 4, unit: "Pack" },
  { name: "Reis (Basmati/Langkorn)", minCount: 2, unit: "Kg" },
  { name: "Mehl (Weizen 405)", minCount: 2, unit: "Kg" },
  { name: "Zucker", minCount: 1, unit: "Kg" },
  { name: "Haferflocken", minCount: 2, unit: "Pack" },
  { name: "Couscous / Bulgur", minCount: 1, unit: "Pack" },
  { name: "Salz (Jod)", minCount: 1, unit: "Pack" },
  { name: "Paniermehl", minCount: 1, unit: "Pack" },

  // --- KONSERVEN & GLÄSER ---
  { name: "Dosentomaten (gehackt)", minCount: 4, unit: "Stück" },
  { name: "Dosentomaten (ganz)", minCount: 4, unit: "Stück" },
  { name: "Tomatenmark", minCount: 2, unit: "Stück" },
  { name: "Mais (Dose)", minCount: 2, unit: "Stück" },
  { name: "Kidneybohnen", minCount: 2, unit: "Stück" },
  { name: "Kichererbsen", minCount: 2, unit: "Stück" },
  { name: "Erbsen & Möhren", minCount: 2, unit: "Stück" },
  { name: "Pesto (Genovese/Rosso)", minCount: 3, unit: "Stück" },
  { name: "Essiggurken", minCount: 1, unit: "Stück" },
  { name: "Apfelmus / Apfelmark", minCount: 1, unit: "Stück" },

  // --- ÖLE, FETTE & SAUCEN ---
  { name: "Olivenöl", minCount: 500, unit: "ml" },
  { name: "Rapsöl", minCount: 500, unit: "ml" },
  { name: "Balsamico Essig", minCount: 1, unit: "Liter" },
  { name: "Heller Essig", minCount: 1, unit: "Liter" },
  { name: "Ketchup", minCount: 1, unit: "Stück" },
  { name: "Senf", minCount: 1, unit: "Stück" },
  { name: "Mayonnaise", minCount: 1, unit: "Stück" },
  { name: "Remoulade", minCount: 1, unit: "Stück" },
  { name: "Maggi", minCount: 1, unit: "Stück" },
  { name: "Sojasauce", minCount: 1, unit: "Stück" },
  { name: "Gemüsebrühe (Glas)", minCount: 1, unit: "Stück" },
  { name: "Kokosmilch", minCount: 2, unit: "Stück" },
  { name: "Kokosfett", minCount: 250, unit: "Gramm" },
  { name: "Zitronensaft (Konzentrat)", minCount: 1, unit: "Stück" }, // NEU: Für Saucen/Tee

  // --- KÜHLUNG & FRISCHE ---
  { name: "H-Milch", minCount: 4, unit: "Liter" },
  { name: "Butter", minCount: 2, unit: "Stück" },
  { name: "Eier", minCount: 1, unit: "Pack" },
  { name: "H-Sahne", minCount: 3, unit: "Pack" },
  { name: "Geriebener Käse", minCount: 2, unit: "Pack" },
  { name: "Käse (Aufschnitt)", minCount: 1, unit: "Pack" },
  { name: "Salami", minCount: 1, unit: "Pack" },
  { name: "Zwiebeln", minCount: 5, unit: "Stück" },
  { name: "Knoblauch", minCount: 2, unit: "Stück" },
  { name: "Kartoffeln", minCount: 2, unit: "Kg" },
  { name: "Aufbackbrötchen", minCount: 3, unit: "Pack" },

  // --- GEWÜRZE & BACKEN ---
  { name: "Pfeffer (Körner)", minCount: 1, unit: "Stück" },
  { name: "Paprika edelsüß", minCount: 1, unit: "Stück" },
  { name: "Oregano (getrocknet)", minCount: 1, unit: "Stück" },
  { name: "Currypulver", minCount: 1, unit: "Stück" },
  { name: "Zimt", minCount: 1, unit: "Stück" },
  { name: "Chili-Flocken", minCount: 1, unit: "Stück" },
  { name: "Muskatnuss", minCount: 1, unit: "Stück" },
  { name: "Kreuzkümmel (Cumin)", minCount: 1, unit: "Stück" }, // NEU: Für Chili/Indisch
  { name: "Backpulver", minCount: 5, unit: "Stück" },
  { name: "Trockenhefe", minCount: 3, unit: "Stück" },
  { name: "Vanillezucker", minCount: 5, unit: "Stück" },
  { name: "Speisestärke", minCount: 1, unit: "Pack" },

  // --- FRÜHSTÜCK & SNACKS ---
  { name: "Kaffee", minCount: 1, unit: "Pack" },
  { name: "Kaffeefilter", minCount: 1, unit: "Pack" }, // NEU: Falls keine Kapseln
  { name: "Tee", minCount: 2, unit: "Pack" },
  { name: "Nutella", minCount: 1, unit: "Stück" },
  { name: "Honig", minCount: 1, unit: "Stück" },
  { name: "Konfitüre", minCount: 1, unit: "Stück" },
  { name: "Schokolade", minCount: 2, unit: "Stück" },
  { name: "Chips / Snacks", minCount: 2, unit: "Pack" },

  // --- HYGIENE & REINIGUNG ---
  { name: "Toilettenpapier", minCount: 8, unit: "Stück" },
  { name: "Küchenrollen", minCount: 2, unit: "Stück" },
  { name: "Spülmaschinentabs", minCount: 20, unit: "Stück" },
  { name: "Müllbeutel (35L)", minCount: 10, unit: "Stück" },
  { name: "Zahnpasta", minCount: 2, unit: "Stück" },
  { name: "Flüssigseife", minCount: 1, unit: "Liter" },
  { name: "Waschmittel", minCount: 1, unit: "Pack" },
  { name: "Spülmittel", minCount: 1, unit: "Stück" },
  { name: "Duschgel", minCount: 2, unit: "Stück" },
  { name: "Shampoo", minCount: 1, unit: "Stück" },
  { name: "Deodorant", minCount: 2, unit: "Stück" },
  { name: "Rasierklingen", minCount: 4, unit: "Stück" },
  { name: "Allzweckreiniger", minCount: 1, unit: "Stück" },
  { name: "WC-Reiniger", minCount: 1, unit: "Stück" },
  { name: "Glasreiniger", minCount: 1, unit: "Stück" },
  { name: "Essig-Essenz", minCount: 1, unit: "Stück" },
  { name: "Abflussreiniger", minCount: 1, unit: "Stück" }, // NEU: Lebensretter
  { name: "Backpapier", minCount: 1, unit: "Stück" },
  { name: "Frischhaltefolie", minCount: 1, unit: "Stück" },
  { name: "Gefrierbeutel", minCount: 1, unit: "Pack" }, // NEU: Für Reste

  // --- APOTHEKE & MAINTENANCE ---
  { name: "Schmerzmittel (Ibu/Para)", minCount: 1, unit: "Pack" },
  { name: "Pflaster-Set", minCount: 1, unit: "Pack" },
  { name: "Desinfektionsspray", minCount: 1, unit: "Stück" },
  { name: "Nasenspray", minCount: 1, unit: "Stück" },
  { name: "Wund- & Heilsalbe", minCount: 1, unit: "Stück" }, // NEU: Bepanthen o.Ä.
  { name: "Batterien AA", minCount: 4, unit: "Stück" },
  { name: "Batterien AAA", minCount: 4, unit: "Stück" },
  { name: "WD-40", minCount: 1, unit: "Stück" }, // NEU: Master-Coder Essential
  { name: "Panzertape", minCount: 1, unit: "Stück" },
  { name: "Kabelbinder", minCount: 1, unit: "Pack" },
  { name: "Sekundenkleber", minCount: 1, unit: "Stück" },
  { name: "Teelichter", minCount: 20, unit: "Stück" },
  { name: "Feuerzeug / Streichhölzer", minCount: 2, unit: "Stück" }, // NEU

  // --- GETRÄNKE ---
  { name: "Mineralwasser (Kasten)", minCount: 2, unit: "Stück" },
  { name: "Apfelsaft", minCount: 3, unit: "Liter" },
  { name: "Cola / Limo", minCount: 2, unit: "Liter" },
  { name: "Wein (Kochen/Trinken)", minCount: 2, unit: "Stück" },
  { name: "Bier", minCount: 6, unit: "Stück" },

  // --- TIEFKÜHL (TK) ---
  { name: "TK-Rahmspinat", minCount: 2, unit: "Pack" },
  { name: "TK-Erbsen", minCount: 1, unit: "Pack" },
  { name: "TK-Pizza", minCount: 2, unit: "Stück" },
  { name: "TK-Kräuter", minCount: 2, unit: "Pack" }
];

async function main() {
  console.log('--- HÖHLE HQ PANTRY WIPE ---');
  await prisma.pantryItem.deleteMany({});
  console.log('Datenbank wurde geleert.');

  console.log('--- REBUILDING PANTRY ---');
  for (const item of masterPantryList) {
    await prisma.pantryItem.create({
      data: {
        name: item.name,
        minCount: item.minCount,
        unit: item.unit,
        count: item.minCount,
      },
    });
  }
  console.log(`Erfolg: ${masterPantryList.length} Artikel importiert.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); // Wichtig: Pool schließen, damit der Prozess beendet werden kann
  });