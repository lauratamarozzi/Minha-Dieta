// Tipos compartilhados do app de Dieta & Rotina

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = domingo ... 6 = sábado

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  0: "Domingo",
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado",
};

export const WEEKDAY_SHORT: Record<Weekday, string> = {
  0: "Dom",
  1: "Seg",
  2: "Ter",
  3: "Qua",
  4: "Qui",
  5: "Sex",
  6: "Sáb",
};

export interface MealItem {
  id: string;
  meal_id: string;
  description: string;
  quantity: string | null;
  notes: string | null;
  order_index: number;
}

export interface Meal {
  id: string;
  weekday: Weekday;
  name: string;
  time: string | null;
  order_index: number;
  items: MealItem[];
}

export interface RoutineItem {
  id: string;
  is_daily: boolean;
  weekday: Weekday | null;
  time: string | null;
  title: string;
  description: string | null;
  order_index: number;
  completed_today?: boolean;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string | null;
  category: string;
  checked: boolean;
  is_auto_generated: boolean;
  order_index: number;
}

export const SHOPPING_CATEGORIES = [
  "Hortifruti",
  "Proteínas",
  "Laticínios",
  "Grãos e Cereais",
  "Padaria",
  "Congelados",
  "Mercearia",
  "Bebidas",
  "Outros",
] as const;
