/* ==========================================================================
   RESULTADOS PRIMER SEMESTRE DE MANTENIMIENTO — lógica del tablero
   Datos: reportes de paradas ene–jun 2026, órdenes de trabajo y PMP.
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. DATOS
   -------------------------------------------------------------------------- */

const TIEMPO_OPERACION = 1376906;   // minutos de operación de planta (semestre)

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"];

// Tiempo perdido (min), frecuencia, MTTR y MTBF por mes
const MENSUAL = {
  tiempo:    [8546, 9980, 12923, 12117, 13581, 9679],
  fallas:    [88, 63, 86, 84, 109, 75],
  mttr:      [97.1, 158.4, 150.3, 144.2, 124.6, 129.1],
  mtbfHoras: [43.5, 60.7, 44.5, 45.5, 35.1, 51.0]   // (tiempo de operación/6) / fallas del mes
};

// Modos de falla del semestre, ordenados por impacto (Pareto)
const MODOS = [
  { n: "Fallas mecánica",         t: 38587, f: 244, mttr: 158.1 },
  { n: "Daño banda",              t: 12918, f: 119, mttr: 108.6 },
  { n: "Fallas eléctrica",        t: 10211, f: 92,  mttr: 111.0 },
  { n: "Sistema de enfriamiento", t: 2833,  f: 25,  mttr: 113.3 },
  { n: "Tiempo a corregir",       t: 948,   f: 6,   mttr: 158.0 },
  { n: "Codificadoras",           t: 783,   f: 6,   mttr: 130.5 },
  { n: "Instrumentación",         t: 206,   f: 5,   mttr: 41.2 },
  { n: "Automatización",          t: 187,   f: 2,   mttr: 93.5 },
  { n: "Neumática",               t: 153,   f: 6,   mttr: 25.5 }
];

// Equipos con mayor tiempo perdido en el semestre
const EQUIPOS = [
  { n: "Sopladora Krupp N°2",         t: 6747, f: 51, mttr: 132.3 },
  { n: "Sopladora Krupp N°1",         t: 5876, f: 42, mttr: 139.9 },
  { n: "Compresora N°1 L1",           t: 5095, f: 21, mttr: 242.6 },
  { n: "Banda transp. Envase–Cedis",  t: 3735, f: 28, mttr: 133.4 },
  { n: "Caldera Wanson (H9301)",      t: 2218, f: 9,  mttr: 246.4 },
  { n: "Compresora N°2 L1",           t: 1472, f: 8,  mttr: 184.0 },
  { n: "Compresor Vilter N°2",        t: 1450, f: 9,  mttr: 161.1 },
  { n: "Crucher 2",                   t: 1331, f: 4,  mttr: 332.8 },
  { n: "Máquina de vaso",             t: 1250, f: 7,  mttr: 178.6 },
  { n: "Chiller Carrier",             t: 1182, f: 13, mttr: 90.9 },
  { n: "Bomba de transferimiento L1", t: 1148, f: 5,  mttr: 229.6 },
  { n: "Pin Machine L1",              t: 1104, f: 4,  mttr: 276.0 }
];

// Reincidencia: en cuáles de los 6 Pareto mensuales del 80 % aparece cada equipo
const BAD_ACTORS = [
  { n: "Sopladora Krupp N°2",         m: [1,1,1,1,1,1], t: 6747, mttr: 132.3 },
  { n: "Sopladora Krupp N°1",         m: [1,0,0,1,1,1], t: 5876, mttr: 139.9 },
  { n: "Compresora N°1 L1",           m: [1,0,1,1,1,0], t: 5095, mttr: 242.6 },
  { n: "Banda transp. Envase–Cedis",  m: [1,1,1,0,0,1], t: 3735, mttr: 133.4 },
  { n: "Compresora N°2 L1",           m: [1,0,1,1,1,0], t: 1472, mttr: 184.0 },
  { n: "Caldera Wanson (H9301)",      m: [0,0,1,1,1,0], t: 2218, mttr: 246.4 },
  { n: "Bomba de transferimiento L1", m: [1,0,1,1,0,0], t: 1148, mttr: 229.6 },
  { n: "Compresor Vilter N°2",        m: [0,0,1,0,1,0], t: 1450, mttr: 161.1 },
  { n: "Pin Machine L1",              m: [0,1,1,0,0,0], t: 1104, mttr: 276.0 },
  { n: "Cámara de vacío L1",          m: [0,0,1,0,1,0], t: 1056, mttr: 211.2 }
];

