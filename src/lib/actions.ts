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

// --- BUCKETLIST & SINKING FUNDS ---
export async function addBucketItem(title: string, price: number, isSurprise: boolean = false) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Nicht autorisiert");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User nicht gefunden");

  await prisma.bucketItem.create({
    data: { title, price, isSurprise, creatorId: user.id },
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

export async function addFundsToItem(itemId: string, amount: number) {
  const item = await prisma.bucketItem.findUnique({ where: { id: itemId } });
  if (!item) throw new Error("Item nicht gefunden");

  await prisma.bucketItem.update({
    where: { id: itemId },
    data: { savedAmount: item.savedAmount + amount },
  });
  revalidatePath("/");
}

export async function markItemCompleted(itemId: string) {
  await prisma.bucketItem.update({
    where: { id: itemId },
    data: { isCompleted: true },
  });
  revalidatePath("/");
}

// --- FIXKOSTEN ---
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

// --- VARIABLE AUSGABEN (DAILY SYNC) ---
export async function addExpense(title: string, amount: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Nicht autorisiert");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User nicht gefunden");

  await prisma.expense.create({
    data: { title, amount, userId: user.id }
  });
  revalidatePath("/");
}

export async function deleteExpense(id: string) {
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/");
}

// --- EINKAUFSLISTE ---
export async function addShoppingItem(title: string) {
  await prisma.shoppingItem.create({ data: { title } });
  revalidatePath("/");
}

export async function toggleShoppingItem(id: string, checked: boolean) {
  await prisma.shoppingItem.update({ where: { id }, data: { checked } });
  revalidatePath("/");
}

export async function clearShoppingList() {
  await prisma.shoppingItem.deleteMany({ where: { checked: true } });
  revalidatePath("/");
}

// --- DATE NIGHT ROULETTE ---
export async function addDateIdea(title: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Nicht autorisiert");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User nicht gefunden");

  await prisma.dateIdea.create({
    data: { title, creatorId: user.id }
  });
  revalidatePath("/roulette");
}

export async function markDateUsed(id: string) {
  await prisma.dateIdea.update({
    where: { id },
    data: { isUsed: true }
  });
  revalidatePath("/roulette");
}

// --- GAMIFIED CHORES (PUTZPLAN) ---
export async function addChore(title: string, points: number) {
  await prisma.chore.create({
    data: { title, points }
  });
  revalidatePath("/chores");
}

export async function completeChore(choreId: string, points: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Nicht autorisiert");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User nicht gefunden");

  // Aufgabe als erledigt markieren
  await prisma.chore.update({
    where: { id: choreId },
    data: { lastDoneBy: user.name, lastDoneAt: new Date() }
  });

  // Dem User die Punkte gutschreiben
  await prisma.user.update({
    where: { id: user.id },
    data: { chorePoints: user.chorePoints + points }
  });

  revalidatePath("/chores");
}

// --- MEAL PREP PLANER ---
export async function addMealPlan(dayOfWeek: number, mealType: string, recipe: string, ingredientsInput: string) {
  // Verwandelt einen Text wie "Tomaten, Nudeln, Pesto" in eine saubere Liste
  const ingredients = ingredientsInput
    .split(',')
    .map(i => i.trim())
    .filter(i => i.length > 0);

  await prisma.mealPlan.create({
    data: { dayOfWeek, mealType, recipe, ingredients }
  });
  revalidatePath("/mealprep");
}

export async function deleteMealPlan(id: string) {
  await prisma.mealPlan.delete({ where: { id } });
  revalidatePath("/mealprep");
}

export async function syncIngredientsToShoppingList(mealId: string) {
  const meal = await prisma.mealPlan.findUnique({ where: { id: mealId } });
  if (!meal || meal.ingredients.length === 0) return;

  // Schreibt jede Zutat automatisch auf die Einkaufsliste
  for (const ingredient of meal.ingredients) {
    await prisma.shoppingItem.create({
      data: { title: `${ingredient} (für ${meal.recipe})` }
    });
  }
  revalidatePath("/mealprep");
  revalidatePath("/shopping"); // Aktualisiert auch das Shopping-Dashboard
}

// --- DOKUMENTEN TRESOR (VAULT) ---
export async function addVaultItem(title: string, url: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Nicht autorisiert");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User nicht gefunden");

  await prisma.vaultItem.create({
    data: { title, url, addedBy: user.name }
  });
  revalidatePath("/vault");
}

export async function deleteVaultItem(id: string) {
  await prisma.vaultItem.delete({ where: { id } });
  revalidatePath("/vault");
}