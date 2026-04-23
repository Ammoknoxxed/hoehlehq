// src/components/widgets/PetWidget.tsx
import { prisma } from "@/lib/prisma";
import { consumePetFood, addPetFood, cleanLitterBox, addHealthEvent, deleteHealthEvent } from "@/lib/actions";
import { Cat, AlertTriangle, Trash2 } from "lucide-react";

function getHygieneStatus(lastCleanAt?: Date | null) {
  if (!lastCleanAt) return { text: "Nie", color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/20", level: 3 };
  const hours = (new Date().getTime() - lastCleanAt.getTime()) / (1000 * 60 * 60);
  if (hours < 12) return { text: "Frisch", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20", level: 1 };
  if (hours < 24) return { text: "Okay", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20", level: 2 };
  return { text: "Kritisch", color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/20 animate-pulse", level: 3 };
}

function PueppiIcon({ statusLevel }: { statusLevel: number }) {
  const baseClasses = "w-16 h-16 transition-all duration-500";
  if (statusLevel === 3) {
    return (
      <div className="relative group">
        <div className="absolute inset-0 bg-rose-500/30 rounded-full blur-xl animate-pulse"></div>
        <Cat className={`${baseClasses} text-rose-500 animate-bounce relative z-10`} strokeWidth={1.5} />
        <AlertTriangle className="absolute -top-1 -right-1 text-rose-500 w-5 h-5 animate-pulse" />
      </div>
    );
  }
  if (statusLevel === 2) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-lg animate-pulse"></div>
        <Cat className={`${baseClasses} text-amber-500 animate-pulse relative z-10`} strokeWidth={1.5} />
      </div>
    );
  }
  return (
    <div className="relative">
      <Cat className={`${baseClasses} text-[#C5A38E] hover:scale-110 transition-transform`} strokeWidth={1} />
    </div>
  );
}

export default async function PetWidget() {
  const [petFoodResult, lastCleanBox1, lastCleanBox2, healthEvents] = await Promise.all([
    prisma.petFood.findFirst(),
    prisma.litterBoxLog.findFirst({ where: { boxId: 1 }, orderBy: { createdAt: 'desc' } }),
    prisma.litterBoxLog.findFirst({ where: { boxId: 2 }, orderBy: { createdAt: 'desc' } }),
    prisma.petHealthEvent.findMany({ orderBy: { dueDate: 'asc' } })
  ]);

  let petFood = petFoodResult || await prisma.petFood.create({ data: { cans: 10 } });

  const foodStatusLevel = petFood.cans > 5 ? 1 : petFood.cans > 2 ? 2 : 3;
  const litter1Status = getHygieneStatus(lastCleanBox1?.createdAt);
  const litter2Status = getHygieneStatus(lastCleanBox2?.createdAt);
  const overallPueppiStatus = Math.max(foodStatusLevel, litter1Status.level, litter2Status.level);

  return (
    <div className="bg-stone-900 text-white rounded-[2.5rem] p-8 shadow-2xl flex flex-col justify-between overflow-hidden relative transition-colors duration-500" 
         style={{ boxShadow: overallPueppiStatus === 3 ? '0 0 40px -5px rgba(239, 68, 68, 0.3)' : overallPueppiStatus === 2 ? '0 0 30px -5px rgba(245, 158, 11, 0.2)' : '0 10px 30px -10px rgba(0,0,0,0.5)' }}>
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-4 text-[#C5A38E]">
          <PueppiIcon statusLevel={overallPueppiStatus} />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.3em]">Püppi Cares</h3>
            <p className="text-[10px] text-stone-500 uppercase mt-1">Hygienestatus: <span className={getHygieneStatus(lastCleanBox1?.createdAt).color}>{getHygieneStatus(lastCleanBox1?.createdAt).text}</span></p>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className={`flex items-center gap-2 tabular-nums text-4xl font-light ${foodStatusLevel === 3 ? 'text-rose-500' : foodStatusLevel === 2 ? 'text-amber-500' : 'text-white'}`}>
              {foodStatusLevel === 3 && <AlertTriangle className="w-6 h-6 animate-pulse" />}
              {petFood.cans}
          </div>
          <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mt-1">Dosen im Vorrat</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
        <div className={`p-4 rounded-2xl border transition-colors ${getHygieneStatus(lastCleanBox1?.createdAt).bg}`}>
          <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">Haupt-Klo</span>
              <form action={async () => { "use server"; await cleanLitterBox(1); }}>
                  <button className="h-9 w-9 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center transition-colors text-white font-bold">✓</button>
              </form>
          </div>
          <p className="text-[10px] text-stone-600 dark:text-stone-400 uppercase tracking-widest">Zuletzt: {lastCleanBox1 ? lastCleanBox1.createdAt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : 'Unbekannt'}</p>
        </div>
        <div className={`p-4 rounded-2xl border transition-colors ${getHygieneStatus(lastCleanBox2?.createdAt).bg}`}>
          <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">Zweit-Klo</span>
              <form action={async () => { "use server"; await cleanLitterBox(2); }}>
                  <button className="h-9 w-9 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center transition-colors text-white font-bold">✓</button>
              </form>
          </div>
          <p className="text-[10px] text-stone-600 dark:text-stone-400 uppercase tracking-widest">Zuletzt: {lastCleanBox2 ? lastCleanBox2.createdAt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : 'Unbekannt'}</p>
        </div>
      </div>

      <div className="bg-stone-800/50 rounded-2xl p-4 mb-6 relative z-10 border border-stone-700/50">
        <p className="text-[10px] uppercase font-bold text-stone-500 mb-2">Gesundheit & Termine</p>
        <div className="space-y-2 mb-3">
          {healthEvents.length === 0 && <p className="text-[10px] text-stone-500 italic">Keine anstehenden Termine.</p>}
          {healthEvents.map(he => (
            <div key={he.id} className="flex justify-between items-center text-xs group">
              <span className="font-bold text-stone-300">{he.title}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#C5A38E]">{he.dueDate.toLocaleDateString('de-DE')}</span>
                <form action={async () => { "use server"; await deleteHealthEvent(he.id); }}><button className="opacity-0 group-hover:opacity-100 text-rose-500"><Trash2 size={10}/></button></form>
              </div>
            </div>
          ))}
        </div>
        <form action={async (formData) => { "use server"; await addHealthEvent(formData.get("title") as string, formData.get("date") as string); }} className="flex gap-2">
          <input name="title" placeholder="Impfung, Tierarzt..." className="flex-1 bg-stone-900 px-3 py-2 rounded-xl text-[10px] outline-none border border-transparent focus:border-[#C5A38E]" required />
          <input name="date" type="date" className="w-24 bg-stone-900 px-3 py-2 rounded-xl text-[10px] outline-none border border-transparent focus:border-[#C5A38E]" required />
          <button className="bg-white/10 hover:bg-white/20 text-white px-3 rounded-xl text-[10px] transition-colors">+</button>
        </form>
      </div>

      <div className="flex gap-2 relative z-10">
        <form action={consumePetFood} className="flex-1"><button className="w-full h-12 bg-stone-800/80 rounded-2xl text-xs font-bold hover:bg-rose-500/20 hover:text-rose-500 transition-colors duration-300">-1 Dose</button></form>
        <form action={async () => { "use server"; await addPetFood(6); }} className="flex-1"><button className="w-full h-12 bg-[#C5A38E] text-stone-900 rounded-2xl text-xs font-bold hover:bg-[#A38572] transition-colors duration-300">+6 Dosen</button></form>
      </div>
    </div>
  );
}