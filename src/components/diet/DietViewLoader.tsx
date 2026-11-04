"use client";

import dynamic from "next/dynamic";
import type { Meal } from "@/lib/types";

// Carregado sem SSR de propósito: a tela precisa saber o dia da semana
// ATUAL no fuso horário do dispositivo da pessoa, não do servidor.
const DietView = dynamic(() => import("./DietView"), { ssr: false });

export default function DietViewLoader({ initialMeals }: { initialMeals: Meal[] }) {
  return <DietView initialMeals={initialMeals} />;
}
