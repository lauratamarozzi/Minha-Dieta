import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { RoutineItem, Weekday } from "@/lib/types";

interface RoutineItemRow {
  id: string;
  is_daily: boolean;
  weekday: number | null;
  time: string | null;
  title: string;
  description: string | null;
  order_index: number;
}

/** Retorna os itens de rotina válidos para uma data específica (YYYY-MM-DD) e
 * já marcados com `completed_today` consultando routine_completions. */
export async function getRoutineForDate(
  dateISO: string,
  weekday: Weekday
): Promise<RoutineItem[]> {
  const supabase = getSupabaseServerClient();

  const { data: items, error } = await supabase
    .from("routine_items")
    .select("id, is_daily, weekday, time, title, description, order_index")
    .or(`is_daily.eq.true,weekday.eq.${weekday}`)
    .order("order_index", { ascending: true });

  if (error) throw error;
  const rows = (items ?? []) as RoutineItemRow[];
  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  const { data: completions, error: compError } = await supabase
    .from("routine_completions")
    .select("routine_item_id, completed")
    .eq("date", dateISO)
    .in("routine_item_id", ids);

  if (compError) throw compError;
  const completedSet = new Set(
    (completions ?? [])
      .filter((c) => c.completed)
      .map((c) => c.routine_item_id as string)
  );

  return rows.map((r) => ({
    id: r.id,
    is_daily: r.is_daily,
    weekday: r.weekday as Weekday | null,
    time: r.time,
    title: r.title,
    description: r.description,
    order_index: r.order_index,
    completed_today: completedSet.has(r.id),
  }));
}

/** IDs dos itens de rotina já marcados como concluídos numa data específica. */
export async function getCompletedIdsForDate(dateISO: string): Promise<string[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("routine_completions")
    .select("routine_item_id")
    .eq("date", dateISO)
    .eq("completed", true);
  if (error) throw error;
  return (data ?? []).map((r) => r.routine_item_id as string);
}

export async function getAllRoutineItems(): Promise<RoutineItem[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("routine_items")
    .select("id, is_daily, weekday, time, title, description, order_index")
    .order("order_index", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as RoutineItemRow[]).map((r) => ({
    ...r,
    weekday: r.weekday as Weekday | null,
  }));
}

export async function createRoutineItem(input: {
  is_daily: boolean;
  weekday?: Weekday | null;
  time?: string | null;
  title: string;
  description?: string | null;
  order_index?: number;
}): Promise<RoutineItem> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("routine_items")
    .insert({
      is_daily: input.is_daily,
      weekday: input.is_daily ? null : input.weekday ?? null,
      time: input.time ?? null,
      title: input.title,
      description: input.description ?? null,
      order_index: input.order_index ?? 0,
    })
    .select("id, is_daily, weekday, time, title, description, order_index")
    .single();
  if (error) throw error;
  const row = data as RoutineItemRow;
  return { ...row, weekday: row.weekday as Weekday | null };
}

export async function updateRoutineItem(
  id: string,
  patch: Partial<{
    is_daily: boolean;
    weekday: Weekday | null;
    time: string | null;
    title: string;
    description: string | null;
    order_index: number;
  }>
): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("routine_items").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteRoutineItem(id: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("routine_items").delete().eq("id", id);
  if (error) throw error;
}

export async function setCompletion(
  routineItemId: string,
  dateISO: string,
  completed: boolean
): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("routine_completions")
    .upsert(
      { routine_item_id: routineItemId, date: dateISO, completed },
      { onConflict: "routine_item_id,date" }
    );
  if (error) throw error;
}

/** Substitui toda a rotina cadastrada por uma nova lista (uso pela IA). */
export async function replaceRoutine(
  items: Array<{
    is_daily: boolean;
    weekday?: Weekday | null;
    time?: string | null;
    title: string;
    description?: string | null;
  }>
): Promise<RoutineItem[]> {
  const supabase = getSupabaseServerClient();

  const { error: deleteError } = await supabase
    .from("routine_items")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // delete all
  if (deleteError) throw deleteError;

  if (items.length === 0) return [];

  const { data, error } = await supabase
    .from("routine_items")
    .insert(
      items.map((it, idx) => ({
        is_daily: it.is_daily,
        weekday: it.is_daily ? null : it.weekday ?? null,
        time: it.time ?? null,
        title: it.title,
        description: it.description ?? null,
        order_index: idx,
      }))
    )
    .select("id, is_daily, weekday, time, title, description, order_index");

  if (error) throw error;
  return ((data ?? []) as RoutineItemRow[]).map((r) => ({
    ...r,
    weekday: r.weekday as Weekday | null,
  }));
}
