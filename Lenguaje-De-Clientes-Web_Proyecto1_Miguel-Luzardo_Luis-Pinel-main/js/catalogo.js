// Renderizado, filtrado y vista en detalle del Catálogo de Materias

function inicializarCatalogo() {
  poblarSelectTrimestres();
  renderizarCatalogo();

  document.getElementById('busqueda-materia').addEventListener('input', renderizarCatalogo);
  document.getElementById('filtro-trimestre').addEventListener('change', renderizarCatalogo);
  document.getElementById('btn-agregar-trimestre').addEventListener('click', manejarAgregarTrimestre);
  document.getElementById('btn-cerrar-detalle').addEventListener('click', cerrarModalDetalle);
}

function poblarSelectTrimestres() {
  const select = document.getElementById('filtro-trimestre');
  select.innerHTML = '<option value="">Todos los trimestres</option>';
  
  obtenerTrimestresDisponibles().forEach(tr => {
    const option = document.createElement('option');
    option.value = tr;
    option.textContent = `Trimestre ${tr}`;
    select.appendChild(option);
  });
}

function renderizarCatalogo() {
  const textoBusqueda = document.getElementById('busqueda-materia').value.toLowerCase().trim();
  const trimestreFiltro = document.getElementById('filtro-trimestre').value;
  const contenedor = document.getElementById('lista-materias');
  contenedor.innerHTML = '';

  const materias = obtenerTodasLasMaterias().filter(m => {
    const coincideTexto = m.nombre.toLowerCase().includes(textoBusqueda) || m.codigo.toLowerCase().includes(textoBusqueda);
    const coincideTrimestre = trimestreFiltro === '' || m.trimestre == trimestreFiltro;
    return coincideTexto && coincideTrimestre;
  });

  if (materias.length === 0) {
    contenedor.innerHTML = '<p class="estado-vacio">No se encontraron materias que coincidan con los criterios.</p>';
    return;
  }

  materias.forEach(m => {
    const card = document.createElement('div');
    card.className = `tarjeta-materia ${m.esManual ? 'materia-manual' : ''}`;
    
    card.innerHTML = `
      <div class="header-tarjeta">
        <h3>${m.nombre} (${m.codigo})</h3>
        ${m.esManual ? '<span class="tag-manual">Manual</span>' : ''}
      </div>
      <p>Trimestre: ${m.trimestre} | UC: ${m.uc} | Secciones: ${m.secciones.length}</p>
      <div class="acciones-tarjeta">
        <button class="btn-detalle" data-codigo="${m.codigo}">Ver Detalle</button>
        <button class="btn-agregar-sel" data-codigo="${m.codigo}">Agregar a Selección</button>
        ${m.esManual ? `
          <button class="btn-editar-manual" data-codigo="${m.codigo}">Editar</button>
          <button class="btn-eliminar-manual" data-codigo="${m.codigo}">Eliminar</button>
        ` : ''}
      </div>
    `;

    card.querySelector('.btn-detalle').addEventListener('click', () => abrirModalDetalle(m.codigo));
    card.querySelector('.btn-agregar-sel').addEventListener('click', () => {
      const resp = agregarMateriaASeleccion(m.codigo);
      if (!resp.exito) mostrarMensajeGlobal(resp.mensaje, 'error');
    });

    if (m.esManual) {
      card.querySelector('.btn-editar-manual').addEventListener('click', () => cargarMateriaEnFormulario(m.codigo));
      card.querySelector('.btn-eliminar-manual').addEventListener('click', () => {
        eliminarMateriaManual(m.codigo);
        poblarSelectTrimestres();
        renderizarCatalogo();
        mostrarMensajeGlobal(`Materia manual ${m.codigo} eliminada.`, 'exito');
      });
    }

    contenedor.appendChild(card);
  });
}

function abrirModalDetalle(codigo) {
  const materia = buscarMateriaPorCodigo(codigo);
  if (!materia) return;

  const contenido = document.getElementById('contenido-detalle-materia');
  let seccionesHTML = materia.secciones.map(sec => {
    let horarioHTML = sec.horario.map(sesion => {
      const rango = obtenerRangoHorasBloques(sesion.bloques);
      return `<li><strong>${sesion.dia}:</strong> ${rango.inicio} - ${rango.fin} (Aula: ${sesion.aula})</li>`;
    }).join('');

    return `
      <div class="item-seccion-detalle">
        <h4>Sección: ${sec.id} - Prof. ${sec.profesor}</h4>
        <ul>${horarioHTML}</ul>
      </div>
    `;
  }).join('');

  contenido.innerHTML = `
    <h2>${materia.nombre} (${materia.codigo})</h2>
    <p>Trimestre: ${materia.trimestre} | UC: ${materia.uc}</p>
    <hr>
    <h3>Secciones Ofertadas</h3>
    ${seccionesHTML}
  `;

  const modal = document.getElementById('modal-detalle-materia');
  if (typeof modal.showModal === 'function') {
    modal.showModal();
  } else {
    modal.setAttribute('open', 'true');
  }
}

function cerrarModalDetalle() {
  const modal = document.getElementById('modal-detalle-materia');
  if (typeof modal.close === 'function') {
    modal.close();
  } else {
    modal.removeAttribute('open');
  }
}

function manejarAgregarTrimestre() {
  const trimestreVal = document.getElementById('filtro-trimestre').value;
  if (!trimestreVal) {
    mostrarMensajeGlobal('Por favor selecciona un trimestre del filtro.', 'aviso');
    return;
  }

  const materiasTrimestre = obtenerTodasLasMaterias().filter(m => m.trimestre == trimestreVal);
  const result = agregarTrimestreCompleto(materiasTrimestre);
  
  if (!result.exito) {
    mostrarMensajeGlobal(result.mensaje, 'error');
  } else {
    mostrarMensajeGlobal(result.mensaje, 'exito');
  }
}