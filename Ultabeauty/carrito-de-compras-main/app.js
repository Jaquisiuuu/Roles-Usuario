// Variable que mantiene el estado visible del carrito
var carritoVisible = false;
var descuento = 0.10; // Ejemplo: 10% de descuento predeterminado
var puntosMaximos = 100; // Máximo de puntos de lealtad que se pueden usar
var codigoDescuentoValido = "DESCUENTO10"; // Código de descuento válido

document.addEventListener('DOMContentLoaded', function() {
    ocultarCarrito(); // Ocultar el carrito al iniciar
    ready(); // Llamamos a la función ready
});

function ready() {
    var botonesAgregarAlCarrito = document.getElementsByClassName('boton-item');
    for (var i = 0; i < botonesAgregarAlCarrito.length; i++) {
        var button = botonesAgregarAlCarrito[i];
        // Reemplaza esta línea
        button.addEventListener('click', agregarAlCarritoClicked); // Esta es tu lógica actual
    }
    document.getElementsByClassName('btn-pagar')[0].addEventListener('click', pagarClicked);
}

function agregarAlCarritoClicked(event) {
    var button = event.target;
    var item = button.parentElement;
    var titulo = item.getElementsByClassName('titulo-item')[0].innerText;
    var precioTexto = item.getElementsByClassName('precio-item')[0].innerText;
    var precio = parseFloat(precioTexto.replace('$', '').replace(/\./g, '').replace(',', '.').trim());
    var imagenSrc = item.getElementsByClassName('img-item')[0].src; // Obtiene la URL de la imagen

    agregarItemAlCarrito(titulo, precio, imagenSrc); // Actualiza la llamada a la función
    if (!carritoVisible) {
        hacerVisibleCarrito();
    }
}

function hacerVisibleCarrito() {
    carritoVisible = true;
    var carrito = document.getElementsByClassName('carrito')[0];
    carrito.style.marginRight = '0'; // Mostrar el carrito
    carrito.style.opacity = '1'; // Cambiar opacidad a visible
}


function agregarItemAlCarrito(titulo, precio, imagenSrc) {
    var itemsCarrito = document.getElementsByClassName('carrito-items')[0];
    var itemCarrito = document.createElement('div');
    itemCarrito.classList.add('carrito-item');

    // Contenido del nuevo item en el carrito
    itemCarrito.innerHTML = `
        <img src="${imagenSrc}" width="50" height="50" alt="${titulo}">
        <div class="carrito-item-detalles">
            <span class="carrito-item-titulo">${titulo}</span>
            <div class="selector-cantidad">
                <i class="fa-solid fa-minus restar-cantidad"></i>
                <input type="text" value="1" class="carrito-item-cantidad" id="cantidad-${titulo.replace(/\s+/g, '-')}" disabled>
                <i class="fa-solid fa-plus sumar-cantidad"></i>
            </div>
            <span class="carrito-item-precio">$${precio.toLocaleString('es')}</span>
        </div>
        <button class="btn-eliminar"><i class="fa-solid fa-trash"></i></button>
    `;
    
    itemsCarrito.appendChild(itemCarrito);

    // Agregar eventos a los nuevos elementos
    itemCarrito.getElementsByClassName('btn-eliminar')[0].addEventListener('click', eliminarItemCarrito);
    itemCarrito.getElementsByClassName('sumar-cantidad')[0].addEventListener('click', sumarCantidad);
    itemCarrito.getElementsByClassName('restar-cantidad')[0].addEventListener('click', restarCantidad);

    // Actualizamos total
    actualizarTotalCarrito();
}

function sumarCantidad(event) {
    var buttonClicked = event.target;
    var selector = buttonClicked.parentElement;
    var cantidadActual = parseInt(selector.getElementsByClassName('carrito-item-cantidad')[0].value);
    cantidadActual++;
    selector.getElementsByClassName('carrito-item-cantidad')[0].value = cantidadActual;
    actualizarTotalCarrito();
}

