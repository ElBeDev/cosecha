DEMO FUNCIONAL +COSECHA

Alcance técnico y operativo — Fases 0, 1 y 2

1. Objetivo de la demo

Crear una demostración navegable que permita visualizar cómo funcionará el sistema para:

* Registrar entradas de producto.
* Clasificar mercancía.
* Recibir pesos automáticamente desde tres tipos de báscula.
* Calcular peso bruto, tara y peso neto.
* Controlar inventario por lote.
* Registrar salidas.
* Consultar movimientos y existencias.
* Usar el sistema desde computadora, tablet y celular.

Para la demo no es indispensable conectar inicialmente básculas físicas. Se puede crear un simulador de lectura de peso que posteriormente se sustituya por la conexión real.

⸻

FASE 0. ANÁLISIS, CONFIGURACIÓN Y ESTRUCTURA

2. Datos generales de la empresa — ⬜ NO HECHO (no se construyó pantalla de configuración de empresa en esta demo)

Campos:

* Nombre comercial.
* Razón social.
* RFC.
* Dirección.
* Teléfono.
* Correo.
* Logotipo.
* Zona horaria.
* Moneda.
* Sucursal.
* Almacén.
* Responsable administrativo.

⸻

3. Usuarios y roles — 🔶 PARCIAL (login y roles sembrados en base de datos; permisos granulares por acción NO implementados, solo protección de sesión)

Administrador — 🔶 Rol sembrado (admin@cosecha.local), sin pantallas de administración

Permisos:

* Consultar toda la información.
* Crear y editar catálogos.
* Configurar básculas.
* Consultar inventario.
* Corregir movimientos.
* Autorizar cancelaciones.
* Consultar reportes.
* Crear usuarios.
* Revisar bitácoras.

Supervisor — 🔶 Rol sembrado (supervisor@cosecha.local), sin flujo de autorización implementado

Permisos:

* Consultar inventario.
* Autorizar entradas y salidas.
* Revisar diferencias de peso.
* Autorizar excepciones.
* Consultar reportes operativos.

Operador — ✅ HECHO Y PROBADO (flujo completo de login, entradas y salidas)

Permisos:

* Registrar entradas.
* Registrar salidas.
* Capturar clasificación.
* Seleccionar tarimas y cajas.
* Recibir peso de la báscula.
* Consultar movimientos propios.

No podrá:

* Modificar pesos históricos.
* Eliminar movimientos.
* Cambiar configuraciones.
* Ajustar inventario sin autorización.

Usuario de consulta — ⬜ Rol sembrado (consulta@cosecha.local), sin pantallas de solo lectura dedicadas

Permisos:

* Consultar dashboards.
* Revisar inventario.
* Ver reportes sin modificar información.

⸻

4. Catálogo de productos — 🔶 PARCIAL (5 productos sembrados por script, sin pantalla CRUD de administración)

Cada producto deberá incluir:

* ID del producto.
* Código interno.
* Nombre.
* Categoría.
* Tipo de hortaliza.
* Variedad.
* Unidad principal:
    * Kilogramos.
    * Caja.
    * Pieza.
    * Tarima.
* Peso mínimo permitido.
* Peso máximo esperado.
* Estatus:
    * Activo.
    * Inactivo.
* Fotografía opcional.
* Observaciones.

Ejemplos:

* Jitomate saladette.
* Cebolla blanca.
* Cilantro.
* Lechuga romana.
* Chile serrano.

⸻

5. Clasificación de producto — 🔶 PARCIAL (tamaño/calidad sembrados y usados en entradas y salidas; catálogos globales, no por-producto; sin pantalla CRUD)

Tamaño — 🔶 Sembrado: Chico/Mediano/Grande, usado en el formulario de entrada

* Chico.
* Mediano.
* Grande.
* Extra grande.
* Personalizado.

Campos:

* ID.
* Nombre.
* Descripción.
* Producto relacionado.
* Estatus.

Calidad — 🔶 Sembrada: Primera/Segunda/Descarte, usada en el formulario de entrada

