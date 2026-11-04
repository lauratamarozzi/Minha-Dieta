"use client";

import { useState } from "react";
import { Field, Button } from "@/components/ui/Field";
import type { Weekday } from "@/lib/types";
import { WEEKDAY_LABELS } from "@/lib/types";

interface RoutineFormProps {
  selectedWeekday: Weekday;
  initialTitle?: string;
  initialTime?: string;
  initialDescription?: string;
  initialIsDaily?: boolean;
  onSave: (input: {
    title: string;
    time: string | null;
    description: string | null;
    is_daily: boolean;
    weekday: Weekday | null;
  }) => void;
  onDelete?: () => void;
  saving?: boolean;
}

export default function RoutineForm({
  selectedWeekday,
  initialTitle = "",
  initialTime = "",
  initialDescription = "",
  initialIsDaily = true,
  onSave,
  onDelete,
  saving,
}: RoutineFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [time, setTime] = useState(initialTime);
  const [description, setDescription] = useState(initialDescription);
  const [isDaily, setIsDaily] = useState(initialIsDaily);

  return (
    <div>
      <Field label="Atividade" value={title} onChange={setTitle} placeholder="Ex: Treino" autoFocus />
      <Field label="Horário (opcional)" value={time} onChange={setTime} placeholder="Ex: 06:30" type="time" />
      <Field
        label="Descrição (opcional)"
        value={description}
        onChange={setDescription}
        placeholder="Ex: Academia - treino de pernas"
      />

      <div className="flex bg-surface-muted rounded-[var(--radius-sm)] p-1 mb-4">
        <button
          type="button"
          onClick={() => setIsDaily(true)}
          className={`flex-1 py-2 rounded-[calc(var(--radius-sm)-4px)] text-xs font-medium transition-colors ${
            isDaily ? "bg-accent text-[var(--accent-contrast)]" : "text-foreground-muted"
          }`}
        >
          Todo dia
        </button>
        <button
          type="button"
          onClick={() => setIsDaily(false)}
          className={`flex-1 py-2 rounded-[calc(var(--radius-sm)-4px)] text-xs font-medium transition-colors ${
            !isDaily ? "bg-accent text-[var(--accent-contrast)]" : "text-foreground-muted"
          }`}
        >
          Só {WEEKDAY_LABELS[selectedWeekday]}
        </button>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <Button
          disabled={!title.trim() || saving}
          onClick={() =>
            onSave({
              title: title.trim(),
              time: time.trim() || null,
              description: description.trim() || null,
              is_daily: isDaily,
              weekday: isDaily ? null : selectedWeekday,
            })
          }
        >
          {saving ? "Salvando..." : "Salvar"}
        </Button>
        {onDelete && (
          <Button variant="danger" onClick={onDelete} disabled={saving}>
            Excluir atividade
          </Button>
        )}
      </div>
    </div>
  );
}
