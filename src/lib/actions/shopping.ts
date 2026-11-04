"use server";

import { revalidatePath } from "next/cache";
import * as shopping from "@/lib/api/shopping";

export async function addShoppingItemAction(
  name: string,
  quantity: string | null,
  category: string
) {
  await shopping.addShoppingItem({ name, quantity, category });
  revalidatePath("/compras");
}

export async function updateShoppingItemAction(
  id: string,
  patch: Partial<{ name: string; quantity: string | null; category: string; checked: boolean }>
) {
  await shopping.updateShoppingItem(id, patch);
  revalidatePath("/compras");
}

export async function deleteShoppingItemAction(id: string) {
  await shopping.deleteShoppingItem(id);
  revalidatePath("/compras");
}

export async function clearCheckedItemsAction() {
  await shopping.clearCheckedItems();
  revalidatePath("/compras");
}

export async function generateShoppingListAction() {
  await shopping.generateShoppingListFromDiet();
  revalidatePath("/compras");
}
