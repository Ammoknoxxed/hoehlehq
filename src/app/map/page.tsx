// src/app/map/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { addTravelPoint, addTrip, deleteTravelPoint, deleteTrip } from "@/lib/actions";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { MapPin, Plane, Map as MapIcon, Trash2 } from "lucide-react";

export default async function MapPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const points = await prisma.travelPoint.findMany({ orderBy: { createdAt: 'desc' } });
  const visited = points.filter(p => p.type === "VISITED");
  const goals = points.filter(p => p.type === "WANT_TO_GO");
  const plannedTrips = await prisma.trip.findMany({ orderBy: { date: 'asc' } });

  return (
    <div className="min-h-screen bg-[#F9F7F5] dark:bg-stone-950 text-stone-900 dark:text-stone-100 p-4 md:p-8 transition-colors duration-300 pb-32">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header className="flex items-center justify-between pb-6 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-4">
            <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 transition">←</Link>
            <h1 className="text-3xl font-bold text-[#C5A38E]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Reisezentrum</h1>
          </div>
          <ThemeToggle />
        </header>

        {/* KONKRETE REISEN PLANEN (FÜR DASHBOARD COUNTDOWN & BUDGET) */}
        <section className="bg-stone-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-9xl"><Plane /></div>
          <div className="relative z-10">
            <h2 className="text-sm font-bold text-[#C5A38E] uppercase tracking-widest mb-6">Gebuchte Reisen</h2>
            
            <div className="space-y-3 mb-8">
              {plannedTrips.length === 0 && <p className="text-xs text-stone-400 italic">Noch keine Reise gebucht.</p>}
              {plannedTrips.map(trip => (
                <div key={trip.id} className="bg-stone-800 p-4 rounded-2xl border border-stone-700 flex justify-between items-center group">
                  <div>
                    <p className="font-bold">{trip.title} <span className="text-stone-400 font-normal">({trip.destination})</span></p>
                    <p className="text-[10px] text-stone-400 uppercase mt-1">
                      Datum: {trip.date.toLocaleDateString('de-DE')} | Budget-Topf: <span className="text-[#C5A38E] font-bold">€{trip.savedAmount}</span>
                    </p>
                  </div>
                  <form action={async () => { "use server"; await deleteTrip(trip.id); }}>
                    <button className="text-stone-500 hover:text-rose-500 transition-colors p-2"><Trash2 size={16} /></button>
                  </form>
                </div>
              ))}
            </div>

            <form action={async (formData) => { "use server"; await addTrip(formData.get("title") as string, formData.get("dest") as string, formData.get("date") as string, parseFloat(formData.get("amount") as string) || 0); }} className="bg-black/30 p-4 rounded-2xl flex flex-col gap-3">
               <h3 className="text-[10px] uppercase font-bold text-stone-500">Neue Reise anlegen (Countdown startet sofort)</h3>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <input name="title" placeholder="Titel (z.B. Sommerurlaub)" className="bg-stone-800 px-3 py-2 rounded-xl text-xs outline-none" required />
                  <input name="dest" placeholder="Ort (z.B. Italien)" className="bg-stone-800 px-3 py-2 rounded-xl text-xs outline-none" required />
                  <input name="date" type="date" className="bg-stone-800 px-3 py-2 rounded-xl text-xs outline-none" required />
                  <input name="amount" type="number" placeholder="Budget in € (optional)" className="bg-stone-800 px-3 py-2 rounded-xl text-xs outline-none" />
               </div>
               <button className="w-full bg-[#C5A38E] hover:bg-[#A38572] text-white py-2 rounded-xl font-bold text-xs mt-1 transition-colors">Reise buchen</button>
            </form>
          </div>
        </section>

        {/* WELTKARTE / TRÄUME */}
        <section className="bg-white dark:bg-stone-900 p-8 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={18} className="text-emerald-500" />
                <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Schon besucht</h2>
              </div>
              <ul className="space-y-2">
                {visited.map(p => (
                  <li key={p.id} className="text-sm font-bold flex justify-between group">
                    <span>✓ {p.name}</span>
                    <form action={async () => { "use server"; await deleteTravelPoint(p.id); }}><button className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-rose-500"><Trash2 size={12}/></button></form>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MapIcon size={18} className="text-[#C5A38E]" />
                <h2 className="text-xs font-bold text-[#C5A38E] uppercase tracking-widest">Träume</h2>
              </div>
              <ul className="space-y-2">
                {goals.map(p => (
                   <li key={p.id} className="text-sm font-bold text-stone-500 flex justify-between group">
                     <span>{p.name}</span>
                     <form action={async () => { "use server"; await deleteTravelPoint(p.id); }}><button className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-rose-500"><Trash2 size={12}/></button></form>
                   </li>
                ))}
              </ul>
            </div>
          </div>

          <form action={async (formData) => { "use server"; await addTravelPoint(formData.get("name") as string, formData.get("type") as string); }} className="mt-8 border-t border-stone-100 dark:border-stone-800 pt-6 flex flex-col md:flex-row gap-3">
            <input name="name" placeholder="Ort/Land auf der Karte markieren..." className="flex-1 bg-stone-50 dark:bg-stone-950 px-4 py-3 rounded-xl text-sm outline-none border border-transparent focus:border-[#C5A38E]" required />
            <div className="flex gap-2">
              <button name="type" value="VISITED" className="px-4 py-3 bg-stone-800 dark:bg-stone-700 text-white rounded-xl text-xs font-bold hover:bg-stone-700 transition">War ich schon!</button>
              <button name="type" value="WANT_TO_GO" className="px-4 py-3 bg-[#C5A38E] text-white rounded-xl text-xs font-bold hover:bg-[#A38572] transition">Da will ich hin!</button>
            </div>
          </form>
        </section>

      </div>
    </div>
  );
}