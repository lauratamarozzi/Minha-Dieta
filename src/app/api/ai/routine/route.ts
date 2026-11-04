import { NextRequest, NextResponse } from "next/server";
import { requireAiAuth } from "@/lib/ai-guard";
import {
  getAllRoutineItems,
  replaceRoutine,
  createRoutineItem,
  updateRoutineItem,
  deleteRoutineItem,
} from "@/lib/api/routine";
import type { Weekday } from "@/lib/types";

/**
 * GET /api/ai/routine
 * Retorna todos os itens de rotina cadastrados.
 */
export async function GET(request: NextRequest) {
  const unauthorized = requireAiAuth(request);
  if (unauthorized) return unauthorized;

  const routine = await getAllRoutineItems();
  return NextResponse.json({ routine });
}

/**
 * PUT /api/ai/routine
 * Substitui TODA a rotina cadastrada por uma nova lista.
 * Body: { "items": [ { "is_daily": true, "time": "06:30", "title": "Treino",
 *                       "description": "Academia - treino de pernas" },
 *                     { "is_daily": false, "weekday": 1, "time": "19:00",
 *                       "title": "Reunião de orientação" } ] }
 */
export async function PUT(request: NextRequest) {
  const unauthorized = requireAiAuth(request);
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.items)) {
    return NextResponse.json({ error: "Envie { items: [...] }." }, { status: 400 });
  }

  try {
    const routine = await replaceRoutine(body.items);
    return NextResponse.json({ ok: true, routine });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao salvar a rotina.", detail: String(err) },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/ai/routine
 * Edições pontuais, sem substituir tudo.
 * Body: { "action": "add", "item": { ... } }
 *       { "action": "update", "id": "...", "patch": { ... } }
 *       { "action": "delete", "id": "..." }
 */
export async function PATCH(request: NextRequest) {
  const unauthorized = requireAiAuth(request);
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  if (!body || typeof body.action !== "string") {
    return NextResponse.json({ error: "Envie { action, ... }." }, { status: 400 });
  }

  try {
    if (body.action === "add") {
      const item = await createRoutineItem(body.item);
      return NextResponse.json({ ok: true, item });
    }
    if (body.action === "update") {
      if (typeof body.id !== "string") {
        return NextResponse.json({ error: "Falta 'id'." }, { status: 400 });
      }
      await updateRoutineItem(body.id, body.patch ?? {});
      return NextResponse.json({ ok: true });
    }
    if (body.action === "delete") {
      if (typeof body.id !== "string") {
        return NextResponse.json({ error: "Falta 'id'." }, { status: 400 });
      }
      await deleteRoutineItem(body.id);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "action deve ser add, update ou delete." }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao editar a rotina.", detail: String(err) },
      { status: 500 }
    );
  }
}

export type { Weekday };
