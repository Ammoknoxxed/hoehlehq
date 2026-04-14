// src/app/roulette/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { addDateIdea, markDateUsed } from "@/lib/actions";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default async function RoulettePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const allIdeas = await prisma.dateIdea.findMany({
    include: { creator: true },
    orderBy: { createdAt: 'desc' }
  });

  const availableIdeas = allIdeas.filter(i => !i.isUsed);
  const usedIdeas = allIdeas.filter(i => i.isUsed);

  // Zufallsgenerator (Server-Side)
  const randomIdea = availableIdeas.length > 0 
    ? availableIdeas[Math.floor(Math.random() * availableIdeas.length)] 
    : null;

  return (
    <div className="min-h-screen bg-[#F9F7F5] dark:bg-stone-950 text-stone-900 dark:text-stone-100 p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <header className="flex items-center justify-between pb-6 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-4">
            <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 transition">←</Link>
            <h1 className="text-3xl font-bold text-[#C5A38E]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Date Roulette</h1>
          </div>
          <ThemeToggle />
        </header>

        {/* DAS ROULETTE */}
        <section className="bg-stone-900 text-white p-8 rounded-3xl shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 text-9xl opacity-10">🎲</div>
          <h2 className="text-stone-400 uppercase tracking-widest text-sm font-bold">Heutiges Abendprogramm</h2>
          
          {randomIdea ? (
            <div className="space-y-4">
              <p className="text-3xl font-bold text-[#C5A38E] py-4">{randomIdea.title}</p>
              <p className="text-xs text-stone-400">Idee von {randomIdea.creator.name}</p>
              <form action={async () => { "use server"; await markDateUsed(randomIdea.id); }}>
                <button className="bg-white text-stone-900 px-8 py-3 rounded-xl font-bold hover:bg-stone-200 transition shadow-lg mt-4">
                  Wir machen das! ✓
                </button>
              </form>
            </div>
          ) : (
            <p className="text-stone-400 italic py-8">Keine Ideen im Topf. Fügt unten neue hinzu!</p>
          )}
        </section>

        {/* IDEEN-TOPF FÜLLEN */}
        <section className="bg-white dark:bg-stone-900 p-6 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800">
          <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">Geheime Idee einwerfen</h2>
          <form action={async (formData) => { "use server"; await addDateIdea(formData.get("title") as string); }} className="flex gap-2">
            <input name="title" placeholder="Kino, Kochen, Spaziergang..." className="flex-1 bg-stone-50 dark:bg-stone-950 p-4 rounded-xl outline-none" required />
            <button type="submit" className="bg-[#C5A38E] text-white px-6 rounded-xl font-bold hover:bg-[#A38572]">+</button>
          </form>
          <p className="text-xs text-stone-400 mt-3 ml-2">Es liegen {availableIdeas.length} Ideen verdeckt im Topf.</p>
        </section>

      </div>
    </div>
  );
}