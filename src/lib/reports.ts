import { startOfDay, subDays } from "date-fns";
import { prisma } from "@/lib/prisma";

function groupSum<T>(items: T[], key: (item: T) => string, value: (item: T) => number) {
  const map = new Map<string, number>();
  for (const item of items) {
    map.set(key(item), (map.get(key(item)) ?? 0) + value(item));
  }
  return [...map.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

function groupCount<T>(items: T[], key: (item: T) => string) {
  const map = new Map<string, number>();
  for (const item of items) {
    map.set(key(item), (map.get(key(item)) ?? 0) + 1);
  }
  return [...map.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

export async function getReporteDiario(at: Date = new Date()) {
  const dayStart = startOfDay(at);

  const [entradas, salidas, mermas, lots, users] = await Promise.all([
    prisma.entry.findMany({ where: { datetime: { gte: dayStart } }, include: { operator: true } }),
    prisma.exit.findMany({ where: { datetime: { gte: dayStart } }, include: { operator: true } }),
    prisma.adjustment.findMany({ where: { datetime: { gte: dayStart } }, include: { operator: true } }),
    prisma.lot.findMany({ select: { availableWeight: true } }),
    prisma.user.findMany({ select: { id: true, name: true } }),
  ]);

  const inventarioFinal = lots.reduce((s, l) => s + l.availableWeight, 0);
  const entradasKg = entradas.reduce((s, e) => s + e.netWeight, 0);
  const salidasKg = salidas.reduce((s, e) => s + e.netWeight, 0);
  const mermasKg = mermas.reduce((s, a) => s + a.difference, 0);
  const inventarioInicial = inventarioFinal - entradasKg + salidasKg + mermasKg;

  const operadorNombres = new Map(users.map((u) => [u.id, u.name]));
  const movPorOperador = groupCount(
    [...entradas.map((e) => e.operatorId), ...salidas.map((e) => e.operatorId), ...mermas.map((a) => a.operatorId)],
    (id) => operadorNombres.get(id) ?? `#${id}`
  );

  return {
    periodo: "diario" as const,
    fecha: dayStart,
    entradas: { count: entradas.length, kg: entradasKg },
    salidas: { count: salidas.length, kg: salidasKg },
    mermas: { count: mermas.length, kg: mermasKg },
    inventarioInicial,
    inventarioFinal,
    movimientosPorOperador: movPorOperador,
  };
}

export async function getReporteSemanal(at: Date = new Date()) {
  const from = subDays(startOfDay(at), 6);

  const [entradas, salidas, mermas, lotesActivos] = await Promise.all([
    prisma.entry.findMany({ where: { datetime: { gte: from } }, include: { product: true } }),
    prisma.exit.findMany({ where: { datetime: { gte: from } }, include: { product: true } }),
    prisma.adjustment.findMany({ where: { datetime: { gte: from } } }),
    prisma.lot.count({ where: { status: { notIn: ["AGOTADO", "CANCELADO"] } } }),
  ]);

  const entradasKg = entradas.reduce((s, e) => s + e.netWeight, 0);
  const salidasKg = salidas.reduce((s, e) => s + e.netWeight, 0);
  const mermasKg = mermas.reduce((s, a) => s + a.difference, 0);

  const movPorProducto = groupSum(
    [...entradas.map((e) => ({ name: e.product.name, kg: e.netWeight })), ...salidas.map((e) => ({ name: e.product.name, kg: e.netWeight }))],
    (d) => d.name,
    (d) => d.kg
  ).slice(0, 5);

  return {
    periodo: "semanal" as const,
    desde: from,
    entradasAcumuladas: { count: entradas.length, kg: entradasKg },
    salidasAcumuladas: { count: salidas.length, kg: salidasKg },
    productosConMayorMovimiento: movPorProducto,
    diferenciaInventario: entradasKg - salidasKg - mermasKg,
    lotesActivos,
  };
}

export async function getReporteMensual(at: Date = new Date()) {
  const from = subDays(startOfDay(at), 29);

  const [entradas, salidas, mermas, lots, users] = await Promise.all([
    prisma.entry.findMany({ where: { datetime: { gte: from } }, include: { product: true, supplier: true, operator: true } }),
    prisma.exit.findMany({ where: { datetime: { gte: from } }, include: { product: true, operator: true } }),
    prisma.adjustment.findMany({ where: { datetime: { gte: from } } }),
    prisma.lot.findMany({ where: { availableWeight: { gt: 0 } }, select: { availableWeight: true } }),
    prisma.user.findMany({ select: { id: true, name: true } }),
  ]);

  const movPorProducto = groupCount(
    [...entradas.map((e) => e.product.name), ...salidas.map((e) => e.product.name)],
    (name) => name
  );

  const mermasKg = mermas.reduce((s, a) => s + a.difference, 0);

  const proveedoresPorVolumen = groupSum(
    entradas.map((e) => ({ name: e.supplier.name, kg: e.netWeight })),
    (d) => d.name,
    (d) => d.kg
  ).slice(0, 5);

  const operadorNombres = new Map(users.map((u) => [u.id, u.name]));
  const operadoresPorActividad = groupCount(
    [...entradas.map((e) => e.operatorId), ...salidas.map((e) => e.operatorId)],
    (id) => operadorNombres.get(id) ?? `#${id}`
  ).slice(0, 5);

  const inventarioPromedioPorLote = lots.length ? lots.reduce((s, l) => s + l.availableWeight, 0) / lots.length : 0;

  return {
    periodo: "mensual" as const,
    desde: from,
    movimientosPorProducto: movPorProducto,
    inventarioPromedioPorLote,
    mermas: { count: mermas.length, kg: mermasKg },
    proveedoresConMayorVolumen: proveedoresPorVolumen,
    operadoresConMayorActividad: operadoresPorActividad,
  };
}

export type ReporteDiario = Awaited<ReturnType<typeof getReporteDiario>>;
export type ReporteSemanal = Awaited<ReturnType<typeof getReporteSemanal>>;
export type ReporteMensual = Awaited<ReturnType<typeof getReporteMensual>>;
