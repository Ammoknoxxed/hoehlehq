// src/app/smarthome/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toggleSmartDevice, deleteSmartDevice, addSmartDevice, setGoveeDeviceState, sendTvCommand } from "@/lib/actions";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
// Alle notwendigen Icons (inklusive Steuerkreuz)
import { Volume2, Volume1, VolumeX, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Play, Pause, Home, Undo2 } from "lucide-react";

export default async function SmartHomePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const devices = await prisma.smartDevice.findMany({ orderBy: { room: 'asc' } });
  const rooms = Array.from(new Set(devices.map(d => d.room)));

  return (
    <div className="min-h-screen bg-[#F9F7F5] dark:bg-stone-950 text-stone-900 dark:text-stone-100 p-4 md:p-8 transition-colors duration-300 pb-32">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center justify-between pb-6 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-4">
            <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 transition">←</Link>
            <h1 className="text-3xl font-bold text-[#C5A38E]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Smart Home</h1>
          </div>
          <ThemeToggle />
        </header>

        {rooms.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 p-10 rounded-3xl border border-dashed border-stone-200 dark:border-stone-700 text-center">
            <p className="text-stone-500 italic">Noch keine Geräte in der Datenbank.</p>
          </div>
        ) : (
          rooms.map(room => (
            <section key={room} className="space-y-4">
              <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest pl-2">{room}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {devices.filter(d => d.room === room).map(device => (
                  <div key={device.id} className={`relative p-5 rounded-3xl border transition-all duration-500 flex flex-col group ${
                    device.isActive ? 'bg-stone-900 border-stone-700 shadow-[0_0_20px_rgba(197,163,142,0.15)]' : 'bg-white dark:bg-stone-900/50 border-stone-200 dark:border-stone-800'
                  }`}>
                    
                    {/* Header des Geräts */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <span className={`text-2xl ${device.isActive ? 'text-[#C5A38E]' : 'text-stone-400 grayscale'}`}>
                          {device.type === 'LIGHT' ? '💡' : device.type === 'VACUUM' ? '🧹' : device.type === 'TV' ? '📺' : '🔌'}
                        </span>
                        <div>
                           <p className={`font-bold text-[14px] ${device.isActive ? 'text-white' : 'text-stone-600 dark:text-stone-300'}`}>{device.name}</p>
                           <p className="text-[10px] text-stone-500 uppercase">{device.value || (device.isActive ? 'Online' : 'Standby')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <form action={async () => { "use server"; await deleteSmartDevice(device.id); }}>
                          <button className="text-stone-600 hover:text-red-400 text-xs transition-colors">✕</button>
                        </form>
                        <form action={async () => { "use server"; await toggleSmartDevice(device.id, device.isActive); }}>
                          <button className={`w-12 h-6 rounded-full flex items-center transition-colors px-1 shadow-inner ${device.isActive ? 'bg-[#C5A38E] justify-end' : 'bg-stone-300 dark:bg-stone-800 justify-start'}`}>
                            <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* GOVEE LICHT STEUERUNG */}
                    {device.isActive && device.type === 'LIGHT' && (
                      <div className="pt-4 border-t border-stone-800 animate-in fade-in slide-in-from-top-2">
                        <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-2">RGB Farbwähler</p>
                        
                        {/* Nativer, stufenloser Color-Picker */}
                        <form action={async (formData) => { 
                          "use server"; 
                          const hex = formData.get("color") as string;
                          if (!hex) return;
                          // Umrechnung von Hexadezimal zu RGB für Govee API
                          const r = parseInt(hex.substring(1, 3), 16);
                          const g = parseInt(hex.substring(3, 5), 16);
                          const b = parseInt(hex.substring(5, 7), 16);
                          await setGoveeDeviceState(device.id, "color", { r, g, b }); 
                        }} className="flex gap-3 mb-5">
                          <div className="relative flex-1 h-12 rounded-xl overflow-hidden border border-stone-700 bg-stone-800">
                            {/* Versteckt den hässlichen Standard-Rand des HTML Color Pickers */}
                            <input type="color" name="color" defaultValue="#C5A38E" className="absolute -top-2 -left-2 w-20 h-20 cursor-pointer" />
                          </div>
                          <button type="submit" className="bg-[#C5A38E] hover:bg-[#A38572] text-white px-4 rounded-xl text-xs font-bold transition-colors shadow-sm">
                            Farbe senden
                          </button>
                        </form>

                        <p className="text-[10px] text-stone-500 uppercase tracking-wider mb-2">Helligkeit</p>
                        <div className="flex gap-2">
                          <form action={async () => { "use server"; await setGoveeDeviceState(device.id, "brightness", 25); }} className="flex-1"><button className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-white text-xs rounded-xl transition-colors font-bold">25%</button></form>
                          <form action={async () => { "use server"; await setGoveeDeviceState(device.id, "brightness", 50); }} className="flex-1"><button className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-white text-xs rounded-xl transition-colors font-bold">50%</button></form>
                          <form action={async () => { "use server"; await setGoveeDeviceState(device.id, "brightness", 100); }} className="flex-1"><button className="w-full py-2.5 bg-[#C5A38E] hover:bg-[#A38572] text-white text-xs rounded-xl transition-colors font-bold">100%</button></form>
                        </div>
                      </div>
                    )}

                    {/* SAMSUNG TV FERNBEDIENUNG */}
                    {device.isActive && device.type === 'TV' && (
                      <div className="pt-4 border-t border-stone-800 animate-in fade-in slide-in-from-top-2">
                        
                        {/* Obere Leiste: Zurück, Home, Play/Pause */}
                        <div className="flex justify-between gap-2 mb-4">
                          <form className="flex-1" action={async () => { "use server"; await sendTvCommand(device.id, "samsungvd.remoteControl", "send", ["KEY_RETURN"]); }}><button className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-xl flex justify-center items-center transition-colors"><Undo2 size={18}/></button></form>
                          <form className="flex-1" action={async () => { "use server"; await sendTvCommand(device.id, "samsungvd.remoteControl", "send", ["KEY_HOME"]); }}><button className="w-full py-3 bg-[#C5A38E] hover:bg-[#A38572] text-white rounded-xl flex justify-center items-center transition-colors"><Home size={18}/></button></form>
                          <form className="flex-1" action={async () => { "use server"; await sendTvCommand(device.id, "mediaPlayback", "play"); }}><button className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-xl flex justify-center items-center transition-colors"><Play size={18}/></button></form>
                          <form className="flex-1" action={async () => { "use server"; await sendTvCommand(device.id, "mediaPlayback", "pause"); }}><button className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-xl flex justify-center items-center transition-colors"><Pause size={18}/></button></form>
                        </div>

                        {/* Das D-PAD (Steuerkreuz) */}
                        <div className="flex justify-center mb-4">
                          <div className="grid grid-cols-3 gap-2 w-48">
                            <div></div> {/* Leer oben links */}
                            <form action={async () => { "use server"; await sendTvCommand(device.id, "samsungvd.remoteControl", "send", ["KEY_UP"]); }}><button className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-xl flex justify-center items-center"><ChevronUp size={20}/></button></form>
                            <div></div> {/* Leer oben rechts */}

                            <form action={async () => { "use server"; await sendTvCommand(device.id, "samsungvd.remoteControl", "send", ["KEY_LEFT"]); }}><button className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-xl flex justify-center items-center"><ChevronLeft size={20}/></button></form>
                            <form action={async () => { "use server"; await sendTvCommand(device.id, "samsungvd.remoteControl", "send", ["KEY_ENTER"]); }}><button className="w-full py-3 bg-stone-700 hover:bg-stone-600 border border-stone-600 text-white rounded-xl flex justify-center items-center font-bold text-xs">OK</button></form>
                            <form action={async () => { "use server"; await sendTvCommand(device.id, "samsungvd.remoteControl", "send", ["KEY_RIGHT"]); }}><button className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-xl flex justify-center items-center"><ChevronRight size={20}/></button></form>

                            <div></div> {/* Leer unten links */}
                            <form action={async () => { "use server"; await sendTvCommand(device.id, "samsungvd.remoteControl", "send", ["KEY_DOWN"]); }}><button className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-xl flex justify-center items-center"><ChevronDown size={20}/></button></form>
                            <div></div> {/* Leer unten rechts */}
                          </div>
                        </div>

                        {/* Untere Leiste: Lautstärke und Kanäle */}
                        <div className="grid grid-cols-3 gap-2">
                          <form action={async () => { "use server"; await sendTvCommand(device.id, "audioVolume", "volumeUp"); }}><button className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-xl flex flex-col items-center gap-1 transition-colors"><Volume2 size={16}/><span className="text-[9px] uppercase font-bold text-stone-400">Vol +</span></button></form>
                          <form action={async () => { "use server"; await sendTvCommand(device.id, "audioMute", "mute"); }}><button className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-xl flex flex-col items-center gap-1 transition-colors"><VolumeX size={16} className="text-red-400"/><span className="text-[9px] uppercase font-bold text-stone-400">Mute</span></button></form>
                          <form action={async () => { "use server"; await sendTvCommand(device.id, "tvChannel", "channelUp"); }}><button className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-xl flex flex-col items-center gap-1 transition-colors"><ChevronUp size={16}/><span className="text-[9px] uppercase font-bold text-stone-400">CH +</span></button></form>

                          <form action={async () => { "use server"; await sendTvCommand(device.id, "audioVolume", "volumeDown"); }}><button className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-xl flex flex-col items-center gap-1 transition-colors"><Volume1 size={16}/><span className="text-[9px] uppercase font-bold text-stone-400">Vol -</span></button></form>
                          <div></div> {/* Platzhalter Mitte Unten */}
                          <form action={async () => { "use server"; await sendTvCommand(device.id, "tvChannel", "channelDown"); }}><button className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-xl flex flex-col items-center gap-1 transition-colors"><ChevronDown size={16}/><span className="text-[9px] uppercase font-bold text-stone-400">CH -</span></button></form>
                        </div>

                      </div>
                    )}

                  </div>
                ))}
              </div>
            </section>
          ))
        )}

        <form action={async (formData) => { 
          "use server"; 
          await addSmartDevice(
            formData.get("name") as string, 
            formData.get("type") as string, 
            formData.get("room") as string,
            formData.get("eid") as string,
            formData.get("model") as string
          ); 
        }} className="bg-stone-900 p-6 rounded-3xl shadow-xl flex flex-col gap-4 mt-8">
          <h2 className="text-[#C5A38E] text-xs uppercase font-bold tracking-widest">Neues Gerät anlegen</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input name="name" placeholder="Name (z.B. Samsung TV)" className="bg-stone-800 text-white p-3 rounded-xl outline-none text-sm" required />
            <select name="type" className="bg-stone-800 text-white p-3 rounded-xl outline-none text-sm font-bold">
              <option value="LIGHT">💡 Licht</option>
              <option value="TV">📺 Smart TV</option>
              <option value="VACUUM">🧹 Saugroboter</option>
              <option value="PLUG">🔌 Steckdose</option>
            </select>
            <input name="room" placeholder="Raum (z.B. Wohnzimmer)" className="bg-stone-800 text-white p-3 rounded-xl outline-none text-sm" required />
            <input name="eid" placeholder="MAC Adresse / Samsung ID" className="bg-stone-800 text-white p-3 rounded-xl outline-none text-sm" />
            <input name="model" placeholder="Modell (nur bei Govee, z.B. H618F)" className="bg-stone-800 text-white p-3 rounded-xl outline-none text-sm" />
          </div>
          
          <button type="submit" className="bg-[#C5A38E] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#A38572] transition">
            Gerät speichern
          </button>
        </form>
      </div>
    </div>
  );
}