const input = document.getElementById("inputValor");
const select = document.getElementById("selectMoneda");
const resultado = document.getElementById("resultado");
const ctx = document.getElementById("myChart");
const boton = document.getElementById("boton");
const invalid = document.getElementById("invalid-feedback");

let html = "<option value='selected'>Seleccione</option>";
let indicador_grafica = null;
let ultimo_valor = null;
let fechas = [];
let valores = [];
let myChart;

// Función para renderizar las opciones del select con las divisas permitidas
function renderizar_divisas(divisa) {
  const divisasPermitidas = ["dolar", "uf", "utm"]; // Divisas permitidas: dólar y UF

  // Filtrar las divisas permitidas
  const divisasFiltradas = Object.keys(divisa).filter((key) =>
    divisasPermitidas.includes(key)
  );

  // Generar el HTML para las opciones del select
  divisasFiltradas.forEach((moneda) => {
    html += `<option value="${moneda}">${moneda.toUpperCase()}</option>`;
  });

  // Actualizar el contenido del select con las opciones generadas
  select.innerHTML = html;
}

// Función para realizar la petición a la API y obtener los datos de las divisas
async function request_api() {
  try {
    const endpointDolar = await fetch("https://mindicador.cl/api");
    const res = await endpointDolar.json();
    renderizar_divisas(res);
  } catch (error) {
    alert(error.message);
  }
}

// Evento click del botón
boton.addEventListener("click", async () => {
  if (select.value === "selected" && input.value === "") {
    invalid.style.display = "block";
    input.classList.add("is-invalid");
    select.classList.add("is-invalid");
    invalid.innerHTML = "Debe rellenar todos los campos!";
  } else if (select.value === "selected") {
    invalid.style.display = "block";
    invalid.innerHTML = "Debe seleccionar una moneda";
    select.classList.add("is-invalid");
    input.classList.remove("is-invalid");
  } else if (input.value === "" || input.value <= 0) {
    invalid.style.display = "block";
    input.classList.add("is-invalid");
    select.classList.remove("is-invalid");
    invalid.innerHTML = "Debe ingresar un monto correcto";
  } else if (input.value > 0 && input.value !== "") {
    let monto = parseInt(input.value);
    let resultado_final = (monto / ultimo_valor).toFixed(2);

    if (select.value === "dolar") {
      resultado.innerHTML = `${resultado_final} USD`;
      invalid.style.display = "none";
      input.classList.remove("is-invalid");
      select.classList.remove("is-invalid");
    } else if (select.value === "uf") {
      resultado.innerHTML = `${resultado_final} UF`;
      invalid.style.display = "none";
      input.classList.remove("is-invalid");
      select.classList.remove("is-invalid");
    } else {
      resultado.innerHTML = `${resultado_final} UTM`;
      invalid.style.display = "none";
      input.classList.remove("is-invalid");
      select.classList.remove("is-invalid");
    }

    limpiar_grafica();
    renderizar_grafica();
  }
});

// Función para obtener los últimos 10 valores de la divisa seleccionada
async function ultimos10Valores(moneda) {
  try {
    const indicador = await fetch(`https://mindicador.cl/api/${moneda}`);
    const data = await indicador.json();
    indicador_grafica = await data.serie.slice(0, 10).reverse();
    ultimo_valor = Number(
      parseInt(indicador_grafica[indicador_grafica.length - 1]["valor"])
    );
    fechas = [];
    valores = [];
    indicador_grafica.forEach((elemento) => {
      fechas.push(elemento.fecha);
      valores.push(parseInt(elemento.valor));
    });
    for (let i = 0; i < fechas.length; i++) {
      fechas[i] = fechas[i].slice(0, 10).split("-").reverse().join("-");
    }
  } catch (error) {
    alert(error.message);
  }
}

// Evento change del select
select.addEventListener("change", () => {
  let moneda = select.value;
  ultimos10Valores(moneda);
});

// Función para renderizar el gráfico
function renderizar_grafica() {
  if (myChart) {
    myChart.destroy();
  }
  myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: fechas,
      datasets: [
        {
          label: "Historial de precios",
          data: valores,
          borderWidth: 1,
        },
      ],
    },
  });
}

// Función para limpiar el gráfico existente
function limpiar_grafica() {
  if (myChart) {
    myChart.destroy();
  }
}

// Llamar a la función para realizar la petición a la API y obtener los datos iniciales
request_api();
