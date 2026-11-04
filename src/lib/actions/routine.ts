"use server";

import { revalidatePath } from "next/cache";
import * as routine from "@/lib/api/routine";
import type { Weekday } from "@/lib/types";

export async function createRoutineItemAction(input: {
  is_daily: boolean;
  weekday?: Weekday | null;
  time?: string | null;
  title: string;
  description?: string | null;
}) {
  await routine.createRoutineItem(input);
  revalidatePath("/rotina");
}

export async function updateRoutineItemAction(
  id: string,
  patch: Partial<{
    is_daily: boolean;
    weekday: Weekday | null;
    time: string | null;
    title: string;
    description: string | null;
  }>
) {
  await routine.updateRoutineItem(id, patch);
  revalidatePath("/rotina");
}

export async function deleteRoutineItemAction(id: string) {
  await routine.deleteRoutineItem(id);
  revalidatePath("/rotina");
}

export async function toggleRoutineCompletionAction(
  id: string,
  dateISO: string,
  completed: boolean
) {
  await routine.setCompletion(id, dateISO, completed);
  revalidatePath("/rotina");
}

export async function getCompletedIdsForDateAction(dateISO: string) {
  return routine.getCompletedIdsForDate(dateISO);
}