// Equipos con mayor MTTR (mínimo 3 fallas para que el promedio sea representativo)
const MTTR_EQ = [
  { n: "Crucher 2", v: 332.8, f: 4 },
  { n: "Pin Machine L1", v: 276.0, f: 4 },
  { n: "Banda transp. aceites y grasas", v: 270.0, f: 3 },
  { n: "Caldera Wanson (H9301)", v: 246.4, f: 9 },
  { n: "Compresora N°1 L1", v: 242.6, f: 21 },
  { n: "Condensador barométrico", v: 233.0, f: 3 },
  { n: "Bomba de transferimiento L1", v: 229.6, f: 5 },
  { n: "Sistema de vacío", v: 228.7, f: 3 },
  { n: "Cámara de vacío L1", v: 211.2, f: 5 },
  { n: "Compresora N°2 L1", v: 184.0, f: 8 }
];

// Líneas o áreas productivas
const AREAS = [
  { n: "Jabonería Barranquilla", t: 12432, f: 92 },
  { n: "Refinación Física Gianazza", t: 8711, f: 52 },
  { n: "Jabonería Bquilla Binacch", t: 8276, f: 39 },
  { n: "Krupp N°2", t: 7087, f: 56 },
  { n: "Krupp N°1", t: 6702, f: 48 },
  { n: "Envase A1", t: 4375, f: 41 },
  { n: "Línea 1 Sólidos", t: 4345, f: 29 },
  { n: "Envase A2", t: 4312, f: 59 },
  { n: "Bidones", t: 3931, f: 42 },
  { n: "Refinación Química 500 T", t: 2817, f: 23 }
];

// Órdenes de trabajo (julio se incluye como alerta, fuera del semestre)
const OT = {
  meses:      ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"],
  finalizada: [1301, 1231, 1500, 1231, 1425, 1148],
  pendiente:  [60, 46, 98, 89, 154, 186],
  anulada:    [5, 6, 7, 2, 1, 2],
  cumpl:      [95.6, 96.4, 93.9, 93.3, 90.2, 86.1]
};

// Cumplimiento del PMP (%) — meta 90 %
const PMP = {
  meses: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"],
  pct:   [90.91, 92.25, 85.54, 92.91, 93.79, 90.09],
  meta:  90
};

/* --------------------------------------------------------------------------
   2. UTILIDADES
   -------------------------------------------------------------------------- */

const C = {
  plate:  "#5f6366",   // gris acero del logo: series secundarias
  ref:    "#8f958f",   // líneas y anotaciones de referencia
  brand:  "#4f9142",   // verde del logo: metas, resaltes y buen desempeño
  green:  "#4f9142",   // alias: mismo verde, lectura "bien"
  red:    "#d1483f",   // alarma, atenuado para la paleta verde/gris
  amber:  "#d9a13e",   // ámbar de precaución
  panel:  "#151815"
};

