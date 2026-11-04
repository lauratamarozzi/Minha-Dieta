"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Clock, UtensilsCrossed } from "lucide-react";
import clsx from "clsx";
import type { Meal, MealItem, Weekday } from "@/lib/types";
import { WEEKDAY_LABELS, WEEKDAY_SHORT } from "@/lib/types";
import Sheet from "@/components/ui/Sheet";
import MealForm from "./MealForm";
import ItemForm from "./ItemForm";
import {
  createMealAction,
  updateMealAction,
  deleteMealAction,
  addMealItemAction,
  updateMealItemAction,
  deleteMealItemAction,
} from "@/lib/actions/diet";

const WEEKDAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];

type SheetState =
  | { kind: "new-meal" }
  | { kind: "edit-meal"; meal: Meal }
  | { kind: "new-item"; mealId: string }
  | { kind: "edit-item"; mealId: string; item: MealItem }
  | null;

export default function DietView({ initialMeals }: { initialMeals: Meal[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const todayWeekday = new Date().getDay() as Weekday;
  const [selectedWeekday, setSelectedWeekday] = useState<Weekday>(todayWeekday);
  const [sheet, setSheet] = useState<SheetState>(null);

  const mealsForDay = useMemo(
    () =>
      initialMeals
        .filter((m) => m.weekday === selectedWeekday)
        .sort((a, b) => a.order_index - b.order_index),
    [initialMeals, selectedWeekday]
  );

  function refresh() {
    router.refresh();
  }

  function closeSheet() {
    setSheet(null);
  }

  return (
    <div className="flex-1 flex flex-col pb-4">
      <header className="px-5 pt-6 pb-4">
        <p className="text-xs font-medium text-foreground-muted uppercase tracking-wide mb-0.5">
          Minha Dieta
        </p>
        <h1 className="text-2xl font-semibold text-foreground">
          {selectedWeekday === todayWeekday ? "Hoje" : WEEKDAY_LABELS[selectedWeekday]}
        </h1>
      </header>

      {/* Seletor de dias */}
      <div className="flex gap-2 px-5 pb-5 overflow-x-auto no-scrollbar">
        {WEEKDAYS.map((wd) => {
          const isToday = wd === todayWeekday;
          const isSelected = wd === selectedWeekday;
          return (
            <button
              key={wd}
              onClick={() => setSelectedWeekday(wd)}
              className={clsx(
                "flex flex-col items-center justify-center gap-1 min-w-[52px] h-16 rounded-[var(--radius-md)] border transition-colors shrink-0",
                isSelected
                  ? "bg-accent text-[var(--accent-contrast)] border-accent"
                  : "bg-surface border-border text-foreground-muted"
              )}
            >
              <span className="text-[10px] font-medium uppercase">
                {WEEKDAY_SHORT[wd]}
              </span>
              {isToday && (
                <span
                  className={clsx(
                    "w-1.5 h-1.5 rounded-full",
                    isSelected ? "bg-[var(--accent-contrast)]" : "bg-coral"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Lista de refeições do dia selecionado */}
      <div className="flex-1 px-5 flex flex-col gap-4">
        {mealsForDay.length === 0 && (
          <div className="bg-surface border border-dashed border-border rounded-[var(--radius-lg)] p-8 flex flex-col items-center text-center gap-2">
            <UtensilsCrossed size={28} className="text-foreground-muted" />
            <p className="text-sm text-foreground-muted">
              Nenhuma refeição cadastrada para {WEEKDAY_LABELS[selectedWeekday].toLowerCase()} ainda.
            </p>
          </div>
        )}

        {mealsForDay.map((meal) => (
          <div
            key={meal.id}
            className="bg-surface border border-border rounded-[var(--radius-lg)] overflow-hidden shadow-sm"
          >
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div>
                <h3 className="font-semibold text-foreground text-[15px]">{meal.name}</h3>
                {meal.time && (
                  <span className="inline-flex items-center gap-1 text-xs text-foreground-muted mt-0.5">
                    <Clock size={12} /> {meal.time}
                  </span>
                )}
              </div>
              <button
                onClick={() => setSheet({ kind: "edit-meal", meal })}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-muted text-foreground-muted"
              >
                <Pencil size={14} />
              </button>
            </div>

            <div className="px-4 pb-2">
              {meal.items.length === 0 && (
                <p className="text-xs text-foreground-muted py-2">Sem itens ainda.</p>
              )}
              {meal.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSheet({ kind: "edit-item", mealId: meal.id, item })}
                  className="w-full flex items-center justify-between py-2 border-t border-border/70 text-left first:border-t-0"
                >
                  <span className="text-sm text-foreground">{item.description}</span>
                  {item.quantity && (
                    <span className="text-xs text-foreground-muted bg-surface-muted px-2 py-0.5 rounded-full shrink-0 ml-2">
                      {item.quantity}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setSheet({ kind: "new-item", mealId: meal.id })}
              className="w-full flex items-center justify-center gap-1.5 py-3 border-t border-border text-accent text-sm font-medium bg-accent-soft/40"
            >
              <Plus size={15} /> Adicionar item
            </button>
          </div>
        ))}

        <button
          onClick={() => setSheet({ kind: "new-meal" })}
          className="flex items-center justify-center gap-1.5 py-3.5 rounded-[var(--radius-md)] border border-dashed border-border text-foreground-muted text-sm font-medium"
        >
          <Plus size={16} /> Nova refeição
        </button>
      </div>

      {/* Sheets de edição */}
      <Sheet open={sheet?.kind === "new-meal"} onClose={closeSheet} title="Nova refeição">
        <MealForm
          saving={isPending}
          onSave={(name, time) =>
            startTransition(async () => {
              await createMealAction(selectedWeekday, name, time);
              refresh();
              closeSheet();
            })
          }
        />
      </Sheet>

      <Sheet
        open={sheet?.kind === "edit-meal"}
        onClose={closeSheet}
        title="Editar refeição"
      >
        {sheet?.kind === "edit-meal" && (
          <MealForm
            initialName={sheet.meal.name}
            initialTime={sheet.meal.time ?? ""}
            saving={isPending}
            onSave={(name, time) =>
              startTransition(async () => {
                await updateMealAction(sheet.meal.id, { name, time });
                refresh();
                closeSheet();
              })
            }
            onDelete={() =>
              startTransition(async () => {
                await deleteMealAction(sheet.meal.id);
                refresh();
                closeSheet();
              })
            }
          />
        )}
      </Sheet>

      <Sheet open={sheet?.kind === "new-item"} onClose={closeSheet} title="Adicionar item">
        {sheet?.kind === "new-item" && (
          <ItemForm
            saving={isPending}
            onSave={(description, quantity) =>
              startTransition(async () => {
                await addMealItemAction(sheet.mealId, description, quantity);
                refresh();
                closeSheet();
              })
            }
          />
        )}
      </Sheet>

      <Sheet open={sheet?.kind === "edit-item"} onClose={closeSheet} title="Editar item">
        {sheet?.kind === "edit-item" && (
          <ItemForm
            initialDescription={sheet.item.description}
            initialQuantity={sheet.item.quantity ?? ""}
            saving={isPending}
            onSave={(description, quantity) =>
              startTransition(async () => {
                await updateMealItemAction(sheet.item.id, { description, quantity });
                refresh();
                closeSheet();
              })
            }
            onDelete={() =>
              startTransition(async () => {
                await deleteMealItemAction(sheet.item.id);
                refresh();
                closeSheet();
              })
            }
          />
        )}
      </Sheet>
    </div>
  );
}
