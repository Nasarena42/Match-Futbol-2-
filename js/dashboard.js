// dashboard.js — carga métricas del panel principal

(function loadDashboard() {
  const clientes  = DB.get('clientes');
  const reservas  = DB.get('reservas');
  const pagos     = DB.get('pagos');
  const eventos   = DB.get('eventos');

  document.getElementById('totalClientes').textContent = clientes.length;

  const reservasActivas = reservas.filter(r => r.estado !== 'cancelada');
  document.getElementById('totalReservas').textContent = reservasActivas.length;

  const todayStr = hoy();
  const cobradoHoy = pagos
    .filter(p => p.fecha === todayStr)
    .reduce((sum, p) => sum + Number(p.monto || 0), 0);
  document.getElementById('totalPagos').textContent = '$' + cobradoHoy.toLocaleString('es-AR');

  document.getElementById('totalEventos').textContent = eventos.length;

  // Próximas reservas del día
  const container = document.getElementById('proximasReservas');
  const hoyReservas = reservas
    .filter(r => r.fecha === todayStr && r.estado !== 'cancelada')
    .sort((a, b) => a.hora.localeCompare(b.hora));

  if (hoyReservas.length === 0) {
    container.innerHTML = '<p class="empty-msg">No hay reservas para hoy.</p>';
    return;
  }

  container.innerHTML = hoyReservas.map(r => `
    <div class="reserva-item">
      <div class="reserva-hora">${r.hora}</div>
      <div>
        <div style="font-weight:600">${r.clienteNombre || '—'}</div>
        <div class="reserva-cancha">Cancha ${r.cancha}</div>
      </div>
      <div style="margin-left:auto">
        <span class="badge ${r.saldoPendiente > 0 ? 'badge-orange' : 'badge-green'}">
          ${r.saldoPendiente > 0 ? 'Saldo pendiente' : 'Pagada'}
        </span>
      </div>
    </div>
  `).join('');
})();
