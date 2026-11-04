"use client";

import { useState } from "react";
import { Field, Button } from "@/components/ui/Field";

interface MealFormProps {
  initialName?: string;
  initialTime?: string;
  onSave: (name: string, time: string | null) => void;
  onDelete?: () => void;
  saving?: boolean;
}

export default function MealForm({
  initialName = "",
  initialTime = "",
  onSave,
  onDelete,
  saving,
}: MealFormProps) {
  const [name, setName] = useState(initialName);
  const [time, setTime] = useState(initialTime);

  return (
    <div>
      <Field label="Nome da refeição" value={name} onChange={setName} placeholder="Ex: Café da manhã" autoFocus />
      <Field label="Horário (opcional)" value={time} onChange={setTime} placeholder="Ex: 07:30" type="time" />
      <div className="flex flex-col gap-2 mt-2">
        <Button
          disabled={!name.trim() || saving}
          onClick={() => onSave(name.trim(), time.trim() || null)}
        >
          {saving ? "Salvando..." : "Salvar"}
        </Button>
        {onDelete && (
          <Button variant="danger" onClick={onDelete} disabled={saving}>
            Excluir refeição
          </Button>
        )}
      </div>
    </div>
  );
}
