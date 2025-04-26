let bibliaData = null; // Guardará la Biblia cargada
let libroActual = "Gn"; // Comenzamos con Génesis
let capituloActual = "1";
let versiculoActual = "1";

document.addEventListener("DOMContentLoaded", function () {
    console.log("📖 Cargando la Biblia...");

    fetch("data/bibliaJSON.json") // 🔹 Nombre del archivo corregido
        .then(response => response.json())
        .then(data => {
            console.log("🔍 JSON cargado:", data);

            if (!data || typeof data !== "object") {
                console.error("❌ Error: El JSON no tiene el formato esperado.");
                return;
            }

            bibliaData = data;
            console.log("✅ Biblia cargada correctamente.");
            mostrarVersiculo();
        })
        .catch(error => console.error("❌ Error al cargar la Biblia:", error));
});

// 📌 Función para mostrar el versículo actual
function mostrarVersiculo() {
    console.log(`📖 Mostrando ${libroActual} ${capituloActual}:${versiculoActual}`);

    if (!bibliaData) {
        console.error("❌ Error: La Biblia no está cargada.");
        document.getElementById("texto-biblia").innerText = "Error al cargar la Biblia.";
        return;
    }

    let libroData = bibliaData[libroActual];

    if (!libroData) {
        console.error(`❌ Error: El libro ${libroActual} no existe.`);
        document.getElementById("texto-biblia").innerText = "Libro no encontrado.";
        return;
    }

    let capituloData = libroData[capituloActual];

    if (!capituloData) {
        console.error(`❌ Error: El capítulo ${capituloActual} no existe en ${libroActual}.`);
        document.getElementById("texto-biblia").innerText = "Capítulo no encontrado.";
        return;
    }

    let versiculoTexto = capituloData[versiculoActual];

    if (!versiculoTexto) {
        console.error(`❌ Error: El versículo ${versiculoActual} no existe en ${libroActual} ${capituloActual}.`);
        document.getElementById("texto-biblia").innerText = "Versículo no encontrado.";
        return;
    }

    document.getElementById("texto-biblia").innerText = `${versiculoTexto} (${libroActual} ${capituloActual}:${versiculoActual})`;
}

// 📌 Ir al siguiente versículo
function siguienteVersiculo() {
    if (!bibliaData || !bibliaData[libroActual] || !bibliaData[libroActual][capituloActual]) return;

    let capitulos = bibliaData[libroActual];
    let versiculos = Object.keys(capitulos[capituloActual]).sort((a, b) => a - b);
    let indice = versiculos.indexOf(versiculoActual);

    if (indice < versiculos.length - 1) {
        versiculoActual = versiculos[indice + 1];
    } else {
        let capitulosDisponibles = Object.keys(capitulos).sort((a, b) => a - b);
        let indiceCapitulo = capitulosDisponibles.indexOf(capituloActual);

        if (indiceCapitulo < capitulosDisponibles.length - 1) {
            capituloActual = capitulosDisponibles[indiceCapitulo + 1];
            versiculoActual = Object.keys(capitulos[capituloActual])[0];
        } else {
            console.log("⚠ No hay más capítulos en este libro.");
            return;
        }
    }

    mostrarVersiculo();
}

// 📌 Ir al versículo anterior
function versiculoAnterior() {
    if (!bibliaData || !bibliaData[libroActual] || !bibliaData[libroActual][capituloActual]) return;

    let capitulos = bibliaData[libroActual];
    let versiculos = Object.keys(capitulos[capituloActual]).sort((a, b) => a - b);
    let indice = versiculos.indexOf(versiculoActual);

    if (indice > 0) {
        versiculoActual = versiculos[indice - 1];
    } else {
        let capitulosDisponibles = Object.keys(capitulos).sort((a, b) => a - b);
        let indiceCapitulo = capitulosDisponibles.indexOf(capituloActual);

        if (indiceCapitulo > 0) {
            capituloActual = capitulosDisponibles[indiceCapitulo - 1];
            let versiculosAnteriores = Object.keys(capitulos[capituloActual]).sort((a, b) => a - b);
            versiculoActual = versiculosAnteriores[versiculosAnteriores.length - 1];
        } else {
            console.log("⚠ Ya estamos en el primer versículo.");
            return;
        }
    }

    mostrarVersiculo();
}

