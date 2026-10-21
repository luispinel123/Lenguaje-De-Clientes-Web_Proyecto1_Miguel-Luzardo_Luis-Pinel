/**
 * Evalúa si dos sesiones chocan.
 */
function evaluarChoqueSesiones(sesionA, sesionB) {
  if (sesionA.dia !== sesionB.dia) return false;

  const rangoA = obtenerRangoHorasBloques(sesionA.bloques);
  const rangoB = obtenerRangoHorasBloques(sesionB.bloques);

  return haySolapamiento(rangoA.inicio, rangoA.fin, rangoB.inicio, rangoB.fin);
}

/**
 * Evalúa si dos secciones de distintas materias chocan en al menos una de sus sesiones.
 */
function evaluarChoqueSecciones(seccionA, seccionB) {
  for (const sesA of seccionA.horario) {
    for (const sesB of seccionB.horario) {
      if (evaluarChoqueSesiones(sesA, sesB)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Detecta pares de materias en la selección actual donde TODAS las secciones de una
 * chocan con TODAS las secciones de la otra.
 * @returns {Array<{materia1: string, materia2: string}>} Par de códigos incompatibles
 */
function detectarMateriasIncompatibles() {
  const incompatibilidades = [];

  for (let i = 0; i < seleccion.length; i++) {
    for (let j = i + 1; j < seleccion.length; j++) {
      const matA = buscarMateriaPorCodigo(seleccion[i].codigo);
      const matB = buscarMateriaPorCodigo(seleccion[j].codigo);

      if (!matA || !matB) continue;

      // Obtener secciones disponibles filtrando excluidas
      const secsA = matA.secciones.filter(s => !seleccion[i].seccionesExcluidas.includes(s.id));
      const secsB = matB.secciones.filter(s => !seleccion[j].seccionesExcluidas.includes(s.id));

      let todasChocan = true;

      for (const sA of secsA) {
        for (const sB of secsB) {
          if (!evaluarChoqueSecciones(sA, sB)) {
            todasChocan = false;
            break;
          }
        }
        if (!todasChocan) break;
      }

      if (todasChocan && secsA.length > 0 && secsB.length > 0) {
        incompatibilidades.push({
          materia1: matA.nombre,
          materia2: matB.nombre
        });
      }
    }
  }

  return incompatibilidades;
}

/**
 * Muestra las incompatibilidades detectadas en el contenedor asignado en el DOM.
 */
function evaluarIncompatibilidades() {
  const contenedor = document.getElementById('contenedor-choques');
  if (!contenedor) return;

  const incompatibles = detectarMateriasIncompatibles();
  contenedor.innerHTML = '';

  if (incompatibles.length > 0) {
    let html = '<div class="alerta-choque"><strong>Incompatibilidades detectadas:</strong><ul>';
    incompatibles.forEach(inc => {
      html += `<li>Todas las secciones de <strong>${inc.materia1}</strong> chocan con <strong>${inc.materia2}</strong>.</li>`;
    });
    html += '</ul></div>';
    contenedor.innerHTML = html;
  }
}