function restarCantidad(event) {
    var buttonClicked = event.target;
    var selector = buttonClicked.parentElement;
    var cantidadActual = parseInt(selector.getElementsByClassName('carrito-item-cantidad')[0].value);
    cantidadActual--;
    if (cantidadActual >= 1) {
        selector.getElementsByClassName('carrito-item-cantidad')[0].value = cantidadActual;
        actualizarTotalCarrito();
    }
}

function eliminarItemCarrito(event) {
    var buttonClicked = event.target;
    buttonClicked.parentElement.parentElement.remove();
    actualizarTotalCarrito();
    ocultarCarrito();
}

function actualizarTotalCarrito() {
    var carritoItems = document.getElementsByClassName('carrito-items')[0];
    var total = 0;

    for (var i = 0; i < carritoItems.children.length; i++) {
        var item = carritoItems.children[i];
        var precioTexto = item.getElementsByClassName('carrito-item-precio')[0].innerText;
        var precio = parseFloat(precioTexto.replace('$', '').replace(/\./g, '').replace(',', '.').trim());
        var cantidad = parseInt(item.getElementsByClassName('carrito-item-cantidad')[0].value);
        total += precio * cantidad;
    }

    // Verificar si se ha introducido un código de descuento válido
    var codigoDescuento = document.getElementById('codigo-descuento').value;
    var descuentoAplicado = 0;
    if (codigoDescuento === codigoDescuentoValido) {
        descuentoAplicado = total * descuento; // 10% de descuento
    }

    // Aplicar puntos de lealtad
    var puntosUsados = parseInt(document.getElementById('puntos-lealtad').value);
    if (isNaN(puntosUsados) || puntosUsados < 0) {
        puntosUsados = 0; // Si no es un número o es negativo, lo establecemos en 0
    } else if (puntosUsados > puntosMaximos) {
        puntosUsados = puntosMaximos; // Máximo de puntos permitidos
    }

    var descuentoPuntos = puntosUsados; // 1 punto = 1 unidad de moneda

    // Calcular el total final
    var totalFinal = total - descuentoAplicado - descuentoPuntos;
    if (totalFinal < 0) totalFinal = 0; // Evitar que el total sea negativo

    // Mostrar el total actualizado
    document.getElementsByClassName('carrito-precio-total')[0].innerText = `$${totalFinal.toLocaleString('es')}`;
}

// Evento personalizado 2 "compraRealizada"
document.addEventListener('compraRealizada', function(event) {
    console.log('Compra realizada con éxito:', event.detail);
    alert(`Gracias por tu compra. Usaste ${event.detail.puntosLealtad} puntos de lealtad. Total final: $${event.detail.totalFinal}`);
});

function pagarClicked() {
    var puntosLealtad = document.getElementById('puntos-lealtad').value;
    var totalFinal = document.getElementsByClassName('carrito-precio-total')[0].innerText;

    // Crear el evento personalizado "compraRealizada"
    var eventoCompra = new CustomEvent('compraRealizada', {
        detail: {
            puntosLealtad: puntosLealtad,
            totalFinal: totalFinal
        }
    });

    // Despachar el evento personalizado
    document.dispatchEvent(eventoCompra);

    // Limpiar el carrito después de la compra
    var carritoItems = document.getElementsByClassName('carrito-items')[0];
    while (carritoItems.hasChildNodes()) {
        carritoItems.removeChild(carritoItems.firstChild);
    }
    actualizarTotalCarrito();
    ocultarCarrito();
}

// Agregar el evento de click al botón de pagar
document.getElementsByClassName('btn-pagar')[0].addEventListener('click', pagarClicked);


function ocultarCarrito() {
    var carrito = document.getElementsByClassName('carrito')[0];
    if (carrito.getElementsByClassName('carrito-items')[0].children.length === 0) {
        carrito.style.marginRight = '-300px'; // Ajusta el valor según necesites
        carrito.style.opacity = '0';
        carritoVisible = false;
    }
}

