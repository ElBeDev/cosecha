export type DomainErrorCode =
  | "PESO_CERO"
  | "PESO_NEGATIVO"
  | "CAPACIDAD_EXCEDIDA"
  | "PESO_INESTABLE"
  | "BASCULA_DESCONECTADA"
  | "TARA_MAYOR_A_BRUTO"
  | "PESO_NETO_INVALIDO"
  | "LOTE_NO_DISPONIBLE"
  | "INVENTARIO_INSUFICIENTE"
  | "LECTURA_DUPLICADA";

export class DomainError extends Error {
  code: DomainErrorCode;

  constructor(code: DomainErrorCode, message: string) {
    super(message);
    this.name = "DomainError";
    this.code = code;
  }
}
