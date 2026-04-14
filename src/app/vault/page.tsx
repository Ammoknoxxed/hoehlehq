// src/app/vault/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { addVaultItem, deleteVaultItem } from "@/lib/actions";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default async function VaultPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const items = await prisma.vaultItem.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="min-h-screen bg-[#F9F7F5] dark:bg-stone-950 text-stone-900 dark:text-stone-100 p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <header className="flex items-center justify-between pb-6 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-4">
            <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 transition">←</Link>
            <h1 className="text-3xl font-bold text-[#C5A38E]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Tresor</h1>
          </div>
          <ThemeToggle />
        </header>

        <section className="bg-stone-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute -right-6 -top-6 text-9xl opacity-5">🔒</div>
          <h2 className="text-sm font-bold text-[#C5A38E] uppercase tracking-widest mb-6">Gemeinsame Dokumente & Links</h2>
          
          <div className="space-y-3 mb-8">
            {items.length === 0 ? (
              <p className="text-stone-500 italic text-sm">Der Tresor ist noch leer.</p>
            ) : (
              items.map(item => (
                <div key={item.id} className="flex justify-between items-center p-4 bg-stone-800/50 rounded-2xl border border-stone-700">
                  <div>
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-bold text-white hover:text-[#C5A38E] transition flex items-center gap-2">
                      📄 {item.title} ↗
                    </a>
                    <p className="text-[10px] text-stone-400 mt-1">Hinzugefügt von {item.addedBy}</p>
                  </div>
                  <form action={async () => { "use server"; await deleteVaultItem(item.id); }}>
                    <button className="text-stone-500 hover:text-red-400 text-sm p-2">✕</button>
                  </form>
                </div>
              ))
            )}
          </div>

          <form action={async (formData) => { "use server"; await addVaultItem(formData.get("title") as string, formData.get("url") as string); }} className="flex flex-col gap-3 bg-black/40 p-4 rounded-2xl">
            <h3 className="text-xs uppercase text-stone-500 font-bold">Neuen Link sichern</h3>
            <div className="flex gap-2">
              <input name="title" placeholder="z.B. Mietvertrag (Google Drive)" className="flex-1 bg-stone-800 border-none text-white text-sm px-4 py-2 rounded-xl outline-none" required />
              <input name="url" type="url" placeholder="https://..." className="flex-1 bg-stone-800 border-none text-white text-sm px-4 py-2 rounded-xl outline-none" required />
              <button type="submit" className="bg-[#C5A38E] text-white px-6 rounded-xl font-bold hover:bg-[#A38572]">+</button>
            </div>
          </form>
        </section>

      </div>
    </div>
  );
}