* Primera.
* Segunda.
* Tercera.
* Exportación.
* Nacional.
* Descarte.
* Personalizada.

Campos:

* ID.
* Nombre.
* Descripción.
* Producto relacionado.
* Criterios de clasificación.
* Estatus.

El sistema debe permitir combinaciones como:

Jitomate saladette / Grande / Primera.

⸻

6. Proveedores y origen — 🔶 PARCIAL (1 proveedor sembrado y usado en entradas, sin pantalla CRUD)

Campos:

* ID del proveedor.
* Nombre o razón social.
* Nombre de contacto.
* Teléfono.
* Correo.
* Dirección.
* Parcela o zona de origen.
* Tipo:
    * Producción propia.
    * Productor externo.
    * Distribuidor.
* Estatus.
* Observaciones.

⸻

7. Catálogo de almacenes y ubicaciones — 🔶 PARCIAL (1 almacén + 1 ubicación sembrados y usados en entradas/salidas, sin pantalla CRUD)

Almacenes — 🔶 Sembrado: "Bodega principal"

* Nombre.
* Sucursal.
* Tipo:
    * Bodega.
    * Cámara fría.
    * Área de recepción.
    * Área de embarque.
    * Mostrador.
* Capacidad aproximada.
* Estatus.

Ubicaciones internas — 🔶 Sembrada: "Pasillo A / Zona 01" (una sola ubicación de ejemplo)

* Pasillo.
* Zona.
* Rack.
* Nivel.
* Espacio.
* Temperatura de referencia.
* Tipo de almacenamiento.

Ejemplo:

Bodega principal / Pasillo A / Zona 03.

⸻

8. Catálogo de taras — 🔶 PARCIAL (tarimas y cajas sembradas y usadas en entradas/salidas; empaques adicionales no; sin pantalla CRUD)

Tarimas — ✅ Sembradas y usadas: madera (25kg), plástico (18kg)

Campos:

* Código de tarima.
* Tipo:
    * Madera.
    * Plástico.
    * Metálica.
* Peso de tara.
* Capacidad máxima.
* Código QR.
* Estatus.

Cajas — ✅ Sembradas y usadas: plástica (2.3kg), cartón (0.8kg), canastilla (1.5kg)

Campos:

* Código de caja.
* Tipo de caja.
* Material.
* Peso de tara.
* Capacidad máxima.
* Estatus.

Empaques adicionales — ⬜ NO HECHO (no se creó catálogo separado; canastilla quedó modelada dentro de "Cajas")

* Costal.
* Bolsa.
* Contenedor.
* Canastilla.
* Huacal.
* Recipiente.

Campos:

* Nombre.
* Peso de tara.
* Unidad.
* Estatus.

⸻

FASE 1. INVENTARIOS Y TRAZABILIDAD

9. Registro de entradas — ✅ HECHO Y PROBADO (`/entradas/nueva`, flujo completo probado con Playwright)

Flujo

1. El operador selecciona “Nueva entrada”.
2. Elige proveedor u origen.
3. Selecciona producto.
4. Selecciona tamaño.
5. Selecciona calidad.
6. Registra fecha de cosecha.
7. Selecciona ubicación de almacenamiento.
8. Selecciona tipo de pesaje.
9. La báscula registra el peso.
10. El sistema calcula la tara.
11. Se obtiene el peso neto.
12. Se genera un lote.
13. Se confirma la entrada.

Campos de entrada

* Folio de entrada.
* Fecha.
* Hora.
* Operador.
* Proveedor.
* Parcela u origen.
* Producto.
* Variedad.
* Tamaño.
* Calidad.
* Fecha de cosecha.
* Báscula utilizada.
* Peso bruto.
* Tipo de tarima.
* Peso de tarima.
* Número de cajas.
* Tipo de caja.
* Tara total de cajas.
* Tara adicional.
* Peso neto.
* Almacén.
* Ubicación.
* Observaciones.
* Evidencia fotográfica.
* Estatus.

Fórmula — ✅ HECHO (calculada siempre en servidor, nunca confía en el valor del cliente)

