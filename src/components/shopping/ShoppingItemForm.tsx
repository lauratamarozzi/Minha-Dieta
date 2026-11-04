"use client";

import { useState } from "react";
import { Field, Button } from "@/components/ui/Field";
import { SHOPPING_CATEGORIES } from "@/lib/types";

interface ShoppingItemFormProps {
  initialName?: string;
  initialQuantity?: string;
  initialCategory?: string;
  onSave: (name: string, quantity: string | null, category: string) => void;
  onDelete?: () => void;
  saving?: boolean;
}

export default function ShoppingItemForm({
  initialName = "",
  initialQuantity = "",
  initialCategory = "Outros",
  onSave,
  onDelete,
  saving,
}: ShoppingItemFormProps) {
  const [name, setName] = useState(initialName);
  const [quantity, setQuantity] = useState(initialQuantity);
  const [category, setCategory] = useState(initialCategory);

  return (
    <div>
      <Field label="Item" value={name} onChange={setName} placeholder="Ex: Arroz integral" autoFocus />
      <Field label="Quantidade (opcional)" value={quantity} onChange={setQuantity} placeholder="Ex: 1kg" />

      <label className="block mb-4">
        <span className="block text-xs font-medium text-foreground-muted mb-1.5">Categoria</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-surface-muted border border-border rounded-[var(--radius-sm)] px-3.5 py-2.5 text-sm outline-none focus:border-accent transition-colors"
        >
          {SHOPPING_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-2 mt-2">
        <Button disabled={!name.trim() || saving} onClick={() => onSave(name.trim(), quantity.trim() || null, category)}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
        {onDelete && (
          <Button variant="danger" onClick={onDelete} disabled={saving}>
            Excluir item
          </Button>
        )}
      </div>
    </div>
  );
}
