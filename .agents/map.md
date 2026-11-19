# Mapa del sitio (pantallas y flujo)

Sitio de una sola página (`index.html`). Navegación con scroll suave entre
secciones + menú sticky.

## Secciones y rutas (#anclas)
1. `#inicio` — Hero
   - H1 "Servicio de Conductor Privado", badge con el eslogan del afiche,
     CTAs: "Cotizar por WhatsApp" y "Ver cobertura".
   - Tarjeta con `assets/chofer.png` con tilt 3D.
   - Fondo: ondas animadas + burbujas.
2. `#servicios` — 6 tarjetas (5 servicios del afiche + tarjeta CTA destacada).
3. `#cobertura` — Mapa interactivo de Nicaragua + panel lateral.
   - SVG con 17 departamentos clicables (hover/tap/teclado).
   - Tooltip en escritorio; panel en móvil.
   - Al seleccionar: mapa resalta el departamento, chip se marca y el panel
     muestra CTA → WhatsApp con mensaje pre-escrito "…viaje privado a [depto]".
   - Pin "Base: Managua".
4. `#cotiza` — Formulario (nombre, origen, destino, fecha, pasajeros) que abre
   WhatsApp con el mensaje armado. Datalist con los 17 destinos.
5. `#contacto` — Footer: WhatsApp, ubicación, servicios.
   - Barra inferior: copyright + crédito "Web by geraldb1996" →
     https://geraldb1996.com (abre en pestaña nueva).

## Flujos de conversión
- Botón flotante WhatsApp (siempre visible) → wa.me con saludo pre-escrito.
- Header CTA WhatsApp (escritorio).
- Mapa → panel → WhatsApp.
- Formulario → WhatsApp.
- Tarjeta destacada en servicios → WhatsApp.

## Componentes compartidos
- Header sticky con sombra al scroll, menú hamburguesa (<760px).
- Botones `.btn` con squish gelatinoso, botón FAB WhatsApp con pulso.
- Animaciones `data-reveal` (IntersectionObserver).
