"use client";

import { useEffect, useRef, useState } from "react";
import type { ScaleType } from "@/generated/prisma/enums";

export type ScaleReading = {
  weight: number;
  stable: boolean;
  connected: boolean;
};

const SCALE_LABELS: Record<ScaleType, string> = {
  PLATAFORMA: "Plataforma industrial",
  CAJAS: "Cajas",
  MOSTRADOR: "Mostrador",
};

const SETTLE_MS = 700;

function randomWeight(min: number, max: number, seed?: number, decimals = 2) {
  const base = seed !== undefined ? seed : min + Math.random() * (max - min);
  const jitter = base * (Math.random() * 0.02 - 0.01);
  const value = Math.min(max, Math.max(min, base + jitter));
  return Number(value.toFixed(decimals));
}

type Props = {
  scaleType: ScaleType;
  minCapacity: number;
  maxCapacity: number;
  unit?: string;
  exampleWeight?: number;
  onCapture: (reading: ScaleReading) => void;
  disabled?: boolean;
};

export function ScaleSimulator({
  scaleType,
  minCapacity,
  maxCapacity,
  unit = "kg",
  exampleWeight,
  onCapture,
  disabled = false,
}: Props) {
  const [weightInput, setWeightInput] = useState("");
  const [stability, setStability] = useState<"ESTABLE" | "INESTABLE" | null>(null);
  const [connected, setConnected] = useState(true);
  const [captured, setCaptured] = useState(false);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (settleTimer.current) clearTimeout(settleTimer.current);
    };
  }, []);

  function scheduleSettle() {
    if (settleTimer.current) clearTimeout(settleTimer.current);
    setStability("INESTABLE");
    settleTimer.current = setTimeout(() => {
      setStability("ESTABLE");
    }, SETTLE_MS);
  }

  function handleSimulate() {
    if (disabled || !connected) return;
    const weight = randomWeight(minCapacity, maxCapacity, exampleWeight);
    setWeightInput(String(weight));
    setCaptured(false);
    scheduleSettle();
  }

  function handleWeightChange(value: string) {
    if (disabled || !connected) return;
    setWeightInput(value);
    setCaptured(false);
    scheduleSettle();
  }

  function handleTara() {
    if (disabled || !connected) return;
    setWeightInput("0");
    setCaptured(false);
    scheduleSettle();
  }

  function handleCapture() {
    if (disabled || !connected || stability !== "ESTABLE" || captured) return;
    const weight = Number(weightInput);
    if (Number.isNaN(weight)) return;
    setCaptured(true);
    onCapture({ weight, stable: true, connected: true });
  }

  function handleReset() {
    if (disabled) return;
    if (settleTimer.current) clearTimeout(settleTimer.current);
    setWeightInput("");
    setStability(null);
    setCaptured(false);
  }

  function handleToggleConnection() {
    if (disabled) return;
    if (settleTimer.current) clearTimeout(settleTimer.current);
    setConnected((v) => !v);
    setWeightInput("");
    setStability(null);
    setCaptured(false);
  }

  const canCapture = !disabled && connected && stability === "ESTABLE" && !captured && weightInput !== "";

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          Báscula — {SCALE_LABELS[scaleType]}
        </span>
        <button
          type="button"
          onClick={handleToggleConnection}
          disabled={disabled}
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            connected
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
              : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
          }`}
        >
          {connected ? "Conectada" : "Desconectada"}
        </button>
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Rango: {minCapacity} – {maxCapacity} {unit}
      </p>

      <div className="flex items-end gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-600 dark:text-zinc-400">Peso ({unit})</label>
          <input
            type="number"
            step="0.01"
            value={weightInput}
            onChange={(e) => handleWeightChange(e.target.value)}
            disabled={disabled || !connected || captured}
            placeholder="0.00"
            className="w-32 rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-zinc-500 disabled:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:disabled:bg-zinc-800"
          />
        </div>

        {weightInput !== "" ? (
          <span
            className={`mb-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              stability === "ESTABLE"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
                : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
            }`}
          >
            {stability === "ESTABLE" ? "Peso estable" : "Peso inestable"}
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSimulate}
          disabled={disabled || !connected || captured}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Simular lectura
        </button>
        <button
          type="button"
          onClick={handleTara}
          disabled={disabled || !connected || captured}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Tara
        </button>
        <button
          type="button"
          onClick={handleCapture}
          disabled={!canCapture}
          className="rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          Capturar
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={disabled}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Reiniciar
        </button>
      </div>

      {captured ? (
        <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
          Lectura capturada: {weightInput} {unit}. Presiona &quot;Reiniciar&quot; para tomar otra lectura.
        </p>
      ) : null}
      {!connected ? (
        <p className="text-xs font-medium text-red-700 dark:text-red-400">
          Báscula desconectada. Reconéctala para poder pesar.
        </p>
      ) : null}
    </div>
  );
}
