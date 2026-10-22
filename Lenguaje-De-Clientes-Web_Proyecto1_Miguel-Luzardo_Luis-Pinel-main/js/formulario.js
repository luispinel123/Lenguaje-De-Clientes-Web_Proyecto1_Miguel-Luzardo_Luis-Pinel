// Registro, Edición y Validación de Materias Manuales

let modoEdicionCodigo = null;

function inicializarFormulario() {
  const form = document.getElementById('form-materia-manual');
  renderizarFormularioBase();

  form.addEventListener('submit', manejarSubmitFormulario);
}

function renderizarFormularioBase() {
  const form = document.getElementById('form-materia-manual');
  form.innerHTML = `
    <div class="campo-form">
      <label>Código:</label>
      <input type="text" id="manual-codigo" required>
      <span class="error-campo" id="error-manual-codigo"></span>
    </div>
    <div class="campo-form">
      <label>Nombre:</label>
      <input type="text" id="manual-nombre" required>
      <span class="error-campo" id="error-manual-nombre"></span>
    </div>
    <div class="campo-form">
      <label>Trimestre:</label>
      <input type="number" id="manual-trimestre" min="1" required>
      <span class="error-campo" id="error-manual-trimestre"></span>
    </div>
    <div class="campo-form">
      <label>Unidades de Crédito (1-5):</label>
      <input type="number" id="manual-uc" min="1" max="5" required>
      <span class="error-campo" id="error-manual-uc"></span>
    </div>

    <hr>
    <h3>Secciones</h3>
    <div id="contenedor-secciones-manuales"></div>
    <button type="button" id="btn-agregar-seccion-form">＋ Agregar Sección</button>
    <br><br>
    <button type="submit" id="btn-guardar-manual">Guardar Materia Manual</button>
    <button type="button" id="btn-cancelar-manual" style="display:none;">Cancelar Edición</button>
  `;

  document.getElementById('btn-agregar-seccion-form').addEventListener('click', () => agregarEstructuraSeccionForm());
  document.getElementById('btn-cancelar-manual').addEventListener('click', resetearFormularioManual);

  // Agregar al menos una sección por defecto
  agregarEstructuraSeccionForm();
}

function agregarEstructuraSeccionForm(datosSeccion = null) {
  const contenedor = document.getElementById('contenedor-secciones-manuales');
  const secIndex = contenedor.children.length;
  
  const divSec = document.createElement('div');
  divSec.className = 'bloque-seccion-form';
  divSec.dataset.index = secIndex;

  divSec.innerHTML = `
    <h4>Sección <button type="button" class="btn-eliminar-sec-form">Quitar Sección</button></h4>
    <div class="campo-form">
      <label>ID Sección (ej: 1, 2, A):</label>
      <input type="text" class="manual-sec-id" value="${datosSeccion ? datosSeccion.id : ''}" required>
    </div>
    <div class="campo-form">
      <label>Profesor:</label>
      <input type="text" class="manual-sec-profesor" value="${datosSeccion ? datosSeccion.profesor : ''}" required>
    </div>
    <h5>Sesiones</h5>
    <div class="contenedor-sesiones-form"></div>
    <button type="button" class="btn-agregar-sesion-form">＋ Agregar Sesión</button>
  `;

  divSec.querySelector('.btn-eliminar-sec-form').addEventListener('click', () => {
    if (contenedor.children.length <= 1) {
      mostrarMensajeGlobal('La materia debe tener al menos una sección.', 'error');
      return;
    }
    divSec.remove();
  });

  const btnAddSesion = divSec.querySelector('.btn-agregar-sesion-form');
  const contSesiones = divSec.querySelector('.contenedor-sesiones-form');

  btnAddSesion.addEventListener('click', () => agregarEstructuraSesionForm(contSesiones));

  if (datosSeccion && datosSeccion.horario) {
    datosSeccion.horario.forEach(ses => agregarEstructuraSesionForm(contSesiones, ses));
  } else {
    agregarEstructuraSesionForm(contSesiones);
  }

  contenedor.appendChild(divSec);
}

