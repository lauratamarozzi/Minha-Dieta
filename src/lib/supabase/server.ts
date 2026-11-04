import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Cliente Supabase para uso EXCLUSIVO no servidor (API routes, Server Actions,
// Server Components). Usa a service_role key, que ignora RLS — por isso
// NUNCA deve ser importado em componentes de cliente ("use client") nem
// exposto ao navegador.
//
// As variáveis de ambiente necessárias (ver .env.example):
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//
// Não geramos tipos a partir do schema (projeto pequeno, uso pessoal), então
// tipamos o client com genéricos "any" propositalmente — cada função em
// src/lib/api/*.ts já declara os tipos de entrada/saída que importam.
/* eslint-disable @typescript-eslint/no-explicit-any */

let cachedClient: SupabaseClient<any, any, any> | null = null;

export function getSupabaseServerClient(): SupabaseClient<any, any, any> {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar configuradas (.env.local ou nas variáveis de ambiente do deploy)."
    );
  }

  cachedClient = createClient<any, any, any>(url, serviceRoleKey, {
    auth: { persistSession: false },
  });

  return cachedClient;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
