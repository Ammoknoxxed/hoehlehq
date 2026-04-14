import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

// Dies ist eine Server Component. Sie lädt Daten sicher im Backend, bevor der Nutzer etwas sieht.
export default async function Dashboard() {
  // 1. Sicherheits-Check: Ist der Nutzer eingeloggt?
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  // 2. Daten aus der Railway-Datenbank abrufen
  // Wir holen alle Nutzer, um das Gesamteinkommen zu berechnen
  const allUsers = await prisma.user.findMany();
  const totalIncome = allUsers.reduce((sum, user) => sum + user.netIncome, 0);

  // Wir holen alle Fixkosten und Schulden
  const obligations = await prisma.financialObligation.findMany();
  const totalExpenses = obligations.reduce((sum, obs) => sum + obs.amount, 0);

  // Analytische Berechnung des verfügbaren Geldes
  const freeCashflow = totalIncome - totalExpenses;

  // Wir holen die Bucketlist-Items (inklusive der Namen der Ersteller)
  const items = await prisma.bucketItem.findMany({
    include: { creator: true, approver: true },
    orderBy: { price: 'asc' }
  });

  // Funktion für unser Ampel-System
  const getAmpel = (preis: number, cashflow: number) => {
    if (cashflow <= 0) return { color: '#EF4444', text: 'Kein Budget vorhanden', icon: 'times-circle' };
    if (preis <= cashflow * 0.4) return { color: '#22C55E', text: 'Finanziell sehr sicher', icon: 'check-circle' };
    if (preis <= cashflow) return { color: '#EAB308', text: 'Frisst den Puffer auf', icon: 'exclamation-circle' };
    return { color: '#EF4444', text: 'Überschreitet aktuelles Budget', icon: 'times-circle' };
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans antialiased p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex justify-between items-center py-4 border-b border-stone-200">
          <div>
            <h1 className="text-3xl font-bold text-[#C5A38E] tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Our Journeys
            </h1>
            <p className="text-sm text-stone-500">Willkommen zurück, {session.user?.name}</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-50 text-blue-500" title="Er">
              E
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-pink-50 text-pink-500" title="Sie">
              S
            </div>
          </div>
        </header>

        {/* Finance Dashboard */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-stone-800">Gemeinsames Finanz-Potenzial</h2>
            <span className="text-sm text-stone-500">Stand: Monatlich</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm space-y-2">
              <p className="text-stone-500 text-sm">Gesamteinnahmen</p>
              <p className="text-2xl font-bold text-stone-900">€ {totalIncome.toLocaleString('de-DE')}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm space-y-2">
              <p className="text-stone-500 text-sm">Schulden & Fixkosten</p>
              <p className="text-2xl font-bold text-stone-700">€ {totalExpenses.toLocaleString('de-DE')}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border-l-4 border-[#C5A38E] shadow-[0_4px_15px_-3px_rgba(197,163,142,0.2)] space-y-2">
              <p className="text-[#C5A38E] text-sm font-medium">Freier Cashflow</p>
              <p className="text-3xl font-bold text-[#C5A38E]">€ {freeCashflow.toLocaleString('de-DE')}</p>
              <p className="text-xs text-stone-400">Verfügbar für Träume</p>
            </div>
          </div>
        </section>

        {/* Bucketlist */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-stone-800">Unsere Gemeinsame Bucketlist</h2>
            <button className="bg-[#C5A38E] hover:bg-[#A38572] text-white px-4 py-2 rounded-full text-sm transition-colors flex items-center shadow-sm">
              + Neuen Traum hinzufügen
            </button>
          </div>

          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="text-center p-8 bg-white rounded-xl border border-stone-100 text-stone-500">
                Eure Liste ist noch leer. Zeit, den ersten gemeinsamen Traum einzutragen!
              </div>
            ) : (
              items.map((item) => {
                const ampel = getAmpel(item.price, freeCashflow);
                return (
                  <div key={item.id} className="flex items-center justify-between p-5 bg-white rounded-xl border border-stone-100 hover:border-[#C5A38E]/30 hover:shadow-sm transition group">
                    <div className="flex items-center space-x-5">
                      <div className="w-1.5 h-12 rounded-full shadow-sm" style={{ backgroundColor: ampel.color }} title={ampel.text}></div>
                      <div>
                        <p className="font-semibold text-lg text-stone-800">{item.title}</p>
                        <div className="flex items-center space-x-4 text-xs text-stone-500 mt-1">
                          <span>€ {item.price.toLocaleString('de-DE')}</span>
                          <span>Von: {item.creator.name}</span>
                          <span className="font-medium" style={{ color: ampel.color }}>
                            {ampel.text}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}