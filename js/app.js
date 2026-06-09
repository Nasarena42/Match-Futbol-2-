// ===== app.js — utilidades globales =====

// Toast notification

function showToast(msg, color = '#25a83e') {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.background = color;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// localStorage helpers
const DB = {
  get(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
  },
  set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },
  getObj(key) {
    try { return JSON.parse(localStorage.getItem(key)) || {}; }
    catch { return {}; }
  }
};

// Generar ID único
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Formatear fecha legible
function fmtFecha(isoStr) {
  if (!isoStr) return '—';
  const [y, m, d] = isoStr.split('-');
  return `${d}/${m}/${y}`;
}

// Fecha de hoy en YYYY-MM-DD
function hoy() {
  return new Date().toISOString().split('T')[0];
}

// Marcar nav-item activo según la página actual
(function marcarNavActivo() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-item').forEach(a => {
    a.classList.toggle('active', path.endsWith(a.getAttribute('href').replace('./', '')));
  });
  // Fix: inicio
  if (path.endsWith('index.html') || path.endsWith('/')) {
    document.querySelectorAll('.nav-item').forEach(a => a.classList.remove('active'));
    const inicio = document.querySelector('.nav-item[data-page="inicio"]');
    if (inicio) inicio.classList.add('active');
  }
})();

// Fecha en top bar
(function setTopDate() {
  const el = document.getElementById('topDate');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
})();





let pagos = JSON.parse(localStorage.getItem("pagos")) || [];

function cargarReservasEnPagos() {
  const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
  const select = document.getElementById("reservaSelect");
  select.innerHTML = "<option value=''>-- Seleccioná una reserva --</option>";
  reservas.forEach((r, i) => {
    const opcion = document.createElement("option");
    opcion.value = i;
    opcion.textContent = `${r.cliente} - Cancha ${r.cancha} - ${r.fecha} ${r.hora}`;
    select.appendChild(opcion);
  });
}

function cargarDatosReserva() {
  const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
  const indice = document.getElementById("reservaSelect").value;
  if (indice === "") return;
  const r = reservas[indice];
  document.getElementById("precioTotal").value = r.precio;
  document.getElementById("senaYaPagada").value = r.sena;
  document.getElementById("saldoRestante").value = (r.precio - r.sena).toFixed(2);
  document.getElementById("montoCobrar").value = "";
  document.getElementById("tipoPago").value = "";
  document.getElementById("formaPago").value = "";
}

function seleccionarTipoPago() {
  const tipo = document.getElementById("tipoPago").value;
  const precio = parseFloat(document.getElementById("precioTotal").value) || 0;
  const sena = parseFloat(document.getElementById("senaYaPagada").value) || 0;
  const saldo = parseFloat(document.getElementById("saldoRestante").value) || 0;

  if (tipo === "sena") {
    document.getElementById("montoCobrar").value = sena;
    document.getElementById("saldoRestante").value = (precio - sena).toFixed(2);
  } else if (tipo === "total") {
    document.getElementById("montoCobrar").value = precio;
    document.getElementById("saldoRestante").value = 0;
  } else if (tipo === "parcial") {
    document.getElementById("montoCobrar").value = saldo > 0 ? saldo.toFixed(2) : 0;
  } else {
    document.getElementById("montoCobrar").value = "";
  }
}

function calcularSaldoRestante() {
  const precioTotal  = parseFloat(document.getElementById("precioTotal").value) || 0;
  const senaPagada   = parseFloat(document.getElementById("senaYaPagada").value) || 0;
  const monto        = parseFloat(document.getElementById("montoCobrar").value) || 0;

  let saldo = precioTotal - senaPagada - monto;
  document.getElementById("saldoRestante").value = saldo <= 0 ? "Pagado" : saldo.toFixed(2);
}

