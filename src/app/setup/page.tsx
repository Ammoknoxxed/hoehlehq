"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ text: data.message, type: "error" });
      } else {
        setMessage({ text: "Account erfolgreich erstellt! Leere die Felder für den nächsten Account.", type: "success" });
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      setMessage({ text: "Verbindungsfehler zur Datenbank.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#C5A38E] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Initiale Einrichtung
          </h1>
          <p className="text-sm text-stone-500 font-medium">Erstelle eure beiden Accounts (Max. 2)</p>
        </div>

        {message.text && (
          <div className={`mb-4 p-3 text-sm rounded-lg border text-center ${
            message.type === "error" ? "bg-red-50 text-red-500 border-red-100" : "bg-green-50 text-green-600 border-green-100"
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Name (z.B. Er / Sie)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A38E]/50 focus:border-[#C5A38E] transition-all text-stone-800"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A38E]/50 focus:border-[#C5A38E] transition-all text-stone-800"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A38E]/50 focus:border-[#C5A38E] transition-all text-stone-800"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-white font-medium rounded-lg transition-colors flex justify-center items-center disabled:opacity-70"
          >
            {isLoading ? "Speichere in Datenbank..." : "Account anlegen"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => router.push("/login")} className="text-sm text-[#C5A38E] hover:underline">
            Zum Login wechseln
          </button>
        </div>
      </div>
    </div>
  );
}