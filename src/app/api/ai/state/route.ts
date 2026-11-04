import { NextRequest, NextResponse } from "next/server";
import { requireAiAuth } from "@/lib/ai-guard";
import { getWeekDiet } from "@/lib/api/diet";
import { getAllRoutineItems } from "@/lib/api/routine";
import { getShoppingList } from "@/lib/api/shopping";

/**
 * GET /api/ai/state
 * Retorna um snapshot completo: dieta da semana, rotina e lista de compras.
 * Pensado para dar contexto completo a um agente (Claude/Gemini) antes de
 * fazer uma edição, sem precisar de várias chamadas.
 */
export async function GET(request: NextRequest) {
  const unauthorized = requireAiAuth(request);
  if (unauthorized) return unauthorized;

  const [diet, routine, shopping] = await Promise.all([
    getWeekDiet(),
    getAllRoutineItems(),
    getShoppingList(),
  ]);

  return NextResponse.json({ diet, routine, shopping });
}