function registrarCobro() {
  const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
  const indice = document.getElementById("reservaSelect").value;
  const forma = document.getElementById("formaPago").value;
  const tipo = document.getElementById("tipoPago").value;
  const monto = parseFloat(document.getElementById("montoCobrar").value) || 0;

  if (indice === "" || forma === "" || tipo === "" || monto <= 0) {
    alert("Completa todos los campos obligatorios y que el monto sea mayor a 0.");
    return;
  }

  const r = reservas[indice];
  if (!r) {
    alert("La reserva seleccionada no es válida.");
    return;
  }

  let pagoExistente = pagos.find(p => p.reservaId == indice && p.tipo === tipo);
  if (pagoExistente) {
    pagoExistente.monto += monto;
    pagoExistente.forma = forma;
  } else {
    pagoExistente = { reservaId: indice, tipo, forma, monto };
    pagos.push(pagoExistente);
  }

  localStorage.setItem("pagos", JSON.stringify(pagos));

  mostrarComprobante(pagoExistente, r);

  const mensaje = document.getElementById("mensajeOk");
  mensaje.style.display = "block";
  setTimeout(() => { mensaje.style.display = "none"; }, 3000);

  actualizarTablaPagos();
  mostrarComprobante(pagoExistente, r);
  limpiarFormulario();
}


function actualizarTablaPagos() {
  const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
  const tabla = document.getElementById("tablaPagos").querySelector("tbody");
  tabla.innerHTML = "";

  const pagosPorClave = {};
  pagos.forEach(p => {
    const clave = p.reservaId + "-" + p.tipo + "-" + p.forma;
    if (!pagosPorClave[clave]) {
      pagosPorClave[clave] = { ...p };
    } else {
      pagosPorClave[clave].monto += p.monto;
    }
  });

  Object.values(pagosPorClave).forEach(p => {
    const reservaIndex = Number(p.reservaId);
    const r = reservas[reservaIndex];

    if (!r) {
      console.warn(`No se encontró reserva para id ${p.reservaId}`);
      return;
    }

    const totalPagado = pagos
      .filter(px => Number(px.reservaId) === reservaIndex)
      .reduce((sum, px) => sum + px.monto, 0);
    const saldo = r.precio - totalPagado;

    const fila = tabla.insertRow();
    fila.innerHTML = `
      <td>${r.cliente}</td>
      <td>Cancha ${r.cancha}</td>
      <td>$${r.precio.toFixed(2)}</td>
      <td>$${r.sena.toFixed(2)}</td>
      <td>${p.tipo === "sena" ? "Seña" : (p.tipo === "parcial" ? "Pago Parcial" : "Total")}</td>
      <td>$${p.monto.toFixed(2)}</td>
      <td>${p.forma}</td>
      <td>${saldo <= 0 ? "Pagado" : "$" + saldo.toFixed(2)}</td>
    `;
  });
}

function limpiarFormulario() {
  document.getElementById("formPago").reset();
  document.getElementById("saldoRestante").value = "";
  document.getElementById("precioTotal").value = "";
  document.getElementById("senaYaPagada").value = "";
}

function borrarListadoPagos() {
  if (confirm("¿Estás seguro que quieres borrar todos los pagos? Esta acción no se puede deshacer.")) {
    pagos = [];
    localStorage.removeItem("pagos");
    actualizarTablaPagos();
  }
}

// Comprobante de pago
function mostrarComprobante(pago, reserva) {
  const detalles = `
    <p><strong>Cliente:</strong> ${reserva.cliente}</p>
    <p><strong>Cancha:</strong> ${reserva.cancha}</p>
    <p><strong>Fecha:</strong> ${reserva.fecha} ${reserva.hora}</p>
    <p><strong>Tipo de pago:</strong> ${pago.tipo === "sena" ? "Seña" : (pago.tipo === "parcial" ? "Pago Parcial" : "Total")}</p>
    <p><strong>Monto cobrado:</strong> $${pago.monto.toFixed(2)}</p>
    <p><strong>Forma de pago:</strong> ${pago.forma}</p>
  `;
  document.getElementById("detallesPago").innerHTML = detalles;

  document.getElementById("comprobantePago").style.display = "block";
  document.getElementById("overlay").style.display = "block";
}

function cerrarComprobante() {
  document.getElementById("comprobantePago").style.display = "none";
  document.getElementById("overlay").style.display = "none";
}

function imprimirComprobante() {
  const contenido = document.getElementById("comprobantePago").innerHTML;
  const ventana = window.open('', '', 'width=400,height=600');
  ventana.document.write('<html><head><title>Comprobante de Pago</title></head><body>');
  ventana.document.write(contenido);
  ventana.document.write('</body></html>');
  ventana.document.close();
  ventana.print();
}

window.onload = function() {
  cargarReservasEnPagos();
  actualizarTablaPagos();
  document.getElementById("btnBorrarPagos").onclick = borrarListadoPagos;
};
