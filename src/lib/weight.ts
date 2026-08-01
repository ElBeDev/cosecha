export function calcNetWeight(
  gross: number,
  palletTare: number,
  boxesTare: number,
  additionalTare: number
): number {
  return gross - palletTare - boxesTare - additionalTare;
}