Peso neto = Peso bruto − Tara de tarima − Tara de cajas − Tara adicional

⸻

10. Generación de lotes — ✅ HECHO Y PROBADO (código exacto probado: `LOT-20260731-JIT-001`)

Cada entrada debe generar un lote único.

Ejemplo:

LOT-20260731-JIT-001

Datos del lote:

* ID.
* Código de lote.
* Producto.
* Tamaño.
* Calidad.
* Proveedor.
* Origen.
* Fecha de cosecha.
* Fecha y hora de entrada.
* Peso inicial.
* Peso disponible.
* Almacén.
* Ubicación.
* Estatus.
* Operador.
* Observaciones.

Estados: — 🔶 PARCIAL (Disponible/Parcialmente utilizado/Agotado se disparan solos en el flujo probado; Reservado/Bloqueado/En revisión/Merma/Cancelado existen en el modelo de datos pero ningún flujo los dispara todavía)

* Disponible. ✅
* Reservado. ⬜
* Parcialmente utilizado. ✅
* Agotado. ✅
* Bloqueado. ⬜
* En revisión. ⬜
* Merma. ⬜
* Cancelado. ⬜

⸻

11. Inventario disponible — 🔶 PARCIAL (`/inventario`, hecho y probado; solo filtra por producto y estatus)

El inventario debe consultarse por:

* Producto. ✅
* Variedad. ⬜
* Tamaño. ⬜ (visible en la tabla, no como filtro)
* Calidad. ⬜ (visible en la tabla, no como filtro)
* Lote. ⬜
* Proveedor. ⬜ (visible en la tabla, no como filtro)
* Almacén. ⬜ (visible en la tabla, no como filtro)
* Ubicación. ⬜ (visible en la tabla, no como filtro)
* Fecha de entrada. ⬜
* Antigüedad. ⬜
* Estatus. ✅

Métricas principales — 🔶 PARCIAL (solo peso disponible/inicial se muestran hoy, en la lista y en el detalle de lote)

* Peso total recibido. 🔶 (visible como "peso inicial" en detalle de lote)
* Peso disponible. ✅
* Peso reservado. ⬜
* Peso retirado. 🔶 (visible en detalle de lote: inicial − disponible)
* Peso registrado como merma. ⬜
* Número de lotes activos. ✅ (en el dashboard)
* Número de cajas. ⬜
* Número de tarimas. ⬜
* Antigüedad del lote en horas o días. ⬜

⸻

12. Registro de salidas — ✅ HECHO Y PROBADO (`/salidas/nueva`, modalidades cajas y mostrador probadas de punta a punta)

Tipos de salida: — ✅ Los 8 tipos están disponibles como selección en el formulario (el flujo completo solo se probó para Venta, que fue lo usado en las pruebas)

* Venta.
* Traslado interno.
* Embarque.
* Devolución.
* Merma.
* Ajuste autorizado.
* Muestra.
* Consumo interno.

Campos

* Folio de salida.
* Fecha.
* Hora.
* Operador.
* Tipo de salida.
* Producto.
* Lote.
* Tamaño.
* Calidad.
* Peso solicitado.
* Peso registrado.
* Báscula utilizada.
* Peso bruto.
* Tara.
* Peso neto.
* Ubicación de origen.
* Ubicación de destino.
* Cliente, cuando aplique.
* Motivo.
* Observaciones.
* Autorización.
* Estatus.

⸻

13. Modalidades de salida — 🔶 PARCIAL (2 de 4 modalidades implementadas: cajas y mostrador)

Salida con tarima — ⬜ NO HECHO (no implementada como modalidad separada)

* Peso total de tarima cargada.
* Tara de la tarima.
* Tara de cajas.
* Peso neto del producto.
* Identificador de tarima.
* Lote relacionado.

Salida sin tarima — ⬜ NO HECHO (no implementada como modalidad separada)

* Peso del producto.
* Tara de cajas o contenedores.
* Peso neto.
* Lote relacionado.
* Inventario restante.

