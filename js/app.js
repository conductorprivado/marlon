/* ============================================================
   Servicio de Conductor Privado — Managua, Nicaragua
   Interacciones: mapa interactivo, efectos gelatinosos, WhatsApp
   ============================================================ */
"use strict";

/* ============================================================
   CONFIGURACIÓN — EDITA AQUÍ TU NÚMERO REAL DE WHATSAPP
   Formato internacional sin "+" ni espacios: país + número
   Ejemplo Nicaragua: 50578106345
   ============================================================ */
const WA_NUM = "50578106345"; // +505 7810 6345

/* ---------- Utilidades ---------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/** Normaliza TODOS los enlaces wa.me del documento al número configurado. */
function sincronizarEnlacesWhatsApp() {
  $$('a[href*="wa.me/"]').forEach((a) => {
    a.href = a.href.replace(/wa\.me\/\d+/, `wa.me/${WA_NUM}`);
  });
}

/** Enlace de WhatsApp con mensaje pre-escrito. */
const enlaceWhatsApp = (mensaje) =>
  `https://wa.me/${WA_NUM}?text=${encodeURIComponent(mensaje)}`;

/* ---------- Header: sombra al hacer scroll ---------- */
function iniciarHeader() {
  const header = $("#header");
  const alScroll = () => header.classList.toggle("scrolleado", window.scrollY > 8);
  window.addEventListener("scroll", alScroll, { passive: true });
  alScroll();
}

/* ---------- Menú móvil ---------- */
function iniciarNavMovil() {
  const toggle = $("#navToggle");
  const menu = $("#navMenu");
  toggle.addEventListener("click", () => {
    const abierto = menu.classList.toggle("abierto");
    toggle.classList.toggle("abierto", abierto);
    toggle.setAttribute("aria-expanded", String(abierto));
    toggle.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
  });
  // Cerrar al elegir un enlace
  $$(".nav__enlace", menu).forEach((a) =>
    a.addEventListener("click", () => {
      menu.classList.remove("abierto");
      toggle.classList.remove("abierto");
      toggle.setAttribute("aria-expanded", "false");
    })
  );
}

/* ---------- Squish gelatinoso al pulsar ---------- */
function iniciarJelly() {
  $$("[data-jelly]").forEach((el) => {
    el.addEventListener("pointerdown", () => {
      el.classList.remove("jelly--pulsado");
      // reinicia la animación aunque ya estuviera corriendo
      void el.offsetWidth;
      el.classList.add("jelly--pulsado");
    });
    el.classList.add("jelly--listo");
  });
}

/* ---------- Aparición al hacer scroll ---------- */
function iniciarReveal() {
  const obs = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("revelado");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  $$("[data-reveal]").forEach((el) => obs.observe(el));
}

/* ---------- Enlace activo en el menú ---------- */
function iniciarEnlaceActivo() {
  const secciones = $$("main section[id]");
  const enlaces = $$(".nav__enlace");
  const obs = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        enlaces.forEach((a) =>
          a.classList.toggle("activo", a.getAttribute("href") === `#${e.target.id}`)
        );
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  secciones.forEach((s) => obs.observe(s));
}

/* ---------- Tilt 3D gelatinoso en la tarjeta del hero ---------- */
function iniciarTiltHero() {
  const tarjeta = $("#tarjetaHero");
  if (!tarjeta || window.matchMedia("(pointer: coarse)").matches) return;
  tarjeta.addEventListener("pointermove", (e) => {
    const r = tarjeta.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    tarjeta.style.transform = `rotateY(${x * 12}deg) rotateX(${-y * 10}deg) scale(1.02)`;
  });
  tarjeta.addEventListener("pointerleave", () => {
    tarjeta.style.transform = "rotateY(0) rotateX(0) scale(1)";
  });
}

/* ============================================================
   MAPA INTERACTIVO DE NICARAGUA
   Usa los polígonos de NIC_DEPTOS (js/nic-map-data.js)
   ============================================================ */
const SVG_NS = "http://www.w3.org/2000/svg";