// 📌 Función corregida para mostrar secciones
function mostrarSeccion(id) {
    document.querySelectorAll(".seccion").forEach(seccion => {
        seccion.classList.add("oculto");
    });
    document.getElementById(id).classList.remove("oculto");
}

// 📌 Función para leer el versículo en voz alta


async function leerTexto() {
    const texto = document.getElementById("texto-biblia").innerText;
    if (!texto) {
        alert("❌ No hay texto para leer.");
        return;
    }

    const { TextToSpeech } = window.Capacitor.Plugins;

    try {
        await TextToSpeech.speak({
            text: texto,
            lang: 'es-ES',
            rate: 1.0,
            pitch: 1.0,
            volume: 1.0,
            category: 'ambient' // recomendado para apps religiosas o meditativas
        });
    } catch (error) {
        console.error("❌ Error al reproducir el texto:", error);
        alert("No se pudo reproducir el texto.");
    }
}

// 📌 Función para buscar libros
function buscarLibros() {
    let entrada = document.getElementById("buscar-libro").value.toLowerCase();
    let listaLibros = document.getElementById("lista-libros");
    listaLibros.innerHTML = ""; // Limpiar resultados anteriores

    if (entrada.length < 2) return; // Evitar búsquedas demasiado cortas

    Object.keys(bibliaData).forEach(libro => {
        if (libro.toLowerCase().includes(entrada)) {
            let libroElemento = document.createElement("div");
            libroElemento.innerText = libro;
            libroElemento.classList.add("libro-item");
            libroElemento.onclick = () => seleccionarLibro(libro);
            listaLibros.appendChild(libroElemento);
        }
    });
}

// 📌 Función para mostrar capítulos de un libro seleccionado
function seleccionarLibro(libro) {
    libroActual = libro;
    capituloActual = "1";
    document.getElementById("lista-libros").innerHTML = ""; // Ocultar lista de libros
    let listaCapitulos = document.getElementById("lista-capitulos");
    listaCapitulos.innerHTML = ""; // Limpiar anteriores

    let capitulos = Object.keys(bibliaData[libro]);

    capitulos.forEach(capitulo => {
        let capituloElemento = document.createElement("div");
        capituloElemento.innerText = `Capítulo ${capitulo}`;
        capituloElemento.classList.add("capitulo-item");
        capituloElemento.onclick = () => seleccionarCapitulo(capitulo);
        listaCapitulos.appendChild(capituloElemento);
    });
}

// 📌 Función para mostrar versículos de un capítulo seleccionado
function seleccionarCapitulo(capitulo) {
    capituloActual = capitulo;
    versiculoActual = "1";
    document.getElementById("lista-capitulos").innerHTML = ""; // Ocultar capítulos
    let listaVersiculos = document.getElementById("lista-versiculos");
    listaVersiculos.innerHTML = ""; // Limpiar anteriores

    let versiculos = Object.keys(bibliaData[libroActual][capitulo]);

    versiculos.forEach(versiculo => {
        let versiculoElemento = document.createElement("div");
        versiculoElemento.innerText = `Versículo ${versiculo}`;
        versiculoElemento.classList.add("versiculo-item");
        versiculoElemento.onclick = () => seleccionarVersiculo(versiculo);
        listaVersiculos.appendChild(versiculoElemento);
    });
}

// 📌 Función para seleccionar un versículo
function seleccionarVersiculo(versiculo) {
    versiculoActual = versiculo;
    document.getElementById("lista-versiculos").innerHTML = ""; // Ocultar versículos
    mostrarVersiculo(); // Mostrar el versículo seleccionado
}

let planLectura = null;
let diaActual = 1;

