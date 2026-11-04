import { NextRequest, NextResponse } from "next/server";
import { requireAiAuth } from "@/lib/ai-guard";
import {
  getShoppingList,
  addShoppingItem,
  updateShoppingItem,
  deleteShoppingItem,
  clearCheckedItems,
  generateShoppingListFromDiet,
} from "@/lib/api/shopping";

/**
 * GET /api/ai/shopping
 * Retorna a lista de compras atual.
 */
export async function GET(request: NextRequest) {
  const unauthorized = requireAiAuth(request);
  if (unauthorized) return unauthorized;

  const shopping = await getShoppingList();
  return NextResponse.json({ shopping });
}

/**
 * POST /api/ai/shopping
 * Body: { "action": "add", "name": "Arroz integral", "quantity": "1kg", "category": "Grãos e Cereais" }
 *       { "action": "update", "id": "...", "patch": { "checked": true } }
 *       { "action": "delete", "id": "..." }
 *       { "action": "generate" }           -> gera a lista a partir da dieta da semana
 *       { "action": "clear_checked" }      -> remove os itens já marcados como comprados
 */
export async function POST(request: NextRequest) {
  const unauthorized = requireAiAuth(request);
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  if (!body || typeof body.action !== "string") {
    return NextResponse.json({ error: "Envie { action, ... }." }, { status: 400 });
  }

  try {
    switch (body.action) {
      case "add": {
        if (typeof body.name !== "string") {
          return NextResponse.json({ error: "Falta 'name'." }, { status: 400 });
        }
        const item = await addShoppingItem({
          name: body.name,
          quantity: body.quantity ?? null,
          category: body.category ?? "Outros",
        });
        return NextResponse.json({ ok: true, item });
      }
      case "update": {
        if (typeof body.id !== "string") {
          return NextResponse.json({ error: "Falta 'id'." }, { status: 400 });
        }
        await updateShoppingItem(body.id, body.patch ?? {});
        return NextResponse.json({ ok: true });
      }
      case "delete": {
        if (typeof body.id !== "string") {
          return NextResponse.json({ error: "Falta 'id'." }, { status: 400 });
        }
        await deleteShoppingItem(body.id);
        return NextResponse.json({ ok: true });
      }
      case "generate": {
        const shopping = await generateShoppingListFromDiet();
        return NextResponse.json({ ok: true, shopping });
      }
      case "clear_checked": {
        await clearCheckedItems();
        return NextResponse.json({ ok: true });
      }
      default:
        return NextResponse.json(
          { error: "action deve ser add, update, delete, generate ou clear_checked." },
          { status: 400 }
        );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao editar a lista de compras.", detail: String(err) },
      { status: 500 }
    );
  }
}