//EVENTO 1: MENSAJE DE SUSCRIPCION A CORREO ELECTRONICO 
// Función que se ejecuta cuando se hace clic en el botón "Registrar"
function simularRegistro() {
    // Obtener los valores de los campos de nombre y correo electrónico
    var nombre = document.getElementById("nombre").value;
    var email = document.getElementById("email").value;

    // Comprobar si los campos están vacíos
    if (nombre === "" || email === "") {
        document.getElementById("mensaje").textContent = "Por favor, completa ambos campos.";
        document.getElementById("mensaje").style.color = "red";
    } else {
        // Simulación de registro exitoso (en lugar de enviarlo a una base de datos (Por el momento))
        document.getElementById("mensaje").textContent = "💜 Registro exitoso para " + nombre + " con el correo " + email;
        document.getElementById("mensaje").style.color = "green";

        // Limpiar los campos después del registro
        document.getElementById("nombre").value = "";
        document.getElementById("email").value = "";
    }
}

//EVENTO2 "MODO OSCURO"
document.getElementById('modoOscuro').addEventListener('click', function() {
    document.body.classList.toggle('oscuro');

    if (document.body.classList.contains('oscuro')) {
        this.textContent = 'Cambiar a Modo Claro';
    } else {
        this.textContent = 'Cambiar a Modo Oscuro';
    }
});


//EVENTO3 "CARRUSEL DE IMAGENES"
let slideIndex = 0;
mostrarSlide(slideIndex);

function cambiarSlide(n) {
    mostrarSlide(slideIndex += n);
}

function mostrarSlide(n) {
    const slides = document.getElementsByClassName("slide");
    
    // Resetea el índice si se pasa de los límites
    if (n >= slides.length) {
        slideIndex = 0;
    } else if (n < 0) {
        slideIndex = slides.length - 1;
    }

    // Oculta todas las slides y muestra solo la activa
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";  
    }
    
    slides[slideIndex].style.display = "flex"; // Muestra la slide activa
}

// Evento personalizado #1 "usuarioInactivo"
document.addEventListener('usuarioInactivo', function(event) {
    console.log('Usuario inactivo:', event.detail);
    alert(`Has estado inactivo por ${event.detail.tiempoInactivo} segundos. ¿Sigues ahí?`);
});

let tiempoInactividad;
function reiniciarTiempoInactividad() {
    clearTimeout(tiempoInactividad);
    tiempoInactividad = setTimeout(function() {
        var eventoInactivo = new CustomEvent('usuarioInactivo', {
            detail: {
                tiempoInactivo: 60, // Inactivo por 60 segundos
            }
        });
        document.dispatchEvent(eventoInactivo);
    }, 60000); // 60,000 ms = 1 minuto
}

document.addEventListener('mousemove', reiniciarTiempoInactividad);
document.addEventListener('keypress', reiniciarTiempoInactividad);
reiniciarTiempoInactividad();