// 📌 Cargar el plan de lectura desde el JSON
document.addEventListener("DOMContentLoaded", function () {
    fetch("planLectura.json")
        .then(response => response.json())
        .then(data => {
            planLectura = data;
            let progresoGuardado = localStorage.getItem("diaActual");
            if (progresoGuardado) {
                diaActual = parseInt(progresoGuardado);
            }
            mostrarPlan();
        })
        .catch(error => console.error("❌ Error al cargar el plan de lectura:", error));
});

// 📌 Función para mostrar el plan del día actual
function mostrarPlan() {
    if (!planLectura || !planLectura[diaActual]) {
        document.getElementById("fecha-plan").innerText = "Plan no encontrado.";
        return;
    }

    let dia = planLectura[diaActual];
    document.getElementById("fecha-plan").innerText = `📅 Día ${diaActual}: ${dia.fecha}`;

    let listaPasajes = document.getElementById("pasajes-plan");
    listaPasajes.innerHTML = ""; 

    dia.pasajes.forEach(pasaje => {
        let item = document.createElement("li");
        item.innerText = pasaje;
        listaPasajes.appendChild(item);
    });

    // Verificar si el usuario ya marcó este día como completado
    let estado = localStorage.getItem(`completado-${diaActual}`);
    document.getElementById("estado-completado").innerText = estado ? "✔ Día completado" : "";
    document.getElementById("estado-completado").style.color = estado ? "green" : "black"; // Cambia color si está completado
}

// 📌 Ir al día siguiente
function diaSiguiente() {
    if (diaActual < Object.keys(planLectura).length) {
        diaActual++;
        localStorage.setItem("diaActual", diaActual);
        mostrarPlan();
    }
}

// 📌 Ir al día anterior
function diaAnterior() {
    if (diaActual > 1) {
        diaActual--;
        localStorage.setItem("diaActual", diaActual);
        mostrarPlan();
    }
}

// 📌 Marcar el día como completado
function marcarCompletado() {
    if (!planLectura || !planLectura[diaActual]) {
        console.error("❌ No se puede marcar como completado: Plan de lectura no cargado.");
        return;
    }

    // Guardar en localStorage
    localStorage.setItem(`completado-${diaActual}`, "true");

    // Actualizar la interfaz
    document.getElementById("estado-completado").innerText = "✔ Día completado";
    document.getElementById("estado-completado").style.color = "green"; // Cambia color a verde para destacar

    console.log(`✅ Día ${diaActual} marcado como completado.`);
}


// 📌 Función para mostrar la lista de días completados
function mostrarCompletados() {
    let lista = document.getElementById("lista-completados");
    lista.innerHTML = ""; // Limpiar la lista antes de actualizarla

    // Asegurar que `planLectura` esté cargado antes de continuar
    if (!planLectura) return;

    for (let i = 1; i <= Object.keys(planLectura).length; i++) {
        if (localStorage.getItem(`completado-${i}`)) {
            let item = document.createElement("li");
            item.innerHTML = `Día ${i} - ${planLectura[i].fecha} 
                <button onclick="desmarcarDia(${i})">❌</button>`;
            lista.appendChild(item);
        }
    }
}

// 📌 Función para marcar el día como completado
function marcarCompletado() {
    localStorage.setItem(`completado-${diaActual}`, "true");
    document.getElementById("estado-completado").innerText = "✔ Día completado";

    // Actualizar la lista de completados inmediatamente
    mostrarCompletados();
}

// 📌 Desmarcar un día completado
function desmarcarDia(dia) {
    localStorage.removeItem(`completado-${dia}`);
    mostrarCompletados(); // Actualizar la lista
}

// 📌 Limpiar todos los días completados
function limpiarCompletados() {
    if (confirm("¿Seguro que deseas limpiar todos los días completados?")) {
        for (let i = 1; i <= Object.keys(planLectura).length; i++) {
            localStorage.removeItem(`completado-${i}`);
        }
        mostrarCompletados();
    }
}