function agregarEstructuraSesionForm(contenedorSesiones, datosSesion = null) {
  const divSes = document.createElement('div');
  divSes.className = 'bloque-sesion-form';

  const opcionesDias = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
  const selectDiasHTML = opcionesDias.map(d => `
    <option value="${d}" ${datosSesion && datosSesion.dia === d ? 'selected' : ''}>${d}</option>
  `).join('');

  const opcionesBloquesHTML = BLOQUES.map(b => `
    <option value="${b.id}" ${datosSesion && datosSesion.bloques.includes(b.id) ? 'selected' : ''}>
      ${b.id} (${b.tipo} | ${b.inicio} - ${b.fin})
    </option>
  `).join('');

  divSes.innerHTML = `
    <div class="campo-form">
      <label>Día:</label>
      <select class="manual-sesion-dia">${selectDiasHTML}</select>
    </div>
    <div class="campo-form">
      <label>Bloques (Mantén Ctrl/Cmd para seleccionar consecutivos):</label>
      <select class="manual-sesion-bloques" multiple required size="4">${opcionesBloquesHTML}</select>
    </div>
    <div class="campo-form">
      <label>Aula:</label>
      <input type="text" class="manual-sesion-aula" value="${datosSesion ? datosSesion.aula : ''}" required>
    </div>
    <button type="button" class="btn-eliminar-sesion-form">Quitar Sesión</button>
  `;

  divSes.querySelector('.btn-eliminar-sesion-form').addEventListener('click', () => {
    if (contenedorSesiones.children.length <= 1) {
      mostrarMensajeGlobal('Cada sección debe tener al menos una sesión.', 'error');
      return;
    }
    divSes.remove();
  });

  contenedorSesiones.appendChild(divSes);
}

function manejarSubmitFormulario(e) {
  e.preventDefault();
  limpiarErroresFormulario();

  const codigo = document.getElementById('manual-codigo').value.trim().toUpperCase();
  const nombre = document.getElementById('manual-nombre').value.trim();
  const trimestre = parseInt(document.getElementById('manual-trimestre').value, 10);
  const uc = parseInt(document.getElementById('manual-uc').value, 10);

  let esValido = true;

  if (!codigo) { mostrarErrorCampo('manual-codigo', 'El código es requerido'); esValido = false; }
  else {
    const existe = buscarMateriaPorCodigo(codigo);
    if (existe && modoEdicionCodigo !== codigo) {
      mostrarErrorCampo('manual-codigo', 'Este código ya existe en el catálogo o materias manuales.');
      esValido = false;
    }
  }

  if (!nombre) { mostrarErrorCampo('manual-nombre', 'El nombre es requerido'); esValido = false; }
  if (isNaN(trimestre) || trimestre < 1) { mostrarErrorCampo('manual-trimestre', 'Trimestre inválido'); esValido = false; }
  if (isNaN(uc) || uc < 1 || uc > 5) { mostrarErrorCampo('manual-uc', 'Las UC deben estar entre 1 y 5'); esValido = false; }

  // Recolectar Secciones
  const bloquesSeccion = document.querySelectorAll('.bloque-seccion-form');
  if (bloquesSeccion.length === 0) {
    mostrarMensajeGlobal('Debe agregar al menos una sección.', 'error');
    return;
  }

  const seccionesList = [];
  const idsSeccionesVistos = new Set();

  bloquesSeccion.forEach((secElem, idx) => {
    const secId = secElem.querySelector('.manual-sec-id').value.trim();
    const profesor = secElem.querySelector('.manual-sec-profesor').value.trim();

    if (!secId) { mostrarMensajeGlobal(`ID de sección requerido en sección #${idx + 1}`, 'error'); esValido = false; }
    if (idsSeccionesVistos.has(secId)) { mostrarMensajeGlobal(`ID de sección "${secId}" duplicado en esta materia.`, 'error'); esValido = false; }
    idsSeccionesVistos.add(secId);

    const bloquesSesion = secElem.querySelectorAll('.bloque-sesion-form');
    const horarioList = [];

    bloquesSesion.forEach(sesElem => {
      const dia = sesElem.querySelector('.manual-sesion-dia').value;
      const aula = sesElem.querySelector('.manual-sesion-aula').value.trim();
      const selectBloques = sesElem.querySelector('.manual-sesion-bloques');
      const bloquesSeleccionados = Array.from(selectBloques.selectedOptions).map(opt => opt.value);

      if (bloquesSeleccionados.length === 0) {
        mostrarMensajeGlobal(`Debes seleccionar al menos un bloque para la sesión en ${dia}.`, 'error');
        esValido = false;
        return;
      }

      // Validar que los bloques sean consecutivos y del mismo tipo
      if (!validarBloquesSesion(bloquesSeleccionados)) {
        mostrarMensajeGlobal(`Los bloques seleccionados para ${dia} deben ser consecutivos y del mismo tipo.`, 'error');
        esValido = false;
        return;
      }

      horarioList.push({ dia, bloques: bloquesSeleccionados, aula });
    });

    // Validar que las sesiones de una misma sección no choquen entre sí
    if (!validarNoChoqueInternoSeccion(horarioList)) {
      mostrarMensajeGlobal(`Las sesiones de la sección "${secId}" chocan entre sí.`, 'error');
      esValido = false;
    }

    seccionesList.push({ id: secId, profesor, horario: horarioList });
  });

  if (!esValido) return;

  const nuevaMateria = { codigo, nombre, trimestre, uc, secciones: seccionesList };

  if (modoEdicionCodigo) {
    actualizarMateriaManual(modoEdicionCodigo, nuevaMateria);
    mostrarMensajeGlobal(`Materia ${codigo} actualizada con éxito.`, 'exito');
  } else {
    agregarMateriaManual(nuevaMateria);
    mostrarMensajeGlobal(`Materia manual ${codigo} registrada con éxito.`, 'exito');
  }

  resetearFormularioManual();
  if (typeof poblarSelectTrimestres === 'function') poblarSelectTrimestres();
  if (typeof renderizarCatalogo === 'function') renderizarCatalogo();
}