Salida por cajas — ✅ HECHO Y PROBADO (87.25kg → 75.75kg neto, lote pasó a Parcialmente utilizado)

* Número de cajas.
* Peso individual o acumulado.
* Tara por caja.
* Peso total neto.
* Pedido o cliente relacionado.

Salida por mostrador — ✅ HECHO Y PROBADO (3.5kg → 3.4kg neto con tara de bolsa)

En esta demo solo se mostrará el flujo operativo:

* Selección de producto.
* Selección de lote.
* Peso de báscula.
* Tara de recipiente.
* Peso neto.
* Salida del inventario.

El módulo de cobro se incorporará en la siguiente fase comercial.

⸻

14. Movimientos internos — ⬜ NO HECHO (no se construyó traslado interno en esta demo)

Debe existir una opción de traslado interno para evitar que el sistema descuente mercancía como venta.

Ejemplos:

* Recepción a almacén.
* Almacén a preparación de pedidos.
* Almacén a mostrador.
* Almacén a embarque.
* Cambio de ubicación.
* Cambio de tarima.

El traslado:

* No disminuye el inventario total.
* Cambia la ubicación.
* Conserva lote, tamaño y calidad.
* Registra operador, fecha y hora.

⸻

15. Ajustes y mermas — ⬜ NO HECHO (no se construyó en esta demo)

Tipos de merma

* Deshidratación.
* Daño.
* Golpe.
* Descomposición.
* Producto rechazado.
* Derrame.
* Diferencia de peso.
* Error de captura.
* Otro.

Campos:

* Producto.
* Lote.
* Peso antes.
* Peso después.
* Diferencia.
* Porcentaje.
* Motivo.
* Evidencia.
* Operador.
* Supervisor autorizador.
* Fecha y hora.

Para la demo, la deshidratación puede registrarse manualmente. El modelo dinámico se desarrollará en una fase posterior.

⸻

16. Bitácora de movimientos — 🔶 PARCIAL (`/movimientos`, hecho y probado; guarda entradas/salidas creadas, sin flujo de edición ni reversión todavía)

El sistema debe guardar:

* Usuario. ✅
* Fecha. ✅
* Hora. ✅
* Acción. ✅
* Módulo. ✅
* Folio. ✅
* Dato anterior. ⬜ (el modelo tiene campo `newData`, no hay `previousData`/diff porque no hay flujo de edición aún)
* Dato nuevo. ✅ (guardado como JSON en `newData`)
* Dispositivo utilizado. 🔶 (campo existe en el modelo, siempre queda "web")
* Motivo de modificación. ⬜
* Usuario autorizador. ⬜ (campo existe en el modelo, no se usa todavía)

No debe permitirse borrar movimientos. Se deben cancelar o revertir dejando historial. — 🔶 No hay UI de borrado (correcto), pero tampoco existe todavía la opción de cancelar/revertir un movimiento.

⸻

17. Dashboard básico — 🔶 PARCIAL (`/dashboard`, hecho y probado; 5 de 12 indicadores, 2 de 5 gráficas)

Indicadores:

* Inventario total en kilogramos. ✅
* Entradas del día. ✅
* Salidas del día. ✅
* Mermas del día. ⬜
* Número de lotes activos. ✅
* Productos con mayor inventario. ⬜
* Productos con menor inventario. ⬜
* Últimos movimientos. ✅
* Inventario por calidad. ⬜
* Inventario por tamaño. ⬜
* Inventario por almacén. ⬜
* Inventario por antigüedad. ⬜

Gráficas sugeridas:

* Entradas vs. salidas. ✅
* Inventario por producto. ✅
* Inventario por calidad. ⬜
* Movimientos por día. ⬜
* Mermas por producto. ⬜

⸻

