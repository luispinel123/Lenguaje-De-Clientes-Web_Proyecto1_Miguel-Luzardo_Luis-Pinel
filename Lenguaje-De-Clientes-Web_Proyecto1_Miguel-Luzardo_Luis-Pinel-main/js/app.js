// Punto de entrada / Coordinación general e integración de mensajes DOM

function mostrarMensajeGlobal(texto, tipo = 'info') {
  const contenedor = document.getElementById('contenedor-mensajes');
  if (!contenedor) return;

  const msg = document.createElement('div');
  msg.className = `mensaje-global mensaje-${tipo}`;
  msg.innerHTML = `
    <span>${texto}</span>
    <button class="btn-cerrar-msg">&times;</button>
  `;

  msg.querySelector('.btn-cerrar-msg').addEventListener('click', () => msg.remove());

  contenedor.appendChild(msg);

  // Auto eliminar mensaje a los 6 segundos
  setTimeout(() => {
    if (msg.parentNode) msg.remove();
  }, 6000);
}

// Inicialización de la aplicación al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  if (typeof inicializarSeleccion === 'function') inicializarSeleccion();
  if (typeof inicializarCatalogo === 'function') inicializarCatalogo();
  if (typeof inicializarFormulario === 'function') inicializarFormulario();
  if (typeof inicializarGenerador === 'function') inicializarGenerador();
  if (typeof inicializarPreferencias === 'function') inicializarPreferencias();
  if (typeof inicializarRejilla === 'function') inicializarRejilla();

  mostrarMensajeGlobal('Aplicación inicializada correctamente.', 'exito');
});