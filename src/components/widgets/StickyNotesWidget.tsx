// src/components/widgets/StickyNotesWidget.tsx
import { prisma } from "@/lib/prisma";
import { addStickyNote, deleteStickyNote } from "@/lib/actions";
import { MessageSquare, X, Maximize2, Camera } from "lucide-react";
import SubmitButton from "@/components/SubmitButton"; // NEU IMPORTIERT

export default async function StickyNotesWidget() {
  const stickyNotes = await prisma.stickyNote.findMany({ 
    orderBy: { createdAt: 'desc' }, 
    take: 10 
  });

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-[2.5rem] p-6 shadow-sm flex flex-col h-[500px] transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={18} className="text-[#C5A38E]" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">Schwarzes Brett</h3>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {stickyNotes.length === 0 && <p className="text-xs text-stone-400 italic">Keine Notizen.</p>}
        {stickyNotes.map(note => (
          <div key={note.id} className="bg-stone-50 dark:bg-stone-800/40 p-4 rounded-3xl border border-stone-100 dark:border-stone-800 relative group transition-colors">
            <div className="flex justify-between mb-2">
              <span className="text-[10px] font-bold text-[#C5A38E]">{note.author}</span>
              <form action={async () => { "use server"; await deleteStickyNote(note.id); }}>
                {/* NEU: Smarter Delete-Button */}
                <SubmitButton isIconOnly className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-rose-500 transition-all">
                  <X size={14}/>
                </SubmitButton>
              </form>
            </div>
            {note.text && <p className="text-sm leading-relaxed">{note.text}</p>}
            
            {note.imageUrl && (
              <div className="mt-3 relative group/img">
                <a href={`#img-${note.id}`} className="block rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 shadow-sm relative transition-all">
                  <img src={note.imageUrl} alt="Note" className="w-full h-auto max-h-48 object-cover" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                      <Maximize2 className="text-white" size={24} />
                  </div>
                </a>
                <div id={`img-${note.id}`} className="fixed inset-0 z-50 bg-black/90 hidden target:flex items-center justify-center p-4 transition-all duration-500">
                  <a href="#!" className="absolute top-6 right-6 text-white bg-white/20 p-2 rounded-full hover:bg-rose-500 transition-colors"><X size={24}/></a>
                  <img src={note.imageUrl} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <form action={addStickyNote} className="mt-4 flex gap-2">
        <input name="text" placeholder="Notiz hinterlassen..." className="flex-1 h-12 bg-stone-50 dark:bg-stone-950 px-5 rounded-2xl outline-none text-sm focus:border-[#C5A38E] border border-transparent transition" />
        <label className="w-12 h-12 bg-stone-100 dark:bg-stone-800 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-[#C5A38E] hover:text-white transition-all duration-300">
          <Camera size={20} /><input type="file" name="file" className="hidden" accept="image/*" />
        </label>
        {/* NEU: Smarter Senden-Button */}
        <SubmitButton className="px-6 h-12 bg-[#C5A38E] text-white rounded-2xl font-bold shadow-md hover:bg-[#A38572] transition-colors">
          Senden
        </SubmitButton>
      </form>
    </div>
  );
}