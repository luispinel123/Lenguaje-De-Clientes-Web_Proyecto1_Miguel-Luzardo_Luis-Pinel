// Gestión de datos (Catálogo provisto + Materias Manuales)

let materiasManuales = [];

/**
 * Obtiene todas las materias combinando las del catálogo provisto y las manuales.
 * @returns {Array} Lista completa de materias
 */
function obtenerTodasLasMaterias() {
  const baseMaterias = typeof MATERIAS !== 'undefined' ? MATERIAS : [];
  return [...baseMaterias, ...materiasManuales];
}

/**
 * Busca una materia por su código en la lista unificada.
 * @param {string} codigo 
 * @returns {Object|null}
 */
function buscarMateriaPorCodigo(codigo) {
  return obtenerTodasLasMaterias().find(m => m.codigo === codigo) || null;
}

/**
 * Agrega una materia manual a la colección en memoria.
 * @param {Object} nuevaMateria 
 */
function agregarMateriaManual(nuevaMateria) {
  nuevaMateria.esManual = true;
  materiasManuales.push(nuevaMateria);
}

/**
 * Modifica una materia manual existente.
 * @param {string} codigo 
 * @param {Object} datosActualizados 
 */
function actualizarMateriaManual(codigo, datosActualizados) {
  const index = materiasManuales.findIndex(m => m.codigo === codigo);
  if (index !== -1) {
    materiasManuales[index] = { ...datosActualizados, esManual: true };
  }
}

/**
 * Elimina una materia manual de la colección en memoria.
 * @param {string} codigo 
 */
function eliminarMateriaManual(codigo) {
  materiasManuales = materiasManuales.filter(m => m.codigo !== codigo);
  // Remueve de la selección si estaba seleccionada
  if (typeof removerMateriaDeSeleccion === 'function') {
    removerMateriaDeSeleccion(codigo);
  }
}

/**
 * Obtiene la lista única de trimestres disponibles en todas las materias.
 * @returns {Array<number>} Trimestres ordenados de forma ascendente
 */
function obtenerTrimestresDisponibles() {
  const trimestres = new Set(obtenerTodasLasMaterias().map(m => m.trimestre));
  return Array.from(trimestres).sort((a, b) => a - b);
}