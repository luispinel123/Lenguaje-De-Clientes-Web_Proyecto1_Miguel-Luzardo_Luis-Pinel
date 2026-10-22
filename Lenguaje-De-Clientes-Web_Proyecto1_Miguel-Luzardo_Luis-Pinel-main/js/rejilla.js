// Renderizado y Navegación de la Rejilla Semanal con CSS Grid

let resultadosActuales = [];
let indiceResultadoActual = 0;
const paletaColores = ['#4A90E2', '#50E3C2', '#F5A623', '#BD10E0', '#7ED321', '#E67E22', '#9B59B6', '#1ABC9C'];
const mapaColoresMaterias = {};

function inicializarRejilla() {
  document.getElementById('btn-anterior-resultado').addEventListener('click', () => navegarResultado(-1));
  document.getElementById('btn-siguiente-resultado').addEventListener('click', () => navegarResultado(1));
  document.getElementById('btn-elegir-definitivo').addEventListener('click', fijarHorarioDefinitivo);
}

function asignarColorAMateria(codigo) {
  if (!mapaColoresMaterias[codigo]) {
    const index = Object.keys(mapaColoresMaterias).length % paletaColores.length;
    mapaColoresMaterias[codigo] = paletaColores[index];
  }
  return mapaColoresMaterias[codigo];
}

function establecerResultadosRejilla(resultados) {
  resultadosActuales = resultados;
  indiceResultadoActual = 0;

  const contador = document.getElementById('contador-resultados');
  contador.textContent = `Resultados mostrados: ${resultados.length} (de ${combinacionesGeneradas.length} generados)`;

  renderizarResultadoActual();
}

function navegarResultado(delta) {
  if (resultadosActuales.length === 0) return;
  
  const nuevoIndice = indiceResultadoActual + delta;
  if (nuevoIndice >= 0 && nuevoIndice < resultadosActuales.length) {
    indiceResultadoActual = nuevoIndice;
    renderizarResultadoActual();
  }
}

function renderizarResultadoActual() {
  const rejilla = document.getElementById('rejilla-semanal');
  const metricasDiv = document.getElementById('metricas-resultado');
  const posSpan = document.getElementById('posicion-resultado');

  rejilla.innerHTML = '';
  metricasDiv.innerHTML = '';

  if (resultadosActuales.length === 0) {
    posSpan.textContent = 'Opción 0 de 0';
    rejilla.innerHTML = '<p class="estado-vacio">No hay combinaciones que cumplan los filtros elegidos.</p>';
    return;
  }

  posSpan.textContent = `Opción ${indiceResultadoActual + 1} de ${resultadosActuales.length}`;

  const combActual = resultadosActuales[indiceResultadoActual];
  const metricas = calcularMetricasCombinacion(combActual);

  metricasDiv.innerHTML = `
    <span>Días con Clase: <strong>${metricas.diasAsistencia}</strong></span> | 
    <span>Horas Muertas: <strong>${(metricas.horasMuertasMinutos / 60).toFixed(1)} hrs</strong></span> | 
    <span>Entrada más Temprana: <strong>${metricas.entradaMasTemprana}</strong></span> | 
    <span>Salida más Tardía: <strong>${metricas.salidaMasTardia}</strong></span>
  `;

  construirEstructuraGrid(rejilla, combActual);
}

function construirEstructuraGrid(contenedorGrid, combinacion) {
  const dias = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
  
  // Calcular hora mínima y máxima de toda la oferta para la escala
  let horaMinGlobal = 7 * 60; // 07:00 por defecto
  let horaMaxGlobal = 22 * 60; // 22:00 por defecto

  const totalFilas = (horaMaxGlobal - horaMinGlobal) / 30; // Bloques de 30 minutos
  
  contenedorGrid.style.display = 'grid';
  contenedorGrid.style.gridTemplateColumns = '60px repeat(6, 1fr)';
  contenedorGrid.style.gridTemplateRows = `30px repeat(${totalFilas}, 25px)`;

  // Renderizar Headers Días
  contenedorGrid.appendChild(crearElemCell('Encabezado Hora', '', 1, 1));
  dias.forEach((d, idx) => {
    contenedorGrid.appendChild(crearElemCell('Encabezado Día', d, 1, idx + 2));
  });

  // Renderizar Escala de Horas (Columna 1)
  for (let i = 0; i < totalFilas; i += 2) {
    const minActual = horaMinGlobal + (i * 30);
    const cellHora = crearElemCell('celda-hora', minutosAHora(minActual), i + 2, 1, 2, 1);
    contenedorGrid.appendChild(cellHora);
  }

  // Renderizar Sesiones de la Combinación
  combinacion.forEach(item => {
    const color = asignarColorAMateria(item.codigo);

    item.seccion.horario.forEach(ses => {
      const colIndex = dias.indexOf(ses.dia) + 2;
      if (colIndex < 2) return;

      const rango = obtenerRangoHorasBloques(ses.bloques);
      const iniMin = horaAMinutos(rango.inicio);
      const finMin = horaAMinutos(rango.fin);

      const filaInicio = Math.floor((iniMin - horaMinGlobal) / 30) + 2;
      const spanFilas = Math.ceil((finMin - iniMin) / 30);

      const bloqueSesion = document.createElement('div');
      bloqueSesion.className = 'tarjeta-sesion-grid';
      bloqueSesion.style.gridRow = `${filaInicio} / span ${spanFilas}`;
      bloqueSesion.style.gridColumn = `${colIndex}`;
      bloqueSesion.style.backgroundColor = color;

      bloqueSesion.innerHTML = `
        <div class="contenido-sesion-grid">
          <strong>${item.codigo}</strong> - Sec ${item.seccion.id}<br>
          <small>Aula: ${ses.aula}</small>
        </div>
      `;

      bloqueSesion.addEventListener('click', () => {
        mostrarMensajeGlobal(
          `<strong>${item.nombre}</strong><br>Sección: ${item.seccion.id} | Profesor: ${item.seccion.profesor}<br>Horario: ${ses.dia} ${rango.inicio} - ${rango.fin} (Aula ${ses.aula})`,
          'info'
        );
      });

      contenedorGrid.appendChild(bloqueSesion);
    });
  });
}

function crearElemCell(clase, texto, rowStart, colStart, rowSpan = 1, colSpan = 1) {
  const elem = document.createElement('div');
  elem.className = clase;
  elem.textContent = texto;
  elem.style.gridRow = `${rowStart} / span ${rowSpan}`;
  elem.style.gridColumn = `${colStart} / span ${colSpan}`;
  return elem;
}

function fijarHorarioDefinitivo() {
  if (resultadosActuales.length === 0) return;
  const combDefinitiva = resultadosActuales[indiceResultadoActual];

  if (typeof renderizarResumenDefinitivo === 'function') {
    renderizarResumenDefinitivo(combDefinitiva);
    mostrarMensajeGlobal('¡Horario elegido como definitivo correctamente!', 'exito');
    document.getElementById('seccion-resumen').scrollIntoView({ behavior: 'smooth' });
  }
}