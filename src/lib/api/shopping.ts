import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getWeekDiet } from "@/lib/api/diet";
import type { ShoppingItem } from "@/lib/types";

export async function getShoppingList(): Promise<ShoppingItem[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("shopping_items")
    .select("id, name, quantity, category, checked, is_auto_generated, order_index")
    .order("category", { ascending: true })
    .order("order_index", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ShoppingItem[];
}

export async function addShoppingItem(input: {
  name: string;
  quantity?: string | null;
  category?: string;
  order_index?: number;
}): Promise<ShoppingItem> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("shopping_items")
    .insert({
      name: input.name,
      quantity: input.quantity ?? null,
      category: input.category ?? "Outros",
      is_auto_generated: false,
      checked: false,
      order_index: input.order_index ?? 0,
    })
    .select("id, name, quantity, category, checked, is_auto_generated, order_index")
    .single();
  if (error) throw error;
  return data as ShoppingItem;
}

export async function updateShoppingItem(
  id: string,
  patch: Partial<{
    name: string;
    quantity: string | null;
    category: string;
    checked: boolean;
    order_index: number;
  }>
): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("shopping_items").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteShoppingItem(id: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("shopping_items").delete().eq("id", id);
  if (error) throw error;
}

export async function clearCheckedItems(): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("shopping_items").delete().eq("checked", true);
  if (error) throw error;
}

/**
 * Gera (ou atualiza) a lista de compras a partir de todos os ingredientes da
 * dieta da semana inteira. Agrupa itens com a mesma descrição (normalizada),
 * somando as quantidades informadas em cada refeição.
 *
 * Preserva:
 *  - itens marcados como comprados (checked = true), mesmo que fossem auto-gerados;
 *  - itens adicionados manualmente (is_auto_generated = false).
 * Substitui:
 *  - itens auto-gerados ainda não marcados, pela nova lista calculada.
 */
export async function generateShoppingListFromDiet(): Promise<ShoppingItem[]> {
  const supabase = getSupabaseServerClient();
  const diet = await getWeekDiet();

  const aggregated = new Map<string, { name: string; quantities: string[] }>();

  for (const meal of diet) {
    for (const item of meal.items) {
      const key = item.description.trim().toLowerCase();
      if (!aggregated.has(key)) {
        aggregated.set(key, { name: item.description.trim(), quantities: [] });
      }
      if (item.quantity) {
        aggregated.get(key)!.quantities.push(item.quantity.trim());
      }
    }
  }

  // Remove os itens auto-gerados ainda não comprados (serão recalculados)
  const { error: deleteError } = await supabase
    .from("shopping_items")
    .delete()
    .eq("is_auto_generated", true)
    .eq("checked", false);
  if (deleteError) throw deleteError;

  const toInsert = Array.from(aggregated.values()).map((entry, idx) => ({
    name: entry.name,
    quantity: entry.quantities.length > 0 ? entry.quantities.join(" + ") : null,
    category: "Outros",
    checked: false,
    is_auto_generated: true,
    order_index: idx,
  }));

  if (toInsert.length > 0) {
    const { error: insertError } = await supabase.from("shopping_items").insert(toInsert);
    if (insertError) throw insertError;
  }

  return getShoppingList();
}
