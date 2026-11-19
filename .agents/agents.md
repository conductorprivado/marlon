# Contexto del proyecto — Traslados Privados NI

## Descripción
Sitio web estático de una sola página para un servicio de conductor privado en
Managua, Nicaragua, con cobertura a todos los departamentos del país.
Diseño basado en el afiche `assets/chofer.png` (paleta azul marino/celeste,
ondas, íconos tipo pill redondeados).

## Stack técnico
- HTML5 + CSS3 + JavaScript vanilla. Sin frameworks, sin build step.
- Mapa: SVG generado en runtime desde `js/nic-map-data.js` (17 departamentos,
  datos de geoBoundaries gbOpen NIC ADM1, licencia ODbL, simplificados con
  Douglas-Peucker a ~1400 puntos).
- Tipografías: stack del sistema (`system-ui` / Segoe UI). Sin fuentes externas.
- Sin dependencias externas ni CDNs.

## Estructura de archivos
- `index.html` — página única (hero, servicios, cobertura/mapa, cotiza, footer).
- `css/style.css` — estilos, animaciones "gelatinosas", responsive y
  `prefers-reduced-motion`.
- `js/nic-map-data.js` — datos de polígonos + centroides por departamento.
  Generado por script (no editar a mano).
- `js/app.js` — interacciones: mapa, menú móvil, reveal on scroll, tilt 3D,
  formulario → WhatsApp.
- `assets/chofer.png` — afiche original (también usado como og:image).
- `robots.txt`, `sitemap.xml` — SEO.

## Convenciones
- Español (Nicaragua), `lang="es-NI"`.
- BEM ligero en clases CSS (bloque__elemento--modificador).
- Todas las interacciones críticas llevan try/catch o validación.

## Configuración importante
- **Número de WhatsApp:** constante `WA_NUM` en `js/app.js` (+505 7810 6345).
  `sincronizarEnlacesWhatsApp()` reescribe todos los enlaces `wa.me` del
  documento, así que el número solo se cambia ahí (además del texto del footer
  y el JSON-LD en `index.html`).
- **Dominio de ejemplo:** `https://trasladosprivadoni.com/` (placeholder en
  canonical, Open Graph y sitemap). Reemplazar al publicar con el dominio real.

## SEO
- Title, meta description y keywords enfocados en "conductor privado Managua /
  Nicaragua".
- Open Graph + Twitter Card con `assets/chofer.png`.
- JSON-LD: `LocalBusiness` (geo Managua, `areaServed` con los 17 territorios) y
  `Service` con catálogo de ofertas.
- HTML semántico, un solo `<h1>`, alt en imágenes, skip-link, ARIA en el mapa.

## Pendientes al publicar
- Reemplazar dominio placeholder en: canonical, og:image, og:url, twitter:image,
  JSON-LD (`@id`, url, image, sameAs), `robots.txt` y `sitemap.xml`.
