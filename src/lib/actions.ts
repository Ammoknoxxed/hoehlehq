// src/lib/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// --- NUTZER & EINKOMMEN ---
export async function updateNetIncome(amount: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Nicht autorisiert");
  await prisma.user.update({
    where: { email: session.user.email },
    data: { netIncome: amount },
  });
  revalidatePath("/");
}

// --- BUCKETLIST ---
export async function addBucketItem(title: string, price: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Nicht autorisiert");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User nicht gefunden");

  await prisma.bucketItem.create({
    data: { title, price, creatorId: user.id },
  });
  revalidatePath("/");
}

export async function approveBucketItem(itemId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Nicht autorisiert");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User nicht gefunden");

  await prisma.bucketItem.update({
    where: { id: itemId },
    data: { approverId: user.id },
  });
  revalidatePath("/");
}

export async function deleteBucketItem(itemId: string) {
  await prisma.bucketItem.delete({ where: { id: itemId } });
  revalidatePath("/");
}

// --- FIXKOSTEN (FINANCIAL OBLIGATIONS) ---
export async function addObligation(title: string, amount: number) {
  await prisma.financialObligation.create({
    data: { title, amount, type: "FIXKOSTEN" }
  });
  revalidatePath("/");
}

export async function deleteObligation(id: string) {
  await prisma.financialObligation.delete({ where: { id } });
  revalidatePath("/");
}