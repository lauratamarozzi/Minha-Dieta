import { NextRequest, NextResponse } from "next/server";
import { requireAiAuth } from "@/lib/ai-guard";
import { getWeekDiet, replaceWeekdayDiet } from "@/lib/api/diet";
import type { Weekday } from "@/lib/types";

/**
 * GET /api/ai/diet
 * Retorna a dieta da semana inteira (todas as refeições + itens).
 */
export async function GET(request: NextRequest) {
  const unauthorized = requireAiAuth(request);
  if (unauthorized) return unauthorized;

  const diet = await getWeekDiet();
  return NextResponse.json({ diet });
}

type MealInput = {
  name: string;
  time?: string | null;
  items: Array<{ description: string; quantity?: string | null; notes?: string | null }>;
};

/**
 * PUT /api/ai/diet
 * Substitui a dieta de um ou mais dias da semana.
 *
 * Body (um dia):
 *   { "weekday": 3, "meals": [ { "name": "Café da manhã", "time": "07:30",
 *       "items": [ { "description": "Ovos mexidos", "quantity": "3 unidades" } ] } ] }
 *
 * Body (semana inteira de uma vez):
 *   { "week": { "0": [...meals], "1": [...meals], ..., "6": [...meals] } }
 *
 * weekday segue o padrão: 0 = domingo, 1 = segunda, ..., 6 = sábado.
 */
export async function PUT(request: NextRequest) {
  const unauthorized = requireAiAuth(request);
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  try {
    if (body.week && typeof body.week === "object") {
      const week = body.week as Record<string, MealInput[]>;
      const results: Record<string, unknown> = {};
      for (const key of Object.keys(week)) {
        const weekday = Number(key) as Weekday;
        if (weekday < 0 || weekday > 6) {
          return NextResponse.json(
            { error: `weekday inválido: ${key}. Use 0 (domingo) a 6 (sábado).` },
            { status: 400 }
          );
        }
        results[key] = await replaceWeekdayDiet(weekday, week[key]);
      }
      return NextResponse.json({ ok: true, week: results });
    }

    if (typeof body.weekday === "number" && Array.isArray(body.meals)) {
      const weekday = body.weekday as Weekday;
      if (weekday < 0 || weekday > 6) {
        return NextResponse.json(
          { error: "weekday inválido. Use 0 (domingo) a 6 (sábado)." },
          { status: 400 }
        );
      }
      const meals = await replaceWeekdayDiet(weekday, body.meals as MealInput[]);
      return NextResponse.json({ ok: true, meals });
    }

    return NextResponse.json(
      {
        error:
          "Body inválido. Envie { weekday, meals } para um dia, ou { week: { '0': [...], ... } } para a semana inteira.",
      },
      { status: 400 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao salvar a dieta.", detail: String(err) },
      { status: 500 }
    );
  }
}
