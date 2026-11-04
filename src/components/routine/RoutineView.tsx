"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Plus, Pencil, Clock, Repeat, CheckCircle2, Circle } from "lucide-react";
import clsx from "clsx";
import type { RoutineItem, Weekday } from "@/lib/types";
import { WEEKDAY_LABELS, WEEKDAY_SHORT } from "@/lib/types";
import Sheet from "@/components/ui/Sheet";
import RoutineForm from "./RoutineForm";
import {
  createRoutineItemAction,
  updateRoutineItemAction,
  deleteRoutineItemAction,
  toggleRoutineCompletionAction,
  getCompletedIdsForDateAction,
} from "@/lib/actions/routine";

const WEEKDAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];

type SheetState = { kind: "new" } | { kind: "edit"; item: RoutineItem } | null;

export default function RoutineView({ initialItems }: { initialItems: RoutineItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const todayWeekday = new Date().getDay() as Weekday;
  const todayISO = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const [selectedWeekday, setSelectedWeekday] = useState<Weekday>(todayWeekday);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    getCompletedIdsForDateAction(todayISO).then((ids) => setCompletedIds(new Set(ids)));
  }, [todayISO]);

  const itemsForDay = useMemo(
    () =>
      initialItems
        .filter((i) => i.is_daily || i.weekday === selectedWeekday)
        .sort((a, b) => a.order_index - b.order_index),
    [initialItems, selectedWeekday]
  );

  const isViewingToday = selectedWeekday === todayWeekday;

  function refresh() {
    router.refresh();
  }

  function closeSheet() {
    setSheet(null);
  }

  function toggleComplete(item: RoutineItem) {
    const nowCompleted = !completedIds.has(item.id);
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (nowCompleted) next.add(item.id);
      else next.delete(item.id);
      return next;
    });
    startTransition(async () => {
      await toggleRoutineCompletionAction(item.id, todayISO, nowCompleted);
    });
  }

  return (
    <div className="flex-1 flex flex-col pb-4">
      <header className="px-5 pt-6 pb-4">
        <p className="text-xs font-medium text-foreground-muted uppercase tracking-wide mb-0.5">
          Rotina
        </p>
        <h1 className="text-2xl font-semibold text-foreground">
          {isViewingToday ? "Hoje" : WEEKDAY_LABELS[selectedWeekday]}
        </h1>
      </header>

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
              <span className="text-[10px] font-medium uppercase">{WEEKDAY_SHORT[wd]}</span>
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

      <div className="flex-1 px-5 flex flex-col gap-2.5">
        {itemsForDay.length === 0 && (
          <div className="bg-surface border border-dashed border-border rounded-[var(--radius-lg)] p-8 flex flex-col items-center text-center gap-2">
            <Repeat size={26} className="text-foreground-muted" />
            <p className="text-sm text-foreground-muted">
              Nenhuma atividade cadastrada para {WEEKDAY_LABELS[selectedWeekday].toLowerCase()}.
            </p>
          </div>
        )}

        {itemsForDay.map((item) => {
          const done = completedIds.has(item.id);
          return (
            <div
              key={item.id}
              className="bg-surface border border-border rounded-[var(--radius-md)] px-4 py-3 flex items-center gap-3 shadow-sm"
            >
              {isViewingToday ? (
                <button onClick={() => toggleComplete(item)} className="shrink-0 text-accent">
                  {done ? <CheckCircle2 size={22} /> : <Circle size={22} className="text-border" />}
                </button>
              ) : (
                <div className="shrink-0 text-foreground-muted">
                  <Repeat size={18} />
                </div>
              )}

              <button
                onClick={() => setSheet({ kind: "edit", item })}
                className="flex-1 text-left min-w-0"
              >
                <p
                  className={clsx(
                    "text-sm font-medium truncate",
                    done && isViewingToday ? "text-foreground-muted line-through" : "text-foreground"
                  )}
                >
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {item.time && (
                    <span className="inline-flex items-center gap-1 text-xs text-foreground-muted">
                      <Clock size={11} /> {item.time}
                    </span>
                  )}
                  {item.description && (
                    <span className="text-xs text-foreground-muted truncate">{item.description}</span>
                  )}
                </div>
              </button>

              <button
                onClick={() => setSheet({ kind: "edit", item })}
                className="w-7 h-7 rounded-full flex items-center justify-center bg-surface-muted text-foreground-muted shrink-0"
              >
                <Pencil size={12} />
              </button>
            </div>
          );
        })}

        <button
          onClick={() => setSheet({ kind: "new" })}
          className="flex items-center justify-center gap-1.5 py-3.5 rounded-[var(--radius-md)] border border-dashed border-border text-foreground-muted text-sm font-medium mt-1"
        >
          <Plus size={16} /> Nova atividade
        </button>
      </div>

      <Sheet open={sheet?.kind === "new"} onClose={closeSheet} title="Nova atividade">
        <RoutineForm
          selectedWeekday={selectedWeekday}
          saving={isPending}
          onSave={(input) =>
            startTransition(async () => {
              await createRoutineItemAction(input);
              refresh();
              closeSheet();
            })
          }
        />
      </Sheet>

      <Sheet open={sheet?.kind === "edit"} onClose={closeSheet} title="Editar atividade">
        {sheet?.kind === "edit" && (
          <RoutineForm
            selectedWeekday={selectedWeekday}
            initialTitle={sheet.item.title}
            initialTime={sheet.item.time ?? ""}
            initialDescription={sheet.item.description ?? ""}
            initialIsDaily={sheet.item.is_daily}
            saving={isPending}
            onSave={(input) =>
              startTransition(async () => {
                await updateRoutineItemAction(sheet.item.id, input);
                refresh();
                closeSheet();
              })
            }
            onDelete={() =>
              startTransition(async () => {
                await deleteRoutineItemAction(sheet.item.id);
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
