"use client";

import { useActionState, useState } from "react";
import { createSalidaAction, type SalidaState } from "@/server/actions/salidas";
import { ScaleSimulator, type ScaleReading } from "@/components/scale-simulator";

type LotOption = {
  id: number;
  code: string;
  productName: string;
  sizeName: string;
  qualityName: string;
  availableWeight: number;
};
type CajaOption = { id: number; name: string; tareWeight: number };
type ScaleInfo = { id: number; name: string; minCapacity: number; maxCapacity: number; unit: string };

type SalidaFormProps = {
  lots: LotOption[];
  cajas: CajaOption[];
  scaleCajas: ScaleInfo;
  scaleMostrador: ScaleInfo;
};

const EXIT_TYPE_LABELS: Record<string, string> = {
  VENTA: "Venta",
  TRASLADO_INTERNO: "Traslado interno",
  EMBARQUE: "Embarque",
  DEVOLUCION: "Devolución",
  MERMA: "Merma",
  AJUSTE_AUTORIZADO: "Ajuste autorizado",
  MUESTRA: "Muestra",
  CONSUMO_INTERNO: "Consumo interno",
};

const initialState: SalidaState = null;

export function SalidaForm({ lots, cajas, scaleCajas, scaleMostrador }: SalidaFormProps) {
  const [state, formAction, pending] = useActionState<SalidaState, FormData>(createSalidaAction, initialState);
  const [formKey, setFormKey] = useState(0);
  const [mode, setMode] = useState<"CAJAS" | "MOSTRADOR">("CAJAS");
  const [lotId, setLotId] = useState<number | "">("");
  const [cajaTipoId, setCajaTipoId] = useState<number | "">("");
  const [boxCount, setBoxCount] = useState(0);
  const [tareManual, setTareManual] = useState(0);
  const [reading, setReading] = useState<ScaleReading | null>(null);

  const activeScale = mode === "CAJAS" ? scaleCajas : scaleMostrador;
  const tare = mode === "CAJAS" ? (cajas.find((c) => c.id === cajaTipoId)?.tareWeight ?? 0) * boxCount : tareManual;
  const netPreview = reading ? reading.weight - tare : null;
  const selectedLot = lots.find((l) => l.id === lotId);

  function handleModeChange(next: "CAJAS" | "MOSTRADOR") {
    setMode(next);
    setReading(null);
  }

  function handleRegisterAnother() {
    setFormKey((k) => k + 1);
    setLotId("");
    setCajaTipoId("");
    setBoxCount(0);
    setTareManual(0);
    setReading(null);
  }

  if (state?.ok) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-emerald-300 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-950">
        <h2 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300">Salida registrada</h2>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <dt className="text-latte-500">Folio</dt>
          <dd className="font-medium">{state.folio}</dd>
          <dt className="text-latte-500">Lote</dt>
          <dd className="font-medium">{state.lotCode}</dd>
          <dt className="text-latte-500">Peso neto retirado</dt>
          <dd className="font-medium">{state.netWeight.toFixed(2)} kg</dd>
          <dt className="text-latte-500">Nuevo estatus del lote</dt>
          <dd className="font-medium">{state.lotStatus}</dd>
        </dl>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleRegisterAnother}
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            Registrar otra salida
          </button>
          <a
            href={`/lotes/${state.lotId}`}
            className="rounded-md border border-latte-300 px-4 py-2 text-sm font-medium text-latte-700 hover:bg-latte-100 dark:border-latte-700 dark:text-latte-200 dark:hover:bg-latte-900"
          >
            Ver lote
          </a>
        </div>
      </div>
    );
  }

  return (
    <form key={formKey} action={formAction} className="flex max-w-3xl flex-col gap-5">
      <div className="flex gap-2">
        {(["CAJAS", "MOSTRADOR"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => handleModeChange(m)}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              mode === m
                ? "bg-emerald-700 text-white"
                : "border border-latte-300 text-latte-700 hover:bg-latte-100 dark:border-latte-700 dark:text-latte-200 dark:hover:bg-latte-900"
            }`}
          >
            {m === "CAJAS" ? "Salida por cajas" : "Salida de mostrador"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Lote">
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
                {l.code} — {l.productName} ({l.sizeName}/{l.qualityName}) · {l.availableWeight.toFixed(2)} kg disp.
              </option>
            ))}
          </select>
        </Field>

        <Field label="Tipo de salida">
          <select name="exitType" required defaultValue="VENTA" className={selectClass}>
            {Object.entries(EXIT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        {mode === "CAJAS" ? (
          <>
            <Field label="Tipo de caja">
              <select
                name="cajaTipoId"
                required
                value={cajaTipoId}
                onChange={(e) => setCajaTipoId(e.target.value ? Number(e.target.value) : "")}
                className={selectClass}
              >
                <option value="" disabled>
                  Selecciona...
                </option>
                {cajas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (tara {c.tareWeight} kg)
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Número de cajas">
              <input
                type="number"
                name="boxCount"
                min={1}
                value={boxCount}
                onChange={(e) => setBoxCount(Number(e.target.value) || 0)}
                className={selectClass}
              />
            </Field>
          </>
        ) : (
          <Field label="Tara de bolsa / recipiente (kg)">
            <input
              type="number"
              name="tareManual"
              min={0}
              step="0.001"
              value={tareManual}
              onChange={(e) => setTareManual(Number(e.target.value) || 0)}
              className={selectClass}
            />
          </Field>
        )}

        {mode === "MOSTRADOR" ? (
          <Field label="Cliente (opcional)">
            <input type="text" name="customer" className={selectClass} />
          </Field>
        ) : null}
      </div>

      <ScaleSimulator
        key={mode}
        scaleType={mode}
        minCapacity={activeScale.minCapacity}
        maxCapacity={activeScale.maxCapacity}
        unit={activeScale.unit}
        exampleWeight={mode === "CAJAS" ? 87.25 : 3.45}
        onCapture={setReading}
      />
      <input type="hidden" name="exitMode" value={mode} />
      <input type="hidden" name="scaleId" value={activeScale.id} />
      <input type="hidden" name="grossWeight" value={reading?.weight ?? ""} />
      <input type="hidden" name="pesoEstable" value={String(reading?.stable ?? false)} />
      <input type="hidden" name="basculaConectada" value={String(reading?.connected ?? false)} />

      {reading ? (
        <div className="rounded-md border border-latte-200 bg-latte-50 p-3 text-sm dark:border-latte-800 dark:bg-latte-950">
          <p>Peso capturado: <strong>{reading.weight} kg</strong></p>
          <p>Tara: {tare.toFixed(3)} kg</p>
          <p className="mt-1 font-semibold">
            Peso neto estimado: {netPreview !== null ? netPreview.toFixed(2) : "-"} kg
          </p>
          {selectedLot ? (
            <p className="mt-1 text-latte-500">Disponible en el lote: {selectedLot.availableWeight.toFixed(2)} kg</p>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-latte-500">Captura el peso con el simulador para continuar.</p>
      )}

      <Field label="Observaciones">
        <textarea name="notas" rows={2} className={selectClass} />
      </Field>
      <input type="hidden" name="reason" value="" />

      {state && !state.ok ? (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || !reading || !lotId}
        className="w-fit rounded-md bg-emerald-700 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
      >
        {pending ? "Registrando..." : "Confirmar salida"}
      </button>
    </form>
  );
}

const selectClass =
  "rounded-md border border-latte-300 px-3 py-2 text-sm outline-none focus:border-latte-500 dark:border-latte-700 dark:bg-latte-900";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-latte-700 dark:text-latte-300">{label}</label>
      {children}
    </div>
  );
}