function crearSvg(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function iniciarMapa() {
  const svg = $("#mapaNic");
  if (!svg || typeof NIC_DEPTOS === "undefined") return;

  // Gradientes de relleno
  const defs = crearSvg("defs");
  const gradientes = [
    ["gradDepto", ["#a8d4f7", "#6fa8e8"]],
    ["gradDeptoHover", ["#7fd8ff", "#1e88e5"]],
    ["gradDeptoSel", ["#0a3d91", "#1565c0"]],
  ];
  gradientes.forEach(([id, colores]) => {
    const g = crearSvg("linearGradient", { id, x1: "0", y1: "0", x2: "1", y2: "1" });
    colores.forEach((c, i) => {
      const stop = crearSvg("stop", { offset: String(i), "stop-color": c });
      g.appendChild(stop);
    });
    defs.appendChild(g);
  });
  svg.appendChild(defs);

  const tooltip = $("#mapaTooltip");
  const tooltipNombre = $("#tooltipNombre");
  const wrap = svg.parentElement;
  const panel = $(".cobertura__panel");
  const infoNombre = $("#infoDeptoNombre");
  const infoTexto = $("#infoDeptoTexto");
  const infoCta = $("#infoDeptoCta");
  const listaDeptos = $("#listaDeptos");
  const datalist = $("#listaDestinosSugeridos");
  const respetaMovimiento = () =>
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Línea de ruta Managua → destino (se dibuja sobre los departamentos)
  const ruta = crearSvg("path", { class: "ruta-mapa", "aria-hidden": "true" });
  ruta.style.display = "none";
  const puntoDestino = crearSvg("circle", {
    class: "punto-destino", r: "5", "aria-hidden": "true",
  });
  puntoDestino.style.display = "none";
  const managua = NIC_DEPTOS.find((d) => d.n === "Managua");

  // Crear chips de la lista + datalist del formulario
  const chips = new Map();
  NIC_DEPTOS.forEach((d) => {
    const li = document.createElement("li");
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = d.n;
    chip.title = `Cotizar viaje a ${d.n}`;
    chip.setAttribute("aria-label", `Cotizar viaje a ${d.n}`);
    li.appendChild(chip);
    listaDeptos.appendChild(li);
    chips.set(d.n, chip);

    const opt = document.createElement("option");
    opt.value = d.n;
    datalist.appendChild(opt);

    chip.addEventListener("pointerenter", () => pathDe(d)?.classList.add("enfocado"));
    chip.addEventListener("pointerleave", () => pathDe(d)?.classList.remove("enfocado"));
    chip.addEventListener("click", () => seleccionar(d, chip));
  });

  // Crear los polígonos
  const rutas = new Map(); // nombre -> <path>
  NIC_DEPTOS.forEach((d, i) => {
    const el = crearSvg("path", {
      d: d.r.map((anillo) => `M${anillo}Z`).join(" "),
      class: "depto",
      tabindex: "0",
      role: "button",
      "aria-label": `${d.n}: servicio de transporte disponible`,
    });
    const retardoEntrada = i * 45;
    el.style.opacity = "0";
    el.style.transform = "scale(.55)";
    el.style.transitionDelay = `${retardoEntrada}ms`;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        el.classList.add("visible");
        el.style.opacity = "1";
        el.style.transform = "scale(1)";
      })
    );
    // al terminar la entrada, el delay vuelve a 0 para que hover responda al instante
    setTimeout(() => (el.style.transitionDelay = "0ms"), retardoEntrada + 800);

    el.addEventListener("pointerenter", () => mostrarTooltip(d, el));
    el.addEventListener("pointermove", (e) => moverTooltip(e));
    el.addEventListener("pointerleave", () => (tooltip.hidden = true));
    el.addEventListener("focus", () => mostrarTooltip(d, el));
    el.addEventListener("blur", () => (tooltip.hidden = true));
    el.addEventListener("click", () => seleccionar(d, el));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        seleccionar(d, el);
      }
    });

    svg.appendChild(el);
    rutas.set(d.n, el);
  });

  // La ruta siempre por encima de todos los polígonos
  svg.appendChild(ruta);
  svg.appendChild(puntoDestino);

  const pathDe = (d) => rutas.get(d.n);

  function mostrarTooltip(d, el) {
    if (window.matchMedia("(max-width: 760px)").matches) return;
    tooltipNombre.textContent = d.n;
    tooltip.hidden = false;
    const r = el.getBoundingClientRect();
    const w = wrap.getBoundingClientRect();
    moverTooltip({
      clientX: r.left + r.width / 2,
      clientY: r.top + r.height / 2,
    }, w, w);
  }

  function moverTooltip(e, rPrevia = null, wPrevia = null) {
    if (tooltip.hidden) return;
    const r = rPrevia || wrap.getBoundingClientRect();
    const w = wPrevia || wrap.getBoundingClientRect();
    const x = Math.min(Math.max(e.clientX - w.left, 60), w.width - 60);
    const y = e.clientY - r.top;
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
  }

  /** Dibuja la curva Managua → destino con efecto de trazado. */
  function dibujarRuta(d) {
    if (!managua || d.n === "Managua") {
      ruta.style.display = "none";
      puntoDestino.style.display = "none";
      return;
    }
    const [x1, y1] = managua.c;
    const [x2, y2] = d.c;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy) || 1;
    // punto de control: perpendicular a la recta, para curva suave
    const cx = x1 + dx / 2 - (dy / dist) * dist * 0.22;
    const cy = y1 + dy / 2 + (dx / dist) * dist * 0.22;
    ruta.setAttribute("d", `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`);
    puntoDestino.setAttribute("cx", x2);
    puntoDestino.setAttribute("cy", y2);
    ruta.style.display = "";
    puntoDestino.style.display = "";

    const largo = ruta.getTotalLength();
    ruta.style.transition = "none";
    ruta.style.strokeDasharray = String(largo);
    ruta.style.strokeDashoffset = String(largo);
    ruta.getBoundingClientRect(); // fuerza el estado inicial
    if (respetaMovimiento()) {
      ruta.style.strokeDashoffset = "0";
    } else {
      ruta.style.transition = "stroke-dashoffset .9s cubic-bezier(.34, 1.2, .64, 1)";
      ruta.style.strokeDashoffset = "0";
    }
  }

  /** En pantallas angostas, lleva la vista al panel tras seleccionar. */
  function irAlPanel() {
    if (!window.matchMedia("(max-width: 900px)").matches) return;
    const r = panel.getBoundingClientRect();
    const fueraDeVista = r.top > window.innerHeight * 0.8 || r.bottom < 120;
    if (fueraDeVista) {
      panel.scrollIntoView({
        behavior: respetaMovimiento() ? "smooth" : "auto",
        block: "start",
      });
    }
  }

  function seleccionar(d, origen) {
    seleccionado = d.n;
    // gelatina en el origen del clic
    origen.classList.remove("presionado");
    void origen.getBoundingClientRect();
    origen.classList.add("presionado");

    rutas.forEach((p) => {
      p.classList.remove("seleccionado");
      delete p.dataset.sel;
    });
    const path = pathDe(d);
    path.dataset.sel = d.n;
    path.classList.add("seleccionado");

    chips.forEach((c, nombre) => {
      c.classList.toggle("seleccionado", nombre === d.n);
      c.setAttribute("aria-pressed", String(nombre === d.n));
    });

    infoNombre.classList.remove("actualizado");
    void infoNombre.offsetWidth;
    infoNombre.classList.add("actualizado");
    infoNombre.textContent = `${d.n} ✓`;
    infoTexto.textContent =
      d.n === "Managua"
        ? "Base principal del servicio. Viajes privados dentro de toda la ciudad y sus alrededores."
        : `¡Sí! Viajamos a ${d.n}. Toca el botón y te cotizamos el traslado por WhatsApp, sin compromiso.`;
    infoCta.hidden = false;
    infoCta.href = enlaceWhatsApp(
      `Hola! Quiero cotizar un viaje privado a ${d.n}.`
    );
    infoCta.setAttribute(
      "aria-label",
      `Cotizar viaje a ${d.n} por WhatsApp`
    );
    dibujarRuta(d);
    irAlPanel();
  }

  // Estado inicial del panel
  infoCta.href = enlaceWhatsApp("Hola! Quiero cotizar un viaje privado.");
}