//EVENTO 2
document.addEventListener('DOMContentLoaded', function() {
    var estrellas = document.querySelectorAll('#calificacion-estrellas span');
    var contenedorReseñas = document.getElementById('contenedor-reseñas');
    var filtroReseñas = document.getElementById('filtro-reseñas');
    var calificacionPromedio = document.getElementById('calificacion-promedio');
    var reseñas = JSON.parse(localStorage.getItem('reseñas')) || [];

    // Mostrar las reseñas almacenadas al cargar la página
    mostrarReseñas();
    actualizarCalificacionPromedio();

    // Crear y despachar evento personalizado para seleccionar estrellas
    estrellas.forEach(function(estrella) {
        estrella.addEventListener('click', function() {
            seleccionarEstrellas(parseInt(this.getAttribute('data-valor')));
            // Crear un evento personalizado después de seleccionar estrellas
            var eventoEstrellasSeleccionadas = new CustomEvent('estrellasSeleccionadas', {
                detail: { valor: obtenerCalificacionSeleccionada() }
            });
            // Despachar el evento personalizado
            document.dispatchEvent(eventoEstrellasSeleccionadas);
        });
    });

    // Escuchar el evento personalizado de estrellas seleccionadas
    document.addEventListener('estrellasSeleccionadas', function(e) {
        console.log('Estrellas seleccionadas: ' + e.detail.valor);
    });

    // Evento para enviar la reseña
    document.getElementById('btn-enviar-reseña').addEventListener('click', function() {
        var textoReseña = document.getElementById('texto-reseña').value;
        var calificacion = obtenerCalificacionSeleccionada();

        if (textoReseña !== '' && calificacion > 0) {
            // Crear objeto de reseña y añadirlo a la lista
            var nuevaReseña = { texto: textoReseña, calificacion: calificacion };
            reseñas.push(nuevaReseña);

            // Guardar las reseñas en localStorage
            localStorage.setItem('reseñas', JSON.stringify(reseñas));

            // Mostrar y actualizar reseñas
            mostrarReseñas();
            actualizarCalificacionPromedio();

            // Limpiar el campo de texto y las estrellas seleccionadas
            document.getElementById('texto-reseña').value = '';
            limpiarEstrellas();

            // Crear un evento personalizado después de enviar la reseña
            var eventoReseñaEnviada = new CustomEvent('reseñaEnviada', {
                detail: { reseña: nuevaReseña }
            });
            // Despachar el evento personalizado
            document.dispatchEvent(eventoReseñaEnviada);
        }
    });

    // Escuchar el evento personalizado de reseña enviada
    document.addEventListener('reseñaEnviada', function(e) {
        console.log('Reseña enviada:', e.detail.reseña);
        alert('¡Reseña enviada correctamente!');
    });

    // Evento para filtrar reseñas
    filtroReseñas.addEventListener('change', function() {
        mostrarReseñas();
    });


    // Función para mostrar reseñas
function mostrarReseñas() {
    contenedorReseñas.innerHTML = '';
    var filtro = filtroReseñas.value;
    var reseñasFiltradas = reseñas.filter(function(reseña) {
        if (filtro === 'positivas') {
            return reseña.calificacion >= 4;
        } else if (filtro === 'negativas') {
            return reseña.calificacion < 4;
        }
        return true;
    });

    reseñasFiltradas.forEach(function(reseña) {
        var div = document.createElement('div');
        div.className = 'reseña';

        // Generar la fecha en formato deseado
        var fechaPublicacion = new Date().toLocaleDateString(); // Aquí puedes usar la fecha de publicación real si la tienes
        
        // Generar las estrellas
        var estrellasHTML = '';
        for (let i = 0; i < reseña.calificacion; i++) {
            estrellasHTML += '<span class="estrella">&#9733;</span>'; // Estrella amarilla
        }

        // Crear el contenido HTML para la reseña
        div.innerHTML = `
            <div class="fecha">${fechaPublicacion}</div>
            <div class="comentario">${reseña.texto}</div>
            <div class="calificacion-estrellas">${estrellasHTML}</div>
        `;

        contenedorReseñas.appendChild(div);
    });
}
    // Función para seleccionar estrellas
    function seleccionarEstrellas(valor) {
        estrellas.forEach(function(estrella, index) {
            if (index < valor) {
                estrella.classList.add('seleccionada');
            } else {
                estrella.classList.remove('seleccionada');
            }
        });
    }

    // Función para obtener la calificación seleccionada
    function obtenerCalificacionSeleccionada() {
        var seleccionadas = document.querySelectorAll('#calificacion-estrellas span.seleccionada');
        return seleccionadas.length;
    }

    // Función para actualizar la calificación promedio
    function actualizarCalificacionPromedio() {
        if (reseñas.length > 0) {
            var total = reseñas.reduce(function(acumulado, reseña) {
                return acumulado + reseña.calificacion;
            }, 0);
            var promedio = (total / reseñas.length).toFixed(1);
            calificacionPromedio.textContent = 'Calificación promedio: ' + promedio;
        } else {
            calificacionPromedio.textContent = 'Calificación promedio: 0';
        }
    }

    // Función para limpiar la selección de estrellas
    function limpiarEstrellas() {
        estrellas.forEach(function(estrella) {
            estrella.classList.remove('seleccionada');
        });
    }
});
