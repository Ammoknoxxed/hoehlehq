"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Kommuniziert mit unserer API, die wir vorhin gebaut haben
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Falsche E-Mail oder falsches Passwort.");
      setIsLoading(false);
    } else {
      router.push("/"); // Bei Erfolg zurück zur Startseite (Dashboard)
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#C5A38E] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Our Journeys
          </h1>
          <p className="text-sm text-stone-500 font-medium">Gemeinsam Träumen & Planen</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-lg border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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
            className="w-full py-2.5 px-4 bg-[#C5A38E] hover:bg-[#A38572] text-white font-medium rounded-lg transition-colors flex justify-center items-center disabled:opacity-70"
          >
            {isLoading ? "Wird geprüft..." : "Eintreten"}
          </button>
        </form>
      </div>
    </div>
  );
}