// Vista de Horario Definitivo, Tabla de Detalles y Versión Imprimible

function renderizarResumenDefinitivo(combinacion) {
  const contenedorRejillaResumen = document.getElementById('rejilla-resumen');
  const tbody = document.getElementById('cuerpo-tabla-resumen');
  const totalUcDiv = document.getElementById('resumen-total-uc');

  contenedorRejillaResumen.innerHTML = '';
  tbody.innerHTML = '';

  // 1. Renderizar Rejilla Estática de Resumen
  construirEstructuraGrid(contenedorRejillaResumen, combinacion);

  // 2. Renderizar Tabla de Materias Definitiva
  let totalUC = 0;

  combinacion.forEach(item => {
    totalUC += item.uc;

    const tr = document.createElement('tr');
    
    let descripcionHorario = item.seccion.horario.map(s => {
      const rango = obtenerRangoHorasBloques(s.bloques);
      return `${s.dia} ${rango.inicio}-${rango.fin} (${s.aula})`;
    }).join(', ');

    tr.innerHTML = `
      <td>${item.codigo}</td>
      <td>${item.nombre}</td>
      <td>${item.seccion.id}</td>
      <td>${item.seccion.profesor}</td>
      <td>${descripcionHorario}</td>
      <td>${item.seccion.horario.map(s => s.aula).join('/ ')}</td>
    `;

    tbody.appendChild(tr);
  });

  totalUcDiv.innerHTML = `<h3>Total de Unidades de Crédito: ${totalUC} UC</h3>`;
}