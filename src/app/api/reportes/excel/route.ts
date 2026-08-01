import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import ExcelJS from "exceljs";
import { getSession } from "@/lib/session";
import { getReporteDiario, getReporteSemanal, getReporteMensual } from "@/lib/reports";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const periodo = request.nextUrl.searchParams.get("periodo") ?? "diario";
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "+Cosecha";
  workbook.created = new Date();

  if (periodo === "semanal") {
    const r = await getReporteSemanal();
    const sheet = workbook.addWorksheet("Reporte semanal");
    sheet.addRows([
      ["Reporte semanal", ""],
      ["Desde", r.desde.toLocaleDateString("es-MX")],
      [],
      ["Entradas acumuladas (#)", r.entradasAcumuladas.count],
      ["Entradas acumuladas (kg)", r.entradasAcumuladas.kg],
      ["Salidas acumuladas (#)", r.salidasAcumuladas.count],
      ["Salidas acumuladas (kg)", r.salidasAcumuladas.kg],
      ["Diferencia de inventario (kg)", r.diferenciaInventario],
      ["Lotes activos", r.lotesActivos],
      [],
      ["Productos con mayor movimiento", "kg"],
      ...r.productosConMayorMovimiento.map((d) => [d.label, d.value]),
    ]);
  } else if (periodo === "mensual") {
    const r = await getReporteMensual();
    const sheet = workbook.addWorksheet("Reporte mensual");
    sheet.addRows([
      ["Reporte mensual", ""],
      ["Desde", r.desde.toLocaleDateString("es-MX")],
      [],
      ["Inventario promedio por lote (kg)", r.inventarioPromedioPorLote],
      ["Mermas (#)", r.mermas.count],
      ["Mermas (kg)", r.mermas.kg],
      [],
      ["Movimientos por producto", "#"],
      ...r.movimientosPorProducto.map((d) => [d.label, d.value]),
      [],
      ["Proveedores con mayor volumen", "kg"],
      ...r.proveedoresConMayorVolumen.map((d) => [d.label, d.value]),
      [],
      ["Operadores con mayor actividad", "#"],
      ...r.operadoresConMayorActividad.map((d) => [d.label, d.value]),
    ]);
  } else {
    const r = await getReporteDiario();
    const sheet = workbook.addWorksheet("Reporte diario");
    sheet.addRows([
      ["Reporte diario", ""],
      ["Fecha", r.fecha.toLocaleDateString("es-MX")],
      [],
      ["Entradas (#)", r.entradas.count],
      ["Entradas (kg)", r.entradas.kg],
      ["Salidas (#)", r.salidas.count],
      ["Salidas (kg)", r.salidas.kg],
      ["Mermas (#)", r.mermas.count],
      ["Mermas (kg)", r.mermas.kg],
      ["Inventario inicial (kg)", r.inventarioInicial],
      ["Inventario final (kg)", r.inventarioFinal],
      [],
      ["Movimientos por operador", "#"],
      ...r.movimientosPorOperador.map((d) => [d.label, d.value]),
    ]);
  }

  const sheet = workbook.worksheets[0];
  sheet.getColumn(1).width = 32;
  sheet.getColumn(2).width = 18;
  sheet.getRow(1).font = { bold: true, size: 14 };

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(Buffer.from(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="cosecha-reporte-${periodo}.xlsx"`,
    },
  });
}
