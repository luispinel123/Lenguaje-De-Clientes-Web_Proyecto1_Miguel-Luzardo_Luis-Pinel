// Conversión y comparación de horas y bloques

/**
 * Convierte un string de hora 'HH:MM' a minutos desde la medianoche.
 * @param {string} horaStr - Hora en formato 'HH:MM'
 * @returns {number} Minutos transcurridos
 */
function horaAMinutos(horaStr) {
  if (!horaStr) return 0;
  const [horas, minutos] = horaStr.split(':').map(Number);
  return horas * 60 + minutos;
}

/**
 * Convierte minutos desde la medianoche a string 'HH:MM'.
 * @param {number} minutos - Minutos totales
 * @returns {string} Hora en formato 'HH:MM'
 */
function minutosAHora(minutos) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Determina si dos intervalos [inicio1, fin1) e [inicio2, fin2) se solapan.
 * La coincidencia exacta en el borde (fin1 === inicio2) NO se considera choque.
 */
function haySolapamiento(inicio1, fin1, inicio2, fin2) {
  const minIni1 = horaAMinutos(inicio1);
  const minFin1 = horaAMinutos(fin1);
  const minIni2 = horaAMinutos(inicio2);
  const minFin2 = horaAMinutos(fin2);

  return Math.max(minIni1, minIni2) < Math.min(minFin1, minFin2);
}

/**
 * Dado un listado de IDs de bloques, calcula la hora de inicio (mínima) y fin (máxima).
 * @param {Array<string>} idsBloques 
 * @returns {{inicio: string, fin: string}}
 */
function obtenerRangoHorasBloques(idsBloques) {
  let minInicio = Infinity;
  let maxFin = -Infinity;

  idsBloques.forEach(id => {
    const bloque = BLOQUES.find(b => b.id === id);
    if (bloque) {
      const ini = horaAMinutos(bloque.inicio);
      const fin = horaAMinutos(bloque.fin);
      if (ini < minInicio) minInicio = ini;
      if (fin > maxFin) maxFin = fin;
    }
  });

  return {
    inicio: minutosAHora(minInicio === Infinity ? 0 : minInicio),
    fin: minutosAHora(maxFin === -Infinity ? 0 : maxFin)
  };
}