function validarBloquesSesion(idsBloques) {
  const objetosBloques = idsBloques.map(id => BLOQUES.find(b => b.id === id)).filter(Boolean);
  if (objetosBloques.length !== idsBloques.length) return false;

  const tipoBase = objetosBloques[0].tipo;
  if (!objetosBloques.every(b => b.tipo === tipoBase)) return false;

  const ordenados = [...objetosBloques].sort((a, b) => horaAMinutos(a.inicio) - horaAMinutos(b.inicio));

  for (let i = 0; i < ordenados.length - 1; i++) {
    if (horaAMinutos(ordenados[i].fin) !== horaAMinutos(ordenados[i + 1].inicio)) {
      return false;
    }
  }

  return true;
}

function validarNoChoqueInternoSeccion(horario) {
  for (let i = 0; i < horario.length; i++) {
    for (let j = i + 1; j < horario.length; j++) {
      if (horario[i].dia === horario[j].dia) {
        const rangoI = obtenerRangoHorasBloques(horario[i].bloques);
        const rangoJ = obtenerRangoHorasBloques(horario[j].bloques);
        if (haySolapamiento(rangoI.inicio, rangoI.fin, rangoJ.inicio, rangoJ.fin)) {
          return false;
        }
      }
    }
  }
  return true;
}

function mostrarErrorCampo(idCampo, msj) {
  const elem = document.getElementById(`error-${idCampo}`);
  if (elem) elem.textContent = msj;
}

function limpiarErroresFormulario() {
  document.querySelectorAll('.error-campo').forEach(e => e.textContent = '');
}

function cargarMateriaEnFormulario(codigo) {
  const materia = buscarMateriaPorCodigo(codigo);
  if (!materia || !materia.esManual) return;

  modoEdicionCodigo = codigo;
  document.getElementById('manual-codigo').value = materia.codigo;
  document.getElementById('manual-nombre').value = materia.nombre;
  document.getElementById('manual-trimestre').value = materia.trimestre;
  document.getElementById('manual-uc').value = materia.uc;

  const contenedorSecs = document.getElementById('contenedor-secciones-manuales');
  contenedorSecs.innerHTML = '';

  materia.secciones.forEach(sec => agregarEstructuraSeccionForm(sec));

  document.getElementById('btn-cancelar-manual').style.display = 'inline-block';
  document.getElementById('btn-guardar-manual').textContent = 'Actualizar Materia';
}

function resetearFormularioManual() {
  modoEdicionCodigo = null;
  document.getElementById('form-materia-manual').reset();
  limpiarErroresFormulario();
  document.getElementById('contenedor-secciones-manuales').innerHTML = '';
  agregarEstructuraSeccionForm();
  document.getElementById('btn-cancelar-manual').style.display = 'none';
  document.getElementById('btn-guardar-manual').textContent = 'Guardar Materia Manual';
}