/* ---------- Buscador de departamentos ---------- */
const normalizarTexto = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function iniciarBuscadorDeptos() {
  const input = $("#buscarDepto");
  const lista = $("#listaDeptos");
  const sinResultados = $("#sinResultados");
  if (!input || !lista) return;

  input.addEventListener("input", () => {
    try {
      const consulta = normalizarTexto(input.value.trim());
      let visibles = 0;
      $$("li", lista).forEach((li) => {
        const chip = $("button", li);
        const coincide = normalizarTexto(chip.textContent).includes(consulta);
        li.style.display = coincide ? "" : "none";
        if (coincide) visibles += 1;
      });
      sinResultados.hidden = visibles > 0;
      lista.hidden = visibles === 0;
    } catch (err) {
      console.error("Error al filtrar departamentos:", err);
    }
  });
}

/* ---------- Formulario de cotización → WhatsApp ---------- */
function iniciarFormulario() {
  const form = $("#formCotiza");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    try {
      const datos = new FormData(form);
      const nombre = (datos.get("nombre") || "").toString().trim();
      const origen = (datos.get("origen") || "").toString().trim();
      const destino = (datos.get("destino") || "").toString().trim();
      const fecha = (datos.get("fecha") || "").toString().trim();
      const pax = (datos.get("pasajeros") || "").toString().trim();

      const lineas = [
        `Hola! Soy ${nombre || "un cliente nuevo"}.`,
        "Quiero cotizar un viaje privado:",
        `🚗 Origen: ${origen || "Por confirmar"}`,
        `📍 Destino: ${destino || "Por confirmar"}`,
      ];
      if (fecha) lineas.push(`📅 Fecha: ${fecha}`);
      if (pax) lineas.push(`👥 Pasajeros: ${pax}`);
      lineas.push("Vengo de la página web.");

      window.open(enlaceWhatsApp(lineas.join("\n")), "_blank", "noopener");
    } catch (err) {
      console.error("No se pudo abrir WhatsApp:", err);
      alert("No se pudo abrir WhatsApp. Escríbenos directamente al número de contacto.");
    }
  });
}

/* ---------- Arranque ---------- */
document.addEventListener("DOMContentLoaded", () => {
  sincronizarEnlacesWhatsApp();
  iniciarHeader();
  iniciarNavMovil();
  iniciarJelly();
  iniciarReveal();
  iniciarEnlaceActivo();
  iniciarTiltHero();
  iniciarMapa();
  iniciarBuscadorDeptos();
  iniciarFormulario();

  const anio = $("#anio");
  if (anio) anio.textContent = String(new Date().getFullYear());
});