18. Reportes básicos — ⬜ NO HECHO (no se construyó en esta demo; sección 25 lo lista como pantalla #20, no incluida)

Diario

* Entradas.
* Salidas.
* Inventario inicial.
* Inventario final.
* Mermas.
* Movimientos por operador.

Semanal

* Entradas acumuladas.
* Salidas acumuladas.
* Productos con mayor movimiento.
* Diferencias de inventario.
* Lotes activos.

Mensual

* Movimientos por producto.
* Inventario promedio.
* Mermas.
* Proveedores con mayor volumen.
* Operadores con mayor actividad.

Formatos:

* Visualización en pantalla.
* Excel.
* PDF.
* Impresión.

⸻

FASE 2. INTEGRACIÓN CON BÁSCULAS

19. Báscula 1 — Plataforma industrial — ✅ SIMULADA Y PROBADA (usada en `/entradas/nueva`; solo rango/capacidad/tipo, sin marca/modelo/serie/calibración porque es simulador, no báscula física)

Rango

* Desde 200 kg.
* Hasta 1 tonelada.

Usos

* Entrada de tarimas.
* Salida de tarimas.
* Pesaje con tarima.
* Pesaje sin tarima.
* Recepción de grandes volúmenes.

Parámetros

* ID de báscula.
* Nombre.
* Marca.
* Modelo.
* Número de serie.
* Capacidad máxima.
* División mínima.
* Puerto de conexión.
* Protocolo.
* Unidad de medida.
* Estatus.
* Última calibración.

Datos recibidos

* Peso bruto.
* Peso estable.
* Unidad.
* Fecha y hora.
* Estado de conexión.

Modalidades

Con tarima

* Leer peso bruto.
* Seleccionar tarima.
* Restar tara de tarima.
* Seleccionar cajas.
* Restar tara de cajas.
* Obtener peso neto.

Sin tarima

* Leer peso.
* Restar solamente recipientes o empaques.
* Obtener peso neto.

⸻

20. Báscula 2 — Cajas — ✅ SIMULADA Y PROBADA (usada en `/salidas/nueva`, modalidad cajas)

Rango

* Mayor a 5 kg.
* Menor a 200 kg.

Usos

* Pesaje de cajas.
* Pedidos.
* Preparación de mercancía.
* Salidas parciales.
* Agrupación de cajas.

Funciones

* Peso individual.
* Peso acumulado.
* Número de cajas.
* Tara automática por tipo de caja.
* Tara manual autorizada.
* Peso neto total.
* Reiniciar acumulación.
* Confirmar pesaje.
* Relacionar con lote.

⸻

21. Báscula 3 — Mostrador — ✅ SIMULADA Y PROBADA (usada en `/salidas/nueva`, modalidad mostrador)

Rango

* Desde gramos.
* Hasta 5 kg.

Usos

* Venta directa.
* Salida de cantidades pequeñas.
* Producto por kilogramo.
* Producto por gramos.
* Producto por pieza con peso de referencia.

Funciones

* Tara de bolsa o recipiente.
* Peso estable.
* Peso neto.
* Selección de producto.
* Selección automática o manual de lote.
* Descuento del inventario.
* Confirmación de salida.

⸻

22. Simulador de básculas para la demo — ✅ HECHO Y PROBADO (componente `scale-simulator.tsx` reusable, embebido en entradas/salidas + pantalla propia en `/basculas/simulador`)

Cada báscula tendrá una pantalla de simulación.

Elementos

* Selector de báscula.
* Campo de peso.
* Botón “Simular lectura”.
* Indicador:
    * Conectada.
    * Desconectada.
    * Peso inestable.
    * Peso estable.
* Botón de tara.
* Botón de captura.
* Botón de reinicio.

Ejemplos:

* Báscula 1: 625.40 kg.
* Báscula 2: 87.25 kg.
* Báscula 3: 3.450 kg.

⸻

23. Validaciones de pesaje — ✅ HECHO Y PROBADO (todos los bloqueos implementados como errores de dominio en servidor)

El sistema debe bloquear el registro cuando:

* El peso sea cero. ✅
* El peso sea negativo. ✅
* Se exceda la capacidad. ✅ (contra el rango real de cada báscula)
* El peso esté inestable. ✅
* La tara sea mayor al peso bruto. ✅ (probado con Playwright)
* No exista producto seleccionado. ✅ (campo requerido + validado en servidor)
* No exista tamaño o calidad. ✅ (campo requerido + validado en servidor)
* No exista lote para una salida. ✅
* La salida supere el inventario disponible. ✅
* Se intente registrar dos veces la misma lectura. ✅ (ventana de 10 segundos por operador+báscula+peso)

⸻

24. Alertas operativas — 🔶 PARCIAL (existen como errores bloqueantes en el formulario al momento de registrar, no como sistema de alertas independiente/pasivo)

* Peso fuera de rango. ✅ (bloquea el registro)
* Báscula desconectada. ✅ (bloquea el registro)
* Tara no registrada. 🔶 (la tara siempre tiene un valor, default 0; no hay alerta de "falta capturar tara")
* Producto sin clasificación. ⬜
* Lote sin ubicación. ⬜ (ubicación es opcional, no genera alerta)
* Inventario insuficiente. ✅ (bloquea el registro)
* Lectura duplicada. ✅ (bloquea el registro)
* Diferencia de peso. ⬜
* Movimiento pendiente de autorización. ⬜ (no hay flujo de autorización)
* Báscula próxima a calibración. ⬜ (no aplica, son básculas simuladas)

⸻

25. Pantallas necesarias para la demo — 🔶 PARCIAL: 10 de 24 hechas

1. Inicio de sesión. ✅ `/login`
2. Dashboard. ✅ `/dashboard`
3. Usuarios. ⬜
4. Productos. ⬜
5. Tamaños. ⬜
6. Calidades. ⬜
7. Proveedores. ⬜
8. Almacenes. ⬜
9. Ubicaciones. ⬜
10. Tarimas. ⬜
11. Cajas. ⬜
12. Básculas. ⬜ (pantalla de configuración; el simulador sí existe, ítem 21)
13. Nueva entrada. ✅ `/entradas/nueva`
14. Nueva salida. ✅ `/salidas/nueva`
15. Traslado interno. ⬜
16. Inventario. ✅ `/inventario`
17. Lotes. ✅ (lista dentro de `/inventario`, detalle en ítem 22)
18. Mermas. ⬜
19. Movimientos. ✅ `/movimientos`
20. Reportes. ⬜
21. Simulador de básculas. ✅ `/basculas/simulador`
22. Detalle de lote. ✅ `/lotes/[id]`
23. Bitácora. 🔶 (misma pantalla que Movimientos, ítem 19; sin reversión/cancelación)
24. Perfil de usuario. ⬜

⸻

26. Datos de prueba sugeridos — ✅ HECHO (todo sembrado en `prisma/seed.ts`, exactamente como se sugiere aquí)

Productos

* Jitomate saladette.
* Cebolla blanca.
* Cilantro.
* Lechuga romana.
* Chile serrano.

Tamaños

* Chico.
* Mediano.
* Grande.

Calidades

* Primera.
* Segunda.
* Descarte.

Tarimas

* Tarima de madera: 25 kg.
* Tarima de plástico: 18 kg.

Cajas

* Caja plástica: 2.3 kg.
* Caja de cartón: 0.8 kg.
* Canastilla: 1.5 kg.

Usuarios

* Administrador.
* Supervisor.
* Operador 1.
* Operador 2.
* Consulta.

⸻

27. Métricas que deberá mostrar la demo — 🔶 PARCIAL: 6 de 20 hechas

* Kilogramos recibidos. 🔶 (visible como "peso inicial" en detalle de lote, no como KPI agregado)
* Kilogramos disponibles. ✅ (KPI "Inventario total" en dashboard)
* Kilogramos retirados. 🔶 (visible en detalle de lote, no como KPI agregado)
* Kilogramos en merma. ⬜
* Número de entradas. ✅ (KPI "Entradas del día")
* Número de salidas. ✅ (KPI "Salidas del día")
* Número de lotes. ✅ (KPI "Lotes activos")
* Número de tarimas activas. ⬜
* Número de cajas registradas. ⬜
* Inventario por producto. ✅ (gráfica en dashboard)
* Inventario por tamaño. ⬜
* Inventario por calidad. ⬜
* Inventario por ubicación. ⬜
* Inventario por proveedor. ⬜
* Movimientos por operador. ⬜
* Diferencias entre peso bruto y neto. 🔶 (visible en detalle de entrada, no como métrica agregada)
* Porcentaje de merma registrado. ⬜
* Antigüedad promedio de los lotes. ⬜
* Productos con inventario bajo. ⬜
* Productos con mayor rotación. ⬜

⸻

28. Requisitos técnicos sugeridos — 🔶 PARCIAL: 4 de 14 hechos

* Aplicación web responsiva. 🔶 (Tailwind responsivo; no se probó a fondo en dispositivo móvil real, solo en navegador desktop)
* Compatible con celular, tablet y computadora. 🔶 (mismo caso que el punto anterior)
* Base de datos centralizada. ✅ (SQLite local; migrar a Postgres es directo por el diseño con Prisma)
* Control de acceso por roles. 🔶 (roles existen y protegen sesión; permisos granulares por acción no)
* Registro de auditoría. ✅ (`MovementLog`, ver sección 16)
* Arquitectura preparada para múltiples sucursales. ⬜
* API para conexión futura con básculas. ⬜ (hay simulador, no una API real de hardware)
* Lectura mediante RS-232, USB o Ethernet. ⬜
* Exportación a Excel y PDF. ⬜
* Diseño modular. ✅ (Server Actions, validaciones y lógica de dominio separadas por archivo)
* Respaldos automáticos. ⬜
* Ambiente de pruebas y ambiente de producción. ⬜ (solo hay un ambiente local de desarrollo)
* Preparación para códigos QR. ⬜
* Preparación para impresora de etiquetas. ⬜

⸻

29. Alcance mínimo demostrable — ✅ HECHO Y PROBADO DE PUNTA A PUNTA. Corrido completo con Playwright sobre base de datos limpia (reset + seed), los 16 pasos pasaron sin intervención manual. `npm run build` corre limpio.

Durante la presentación debe poder ejecutarse este escenario:

1. Iniciar sesión como operador. ✅
2. Crear una entrada de jitomate. ✅
3. Elegir tamaño grande y calidad primera. ✅
4. Seleccionar una tarima de madera. ✅
5. Simular un peso bruto de 625 kg. ✅
6. Descontar 25 kg de tarima. ✅
7. Registrar 600 kg netos. ✅ (probado exacto: 600.00 kg)
8. Generar automáticamente el lote. ✅ (probado exacto: `LOT-20260731-JIT-001`)
9. Consultar el inventario actualizado. ✅
10. Registrar una salida de cinco cajas. ✅
11. Simular el peso en la báscula intermedia. ✅ (87.25 kg)
12. Descontar la tara de las cajas. ✅ (75.75 kg netos, lote pasó a Parcialmente utilizado)
13. Actualizar el inventario restante. ✅ (probado exacto: 524.25 kg disponibles)
14. Registrar una salida de mostrador de 3.5 kg. ✅ (inventario quedó en 520.75 kg)
15. Consultar el historial completo. ✅ (los 3 movimientos visibles en `/movimientos`)
16. Visualizar los cambios en el dashboard. ✅ (KPIs y gráficas reflejando los totales del día)

Para correrla: `npm run dev` en `/Volumes/work/+Cosecha`, entrar a `localhost:3000`, login con `operador1@cosecha.local` / `cosecha2026` (o cualquier otro usuario del seed).

⸻

30. Fuera del alcance de esta demo

No se requiere desarrollar todavía:

* Cobros y métodos de pago.
* Crédito.
* CRM completo.
* Prospectos.
* Proyecciones de ventas.
* Modelo avanzado de deshidratación.
* Embarques.
* Facturación.
* Rutas.
* Drones.
* Inteligencia artificial.
* Aplicaciones nativas para iOS o Android.
* Integración contable.
* Integración bancaria.

⸻