// 📌 Cargar el plan de lectura y luego mostrar los completados
document.addEventListener("DOMContentLoaded", function () {
    fetch("data/planLectura.json")
        .then(response => response.json())
        .then(data => {
            planLectura = data;
            let progresoGuardado = localStorage.getItem("diaActual");
            if (progresoGuardado) {
                diaActual = parseInt(progresoGuardado);
            }
            mostrarPlan();
            mostrarCompletados(); // Mostrar los días completados después de cargar el plan
        })
        .catch(error => console.error("❌ Error al cargar el plan de lectura:", error));
});

// 📌 Función para convertir nombres de libros a sus claves en el JSON
function obtenerClaveLibro(nombre) {
    let equivalencias = {
        "Génesis": "Gn",
        "Éxodo": "Ex",
        "Levítico": "Lv",
        "Números": "Nm",
        "Deuteronomio": "Dt",
        "Josué": "Jos",
        "Jueces": "Jue",
        "Rut": "Rt",
        "1 Samuel": "1S",
        "2 Samuel": "2S",
        "1 Reyes": "1R",
        "2 Reyes": "2R",
        "1 Crónicas": "1Cr",
        "2 Crónicas": "2Cr",
        "Esdras": "Esd",
        "Nehemías": "Neh",
        "Ester": "Est",
        "Job": "Job",
        "Salmos": "Sal",
        "Proverbios": "Prov",
        "Eclesiastés": "Ecl",
        "Cantares": "Cant",
        "Isaías": "Is",
        "Jeremías": "Jer",
        "Lamentaciones": "Lam",
        "Ezequiel": "Ez",
        "Daniel": "Dn",
        "Oseas": "Os",
        "Joel": "Jl",
        "Amós": "Am",
        "Abdías": "Abd",
        "Jonás": "Jon",
        "Miqueas": "Miq",
        "Nahúm": "Nah",
        "Habacuc": "Hab",
        "Sofonías": "Sof",
        "Hageo": "Hag",
        "Zacarías": "Zac",
        "Malaquías": "Mal",
        "Mateo": "Mt",
        "Marcos": "Mr",
        "Lucas": "Lc",
        "Juan": "Jn",
        "Hechos": "Hch",
        "Romanos": "Ro",
        "1 Corintios": "1Co",
        "2 Corintios": "2Co",
        "Gálatas": "Ga",
        "Efesios": "Ef",
        "Filipenses": "Flp",
        "Colosenses": "Col",
        "1 Tesalonicenses": "1Ts",
        "2 Tesalonicenses": "2Ts",
        "1 Timoteo": "1Ti",
        "2 Timoteo": "2Ti",
        "Tito": "Tit",
        "Filemón": "Flm",
        "Hebreos": "Heb",
        "Santiago": "Stg",
        "1 Pedro": "1P",
        "2 Pedro": "2P",
        "1 Juan": "1Jn",
        "2 Juan": "2Jn",
        "3 Juan": "3Jn",
        "Judas": "Jud",
        "Apocalipsis": "Ap"
    };
    return equivalencias[nombre] || nombre; // Si no se encuentra, devolver el mismo nombre
}

// funcion leer plan de lectura

