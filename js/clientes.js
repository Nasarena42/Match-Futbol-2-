// clientes.js — lógica del módulo de clientes

let clienteEditandoId = null;

function renderTabla(lista) {
  const tbody = document.getElementById('tbodyClientes');
  if (!lista.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-msg">No hay clientes registrados todavía.</td></tr>';
    return;
  }
  tbody.innerHTML = lista.map((c, i) => `
    <tr>
      <td style="color:var(--texto-suave)">${i + 1}</td>
      <td style="font-weight:600">${c.nombre}</td>
      <td>${c.telefono}</td>
      <td>${c.mail || '<span style="color:var(--texto-suave)">—</span>'}</td>
      <td style="color:var(--texto-suave);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
        ${c.observaciones || '—'}
      </td>
      <td>
        <button class="btn btn-outline" style="padding:6px 12px;font-size:0.8rem" onclick="editarCliente('${c.id}')">✏️</button>
        <button class="btn btn-danger"  style="padding:6px 12px;font-size:0.8rem;margin-left:6px" onclick="eliminarCliente('${c.id}')">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function cargarClientes() {
  const clientes = DB.get('clientes');
  renderTabla(clientes);
}

// Búsqueda en tiempo real
document.getElementById('searchInput').addEventListener('input', function () {
  const q = this.value.toLowerCase();
  const todos = DB.get('clientes');
  const filtrado = todos.filter(c =>
    c.nombre.toLowerCase().includes(q) ||
    c.telefono.includes(q) ||
    (c.mail || '').toLowerCase().includes(q)
  );
  renderTabla(filtrado);
});

// Abrir modal nuevo
function abrirModalNuevo() {
  clienteEditandoId = null;
  document.getElementById('modalTitulo').textContent = 'Nuevo Cliente';
  limpiarForm();
  document.getElementById('modalCliente').classList.add('open');
}

// Cerrar modal
function cerrarModal() {
  document.getElementById('modalCliente').classList.remove('open');
}

// Limpiar campos
function limpiarForm() {
  [cNombre,'cNombre','cTelefono','cMail','cFechaNac','cObservaciones'].forEach(id => {
    document.getElementById(id).value = '';
  });
}

// Guardar cliente (nuevo o edición)
function guardarCliente() {
  const nombre     = document.getElementById('cNombre').value.trim();
  const nombre     = document.getElementById('cNombre').value.trim();
  const telefono   = document.getElementById('cTelefono').value.trim();
  const mail       = document.getElementById('cMail').value.trim();
  const fechaNac   = document.getElementById('cFechaNac').value;
  const obs        = document.getElementById('cObservaciones').value.trim();

  if (!nombre || !telefono) {
    showToast('Nombre y teléfono son obligatorios.', '#c45c00');
    return;
  }

  const clientes = DB.get('clientes');

  if (clienteEditandoId) {
    const idx = clientes.findIndex(c => c.id === clienteEditandoId);
    if (idx !== -1) {
      clientes[idx] = { ...clientes[idx], nombre, telefono, mail, fechaNac, observaciones: obs };
    }
    showToast('✅ Cliente actualizado.');
  } else {
    clientes.push({ id: genId(), nombre, telefono, mail, fechaNac, observaciones: obs });
    showToast('✅ Cliente registrado.');
  }

  DB.set('clientes', clientes);
  cerrarModal();
  cargarClientes();
}

// Editar cliente existente
function editarCliente(id) {
  const c = DB.get('clientes').find(x => x.id === id);
  if (!c) return;
  clienteEditandoId = id;
  document.getElementById('modalTitulo').textContent = 'Editar Cliente';
  document.getElementById('cNombre').value        = c.nombre;
  document.getElementById('cTelefono').value      = c.telefono;
  document.getElementById('cMail').value          = c.mail || '';
  document.getElementById('cFechaNac').value      = c.fechaNac || '';
  document.getElementById('cObservaciones').value = c.observaciones || '';
  document.getElementById('modalCliente').classList.add('open');
}

// Eliminar cliente
function eliminarCliente(id) {
  if (!confirm('¿Eliminar este cliente?')) return;
  const clientes = DB.get('clientes').filter(c => c.id !== id);
  DB.set('clientes', clientes);
  showToast('🗑️ Cliente eliminado.', '#a81a1a');
  cargarClientes();
}

// Cerrar modal al hacer click fuera
document.getElementById('modalCliente').addEventListener('click', function(e) {
  if (e.target === this) cerrarModal();
});

// Init
cargarClientes();