const nf = new Intl.NumberFormat("es-CO");
const fmt = (v, d = 0) => new Intl.NumberFormat("es-CO", { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (window.Chart) {
  Chart.defaults.font.family = "'IBM Plex Mono', Inter, sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.color = "#8a939f";
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.boxWidth = 8;
  Chart.defaults.plugins.legend.labels.padding = 14;
  Chart.defaults.plugins.tooltip.backgroundColor = "#0a0b0d";
  Chart.defaults.plugins.tooltip.borderColor = C.brand;
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.titleColor = "#e9ecf1";
  Chart.defaults.plugins.tooltip.bodyColor = "#c3cad3";
  Chart.defaults.plugins.tooltip.padding = 11;
  Chart.defaults.plugins.tooltip.cornerRadius = 2;
  Chart.defaults.animation.duration = reduceMotion ? 0 : 900;
  Chart.defaults.maintainAspectRatio = false;
}

const gridY = { color: "rgba(255,255,255,.06)", drawTicks: false };
const gridOff = { display: false };

/* Línea de referencia horizontal sobre el eje y */
const refLine = (value, label, color) => ({
  id: "refline-" + label,
  afterDatasetsDraw(chart) {
    const y = chart.scales.y;
    if (!y) return;
    const px = y.getPixelForValue(value);
    const { ctx, chartArea } = chart;
    ctx.save();
    ctx.strokeStyle = color; ctx.setLineDash([6, 5]); ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(chartArea.left, px); ctx.lineTo(chartArea.right, px); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = color; ctx.font = "700 10.5px 'IBM Plex Mono', monospace"; ctx.textAlign = "right";
    ctx.fillText(label, chartArea.right - 4, px - 6);
    ctx.restore();
  }
});

/* Línea de referencia vertical sobre el eje x */
const refLineX = (value, label, color) => ({
  id: "reflinex-" + label,
  afterDatasetsDraw(chart) {
    const x = chart.scales.x;
    if (!x) return;
    const px = x.getPixelForValue(value);
    const { ctx, chartArea } = chart;
    ctx.save();
    ctx.strokeStyle = color; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(px, chartArea.top); ctx.lineTo(px, chartArea.bottom); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = color; ctx.font = "700 10.5px 'IBM Plex Mono', monospace"; ctx.textAlign = "left";
    ctx.fillText(label, px + 5, chartArea.top + 11);
    ctx.restore();
  }
});

/* --------------------------------------------------------------------------
   3. PORTADA: cinta del semestre
   -------------------------------------------------------------------------- */

function buildRibbon() {
  const host = document.getElementById("ribbon");
  if (!host) return;
  const max = Math.max(...MENSUAL.tiempo);
  const min = Math.min(...MENSUAL.tiempo);
  MENSUAL.tiempo.forEach((v, i) => {
    const el = document.createElement("div");
    el.className = "rib" + (v === max ? " worst" : v === min ? " best" : "");
    el.innerHTML = `
      <div class="rib-val">${nf.format(v)}</div>
      <div class="rib-bar" data-h="${Math.round((v / max) * 100)}"></div>
      <div class="rib-lab">${MESES[i].slice(0, 3)}</div>
      <div class="rib-tag">${v === max ? "peor mes" : v === min ? "mejor mes" : "&nbsp;"}</div>`;
    host.appendChild(el);
  });
  requestAnimationFrame(() => {
    setTimeout(() => {
      host.querySelectorAll(".rib-bar").forEach((b, i) => {
        setTimeout(() => { b.style.height = b.dataset.h + "%"; }, reduceMotion ? 0 : i * 85);
      });
    }, 180);
  });
}

/* --------------------------------------------------------------------------
   4. TABLAS
   -------------------------------------------------------------------------- */

function buildTablaMeses() {
  const tb = document.getElementById("tblMeses");
  if (!tb) return;
  MESES.forEach((m, i) => {
    const prev = i === 0 ? null : MENSUAL.tiempo[i - 1];
    const varPct = prev ? ((MENSUAL.tiempo[i] - prev) / prev) * 100 : null;
    let pill = '<span class="pill flat">inicio</span>';
    if (varPct !== null) {
      const cls = varPct > 0 ? "down" : "up";          // más tiempo perdido = peor
      pill = `<span class="pill ${cls}">${varPct > 0 ? "▲" : "▼"} ${fmt(Math.abs(varPct), 1)} %</span>`;
    }
    tb.insertAdjacentHTML("beforeend", `
      <tr>
        <td><b>${m}</b></td>
        <td class="n">${nf.format(MENSUAL.tiempo[i])}</td>
        <td class="n">${MENSUAL.fallas[i]}</td>
        <td class="n">${fmt(MENSUAL.mttr[i], 1)}</td>
        <td>${pill}</td>
      </tr>`);
  });
}

function buildTablaModos() {
  const tb = document.getElementById("tblModos");
  if (!tb) return;
  const total = MODOS.reduce((a, b) => a + b.t, 0);
  let acum = 0;
  MODOS.forEach((m, i) => {
    acum += (m.t / total) * 100;
    const cls = i === 0 ? "hot" : i < 3 ? "warm" : "";
    tb.insertAdjacentHTML("beforeend", `
      <tr>
        <td><span class="rank ${cls}">${i + 1}</span></td>
        <td><b>${m.n}</b></td>
        <td class="n">${nf.format(m.t)}</td>
        <td class="n">${m.f}</td>
        <td class="n">${fmt(m.mttr, 1)}</td>
        <td class="n">${fmt(acum, 1)} %</td>
      </tr>`);
  });
}

function buildTablaBad() {
  const tb = document.getElementById("tblBad");
  if (!tb) return;
  const letras = ["E", "F", "M", "A", "M", "J"];
  BAD_ACTORS.forEach(e => {
    const rep = e.m.reduce((a, b) => a + b, 0);
    const dots = e.m.map((on, i) => `<span class="dot ${on ? "on" : ""}">${letras[i]}</span>`).join("");
    const cls = rep >= 5 ? "hot" : rep >= 3 ? "warm" : "";
    tb.insertAdjacentHTML("beforeend", `
      <tr>
        <td><b>${e.n}</b></td>
        <td><div class="dots">${dots}</div></td>
        <td class="n"><span class="rank ${cls}">${rep}</span></td>
        <td class="n">${nf.format(e.t)}</td>
        <td class="n">${fmt(e.mttr, 1)}</td>
      </tr>`);
  });
}

/* --------------------------------------------------------------------------
   5. GRÁFICAS
   -------------------------------------------------------------------------- */

function buildCharts() {
  if (!window.Chart) return;

  /* --- Áreas --- */
  new Chart(document.getElementById("chartAreas"), {
    type: "bar",
    data: {
      labels: AREAS.map(a => a.n),
      datasets: [{
        label: "Minutos perdidos",
        data: AREAS.map(a => a.t),
        backgroundColor: AREAS.map((_, i) => i < 3 ? C.amber : C.plate),
        borderRadius: 0, barThickness: 17
      }]
    },
    options: {
      indexAxis: "y",
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => `${nf.format(c.parsed.x)} min · ${AREAS[c.dataIndex].f} fallas` } }
      },
      scales: {
        x: { grid: gridY, border: { display: false }, ticks: { callback: v => nf.format(v) } },
        y: { grid: gridOff, border: { display: false }, ticks: { font: { size: 11 } } }
      }
    }
  });

  /* --- Tendencia mensual --- */
  new Chart(document.getElementById("chartTendencia"), {
    type: "bar",
    data: {
      labels: MESES,
      datasets: [
        {
          label: "Tiempo perdido (min)",
          data: MENSUAL.tiempo,
          backgroundColor: MENSUAL.tiempo.map(v =>
            v === Math.max(...MENSUAL.tiempo) ? C.red :
            v === Math.min(...MENSUAL.tiempo) ? C.green : C.plate),
          borderRadius: 0, yAxisID: "y", order: 2
        },
        {
          label: "Número de fallas",
          data: MENSUAL.fallas, type: "line",
          borderColor: C.amber, borderWidth: 2.5, tension: .35,
          pointRadius: 5, pointHoverRadius: 7,
          pointBackgroundColor: "#0a0b0d", pointBorderColor: C.amber, pointBorderWidth: 2.5,
          yAxisID: "y1", order: 1
        }
      ]
    },
    options: {
      plugins: { legend: { position: "bottom" } },
      scales: {
        y: { grid: gridY, border: { display: false }, title: { display: true, text: "Minutos" }, ticks: { callback: v => nf.format(v) } },
        y1: { position: "right", grid: gridOff, border: { display: false }, title: { display: true, text: "Fallas" }, suggestedMin: 0 },
        x: { grid: gridOff, border: { display: false } }
      }
    }
  });

  /* --- Pareto de modos de falla --- */
  const totalModos = MODOS.reduce((a, b) => a + b.t, 0);
  let ac = 0;
  const acumulado = MODOS.map(m => { ac += m.t / totalModos * 100; return +ac.toFixed(1); });
  new Chart(document.getElementById("chartPareto"), {
    type: "bar",
    data: {
      labels: MODOS.map(m => m.n),
      datasets: [
        {
          label: "Minutos perdidos", data: MODOS.map(m => m.t),
          backgroundColor: acumulado.map(v => v <= 80.1 ? C.amber : C.plate),
          borderRadius: 0, order: 2, yAxisID: "y"
        },
        {
          label: "% acumulado", data: acumulado, type: "line",
          borderColor: C.amber, borderWidth: 2.5, tension: .25,
          pointRadius: 4.5, pointBackgroundColor: "#0a0b0d", pointBorderColor: C.amber, pointBorderWidth: 2.5,
          order: 1, yAxisID: "y1"
        }
      ]
    },
    options: {
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            afterLabel: c => c.datasetIndex === 0
              ? `${MODOS[c.dataIndex].f} eventos · MTTR ${fmt(MODOS[c.dataIndex].mttr, 1)} min` : ""
          }
        }
      },
      scales: {
        y: { grid: gridY, border: { display: false }, title: { display: true, text: "Minutos" }, ticks: { callback: v => nf.format(v) } },
        y1: { position: "right", min: 0, max: 100, grid: gridOff, border: { display: false }, ticks: { callback: v => v + " %" } },
        x: { grid: gridOff, border: { display: false }, ticks: { maxRotation: 45, font: { size: 10.5 } } }
      }
    },
    plugins: [{
      id: "corte80",
      afterDatasetsDraw(chart) {
        const y1 = chart.scales.y1; if (!y1) return;
        const px = y1.getPixelForValue(80);
        const { ctx, chartArea } = chart;
        ctx.save();
        ctx.strokeStyle = C.ref; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(chartArea.left, px); ctx.lineTo(chartArea.right, px); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = C.ref; ctx.font = "700 10.5px 'IBM Plex Mono', monospace"; ctx.textAlign = "left";
        ctx.fillText("CORTE 80 %", chartArea.left + 6, px - 6);
        ctx.restore();
      }
    }]
  });

  /* --- Top equipos --- */
  new Chart(document.getElementById("chartEquipos"), {
    type: "bar",
    data: {
      labels: EQUIPOS.map(e => e.n),
      datasets: [{
        label: "Minutos perdidos", data: EQUIPOS.map(e => e.t),
        backgroundColor: EQUIPOS.map((_, i) => i < 2 ? C.red : i < 7 ? C.amber : C.plate),
        borderRadius: 0, barThickness: 18
      }]
    },
    options: {
      indexAxis: "y",
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => `${nf.format(c.parsed.x)} min · ${EQUIPOS[c.dataIndex].f} fallas · MTTR ${fmt(EQUIPOS[c.dataIndex].mttr, 1)} min` } }
      },
      scales: {
        x: { grid: gridY, border: { display: false }, ticks: { callback: v => nf.format(v) } },
        y: { grid: gridOff, border: { display: false }, ticks: { font: { size: 11 } } }
      }
    }
  });

  /* --- MTTR por equipo --- */
  new Chart(document.getElementById("chartMttrEq"), {
    type: "bar",
    data: {
      labels: MTTR_EQ.map(e => e.n),
      datasets: [{
        label: "MTTR (min)", data: MTTR_EQ.map(e => e.v),
        backgroundColor: MTTR_EQ.map(e => e.v >= 240 ? C.red : e.v >= 180 ? C.amber : C.plate),
        borderRadius: 0, barThickness: 18
      }]
    },
    options: {
      indexAxis: "y",
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => `${fmt(c.parsed.x, 1)} min por reparación · ${MTTR_EQ[c.dataIndex].f} fallas` } }
      },
      scales: {
        x: { grid: gridY, border: { display: false } },
        y: { grid: gridOff, border: { display: false }, ticks: { font: { size: 11 } } }
      }
    },
    plugins: [refLineX(132.3, "MTTR PLANTA 132", C.ref)]
  });

  /* --- MTBF mes a mes --- */
  new Chart(document.getElementById("chartMtbfDetalle"), {
    type: "line",
    data: {
      labels: MESES,
      datasets: [{
        label: "MTBF (horas)", data: MENSUAL.mtbfHoras,
        borderColor: C.green, backgroundColor: "rgba(23,201,107,.13)", fill: true,
        tension: .35, borderWidth: 2.5,
        pointRadius: 5, pointBackgroundColor: "#0a0b0d", pointBorderColor: C.green, pointBorderWidth: 2.5
      }]
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `${fmt(c.parsed.y, 1)} horas entre fallas` } } },
      scales: {
        y: { grid: gridY, border: { display: false }, suggestedMin: 25, ticks: { callback: v => v + " h" } },
        x: { grid: gridOff, border: { display: false } }
      }
    },
    plugins: [refLine(45.4, "SEMESTRE 45,4 H", C.ref), refLine(40.46, "META 40,46 H", C.brand)]
  });

  /* --- Órdenes de trabajo --- */
  new Chart(document.getElementById("chartOT"), {
    type: "bar",
    data: {
      labels: OT.meses,
      datasets: [
        { label: "Finalizadas", data: OT.finalizada, backgroundColor: C.plate, borderRadius: 0, stack: "s", yAxisID: "y", order: 3 },
        { label: "Pendientes", data: OT.pendiente, backgroundColor: C.red, borderRadius: 0, stack: "s", yAxisID: "y", order: 3 },
        { label: "Anuladas", data: OT.anulada, backgroundColor: C.amber, borderRadius: 0, stack: "s", yAxisID: "y", order: 3 },
        {
          label: "% cumplimiento", data: OT.cumpl, type: "line",
          borderColor: C.green, borderWidth: 2.5, tension: .3,
          pointRadius: 5, pointBackgroundColor: "#0a0b0d", pointBorderColor: C.green, pointBorderWidth: 2.5,
          yAxisID: "y1", order: 1
        }
      ]
    },
    options: {
      plugins: { legend: { position: "bottom" } },
      scales: {
        y: { stacked: true, grid: gridY, border: { display: false }, title: { display: true, text: "Órdenes" } },
        y1: { position: "right", min: 40, max: 100, grid: gridOff, border: { display: false }, ticks: { callback: v => v + " %" } },
        x: { stacked: true, grid: gridOff, border: { display: false } }
      }
    }
  });

  /* --- PMP --- */
  new Chart(document.getElementById("chartPMP"), {
    type: "bar",
    data: {
      labels: PMP.meses,
      datasets: [{
        label: "Cumplimiento PMP (%)", data: PMP.pct,
        backgroundColor: PMP.pct.map(v => v >= PMP.meta ? C.green : v >= 80 ? C.amber : C.red),
        borderRadius: 0
      }]
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `${fmt(c.parsed.y, 2)} % ejecutado` } } },
      scales: {
        y: { min: 50, max: 100, grid: gridY, border: { display: false }, ticks: { callback: v => v + " %" } },
        x: { grid: gridOff, border: { display: false } }
      }
    },
    plugins: [refLine(90, "META 90 %", C.brand)]
  });
}

