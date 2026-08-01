"use client";

import { useActionState, useMemo, useState } from "react";
import { createTrasladoAction, type TrasladoState } from "@/server/actions/traslados";

type LotOption = {
  id: number;
  code: string;
  productName: string;
  warehouseName: string;
  locationLabel: string | null;
  availableWeight: number;
};
type WarehouseOption = { id: number; name: string };
type LocationOption = { id: number; warehouseId: number; label: string };

type TrasladoFormProps = {
  lots: LotOption[];
  warehouses: WarehouseOption[];
  locations: LocationOption[];
};

const initialState: TrasladoState = null;
const selectClass =
  "rounded-md border border-latte-300 px-3 py-2 text-sm outline-none focus:border-latte-500 dark:border-latte-700 dark:bg-latte-900";

export function TrasladoForm({ lots, warehouses, locations }: TrasladoFormProps) {
  const [state, formAction, pending] = useActionState<TrasladoState, FormData>(createTrasladoAction, initialState);
  const [formKey, setFormKey] = useState(0);
  const [lotId, setLotId] = useState<number | "">("");
  const [toWarehouseId, setToWarehouseId] = useState<number | "">("");

  const selectedLot = lots.find((l) => l.id === lotId);
  const locationsForWarehouse = useMemo(
    () => locations.filter((l) => l.warehouseId === toWarehouseId),
    [locations, toWarehouseId]
  );

  function handleRegisterAnother() {
    setFormKey((k) => k + 1);
    setLotId("");
    setToWarehouseId("");
  }

  if (state?.ok) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-emerald-300 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-950">
        <h2 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300">Traslado registrado</h2>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <dt className="text-latte-500">Folio</dt>
          <dd className="font-medium">{state.folio}</dd>
          <dt className="text-latte-500">Lote</dt>
          <dd className="font-medium">{state.lotCode}</dd>
        </dl>
        <p className="text-sm text-latte-500">El inventario total no cambió, solo la ubicación del lote.</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleRegisterAnother}
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            Registrar otro traslado
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
    <form key={formKey} action={formAction} className="flex max-w-xl flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-latte-700 dark:text-latte-300">Lote</label>
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
              {l.code} — {l.productName} ({l.warehouseName}
              {l.locationLabel ? ` · ${l.locationLabel}` : ""}) · {l.availableWeight.toFixed(2)} kg
            </option>
          ))}
        </select>
      </div>

      {selectedLot ? (
        <p className="text-sm text-latte-500">
          Ubicación actual: {selectedLot.warehouseName}
          {selectedLot.locationLabel ? ` · ${selectedLot.locationLabel}` : ""}
        </p>
      ) : null}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-latte-700 dark:text-latte-300">Almacén destino</label>
        <select
          name="toWarehouseId"
          required
          value={toWarehouseId}
          onChange={(e) => setToWarehouseId(e.target.value ? Number(e.target.value) : "")}
          className={selectClass}
        >
          <option value="" disabled>
            Selecciona...
          </option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-latte-700 dark:text-latte-300">Ubicación destino</label>
        <select name="toLocationId" defaultValue="" className={selectClass}>
          <option value="">Sin especificar</option>
          {locationsForWarehouse.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-latte-700 dark:text-latte-300">Motivo</label>
        <input type="text" name="reason" className={selectClass} placeholder="Cambio de ubicación, preparación de pedido..." />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-latte-700 dark:text-latte-300">Observaciones</label>
        <textarea name="notes" rows={2} className={selectClass} />
      </div>

      {state && !state.ok ? (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || !lotId || !toWarehouseId}
        className="w-fit rounded-md bg-emerald-700 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
      >
        {pending ? "Registrando..." : "Confirmar traslado"}
      </button>
    </form>
  );
}
