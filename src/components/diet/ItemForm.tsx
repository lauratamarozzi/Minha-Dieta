"use client";

import { useState } from "react";
import { Field, Button } from "@/components/ui/Field";

interface ItemFormProps {
  initialDescription?: string;
  initialQuantity?: string;
  onSave: (description: string, quantity: string | null) => void;
  onDelete?: () => void;
  saving?: boolean;
}

export default function ItemForm({
  initialDescription = "",
  initialQuantity = "",
  onSave,
  onDelete,
  saving,
}: ItemFormProps) {
  const [description, setDescription] = useState(initialDescription);
  const [quantity, setQuantity] = useState(initialQuantity);

  return (
    <div>
      <Field
        label="Alimento"
        value={description}
        onChange={setDescription}
        placeholder="Ex: Peito de frango grelhado"
        autoFocus
      />
      <Field label="Quantidade (opcional)" value={quantity} onChange={setQuantity} placeholder="Ex: 150g" />
      <div className="flex flex-col gap-2 mt-2">
        <Button
          disabled={!description.trim() || saving}
          onClick={() => onSave(description.trim(), quantity.trim() || null)}
        >
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