/* --------------------------------------------------------------------------
   6. ANIMACIONES E INTERACCIÓN
   -------------------------------------------------------------------------- */

/* Numera las tarjetas KPI como placas de equipo: KPI-01, KPI-02… */
function stampKpiCodes() {
  document.querySelectorAll(".kpi").forEach((k, i) => {
    const head = k.querySelector(".kpi-head");
    if (!head || head.querySelector(".kpi-code")) return;
    const code = document.createElement("span");
    code.className = "kpi-code";
    code.textContent = "KPI-" + String(i + 1).padStart(2, "0");
    head.appendChild(code);
  });
}

function animateCount(el) {
  const target = parseFloat(el.dataset.count);
  const dec = parseInt(el.dataset.dec || "0", 10);
  if (reduceMotion) { el.textContent = fmt(target, dec); return; }
  const dur = 1050, t0 = performance.now();
  const step = now => {
    const p = Math.min((now - t0) / dur, 1);
    el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)), dec);
    if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(target, dec);
  };
  requestAnimationFrame(step);
}

function setupObservers() {
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      if (el.classList.contains("reveal")) el.classList.add("in");
      el.querySelectorAll?.("[data-count]:not([data-done])").forEach(k => {
        k.dataset.done = "1";
        animateCount(k);
      });
      obs.unobserve(el);
    });
  }, { threshold: .12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal, .kpi").forEach(el => io.observe(el));
}

/* Navegación: resalta la sección visible */
function setupNav() {
  const links = [...document.querySelectorAll(".nav a")];
  const map = new Map();
  links.forEach(a => {
    const sec = document.querySelector(a.getAttribute("href"));
    if (sec) map.set(sec, a);
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        links.forEach(l => l.classList.remove("active"));
        map.get(en.target)?.classList.add("active");
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  map.forEach((_, sec) => io.observe(sec));
}

/* Pestañas del plan de acción */
function setupTabs() {
  const tabs = [...document.querySelectorAll(".tab")];
  tabs.forEach(t => {
    t.addEventListener("click", () => {
      tabs.forEach(x => { x.classList.remove("active"); x.setAttribute("aria-selected", "false"); });
      t.classList.add("active"); t.setAttribute("aria-selected", "true");
      document.querySelectorAll(".plan-panel").forEach(p => p.classList.remove("active"));
      document.getElementById(t.dataset.panel)?.classList.add("active");
    });
  });
}

/* --------------------------------------------------------------------------
   7. ARRANQUE
   -------------------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  stampKpiCodes();
  buildRibbon();
  buildTablaMeses();
  buildTablaModos();
  buildTablaBad();
  buildCharts();
  setupObservers();
  setupNav();
  setupTabs();
});