async function leerPlanLectura() {
    // 🧪 Verificamos que el plan de lectura esté cargado y haya un día actual válido
    if (!planLectura || !planLectura[diaActual]) {
        alert("❌ No hay lectura para este día.");
        return;
    }

    let dia = planLectura[diaActual];
    let textoALeer = `📅 Día ${diaActual}, Lecturas: `;

    // 🧩 Recorrer los pasajes del día
    for (let pasaje of dia.pasajes) {
        let partes = pasaje.split(" ");
        if (partes.length < 2) continue;

        let libro = partes[0];
        let claveLibro = obtenerClaveLibro(libro);
        let rango = partes[1].split("-");

        let capInicio = parseInt(rango[0]);
        let capFin = rango[1] ? parseInt(rango[1]) : capInicio;

        for (let cap = capInicio; cap <= capFin; cap++) {
            if (!bibliaData[claveLibro] || !bibliaData[claveLibro][cap]) continue;

            textoALeer += `${libro} capítulo ${cap}. `;

            let versiculos = bibliaData[claveLibro][cap];
            for (let num in versiculos) {
                textoALeer += `Versículo ${num}: ${versiculos[num]}. `;
            }
        }
    }

    // 📏 Verificamos la longitud del texto
    console.log("🧾 Longitud del texto a leer:", textoALeer.length);

    // 🔍 Verificamos si el plugin TextToSpeech está disponible
    const TextToSpeech = window?.Capacitor?.Plugins?.TextToSpeech;
    if (!TextToSpeech || !TextToSpeech.speak) {
        alert("🚫 El plugin TextToSpeech no está disponible.");
        return;
    }

    // ✅ Función auxiliar para dividir y leer texto en partes (si es muy largo)
    async function leerPorPartes(texto, fragmento = 800) {
        const partes = texto.match(new RegExp(`.{1,${fragmento}}`, 'g'));

        for (let parte of partes) {
            await TextToSpeech.speak({
                text: parte,
                lang: 'es-ES',
                rate: 1.0,
                pitch: 1.0,
                volume: 1.0,
                category: 'ambient'
            });

            // ⏳ Esperamos un poco entre fragmentos
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    try {
        // 📢 Reproduce el texto por partes para evitar errores de límite
        await leerPorPartes(textoALeer);
        console.log("✅ Lectura iniciada correctamente.");
    } catch (error) {
        console.error("❌ Error al reproducir la lectura:", error);
        alert("No se pudo reproducir la lectura.");
    }
}








function buscarEnConcordancia() {
    let palabra = document.getElementById("buscarPalabra").value.toLowerCase();
    let resultados = [];
    let maxResultados = 50;

    for (let libro in bibliaData) {
        for (let capitulo in bibliaData[libro]) {
            let versiculos = bibliaData[libro][capitulo];
            for (let versiculo in versiculos) {
                let texto = versiculos[versiculo].toLowerCase();
                if (texto.includes(palabra)) {
                    resultados.push({
                        referencia: `${libro} ${capitulo}:${versiculo}`,
                        texto: versiculos[versiculo]
                    });
                    if (resultados.length >= maxResultados) break;
                }
            }
            if (resultados.length >= maxResultados) break;
        }
        if (resultados.length >= maxResultados) break;
    }

    let contenedor = document.getElementById("resultadoConcordancia");
    contenedor.innerHTML = "";

    if (resultados.length === 0) {
        contenedor.innerHTML = `<p>❌ No se encontraron resultados para "${palabra}".</p>`;
        return;
    }

    resultados.forEach(resultado => {
        let div = document.createElement("div");
        div.innerHTML = `<strong>${resultado.referencia}</strong>: ${resultado.texto}`;
        contenedor.appendChild(div);
    });
}

function mostrarSeccion(id) {
    const secciones = document.querySelectorAll(".seccion");
    secciones.forEach(seccion => seccion.classList.add("oculto"));
    document.getElementById(id).classList.remove("oculto");
}


// import { LocalNotifications } from '@capacitor/local-notifications';

// document.addEventListener("DOMContentLoaded", async () => {
//     const permStatus = await LocalNotifications.requestPermissions();
//     if (permStatus.display === 'granted') {
//         console.log("✅ Permisos de notificaciones otorgados");
//     } else {
//         console.warn("🚫 Permisos de notificaciones denegados");
//     }
// });

// async function programarNotificacionDiaria() {
//     await LocalNotifications.schedule({
//         notifications: [
//             {
//                 title: "📖 Recordatorio de Lectura",
//                 body: "¡No olvides leer el plan de hoy y acercarte más a la Palabra de Dios!",
//                 id: 1,
//                 schedule: { at: new Date(new Date().setHours(8, 0, 0, 0)), repeats: true },
//             }
//         ]
//     });
// }
