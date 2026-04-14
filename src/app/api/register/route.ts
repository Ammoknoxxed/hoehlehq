import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // SICHERHEITS-CHECK: Sind bereits 2 Accounts registriert?
    const userCount = await prisma.user.count();
    if (userCount >= 2) {
      return NextResponse.json(
        { message: "Sicherheits-Lock aktiv: Maximale Anzahl an Nutzern (2) erreicht. Registrierung geschlossen." },
        { status: 403 }
      );
    }

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Bitte alle Felder ausfüllen." }, { status: 400 });
    }

    // Existiert die E-Mail bereits?
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "Diese E-Mail ist bereits vergeben." }, { status: 400 });
    }

    // Passwort sicher verschlüsseln (niemals im Klartext speichern!)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Nutzer in der Datenbank anlegen
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: "Erfolgreich erstellt!" }, { status: 201 });
  } catch (error) {
    console.error("Registrierungs-Fehler:", error);
    return NextResponse.json({ message: "Interner Server-Fehler." }, { status: 500 });
  }
}