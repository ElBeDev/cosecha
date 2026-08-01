"use client";

import { useActionState, useMemo, useState } from "react";
import { createEntradaAction, type EntradaState } from "@/server/actions/entradas";
import { ScaleSimulator, type ScaleReading } from "@/components/scale-simulator";

type Option = { id: number; name: string };
type ProductOption = Option & { code: string };
type TarimaOption = { id: number; code: string; tareWeight: number };
type CajaOption = { id: number; name: string; tareWeight: number };
type LocationOption = { id: number; warehouseId: number; label: string };
type ScaleInfo = { id: number; name: string; minCapacity: number; maxCapacity: number; unit: string };

type EntradaFormProps = {
  proveedores: Option[];
  productos: ProductOption[];
  tamanos: Option[];
  calidades: Option[];
  almacenes: Option[];
  ubicaciones: LocationOption[];
  tarimas: TarimaOption[];
  cajas: CajaOption[];
  bascula: ScaleInfo;
};

const initialState: EntradaState = null;

export function EntradaForm({
  proveedores,
  productos,
  tamanos,
  calidades,
  almacenes,
  ubicaciones,
  tarimas,
  cajas,
  bascula,
}: EntradaFormProps) {
  const [state, formAction, pending] = useActionState<EntradaState, FormData>(createEntradaAction, initialState);
  const [formKey, setFormKey] = useState(0);

  const [almacenId, setAlmacenId] = useState<number | "">(almacenes[0]?.id ?? "");
  const [tarimaTipoId, setTarimaTipoId] = useState<number | "">("");
  const [cajaTipoId, setCajaTipoId] = useState<number | "">("");
  const [numCajas, setNumCajas] = useState(0);
  const [taraAdicional, setTaraAdicional] = useState(0);
  const [reading, setReading] = useState<ScaleReading | null>(null);

  const ubicacionesDelAlmacen = useMemo(
    () => ubicaciones.filter((u) => u.warehouseId === almacenId),
    [ubicaciones, almacenId]
  );

  const palletTare = tarimaTipoId ? tarimas.find((t) => t.id === tarimaTipoId)?.tareWeight ?? 0 : 0;
  const boxesTare = cajaTipoId && numCajas > 0 ? (cajas.find((c) => c.id === cajaTipoId)?.tareWeight ?? 0) * numCajas : 0;
  const netPreview = reading ? reading.weight - palletTare - boxesTare - (taraAdicional || 0) : null;

  function handleRegisterAnother() {
    setFormKey((k) => k + 1);
    setTarimaTipoId("");
    setCajaTipoId("");
    setNumCajas(0);
    setTaraAdicional(0);
    setReading(null);
  }

  if (state?.ok) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-emerald-300 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-950">
        <h2 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300">Entrada registrada</h2>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <dt className="text-zinc-500">Folio</dt>
          <dd className="font-medium">{state.folio}</dd>
          <dt className="text-zinc-500">Lote generado</dt>
          <dd className="font-medium">{state.lotCode}</dd>
          <dt className="text-zinc-500">Peso neto</dt>
          <dd className="font-medium">{state.netWeight.toFixed(2)} kg</dd>
        </dl>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleRegisterAnother}
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            Registrar otra entrada
          </button>
          <a
            href="/inventario"
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Ver inventario
          </a>
        </div>
      </div>
    );
  }

  return (
    <form key={formKey} action={formAction} className="flex max-w-3xl flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Proveedor u origen">
          <select name="proveedorId" required defaultValue="" className={selectClass}>
            <option value="" disabled>
              Selecciona...
            </option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Producto">
          <select name="productoId" required defaultValue="" className={selectClass}>
            <option value="" disabled>
              Selecciona...
            </option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Tamaño">
          <select name="tamanoId" required defaultValue="" className={selectClass}>
            <option value="" disabled>
              Selecciona...
            </option>
            {tamanos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Calidad">
          <select name="calidadId" required defaultValue="" className={selectClass}>
            <option value="" disabled>
              Selecciona...
            </option>
            {calidades.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Fecha de cosecha">
          <input type="date" name="fechaCosecha" className={selectClass} />
        </Field>

        <Field label="Almacén">
          <select
            name="almacenId"
            required
            value={almacenId}
            onChange={(e) => setAlmacenId(Number(e.target.value))}
            className={selectClass}
          >
            {almacenes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Ubicación">
          <select name="ubicacionId" defaultValue="" className={selectClass}>
            <option value="">Sin especificar</option>
            {ubicacionesDelAlmacen.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Tipo de tarima">
          <select
            name="tarimaTipoId"
            value={tarimaTipoId}
            onChange={(e) => setTarimaTipoId(e.target.value ? Number(e.target.value) : "")}
            className={selectClass}
          >
            <option value="">Sin tarima</option>
            {tarimas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.code} (tara {t.tareWeight} kg)
              </option>
            ))}
          </select>
        </Field>

        <Field label="Tipo de caja">
          <select
            name="cajaTipoId"
            value={cajaTipoId}
            onChange={(e) => setCajaTipoId(e.target.value ? Number(e.target.value) : "")}
            className={selectClass}
          >
            <option value="">Sin cajas</option>
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
            name="numCajas"
            min={0}
            value={numCajas}
            onChange={(e) => setNumCajas(Number(e.target.value) || 0)}
            className={selectClass}
          />
        </Field>

        <Field label="Tara adicional (kg)">
          <input
            type="number"
            name="taraAdicional"
            min={0}
            step="0.01"
            value={taraAdicional}
            onChange={(e) => setTaraAdicional(Number(e.target.value) || 0)}
            className={selectClass}
          />
        </Field>
      </div>

      <ScaleSimulator
        scaleType="PLATAFORMA"
        minCapacity={bascula.minCapacity}
        maxCapacity={bascula.maxCapacity}
        unit={bascula.unit}
        exampleWeight={625.4}
        onCapture={setReading}
      />
      <input type="hidden" name="basculaId" value={bascula.id} />
      <input type="hidden" name="pesoBruto" value={reading?.weight ?? ""} />
      <input type="hidden" name="pesoEstable" value={String(reading?.stable ?? false)} />
      <input type="hidden" name="basculaConectada" value={String(reading?.connected ?? false)} />

      {reading ? (
        <div className="rounded-md border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p>Peso bruto capturado: <strong>{reading.weight} kg</strong></p>
          <p>Tara de tarima: {palletTare} kg · Tara de cajas: {boxesTare} kg · Tara adicional: {taraAdicional} kg</p>
          <p className="mt-1 font-semibold">
            Peso neto estimado: {netPreview !== null ? netPreview.toFixed(2) : "-"} kg
          </p>
        </div>
      ) : (
        <p className="text-sm text-zinc-500">Captura el peso bruto con el simulador para continuar.</p>
      )}

      <Field label="Observaciones">
        <textarea name="notas" rows={2} className={selectClass} />
      </Field>

      {state && !state.ok ? (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || !reading}
        className="w-fit rounded-md bg-emerald-700 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
      >
        {pending ? "Registrando..." : "Confirmar entrada"}
      </button>
    </form>
  );
}

const selectClass =
  "rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</label>
      {children}
    </div>
  );
}
