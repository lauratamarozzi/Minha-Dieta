"use server";

import { revalidatePath } from "next/cache";
import * as diet from "@/lib/api/diet";
import type { Weekday } from "@/lib/types";

export async function createMealAction(weekday: Weekday, name: string, time: string | null) {
  await diet.createMeal({ weekday, name, time });
  revalidatePath("/");
}

export async function updateMealAction(
  id: string,
  patch: { name?: string; time?: string | null }
) {
  await diet.updateMeal(id, patch);
  revalidatePath("/");
}

export async function deleteMealAction(id: string) {
  await diet.deleteMeal(id);
  revalidatePath("/");
}

export async function addMealItemAction(
  mealId: string,
  description: string,
  quantity: string | null
) {
  await diet.addMealItem({ meal_id: mealId, description, quantity });
  revalidatePath("/");
}

export async function updateMealItemAction(
  id: string,
  patch: { description?: string; quantity?: string | null; notes?: string | null }
) {
  await diet.updateMealItem(id, patch);
  revalidatePath("/");
}

export async function deleteMealItemAction(id: string) {
  await diet.deleteMealItem(id);
  revalidatePath("/");
}
