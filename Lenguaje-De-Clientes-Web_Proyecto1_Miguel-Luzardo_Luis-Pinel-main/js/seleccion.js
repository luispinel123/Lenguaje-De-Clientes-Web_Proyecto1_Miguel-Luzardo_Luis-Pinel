// Gestión de la Selección de Materias, límites de UC, Fijado y Exclusión de Secciones

let topeUC = 28;
let seleccion = []; // [{ codigo: string, seccionesFijadas: [id], seccionesExcluidas: [id] }]

function inicializarSeleccion() {
  const inputTope = document.getElementById('tope-uc');
  inputTope.value = topeUC;
  
  inputTope.addEventListener('change', (e) => {
    const nuevoTope = parseInt(e.target.value, 10);
    const ucActuales = calcularTotalUCSeleccion();

    if (isNaN(nuevoTope) || nuevoTope < 1) {
      mostrarMensajeGlobal('El tope de UC debe ser un número entero positivo.', 'error');
      e.target.value = topeUC;
      return;
    }

    if (nuevoTope < ucActuales) {
      mostrarMensajeGlobal(`No se puede reducir el tope a ${nuevoTope} UC porque la selección actual suma ${ucActuales} UC.`, 'error');
      e.target.value = topeUC;
      return;
    }

    topeUC = nuevoTope;
    mostrarMensajeGlobal(`Tope de UC actualizado a ${topeUC}.`, 'exito');
  });
}

function calcularTotalUCSeleccion() {
  return seleccion.reduce((total, sel) => {
    const m = buscarMateriaPorCodigo(sel.codigo);
    return total + (m ? m.uc : 0);
  }, 0);
}

function agregarMateriaASeleccion(codigo) {
  if (seleccion.some(s => s.codigo === codigo)) {
    return { exito: false, mensaje: 'La materia ya está seleccionada.' };
  }

  const materia = buscarMateriaPorCodigo(codigo);
  if (!materia) return { exito: false, mensaje: 'Materia no encontrada.' };

  const totalActualUC = calcularTotalUCSeleccion();
  if (totalActualUC + materia.uc > topeUC) {
    return { 
      exito: false, 
      mensaje: `No se puede agregar ${materia.codigo}. Supera el tope de ${topeUC} UC (Excedería por ${ (totalActualUC + materia.uc) - topeUC } UC).` 
    };
  }

  seleccion.push({
    codigo: codigo,
    seccionesFijadas: [],
    seccionesExcluidas: []
  });

  notificarCambioSeleccion();
  return { exito: true };
}

function agregarTrimestreCompleto(materiasTrimestre) {
  const noSeleccionadas = materiasTrimestre.filter(m => !seleccion.some(s => s.codigo === m.codigo));
  const ucAdicionales = noSeleccionadas.reduce((sum, m) => sum + m.uc, 0);
  const totalActual = calcularTotalUCSeleccion();

  if (totalActual + ucAdicionales > topeUC) {
    const exceso = (totalActual + ucAdicionales) - topeUC;
    return {
      exito: false,
      mensaje: `No se agregaron las materias del trimestre. Se superaría el tope de ${topeUC} UC por ${exceso} UC.`
    };
  }

  noSeleccionadas.forEach(m => {
    seleccion.push({
      codigo: m.codigo,
      seccionesFijadas: [],
      seccionesExcluidas: []
    });
  });

  notificarCambioSeleccion();
  return { exito: true, mensaje: `Se agregaron ${noSeleccionadas.length} materias del trimestre a la selección.` };
}

function removerMateriaDeSeleccion(codigo) {
  seleccion = seleccion.filter(s => s.codigo !== codigo);
  notificarCambioSeleccion();
}

function fijarSeccionMateria(codigo, idSeccion) {
  const item = seleccion.find(s => s.codigo === codigo);
  if (!item) return;

  if (item.seccionesFijadas.includes(idSeccion)) {
    item.seccionesFijadas = [];
  } else {
    item.seccionesFijadas = [idSeccion];
    item.seccionesExcluidas = item.seccionesExcluidas.filter(id => id !== idSeccion);
  }
  notificarCambioSeleccion();
}

function excluirSeccionMateria(codigo, idSeccion) {
  const item = seleccion.find(s => s.codigo === codigo);
  if (!item) return;

  const materia = buscarMateriaPorCodigo(codigo);
  if (!materia) return;

  if (item.seccionesExcluidas.includes(idSeccion)) {
    item.seccionesExcluidas = item.seccionesExcluidas.filter(id => id !== idSeccion);
  } else {
    if (item.seccionesExcluidas.length + 1 >= materia.secciones.length) {
      mostrarMensajeGlobal('No puedes excluir todas las secciones de una materia seleccionada.', 'error');
      return;
    }
    item.seccionesExcluidas.push(idSeccion);
    item.seccionesFijadas = item.seccionesFijadas.filter(id => id !== idSeccion);
  }
  notificarCambioSeleccion();
}

function notificarCambioSeleccion() {
  renderizarSeleccion();
  if (typeof evaluarIncompatibilidades === 'function') {
    evaluarIncompatibilidades();
  }
  if (typeof invalidarResultados === 'function') {
    invalidarResultados();
  }
}

function renderizarSeleccion() {
  document.getElementById('total-materias').textContent = `Materias: ${seleccion.length}`;
  document.getElementById('total-uc').textContent = `Total UC: ${calcularTotalUCSeleccion()}`;

  const contenedor = document.getElementById('lista-seleccionadas');
  contenedor.innerHTML = '';

  if (seleccion.length === 0) {
    contenedor.innerHTML = '<p class="estado-vacio">No has seleccionado ninguna materia.</p>';
    return;
  }

  seleccion.forEach(item => {
    const materia = buscarMateriaPorCodigo(item.codigo);
    if (!materia) return;

    const div = document.createElement('div');
    div.className = 'item-materia-seleccionada';

    let htmlSecciones = materia.secciones.map(sec => {
      const estaFijada = item.seccionesFijadas.includes(sec.id);
      const estaExcluida = item.seccionesExcluidas.includes(sec.id);

      return `
        <div class="control-seccion">
          <span>Sección ${sec.id} (${sec.profesor})</span>
          <button class="btn-fijar ${estaFijada ? 'activo' : ''}" data-codigo="${materia.codigo}" data-sec="${sec.id}">
            ${estaFijada ? 'Fijada' : 'Fijar'}
          </button>
          <button class="btn-excluir ${estaExcluida ? 'activo' : ''}" data-codigo="${materia.codigo}" data-sec="${sec.id}">
            ${estaExcluida ? 'Excluida' : 'Excluir'}
          </button>
        </div>
      `;
    }).join('');

    div.innerHTML = `
      <div class="encabezado-seleccionada">
        <strong>${materia.nombre} (${materia.codigo})</strong> - UC: ${materia.uc}
        <button class="btn-quitar-sel" data-codigo="${materia.codigo}">Quitar</button>
      </div>
      <div class="lista-controles-secciones">${htmlSecciones}</div>
    `;

    div.querySelector('.btn-quitar-sel').addEventListener('click', () => removerMateriaDeSeleccion(materia.codigo));
    
    div.querySelectorAll('.btn-fijar').forEach(btn => {
      btn.addEventListener('click', (e) => {
        fijarSeccionMateria(e.target.dataset.codigo, e.target.dataset.sec);
      });
    });

    div.querySelectorAll('.btn-excluir').forEach(btn => {
      btn.addEventListener('click', (e) => {
        excluirSeccionMateria(e.target.dataset.codigo, e.target.dataset.sec);
      });
    });

    contenedor.appendChild(div);
  });
}