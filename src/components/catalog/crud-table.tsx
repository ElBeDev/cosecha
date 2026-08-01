"use client";

import { useActionState, useEffect, useState } from "react";

export type ActionResult = { ok: boolean; error?: string } | null;

export type ColumnType = "text" | "number" | "select" | "textarea";

export type CrudColumn<T> = {
  key: keyof T & string;
  label: string;
  type: ColumnType;
  options?: { value: string; label: string }[];
  required?: boolean;
  step?: string;
};

type CrudTableProps<T extends { id: number }> = {
  title: string;
  columns: CrudColumn<T>[];
  rows: T[];
  createAction: (prevState: ActionResult, formData: FormData) => Promise<ActionResult>;
  updateAction: (prevState: ActionResult, formData: FormData) => Promise<ActionResult>;
  toggleStatusAction?: (id: number) => Promise<ActionResult>;
  isRowActive?: (row: T) => boolean;
  extraFields?: Record<string, string>;
};

const inputClass =
  "rounded-md border border-latte-300 px-2 py-1.5 text-sm outline-none focus:border-latte-500 dark:border-latte-700 dark:bg-latte-900";

function FieldInput<T>({
  column,
  defaultValue,
  name,
}: {
  column: CrudColumn<T>;
  defaultValue?: string | number | null;
  name: string;
}) {
  if (column.type === "select") {
    return (
      <select name={name} defaultValue={defaultValue ?? ""} required={column.required} className={inputClass}>
        <option value="" disabled>
          Selecciona...
        </option>
        {column.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }
  if (column.type === "textarea") {
    return (
      <textarea name={name} defaultValue={defaultValue ?? ""} rows={1} className={inputClass} />
    );
  }
  return (
    <input
      type={column.type}
      step={column.step}
      name={name}
      defaultValue={defaultValue ?? ""}
      required={column.required}
      className={inputClass}
    />
  );
}

export function CrudTable<T extends { id: number }>({
  title,
  columns,
  rows,
  createAction,
  updateAction,
  toggleStatusAction,
  isRowActive = (row) => (row as Record<string, unknown>).status === "ACTIVO" || (row as Record<string, unknown>).active === true,
  extraFields,
}: CrudTableProps<T>) {
  const [createState, createFormAction, creating] = useActionState<ActionResult, FormData>(createAction, null);
  const [editState, editFormAction, editing] = useActionState<ActionResult, FormData>(updateAction, null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [createKey, setCreateKey] = useState(0);

  useEffect(() => {
    if (editState?.ok) setEditingId(null);
  }, [editState]);

  useEffect(() => {
    if (createState?.ok) setCreateKey((k) => k + 1);
  }, [createState]);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-latte-200 p-4 dark:border-latte-800">
        <h3 className="mb-3 text-sm font-semibold text-latte-700 dark:text-latte-200">Nuevo: {title}</h3>
        <form key={createKey} action={createFormAction} className="flex flex-wrap items-end gap-3">
          {columns.map((col) => (
            <div key={col.key} className="flex flex-col gap-1">
              <label className="text-xs text-latte-500">{col.label}</label>
              <FieldInput column={col} name={col.key} />
            </div>
          ))}
          {extraFields &&
            Object.entries(extraFields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
          <button
            type="submit"
            disabled={creating}
            className="rounded-md bg-emerald-700 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {creating ? "Guardando..." : "Agregar"}
          </button>
        </form>
        {createState && !createState.ok ? (
          <p className="mt-2 text-sm text-red-700 dark:text-red-400">{createState.error}</p>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-lg border border-latte-200 dark:border-latte-800">
        <table className="min-w-full divide-y divide-latte-200 text-sm dark:divide-latte-800">
          <thead className="bg-latte-50 dark:bg-latte-900">
            <tr className="text-left text-xs font-semibold uppercase text-latte-500">
              {columns.map((col) => (
                <th key={col.key} className="px-3 py-2">
                  {col.label}
                </th>
              ))}
              {toggleStatusAction ? <th className="px-3 py-2">Estatus</th> : null}
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-latte-100 dark:divide-latte-800">
            {rows.map((row) => {
              const record = row as Record<string, unknown>;
              const isEditing = editingId === row.id;
              return (
                <tr key={row.id}>
                  {isEditing ? (
                    <td colSpan={columns.length + (toggleStatusAction ? 2 : 1)} className="px-3 py-2">
                      <form action={editFormAction} className="flex flex-wrap items-end gap-3">
                        <input type="hidden" name="id" value={row.id} />
                        {extraFields &&
                          Object.entries(extraFields).map(([k, v]) => (
                            <input key={k} type="hidden" name={k} value={v} />
                          ))}
                        {columns.map((col) => (
                          <div key={col.key} className="flex flex-col gap-1">
                            <label className="text-xs text-latte-500">{col.label}</label>
                            <FieldInput column={col} name={col.key} defaultValue={record[col.key] as string} />
                          </div>
                        ))}
                        <button
                          type="submit"
                          disabled={editing}
                          className="rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded-md border border-latte-300 px-3 py-1.5 text-xs text-latte-700 dark:border-latte-700 dark:text-latte-200"
                        >
                          Cancelar
                        </button>
                      </form>
                      {editState && !editState.ok ? (
                        <p className="mt-1 text-xs text-red-700 dark:text-red-400">{editState.error}</p>
                      ) : null}
                    </td>
                  ) : (
                    <>
                      {columns.map((col) => (
                        <td key={col.key} className="px-3 py-2">
                          {col.type === "select"
                            ? col.options?.find((o) => o.value === String(record[col.key]))?.label ??
                              String(record[col.key] ?? "")
                            : String(record[col.key] ?? "")}
                        </td>
                      ))}
                      {toggleStatusAction ? (
                        <td className="px-3 py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              isRowActive(row)
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
                                : "bg-latte-200 text-latte-600 dark:bg-latte-800 dark:text-latte-400"
                            }`}
                          >
                            {isRowActive(row) ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                      ) : null}
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(row.id)}
                            className="rounded-md border border-latte-300 px-2 py-1 text-xs text-latte-700 hover:bg-latte-100 dark:border-latte-700 dark:text-latte-200 dark:hover:bg-latte-900"
                          >
                            Editar
                          </button>
                          {toggleStatusAction ? (
                            <button
                              type="button"
                              onClick={() => toggleStatusAction(row.id)}
                              className="rounded-md border border-latte-300 px-2 py-1 text-xs text-latte-700 hover:bg-latte-100 dark:border-latte-700 dark:text-latte-200 dark:hover:bg-latte-900"
                            >
                              {isRowActive(row) ? "Desactivar" : "Activar"}
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="px-3 py-6 text-center text-latte-500">
                  Sin registros todavía.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
