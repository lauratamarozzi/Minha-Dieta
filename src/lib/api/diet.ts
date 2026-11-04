import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Meal, MealItem, Weekday } from "@/lib/types";

interface MealRow {
  id: string;
  weekday: number;
  name: string;
  time: string | null;
  order_index: number;
}

interface MealItemRow {
  id: string;
  meal_id: string;
  description: string;
  quantity: string | null;
  notes: string | null;
  order_index: number;
}

/** Busca todas as refeições da semana inteira, com seus itens, já organizadas. */
export async function getWeekDiet(): Promise<Meal[]> {
  const supabase = getSupabaseServerClient();

  const { data: meals, error: mealsError } = await supabase
    .from("meals")
    .select("id, weekday, name, time, order_index")
    .order("weekday", { ascending: true })
    .order("order_index", { ascending: true });

  if (mealsError) throw mealsError;

  const mealRows = (meals ?? []) as MealRow[];
  if (mealRows.length === 0) return [];

  const mealIds = mealRows.map((m) => m.id);

  const { data: items, error: itemsError } = await supabase
    .from("meal_items")
    .select("id, meal_id, description, quantity, notes, order_index")
    .in("meal_id", mealIds)
    .order("order_index", { ascending: true });

  if (itemsError) throw itemsError;

  const itemRows = (items ?? []) as MealItemRow[];
  const itemsByMeal = new Map<string, MealItem[]>();
  for (const item of itemRows) {
    const list = itemsByMeal.get(item.meal_id) ?? [];
    list.push(item);
    itemsByMeal.set(item.meal_id, list);
  }

  return mealRows.map((m) => ({
    id: m.id,
    weekday: m.weekday as Weekday,
    name: m.name,
    time: m.time,
    order_index: m.order_index,
    items: itemsByMeal.get(m.id) ?? [],
  }));
}

export async function getMealsForWeekday(weekday: Weekday): Promise<Meal[]> {
  const all = await getWeekDiet();
  return all.filter((m) => m.weekday === weekday);
}

export async function createMeal(input: {
  weekday: Weekday;
  name: string;
  time?: string | null;
  order_index?: number;
}): Promise<Meal> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("meals")
    .insert({
      weekday: input.weekday,
      name: input.name,
      time: input.time ?? null,
      order_index: input.order_index ?? 0,
    })
    .select("id, weekday, name, time, order_index")
    .single();

  if (error) throw error;
  const row = data as MealRow;
  return { ...row, weekday: row.weekday as Weekday, items: [] };
}

export async function updateMeal(
  id: string,
  patch: Partial<{ name: string; time: string | null; order_index: number; weekday: Weekday }>
): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("meals").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteMeal(id: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("meals").delete().eq("id", id);
  if (error) throw error;
}

export async function addMealItem(input: {
  meal_id: string;
  description: string;
  quantity?: string | null;
  notes?: string | null;
  order_index?: number;
}): Promise<MealItem> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("meal_items")
    .insert({
      meal_id: input.meal_id,
      description: input.description,
      quantity: input.quantity ?? null,
      notes: input.notes ?? null,
      order_index: input.order_index ?? 0,
    })
    .select("id, meal_id, description, quantity, notes, order_index")
    .single();

  if (error) throw error;
  return data as MealItem;
}

export async function updateMealItem(
  id: string,
  patch: Partial<{
    description: string;
    quantity: string | null;
    notes: string | null;
    order_index: number;
  }>
): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("meal_items").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteMealItem(id: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("meal_items").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Substitui completamente a dieta de um dia da semana por uma nova lista de
 * refeições (cada uma com seus itens). Pensado para edição em lote tanto
 * pela UI quanto pela integração com IA (Claude/Gemini).
 */
export async function replaceWeekdayDiet(
  weekday: Weekday,
  meals: Array<{
    name: string;
    time?: string | null;
    items: Array<{ description: string; quantity?: string | null; notes?: string | null }>;
  }>
): Promise<Meal[]> {
  const supabase = getSupabaseServerClient();

  // Apaga refeições existentes do dia (cascade remove os itens)
  const { error: deleteError } = await supabase
    .from("meals")
    .delete()
    .eq("weekday", weekday);
  if (deleteError) throw deleteError;

  const createdMeals: Meal[] = [];

  for (let i = 0; i < meals.length; i++) {
    const m = meals[i];
    const { data: mealData, error: mealError } = await supabase
      .from("meals")
      .insert({ weekday, name: m.name, time: m.time ?? null, order_index: i })
      .select("id, weekday, name, time, order_index")
      .single();
    if (mealError) throw mealError;
    const mealRow = mealData as MealRow;

    let items: MealItem[] = [];
    if (m.items.length > 0) {
      const { data: itemsData, error: itemsError } = await supabase
        .from("meal_items")
        .insert(
          m.items.map((it, idx) => ({
            meal_id: mealRow.id,
            description: it.description,
            quantity: it.quantity ?? null,
            notes: it.notes ?? null,
            order_index: idx,
          }))
        )
        .select("id, meal_id, description, quantity, notes, order_index");
      if (itemsError) throw itemsError;
      items = (itemsData ?? []) as MealItem[];
    }

    createdMeals.push({ ...mealRow, weekday: mealRow.weekday as Weekday, items });
  }

  return createdMeals;
}
