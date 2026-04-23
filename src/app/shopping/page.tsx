// src/app/shopping/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { addShoppingItem, toggleShoppingItem, clearShoppingList } from "@/lib/actions";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import SubmitButton from "@/components/SubmitButton"; // NEU: Unser smarter Button
import { RefreshCw } from "lucide-react"; // NEU: Icon für das Update

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
            <SubmitButton className="bg-[#C5A38E] text-white px-8 rounded-xl font-bold hover:bg-[#A38572] transition shadow-md shadow-[#C5A38E]/20">
              Hinzufügen
            </SubmitButton>
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
                  <SubmitButton className="px-5 py-3 rounded-2xl text-sm font-bold bg-white dark:bg-stone-900 border-2 border-[#C5A38E] text-[#C5A38E] shadow-sm hover:bg-[#C5A38E] hover:text-white transition-all transform hover:-translate-y-0.5">
                    {item.amount && item.unit ? `${item.amount} ${item.unit} ` : ''}{item.title}
                  </SubmitButton>
                </form>
              ))
            )}
          </div>
        </section>

        {/* ERLEDIGTE ARTIKEL (MIT MENGEN-UPDATE FÜR VORRAT) */}
        {completedItems.length > 0 && (
          <section className="pt-8 border-t border-stone-200 dark:border-stone-800">
            <div className="flex justify-between items-center mb-4 ml-2">
              <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Im Einkaufswagen</h2>
              <form action={async () => { "use server"; await clearShoppingList(); }}>
                <SubmitButton className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-4 py-2 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-500/20 font-bold transition-colors">
                  Kauf abschließen & Vorrat füllen
                </SubmitButton>
              </form>
            </div>
            <div className="flex flex-col gap-2">
              {completedItems.map(item => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm gap-3">
                  
                  {/* Button zum Ent-Haken (zurück auf die Liste) */}
                  <form action={async () => { "use server"; await toggleShoppingItem(item.id, false); }} className="flex-1">
                    <button className="text-sm font-medium text-stone-400 dark:text-stone-500 line-through text-left w-full hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
                      {item.title}
                    </button>
                  </form>

                  {/* Mengen-Eingabe (Nur sichtbar, wenn es ein Vorrats-Artikel ist) */}
                  {item.pantryItemId ? (
                    <form action={async (formData) => { "use server"; await toggleShoppingItem(item.id, true, parseFloat(formData.get("amount") as string)); }} className="flex items-center gap-2 bg-stone-50 dark:bg-stone-950 p-1 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-stone-400 ml-2">Gekauft:</span>
                      <input 
                        name="amount" 
                        type="number" 
                        step="any" 
                        defaultValue={item.amount || 1} 
                        className="w-16 h-8 bg-white dark:bg-stone-900 text-center rounded-lg text-xs outline-none focus:border-[#C5A38E] border border-transparent transition-colors" 
                      />
                      <span className="text-xs text-stone-500 w-10 truncate">{item.unit || 'Stk'}</span>
                      <SubmitButton isIconOnly className="h-8 w-8 bg-[#C5A38E] text-white rounded-lg hover:bg-[#A38572] transition-colors flex items-center justify-center">
                        <RefreshCw size={12} />
                      </SubmitButton>
                    </form>
                  ) : (
                    <span className="text-[10px] text-stone-400 italic px-2">Kein Vorrats-Artikel</span>
                  )}
                  
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}