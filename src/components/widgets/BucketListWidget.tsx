import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PiggyBank, Trash2, Check, ThumbsUp } from "lucide-react";
import SubmitButton from "@/components/SubmitButton";
import { deleteBucketItem, addFundsToItem, markItemCompleted, approveBucketItem } from "@/lib/actions";

export default async function BucketListWidget() {
  const session = await getServerSession(authOptions);
  const allUsers = await prisma.user.findMany();
  const currentUser = allUsers.find(u => u.email === session?.user?.email);
  const partner = allUsers.find(u => u.email !== session?.user?.email);

  const activeItems = await prisma.bucketItem.findMany({ 
    where: { isCompleted: false },
    include: { creator: true, approver: true }, 
    orderBy: { createdAt: 'desc' } 
  });

  const jointItems = activeItems.filter(i => i.approverId !== null);
  const myIndividualItems = activeItems.filter(i => i.creatorId === currentUser?.id && i.approverId === null);
  const partnerIndividualItems = activeItems.filter(i => i.creatorId === partner?.id && i.approverId === null);

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-[2.5rem] p-6 md:p-8 shadow-sm transition-colors">
      <div className="flex items-center gap-2 mb-6">
        <PiggyBank size={20} className="text-[#C5A38E]" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400">Sinking Funds & Wünsche</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gemeinsame Ziele */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest border-b border-stone-100 dark:border-stone-800 pb-2">Gemeinsame Ziele</h3>
          {jointItems.length === 0 && <p className="text-xs text-stone-400 italic">Keine gemeinsamen Ziele aktiv.</p>}
          {jointItems.map(item => (
            <div key={item.id} className="bg-stone-50 dark:bg-stone-950 p-4 rounded-2xl border border-stone-100 dark:border-stone-800">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-sm leading-tight">{item.title}</span>
                <form action={async () => { "use server"; await deleteBucketItem(item.id); }}>
                  <SubmitButton isIconOnly className="text-stone-400 hover:text-rose-500 transition-colors"><Trash2 size={14} /></SubmitButton>
                </form>
              </div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-medium text-stone-500">€ {item.savedAmount} / {item.price}</span>
                <span className="text-xs font-bold text-[#C5A38E]">{item.price > 0 ? Math.round((item.savedAmount / item.price) * 100) : 0}%</span>
              </div>
              <div className="h-1.5 w-full bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden mb-4">
                <div className="bg-[#C5A38E] h-full rounded-full transition-all duration-500" style={{ width: `${item.price > 0 ? Math.min((item.savedAmount / item.price) * 100, 100) : 0}%` }} />
              </div>
              <div className="flex gap-2">
                <form action={async (formData) => { "use server"; await addFundsToItem(item.id, parseFloat(formData.get("amount") as string)); }} className="flex-1 flex gap-1">
                  <input name="amount" type="number" placeholder="+ €" className="w-16 h-8 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-center outline-none" required />
                  <SubmitButton className="flex-1 bg-stone-900 dark:bg-stone-800 text-white rounded-lg text-xs font-bold shadow-sm">Save</SubmitButton>
                </form>
                {item.savedAmount >= item.price && item.price > 0 && (
                  <form action={async () => { "use server"; await markItemCompleted(item.id); }}>
                    <SubmitButton isIconOnly className="h-8 px-3 bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-sm flex items-center"><Check size={14} /></SubmitButton>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Eigene Wünsche */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest border-b border-stone-100 dark:border-stone-800 pb-2">Meine Wünsche</h3>
          {myIndividualItems.length === 0 && <p className="text-xs text-stone-400 italic">Keine eigenen Wünsche.</p>}
          {myIndividualItems.map(item => (
            <div key={item.id} className="bg-stone-50 dark:bg-stone-950 p-4 rounded-2xl border border-stone-100 dark:border-stone-800">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-sm leading-tight">{item.title}</span>
                <form action={async () => { "use server"; await deleteBucketItem(item.id); }}>
                  <SubmitButton isIconOnly className="text-stone-400 hover:text-rose-500 transition-colors"><Trash2 size={14} /></SubmitButton>
                </form>
              </div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-medium text-stone-500">€ {item.savedAmount} / {item.price}</span>
                <span className="text-xs font-bold text-[#C5A38E]">{item.price > 0 ? Math.round((item.savedAmount / item.price) * 100) : 0}%</span>
              </div>
              <div className="h-1.5 w-full bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden mb-4">
                <div className="bg-[#C5A38E] h-full rounded-full transition-all duration-500" style={{ width: `${item.price > 0 ? Math.min((item.savedAmount / item.price) * 100, 100) : 0}%` }} />
              </div>
              <div className="flex gap-2">
                <form action={async (formData) => { "use server"; await addFundsToItem(item.id, parseFloat(formData.get("amount") as string)); }} className="flex-1 flex gap-1">
                  <input name="amount" type="number" placeholder="+ €" className="w-16 h-8 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-center outline-none" required />
                  <SubmitButton className="flex-1 bg-stone-900 dark:bg-stone-800 text-white rounded-lg text-xs font-bold shadow-sm">Save</SubmitButton>
                </form>
                {item.savedAmount >= item.price && item.price > 0 && (
                  <form action={async () => { "use server"; await markItemCompleted(item.id); }}>
                    <SubmitButton isIconOnly className="h-8 px-3 bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-sm flex items-center"><Check size={14} /></SubmitButton>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Wünsche Partner */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest border-b border-stone-100 dark:border-stone-800 pb-2">Wünsche von Partner</h3>
          {partnerIndividualItems.length === 0 && <p className="text-xs text-stone-400 italic">Keine Wünsche ausstehend.</p>}
          {partnerIndividualItems.map(item => (
            <div key={item.id} className="bg-[#C5A38E]/5 border border-[#C5A38E]/20 p-4 rounded-2xl">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-sm leading-tight text-stone-800 dark:text-stone-200">{item.title}</span>
                <span className="text-xs font-bold text-[#C5A38E]">€ {item.price}</span>
              </div>
              <div className="flex justify-between items-end mb-2 mt-2">
                <span className="text-xs font-medium text-stone-500">Bereits gespart: € {item.savedAmount}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <form action={async () => { "use server"; await approveBucketItem(item.id); }} className="flex-1">
                  <SubmitButton className="w-full h-8 bg-[#C5A38E] text-white rounded-lg text-xs font-bold shadow-sm flex items-center justify-center gap-1 hover:bg-[#A38572] transition-colors">
                    <ThumbsUp size={12} /> Zu gemeinsam machen
                  </SubmitButton>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}