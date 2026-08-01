"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type ProductoInventario = { producto: string; kg: number };
type EntradasVsSalidas = { entradasKg: number; salidasKg: number };
type CategoryDatum = { label: string; value: number };

function ChartTooltip({
  active,
  payload,
  label,
  unit = "kg",
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-latte-200 bg-latte-50 px-3 py-2 text-xs shadow-sm dark:border-latte-700 dark:bg-latte-900">
      <p className="font-medium text-latte-700 dark:text-latte-200">{label}</p>
      <p className="text-latte-500 dark:text-latte-400">
        {payload[0].value.toFixed(unit === "kg" ? 2 : 0)} {unit}
      </p>
    </div>
  );
}

export function CategoryBarChart({ data, unit = "kg" }: { data: CategoryDatum[]; unit?: string }) {
  if (data.length === 0) {
    return <p className="text-sm text-latte-500">Sin datos todavía.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
        <XAxis
          dataKey="label"
          tick={{ fill: "var(--chart-muted)", fontSize: 12 }}
          axisLine={{ stroke: "var(--chart-axis)" }}
          tickLine={false}
        />
        <YAxis tick={{ fill: "var(--chart-muted)", fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
        <Tooltip cursor={{ fill: "transparent" }} content={<ChartTooltip unit={unit} />} />
        <Bar dataKey="value" fill="var(--chart-series-1)" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function InventarioPorProductoChart({ data }: { data: ProductoInventario[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-latte-500">Sin inventario disponible todavía.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
        <XAxis
          dataKey="producto"
          tick={{ fill: "var(--chart-muted)", fontSize: 12 }}
          axisLine={{ stroke: "var(--chart-axis)" }}
          tickLine={false}
        />
        <YAxis tick={{ fill: "var(--chart-muted)", fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
        <Tooltip cursor={{ fill: "transparent" }} content={<ChartTooltip />} />
        <Bar dataKey="kg" fill="var(--chart-series-1)" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function EntradasVsSalidasChart({ data }: { data: EntradasVsSalidas }) {
  const chartData = [
    { name: "Entradas", kg: data.entradasKg },
    { name: "Salidas", kg: data.salidasKg },
  ];
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
        <XAxis
          dataKey="name"
          tick={{ fill: "var(--chart-muted)", fontSize: 12 }}
          axisLine={{ stroke: "var(--chart-axis)" }}
          tickLine={false}
        />
        <YAxis tick={{ fill: "var(--chart-muted)", fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
        <Tooltip cursor={{ fill: "transparent" }} content={<ChartTooltip />} />
        <Bar dataKey="kg" radius={[4, 4, 0, 0]} maxBarSize={48}>
          <Cell fill="var(--chart-series-1)" />
          <Cell fill="var(--chart-series-2)" />
          <LabelList
            dataKey="kg"
            position="top"
            formatter={(v: unknown) => (typeof v === "number" ? v.toFixed(1) : String(v ?? ""))}
            fill="var(--chart-muted)"
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
