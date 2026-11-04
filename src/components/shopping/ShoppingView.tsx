"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Sparkles, Trash2, ShoppingCart } from "lucide-react";
import clsx from "clsx";
import type { ShoppingItem } from "@/lib/types";
import Sheet from "@/components/ui/Sheet";
import ShoppingItemForm from "./ShoppingItemForm";
import {
  addShoppingItemAction,
  updateShoppingItemAction,
  deleteShoppingItemAction,
  clearCheckedItemsAction,
  generateShoppingListAction,
} from "@/lib/actions/shopping";

type SheetState = { kind: "new" } | { kind: "edit"; item: ShoppingItem } | null;

export default function ShoppingView({ initialItems }: { initialItems: ShoppingItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sheet, setSheet] = useState<SheetState>(null);
  const [checkedOverride, setCheckedOverride] = useState<Record<string, boolean>>({});

  const grouped = useMemo(() => {
    const groups = new Map<string, ShoppingItem[]>();
    for (const item of initialItems) {
      const list = groups.get(item.category) ?? [];
      list.push(item);
      groups.set(item.category, list);
    }
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0], "pt-BR"));
  }, [initialItems]);

  const total = initialItems.length;
  const checkedCount = initialItems.filter(
    (i) => checkedOverride[i.id] ?? i.checked
  ).length;

  function refresh() {
    router.refresh();
  }

  function closeSheet() {
    setSheet(null);
  }

  function toggleChecked(item: ShoppingItem) {
    const next = !(checkedOverride[item.id] ?? item.checked);
    setCheckedOverride((prev) => ({ ...prev, [item.id]: next }));
    startTransition(async () => {
      await updateShoppingItemAction(item.id, { checked: next });
      refresh();
    });
  }

  return (
    <div className="flex-1 flex flex-col pb-4">
      <header className="px-5 pt-6 pb-2 flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-foreground-muted uppercase tracking-wide mb-0.5">
            Lista de compras
          </p>
          <h1 className="text-2xl font-semibold text-foreground">
            {checkedCount}/{total} marcados
          </h1>
        </div>
      </header>

      <div className="px-5 pt-2 pb-4 flex gap-2">
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await generateShoppingListAction();
              refresh();
            })
          }
          className="flex-1 flex items-center justify-center gap-1.5 bg-accent-soft text-accent text-sm font-medium rounded-[var(--radius-md)] py-2.5"
        >
          <Sparkles size={15} /> Gerar da dieta
        </button>
        <button
          disabled={isPending || checkedCount === 0}
          onClick={() =>
            startTransition(async () => {
              await clearCheckedItemsAction();
              refresh();
            })
          }
          className="flex-1 flex items-center justify-center gap-1.5 bg-surface-muted text-foreground-muted text-sm font-medium rounded-[var(--radius-md)] py-2.5 disabled:opacity-50"
        >
          <Trash2 size={15} /> Limpar marcados
        </button>
      </div>

      <div className="flex-1 px-5 flex flex-col gap-5">
        {total === 0 && (
          <div className="bg-surface border border-dashed border-border rounded-[var(--radius-lg)] p-8 flex flex-col items-center text-center gap-2">
            <ShoppingCart size={28} className="text-foreground-muted" />
            <p className="text-sm text-foreground-muted">
              Sua lista está vazia. Toque em &quot;Gerar da dieta&quot; para montar a partir
              da sua semana, ou adicione itens manualmente.
            </p>
          </div>
        )}

        {grouped.map(([category, items]) => (
          <div key={category}>
            <h3 className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-2 px-1">
              {category}
            </h3>
            <div className="bg-surface border border-border rounded-[var(--radius-lg)] overflow-hidden shadow-sm divide-y divide-border/70">
              {items.map((item) => {
                const checked = checkedOverride[item.id] ?? item.checked;
                return (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                    <button
                      onClick={() => toggleChecked(item)}
                      className={clsx(
                        "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                        checked ? "bg-accent border-accent" : "border-border"
                      )}
                    >
                      {checked && (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M4 12.5l5 5L20 6"
                            stroke="var(--accent-contrast)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => setSheet({ kind: "edit", item })}
                      className="flex-1 flex items-center justify-between text-left min-w-0"
                    >
                      <span
                        className={clsx(
                          "text-sm truncate",
                          checked ? "text-foreground-muted line-through" : "text-foreground"
                        )}
                      >
                        {item.name}
                      </span>
                      {item.quantity && (
                        <span className="text-xs text-foreground-muted shrink-0 ml-2">
                          {item.quantity}
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <button
          onClick={() => setSheet({ kind: "new" })}
          className="flex items-center justify-center gap-1.5 py-3.5 rounded-[var(--radius-md)] border border-dashed border-border text-foreground-muted text-sm font-medium"
        >
          <Plus size={16} /> Adicionar item
        </button>
      </div>

      <Sheet open={sheet?.kind === "new"} onClose={closeSheet} title="Adicionar item">
        <ShoppingItemForm
          saving={isPending}
          onSave={(name, quantity, category) =>
            startTransition(async () => {
              await addShoppingItemAction(name, quantity, category);
              refresh();
              closeSheet();
            })
          }
        />
      </Sheet>

      <Sheet open={sheet?.kind === "edit"} onClose={closeSheet} title="Editar item">
        {sheet?.kind === "edit" && (
          <ShoppingItemForm
            initialName={sheet.item.name}
            initialQuantity={sheet.item.quantity ?? ""}
            initialCategory={sheet.item.category}
            saving={isPending}
            onSave={(name, quantity, category) =>
              startTransition(async () => {
                await updateShoppingItemAction(sheet.item.id, { name, quantity, category });
                refresh();
                closeSheet();
              })
            }
            onDelete={() =>
              startTransition(async () => {
                await deleteShoppingItemAction(sheet.item.id);
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
