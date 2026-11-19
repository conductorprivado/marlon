# Base de datos

Este proyecto NO usa base de datos.

- Sitio 100% estático: sin backend, sin persistencia.
- El formulario de cotización no guarda datos: arma un mensaje y lo envía por
  WhatsApp (`wa.me`), todo del lado del cliente.
- Imágenes NO se guardan en DB (no aplica, no hay DB): viven en `assets/`.
- La única "data" es geográfica y está en `js/nic-map-data.js` (departamentos
  de Nicaragua, fuente geoBoundaries ODbL).
