// src/components/StatCharts.tsx
"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';

const PIE_COLORS = ['#C5A38E', '#D4B8A6', '#E2CEBF', '#F1E3D8', '#A38572', '#8C6C58'];

export default function StatCharts({ expenses, energy }: { expenses: any[], energy: any[] }) {
  // Tortendiagramm Daten vorbereiten (Kategorien summieren)
  const expenseByCategory = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(expenseByCategory).map(key => ({
    name: key,
    value: expenseByCategory[key]
  })).sort((a, b) => b.value - a.value);

  // Liniendiagramm Daten vorbereiten (Energie)
  const lineData = energy.map(r => ({
    name: new Date(r.date).toLocaleDateString('de-DE', { month: 'short', day: 'numeric' }),
    kWh: r.value
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Tortendiagramm */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-[2.5rem] shadow-sm">
        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-6">Ausgaben nach Kategorie</h3>
        <div className="h-64 w-full">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => `€ ${Number(value).toFixed(2)}`}
                  contentStyle={{ borderRadius: '1rem', border: 'none', backgroundColor: '#1C1917', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-stone-400 italic text-sm">Keine Daten vorhanden</div>
          )}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-[10px]">
          {pieData.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></div>
              <span className="text-stone-600 dark:text-stone-300">{entry.name}: €{entry.value.toFixed(0)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Liniendiagramm (Energie) */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-[2.5rem] shadow-sm">
        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-6">Stromzähler Historie</h3>
        <div className="h-64 w-full">
          {lineData.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={lineData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
                 <XAxis dataKey="name" stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
                 <YAxis stroke="#888" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin', 'dataMax']} />
                 <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', backgroundColor: '#1C1917', color: '#fff' }}
                 />
                 <Line type="monotone" dataKey="kWh" stroke="#C5A38E" strokeWidth={3} dot={{ r: 4, fill: '#C5A38E' }} />
               </LineChart>
             </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-stone-400 italic text-sm">Keine Zählerstände</div>
          )}
        </div>
      </div>
    </div>
  );
}