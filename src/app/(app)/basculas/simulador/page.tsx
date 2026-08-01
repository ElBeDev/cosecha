"use client";

import { useState } from "react";
import { ScaleSimulator, type ScaleReading } from "@/components/scale-simulator";

const SCALES = [
  { type: "PLATAFORMA" as const, min: 200, max: 1000, example: 625.4 },
  { type: "CAJAS" as const, min: 5, max: 200, example: 87.25 },
  { type: "MOSTRADOR" as const, min: 0.01, max: 5, example: 3.45 },
];

export default function SimuladorBasculasPage() {
  const [lastReading, setLastReading] = useState<{ type: string; reading: ScaleReading } | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Simulador de básculas</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Pantalla de aislamiento para probar el componente antes de integrarlo en entradas/salidas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {SCALES.map((s) => (
          <ScaleSimulator
            key={s.type}
            scaleType={s.type}
            minCapacity={s.min}
            maxCapacity={s.max}
            exampleWeight={s.example}
            onCapture={(reading) => setLastReading({ type: s.type, reading })}
          />
        ))}
      </div>

      {lastReading ? (
        <div className="rounded-md border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
          Última captura ({lastReading.type}): <strong>{lastReading.reading.weight} kg</strong>{" "}
          (estable: {String(lastReading.reading.stable)}, conectada: {String(lastReading.reading.connected)})
        </div>
      ) : null}
    </div>
  );
}
