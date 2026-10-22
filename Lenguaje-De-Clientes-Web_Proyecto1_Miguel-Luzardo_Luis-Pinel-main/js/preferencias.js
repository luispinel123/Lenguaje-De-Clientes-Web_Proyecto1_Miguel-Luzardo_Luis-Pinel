// Filtros de Preferencias y Criterios de Ordenamiento de Resultados

let resultadosFiltradosYOrdenados = [];

function inicializarPreferencias() {
  document.querySelectorAll('input[name="dia-libre"]').forEach(chk => chk.addEventListener('change', actualizarResultadosVista));
  document.getElementById('hora-min-entrada').addEventListener('input', actualizarResultadosVista);
  document.getElementById('hora-max-salida').addEventListener('input', actualizarResultadosVista);
  document.getElementById('criterio-orden').addEventListener('change', actualizarResultadosVista);
}

function procesarYRenderizarResultados(listaCombinaciones) {
  actualizarResultadosVista();
}

function actualizarResultadosVista() {
  if (combinacionesGeneradas.length === 0) return;

  // 1. Aplicar Filtros
  const diasLibres = Array.from(document.querySelectorAll('input[name="dia-libre"]:checked')).map(c => c.value);
  const horaMinEntrada = document.getElementById('hora-min-entrada').value;
  const horaMaxSalida = document.getElementById('hora-max-salida').value;

  resultadosFiltradosYOrdenados = combinacionesGeneradas.filter(comb => {
    return cumplePreferencias(comb, diasLibres, horaMinEntrada, horaMaxSalida);
  });

  // 2. Aplicar Ordenamiento
  const criterio = document.getElementById('criterio-orden').value;
  ordenarResultados(resultadosFiltradosYOrdenados, criterio);

  // 3. Notificar a la Rejilla
  if (typeof establecerResultadosRejilla === 'function') {
    establecerResultadosRejilla(resultadosFiltradosYOrdenados);
  }
}

function cumplePreferencias(combinacion, diasLibres, horaMinEntrada, horaMaxSalida) {
  const minEntrada = horaMinEntrada ? horaAMinutos(horaMinEntrada) : 0;
  const maxSalida = horaMaxSalida ? horaAMinutos(horaMaxSalida) : Infinity;

  for (const item of combinacion) {
    for (const sesion of item.seccion.horario) {
      if (diasLibres.includes(sesion.dia)) {
        return false;
      }

      const rango = obtenerRangoHorasBloques(sesion.bloques);
      const iniMin = horaAMinutos(rango.inicio);
      const finMin = horaAMinutos(rango.fin);

      if (iniMin < minEntrada) return false;
      if (finMin > maxSalida) return false;
    }
  }

  return true;
}

function calcularMetricasCombinacion(combinacion) {
  const diasConClase = new Set();
  const sesionesPorDia = {};

  combinacion.forEach(item => {
    item.seccion.horario.forEach(ses => {
      diasConClase.add(ses.dia);
      if (!sesionesPorDia[ses.dia]) sesionesPorDia[ses.dia] = [];
      const rango = obtenerRangoHorasBloques(ses.bloques);
      sesionesPorDia[ses.dia].push({
        inicio: horaAMinutos(rango.inicio),
        fin: horaAMinutos(rango.fin)
      });
    });
  });

  let totalHorasMuertasMin = 0;
  let sumaHorasSalidaMin = 0;
  let horaEntradaMasTempranaMin = Infinity;
  let horaSalidaMasTardiaMin = -Infinity;

  Object.keys(sesionesPorDia).forEach(dia => {
    const lista = sesionesPorDia[dia].sort((a, b) => a.inicio - b.inicio);

    if (lista[0].inicio < horaEntradaMasTempranaMin) horaEntradaMasTempranaMin = lista[0].inicio;
    const ultimaSalida = lista[lista.length - 1].fin;
    if (ultimaSalida > horaSalidaMasTardiaMin) horaSalidaMasTardiaMin = ultimaSalida;

    sumaHorasSalidaMin += ultimaSalida;

    for (let i = 0; i < lista.length - 1; i++) {
      const hueco = lista[i + 1].inicio - lista[i].fin;
      if (hueco > 0) totalHorasMuertasMin += hueco;
    }
  });

  const cantDias = diasConClase.size;

  return {
    diasAsistencia: cantDias,
    horasMuertasMinutos: totalHorasMuertasMin,
    promedioSalidaMinutos: cantDias > 0 ? (sumaHorasSalidaMin / cantDias) : 0,
    entradaMasTemprana: horaEntradaMasTempranaMin === Infinity ? 'N/A' : minutosAHora(horaEntradaMasTempranaMin),
    salidaMasTardia: horaSalidaMasTardiaMin === -Infinity ? 'N/A' : minutosAHora(horaSalidaMasTardiaMin)
  };
}

function ordenarResultados(resultados, criterio) {
  resultados.sort((a, b) => {
    const metA = calcularMetricasCombinacion(a);
    const metB = calcularMetricasCombinacion(b);

    if (criterio === 'dias') {
      return metA.diasAsistencia - metB.diasAsistencia;
    } else if (criterio === 'horas-muertas') {
      return metA.horasMuertasMinutos - metB.horasMuertasMinutos;
    } else if (criterio === 'salida-temprana') {
      return metA.promedioSalidaMinutos - metB.promedioSalidaMinutos;
    }
    return 0;
  });
}