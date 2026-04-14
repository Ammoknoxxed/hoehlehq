import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { 
  updateNetIncome, addBucketItem, approveBucketItem, 
  deleteBucketItem, addObligation, deleteObligation 
} from "@/lib/actions";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const allUsers = await prisma.user.findMany();
  const currentUser = allUsers.find(u => u.email === session.user?.email);
  const partner = allUsers.find(u => u.email !== session.user?.email);
  
  const obligations = await prisma.financialObligation.findMany();
  
  const totalIncome = allUsers.reduce((sum, user) => sum + user.netIncome, 0);
  const totalExpenses = obligations.reduce((sum, ob) => sum + ob.amount, 0);
  const freeCashflow = totalIncome - totalExpenses;

  const allItems = await prisma.bucketItem.findMany({
    include: { creator: true, approver: true },
    orderBy: { createdAt: 'desc' }
  });

  const jointItems = allItems.filter(i => i.approverId !== null);
  const partnerProposals = allItems.filter(i => i.creatorId !== currentUser?.id && i.approverId === null);
  const myProposals = allItems.filter(i => i.creatorId === currentUser?.id && i.approverId === null);

  return (
    <div className="min-h-screen bg-[#F9F7F5] text-stone-900 p-4 md:p-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* HEADER */}
        <header className="flex justify-between items-end border-b border-stone-200 pb-6">
          <div>
            <h1 className="text-4xl font-bold text-[#C5A38E]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Our Journeys</h1>
            <p className="text-stone-400 text-sm tracking-widest uppercase mt-1">Shared Financial Heartbeat</p>
          </div>
          <div className="text-right">
             <p className="text-3xl font-bold text-stone-800">€ {freeCashflow.toLocaleString('de-DE')}</p>
             <p className="text-xs text-[#C5A38E] font-bold uppercase">Netto Cashflow / Monat</p>
          </div>
        </header>

        {/* FINANZEN & FIXKOSTEN SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Einkommen */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
            <h2 className="text-sm font-bold text-stone-400 uppercase mb-4">Dein Einkommen</h2>
            <form action={async (formData) => { "use server"; await updateNetIncome(parseFloat(formData.get("income") as string)); }} className="space-y-3">
              <div className="relative">
                <span className="absolute left-4 top-2.5 text-stone-400">€</span>
                <input name="income" type="number" step="0.01" placeholder={currentUser?.netIncome.toString()} className="w-full pl-8 pr-4 py-2 bg-stone-50 rounded-xl outline-none focus:ring-2 focus:ring-[#C5A38E]/30" />
              </div>
              <button className="w-full py-2 bg-stone-800 text-white text-sm font-bold rounded-xl hover:bg-stone-700 transition">Update</button>
            </form>
          </section>

          {/* Fixkosten Liste */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
            <h2 className="text-sm font-bold text-stone-400 uppercase mb-4">Fixkosten & Schulden</h2>
            <div className="space-y-3 max-h-40 overflow-y-auto mb-4 pr-2">
              {obligations.map(ob => (
                <div key={ob.id} className="flex justify-between items-center text-sm border-b border-stone-50 pb-2 group">
                  <span className="text-stone-600">{ob.title}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">€ {ob.amount}</span>
                    <form action={async () => { "use server"; await deleteObligation(ob.id); }}>
                      <button className="text-stone-300 hover:text-red-400 transition">✕</button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
            <form action={async (formData) => { "use server"; await addObligation(formData.get("title") as string, parseFloat(formData.get("amount") as string)); }} className="flex gap-2">
              <input name="title" placeholder="Zweck" className="flex-1 text-xs p-2 bg-stone-50 rounded-lg outline-none" required />
              <input name="amount" type="number" placeholder="€" className="w-16 text-xs p-2 bg-stone-50 rounded-lg outline-none" required />
              <button className="p-2 bg-[#C5A38E] text-white rounded-lg text-xs">＋</button>
            </form>
          </section>
        </div>

        {/* BUCKETLIST: VORSCHLÄGE VOM PARTNER */}
        {partnerProposals.length > 0 && (
          <section className="animate-in fade-in slide-in-from-top-4 duration-700">
            <h2 className="text-xs font-bold text-[#C5A38E] uppercase tracking-widest mb-4">Neu von {partner?.name} – Deine Zustimmung?</h2>
            <div className="grid gap-4">
              {partnerProposals.map(item => (
                <div key={item.id} className="bg-[#C5A38E]/5 p-6 rounded-3xl border-2 border-dashed border-[#C5A38E]/30 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-stone-800 text-xl">{item.title}</p>
                    <p className="text-[#C5A38E] font-bold">€ {item.price.toLocaleString('de-DE')}</p>
                  </div>
                  <div className="flex gap-3">
                    <form action={async () => { "use server"; await deleteBucketItem(item.id); }}>
                      <button className="px-4 py-2 text-stone-400 hover:text-red-500 transition text-sm">Ablehnen</button>
                    </form>
                    <form action={async () => { "use server"; await approveBucketItem(item.id); }}>
                      <button className="bg-[#C5A38E] text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-[#C5A38E]/30 hover:scale-105 transition">👍 Bestätigen</button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* BUCKETLIST: GEMEINSAME TRÄUME */}
        <section className="space-y-6">
          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Unsere Meilensteine</h2>
          <div className="grid gap-6">
            {jointItems.map(item => {
              const impact = Math.min((item.price / (freeCashflow || 1)) * 100, 100);
              return (
                <div key={item.id} className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 group relative">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-stone-800">{item.title}</h3>
                      <p className="text-sm text-stone-400">Investition: € {item.price.toLocaleString('de-DE')}</p>
                    </div>
                    <form action={async () => { "use server"; await deleteBucketItem(item.id); }}>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-300 hover:text-red-400">Entfernen</button>
                    </form>
                  </div>
                  
                  {/* Progress Bar (Visual Polishing) */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-tighter text-stone-400">
                      <span>Finanzielle Belastung</span>
                      <span>{impact.toFixed(1)}% des Cashflows</span>
                    </div>
                    <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${impact > 80 ? 'bg-red-400' : impact > 40 ? 'bg-amber-400' : 'bg-[#C5A38E]'}`} 
                        style={{ width: `${impact}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* FLOATING ACTION BAR (Eingabe immer griffbereit) */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg">
          <form action={async (formData) => { 
            "use server"; 
            await addBucketItem(formData.get("title") as string, parseFloat(formData.get("price") as string)); 
          }} className="bg-stone-900/90 backdrop-blur-md p-2 rounded-2xl shadow-2xl flex gap-2">
            <input name="title" placeholder="Neuer Traum..." className="flex-1 bg-transparent border-none text-white text-sm px-4 outline-none" required />
            <input name="price" type="number" placeholder="€" className="w-20 bg-stone-800 border-none text-white text-sm px-2 rounded-lg outline-none" required />
            <button type="submit" className="bg-[#C5A38E] text-white p-3 rounded-xl hover:bg-[#A38572] transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}