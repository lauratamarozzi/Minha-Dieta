// Usamos a Web Crypto API (globalThis.crypto) em vez do módulo "crypto" do
// Node, porque este arquivo é importado pelo middleware, que roda em Edge
// Runtime — onde módulos nativos do Node não funcionam. Web Crypto está
// disponível tanto em Edge quanto em Node 18+.

export const SESSION_COOKIE_NAME = "dieta_app_session";

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Comparação em tempo constante o suficiente para um app de uso pessoal. */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function getAppSecret(): string {
  const secret = process.env.APP_SECRET;
  if (!secret) {
    throw new Error("Variável APP_SECRET não configurada.");
  }
  return secret;
}

export async function getExpectedSessionToken(): Promise<string> {
  const password = process.env.APP_PASSWORD;
  if (!password) {
    throw new Error("Variável APP_PASSWORD não configurada.");
  }
  return sha256Hex(password + getAppSecret());
}

export function checkPassword(candidate: string): boolean {
  const password = process.env.APP_PASSWORD;
  if (!password) return false;
  return constantTimeEqual(candidate, password);
}

export async function isValidSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  try {
    const expected = await getExpectedSessionToken();
    return constantTimeEqual(token, expected);
  } catch {
    return false;
  }
}

// ----------------------------------------------------------------------------
// Autenticação por token Bearer para os endpoints de integração com IA
// (/api/ai/*). Pensado para ser chamado por Claude, Gemini (Nini) ou
// qualquer outro agente autorizado, via header:
//   Authorization: Bearer <AI_API_TOKEN>
// ----------------------------------------------------------------------------

export function isValidAiToken(authorizationHeader: string | null): boolean {
  const expected = process.env.AI_API_TOKEN;
  if (!expected || !authorizationHeader) return false;

  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;
  const provided = match[1].trim();

  return constantTimeEqual(provided, expected);
}
