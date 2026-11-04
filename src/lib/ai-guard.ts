import { NextRequest, NextResponse } from "next/server";
import { isValidAiToken } from "@/lib/auth";

/**
 * Verifica o header Authorization: Bearer <AI_API_TOKEN> nas rotas /api/ai/*.
 * Retorna uma NextResponse de erro se inválido, ou null se autorizado.
 */
export function requireAiAuth(request: NextRequest): NextResponse | null {
  const header = request.headers.get("authorization");
  if (!isValidAiToken(header)) {
    return NextResponse.json(
      { error: "Não autorizado. Envie 'Authorization: Bearer <AI_API_TOKEN>'." },
      { status: 401 }
    );
  }
  return null;
}
