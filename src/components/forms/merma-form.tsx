"use client";

import { useActionState, useState } from "react";
import { createMermaAction, type MermaState } from "@/server/actions/mermas";

type LotOption = { id: number; code: string; productName: string; availableWeight: number };
type SupervisorOption = { id: number; name: string };

type MermaFormProps = {
  lots: LotOption[];
  supervisors: SupervisorOption[];
};

const REASON_LABELS: Record<string, string> = {
  DESHIDRATACION: "Deshidratación",
  DANO: "Daño",
  GOLPE: "Golpe",
  DESCOMPOSICION: "Descomposición",
  PRODUCTO_RECHAZADO: "Producto rechazado",
  DERRAME: "Derrame",
  DIFERENCIA_DE_PESO: "Diferencia de peso",
  ERROR_DE_CAPTURA: "Error de captura",
  OTRO: "Otro",
};

const initialState: MermaState = null;
const selectClass =
  "rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900";

export function MermaForm({ lots, supervisors }: MermaFormProps) {
  const [state, formAction, pending] = useActionState<MermaState, FormData>(createMermaAction, initialState);
  const [formKey, setFormKey] = useState(0);
  const [lotId, setLotId] = useState<number | "">("");
  const [weightAfter, setWeightAfter] = useState<number | "">("");

  const selectedLot = lots.find((l) => l.id === lotId);
  const difference = selectedLot && weightAfter !== "" ? selectedLot.availableWeight - Number(weightAfter) : null;
  const percentage = selectedLot && difference !== null && selectedLot.availableWeight > 0
    ? (difference / selectedLot.availableWeight) * 100
    : null;

  function handleRegisterAnother() {
    setFormKey((k) => k + 1);
    setLotId("");
    setWeightAfter("");
  }

  if (state?.ok) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-amber-300 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950">
        <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-300">Merma registrada</h2>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <dt className="text-zinc-500">Folio</dt>
          <dd className="font-medium">{state.folio}</dd>
          <dt className="text-zinc-500">Lote</dt>
          <dd className="font-medium">{state.lotCode}</dd>
          <dt className="text-zinc-500">Diferencia</dt>
          <dd className="font-medium">{state.difference.toFixed(2)} kg ({state.percentage.toFixed(1)}%)</dd>
        </dl>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleRegisterAnother}
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            Registrar otra merma
          </button>
          <a
            href={`/lotes/${state.lotId}`}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Ver lote
          </a>
        </div>
      </div>
    );
  }

  return (
    <form key={formKey} action={formAction} className="flex max-w-xl flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Lote</label>
        <select
          name="lotId"
          required
          value={lotId}
          onChange={(e) => setLotId(e.target.value ? Number(e.target.value) : "")}
          className={selectClass}
        >
          <option value="" disabled>
            Selecciona...
          </option>
          {lots.map((l) => (
            <option key={l.id} value={l.id}>
              {l.code} — {l.productName} · {l.availableWeight.toFixed(2)} kg disponibles
            </option>
          ))}
        </select>
      </div>

      {selectedLot ? (
        <p className="text-sm text-zinc-500">Peso disponible actual: {selectedLot.availableWeight.toFixed(2)} kg</p>
      ) : null}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Peso nuevo (kg)</label>
        <input
          type="number"
          name="weightAfter"
          min={0}
          step="0.01"
          required
          value={weightAfter}
          onChange={(e) => setWeightAfter(e.target.value ? Number(e.target.value) : "")}
          className={selectClass}
        />
      </div>

      {difference !== null && percentage !== null ? (
        <p className="text-sm text-zinc-500">
          Diferencia: <strong>{difference.toFixed(2)} kg</strong> ({percentage.toFixed(1)}%)
        </p>
      ) : null}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Motivo</label>
        <select name="reason" required defaultValue="" className={selectClass}>
          <option value="" disabled>
            Selecciona...
          </option>
          {Object.entries(REASON_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Supervisor autorizador</label>
        <select name="supervisorId" defaultValue="" className={selectClass}>
          <option value="">Sin especificar</option>
          {supervisors.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Observaciones</label>
        <textarea name="notes" rows={2} className={selectClass} />
      </div>

      {state && !state.ok ? (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || !lotId || weightAfter === ""}
        className="w-fit rounded-md bg-amber-700 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-800 disabled:opacity-50"
      >
        {pending ? "Registrando..." : "Confirmar merma"}
      </button>
    </form>
  );
}
