// Algoritmo de Generación de Combinaciones Válidas con Descarte Temprano (Backtracking)

const LIMITE_MAXIMO_COMBINACIONES = 1000;
let combinacionesGeneradas = [];

function inicializarGenerador() {
  document.getElementById('btn-generar-horarios').addEventListener('click', generarHorarios);
}

function generarHorarios() {
  if (seleccion.length === 0) {
    mostrarMensajeGlobal('Debes seleccionar al menos una materia para generar horarios.', 'aviso');
    return;
  }

  // Estructurar lista de materias con sus secciones elegibles
  const listaMateriasElegibles = seleccion.map(sel => {
    const materia = buscarMateriaPorCodigo(sel.codigo);
    let secciones = materia.secciones;

    if (sel.seccionesFijadas.length > 0) {
      secciones = secciones.filter(s => sel.seccionesFijadas.includes(s.id));
    } else if (sel.seccionesExcluidas.length > 0) {
      secciones = secciones.filter(s => !sel.seccionesExcluidas.includes(s.id));
    }

    return {
      codigo: materia.codigo,
      nombre: materia.nombre,
      uc: materia.uc,
      secciones: secciones
    };
  });

  // Verificar si alguna materia quedó sin secciones elegibles
  const materiaSinSeccion = listaMateriasElegibles.find(m => m.secciones.length === 0);
  if (materiaSinSeccion) {
    mostrarMensajeGlobal(`La materia ${materiaSinSeccion.nombre} no tiene secciones válidas con los filtros de fijar/excluir.`, 'error');
    invalidarResultados();
    return;
  }

  combinacionesGeneradas = [];
  
  // Algoritmo recursivo con backtracking
  buscarCombinacionesRecursivo(listaMateriasElegibles, 0, []);

  if (combinacionesGeneradas.length === 0) {
    evaluarIncompatibilidades();
    mostrarMensajeGlobal('No se encontró ninguna combinación válida sin choques de horario.', 'aviso');
    invalidarResultados();
  } else {
    mostrarMensajeGlobal(`Se generaron ${combinacionesGeneradas.length} combinaciones válidas.`, 'exito');
    if (typeof procesarYRenderizarResultados === 'function') {
      procesarYRenderizarResultados(combinacionesGeneradas);
    }
  }
}

function buscarCombinacionesRecursivo(materias, indexMateria, combinacionParcial) {
  if (combinacionesGeneradas.length >= LIMITE_MAXIMO_COMBINACIONES) {
    return;
  }

  if (indexMateria === materias.length) {
    combinacionesGeneradas.push([...combinacionParcial]);
    return;
  }

  const materiaActual = materias[indexMateria];

  for (const seccion of materiaActual.secciones) {
    // Validar choque contra la combinación parcial construida hasta el momento
    let hayChoque = false;

    for (const itemParcial of combinacionParcial) {
      if (evaluarChoqueSecciones(itemParcial.seccion, seccion)) {
        hayChoque = true;
        break; // Descarte temprano (Backtracking)
      }
    }

    if (!hayChoque) {
      combinacionParcial.push({
        codigo: materiaActual.codigo,
        nombre: materiaActual.nombre,
        uc: materiaActual.uc,
        seccion: seccion
      });

      buscarCombinacionesRecursivo(materias, indexMateria + 1, combinacionParcial);

      combinacionParcial.pop(); // Revertir paso
    }
  }
}

function invalidarResultados() {
  combinacionesGeneradas = [];
  document.getElementById('contador-resultados').textContent = 'Cualquier cambio en la selección requiere volver a generar.';
  const contenedor = document.getElementById('rejilla-semanal');
  if (contenedor) contenedor.innerHTML = '';
  const metricas = document.getElementById('metricas-resultado');
  if (metricas) metricas.innerHTML = '';
  document.getElementById('posicion-resultado').textContent = 'Opción 0 de 0';
}