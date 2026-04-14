// src/app/shopping/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { addShoppingItem, toggleShoppingItem, clearShoppingList } from "@/lib/actions";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default async function ShoppingPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const shoppingList = await prisma.shoppingItem.findMany({ orderBy: { createdAt: 'asc' } });
  
  const activeItems = shoppingList.filter(item => !item.checked);
  const completedItems = shoppingList.filter(item => item.checked);

  return (
    <div className="min-h-screen bg-[#F9F7F5] dark:bg-stone-950 text-stone-900 dark:text-stone-100 p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* HEADER */}
        <header className="flex items-center justify-between pb-6 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-4">
            <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 transition">
              ←
            </Link>
            <h1 className="text-3xl font-bold text-[#C5A38E]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Einkaufsliste
            </h1>
          </div>
          <ThemeToggle />
        </header>

        {/* EINGABEFELD */}
        <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 sticky top-4 z-10">
          <form action={async (formData) => { "use server"; await addShoppingItem(formData.get("title") as string); }} className="flex gap-2">
            <input name="title" placeholder="Artikel hinzufügen..." className="flex-1 bg-stone-50 dark:bg-stone-950 p-4 rounded-xl outline-none border border-transparent focus:border-[#C5A38E]/50 transition" required autoFocus />
            <button type="submit" className="bg-[#C5A38E] text-white px-8 rounded-xl font-bold hover:bg-[#A38572] transition shadow-md shadow-[#C5A38E]/20">
              Hinzufügen
            </button>
          </form>
        </div>

        {/* OFFENE ARTIKEL */}
        <section>
          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 ml-2">Noch zu kaufen ({activeItems.length})</h2>
          <div className="flex flex-wrap gap-3">
            {activeItems.length === 0 ? (
              <p className="text-stone-400 text-sm italic ml-2">Alles erledigt. Der Kühlschrank ist voll!</p>
            ) : (
              activeItems.map(item => (
                <form key={item.id} action={async () => { "use server"; await toggleShoppingItem(item.id, true); }}>
                  <button className="px-5 py-3 rounded-2xl text-sm font-bold bg-white dark:bg-stone-900 border-2 border-[#C5A38E] text-[#C5A38E] shadow-sm hover:bg-[#C5A38E] hover:text-white transition-all transform hover:-translate-y-0.5">
                    {item.title}
                  </button>
                </form>
              ))
            )}
          </div>
        </section>

        {/* ERLEDIGTE ARTIKEL */}
        {completedItems.length > 0 && (
          <section className="pt-8 border-t border-stone-200 dark:border-stone-800">
            <div className="flex justify-between items-center mb-4 ml-2">
              <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Im Einkaufswagen</h2>
              <form action={async () => { "use server"; await clearShoppingList(); }}>
                <button className="text-xs text-red-400 hover:text-red-500 hover:underline font-bold">Liste leeren</button>
              </form>
            </div>
            <div className="flex flex-wrap gap-3">
              {completedItems.map(item => (
                <form key={item.id} action={async () => { "use server"; await toggleShoppingItem(item.id, false); }}>
                  <button className="px-4 py-2 rounded-xl text-sm font-medium bg-stone-100 dark:bg-stone-800/50 text-stone-400 dark:text-stone-500 line-through border border-transparent hover:border-stone-300 dark:hover:border-stone-600 transition-all">
                    {item.title}
                  </button>
                </form>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}