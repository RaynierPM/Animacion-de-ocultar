document.addEventListener('DOMContentLoaded', async () => {

    // offline
    // let cultosArray = [
    //     {
    //         id: '1',
    //         nombre: '1er culto',
    //         tema: 'El amor fraternal',
    //         horaEmpieza: '8:00 am',
    //         horaTermina: '10:00 am',
    //         asistenciaActual: 10,
    //         asistenciaMaxima: 100
    //     }
    //     ,
    //     {
    //         id: '2',
    //         nombre: '2do culto',
    //         tema: 'El amor fraternal',
    //         horaEmpieza: '10:00 am',
    //         horaTermina: '12:00 pm',
    //         asistenciaActual: 100,
    //         asistenciaMaxima: 100
    //     }
    // ];

    // obtener elementos y variables globales
    // get elements & global vars
    let soloElement = document.getElementById('solo'), 
        grupoElement = document.getElementById('grupo'),
        nombreInput = document.querySelector('#nombre'),
        cantidadInput = document.querySelector('#cantidad'),
        cantInvitadosInput = document.querySelector('#cantInvitados'),
        tipoAsistencia = document.getElementById('tipoAsistencia'),
        servicioModal = {
            nombre : document.querySelector('#servicioModal .nombre'),
            tema : document.querySelector('#servicioModal .tema'),
            hora: document.querySelector('#servicioModal .hora'),
            cantidadAagregar : document.querySelector('#servicioModal .cantidadAagregar'),
            asistenciaActual : document.querySelector('#servicioModal .asistenciaActual'),
            asistenciaMaxima : document.querySelector('#servicioModal .asistenciaMaxima'),
            modalHandle : new bootstrap.Modal(document.getElementById('servicioModal'))
        },
        servicioRecordatorioModal = {
            nombre : document.querySelector('#servicioRecordatorioModal .nombre'),
            tema : document.querySelector('#servicioRecordatorioModal .tema'),
            hora: document.querySelector('#servicioRecordatorioModal .hora'),
            modalHandle : new bootstrap.Modal(document.getElementById('servicioRecordatorioModal'))
        },
        cultoSeleccionado = null,
        recordatorio = localStorage.getItem('iglesiaDeDiosBelloCampoAsistencia');

    // ===== PASO 0 =====
    // Validar si hay un recordatorio
    if(recordatorio){
        let recordatorioElemento = document.getElementById('recordatorio');
        setTimeout(() => {            
            let datosRecordatorio = JSON.parse(recordatorio);

            servicioRecordatorioModal.nombre.innerText = datosRecordatorio.servicio.nombre;
            servicioRecordatorioModal.tema.innerText = datosRecordatorio.servicio.tema;
            servicioRecordatorioModal.hora.innerText = `${datosRecordatorio.servicio.horaEmpieza} - ${datosRecordatorio.servicio.horaTermina}`;

            document.querySelector('#servicioRecordatorioModal .nombreAsistencia').innerText = datosRecordatorio.asistencia.nombre;
            // ver qué cantidad es la asistencia
            if(datosRecordatorio.asistencia.cantidadAsistencia > 1) {
                document.querySelector('#servicioRecordatorioModal .mensaje').innerText = 'Los esperamos';
            }else {
                document.querySelector('#servicioRecordatorioModal .mensaje').innerText = 'Te esperamos';
            }
            // ver si hay invitados
            if(datosRecordatorio.asistencia.invitados > 0) {
                document.querySelector('#servicioRecordatorioModal .invitados').innerText = `${datosRecordatorio.asistencia.invitados} invitados`
            }
    
            // Mostrar btn de recordatorio
            recordatorioElemento.classList.remove('d-none')
            // detectar click
            recordatorioElemento.addEventListener('click', () => {
                // console.log(datosRecordatorio)
                servicioRecordatorioModal.modalHandle.show();
            })
        }, 1000);

    }

    // ===== PASO 1 =====
    // await getDataHome();

    // ===== PASO 2 ======
    // Detectar si es miembro o visita
    // Detect if is a member or visit
    document.querySelector('.botones').addEventListener('click', async ev => {

        let tipoAsistencia = (ev.target.id).toLowerCase();

        let spiner = `
            <div class="spinner mt-4">
                <div class="bounce1"></div>
                <div class="bounce2"></div>
                <div class="bounce3"></div>
            </div>
        `;

        if( tipoAsistencia == 'miembro' || tipoAsistencia == 'visita' ) {
            document.querySelector('.formAsistencia p').innerHTML = spiner;
            // Consultar
            await getDataAsistencia({tipoAsistencia});
        }
    });
    // ===== PASO 3 ======
    // obtener cultos disponibles
    // Get services available
    document.querySelector('.boton.siguiente').addEventListener('click', async ev => {
        // Consultar servicios disponibles
        await getDataCulto({
            nombre : nombreInput.value,
            tipoAsistencia : tipoAsistencia.value,
            cantidadAsistencia : soloElement.checked && !grupoElement.checked? 
                                    0 : Number(cantidadInput.value),
            invitados : tipoAsistencia.value == 'miembro' && cantInvitadosInput.value.length > 0? 
                        cantInvitadosInput.value : 0 
        });    
    });
    // ===== PASO 4 =====
    // Agradecimientos
    function darAgradecimientos(datos) {
        // console.log(datos)
        const { cantidadAsistencia } = datos;
        const objParaGuardar = {
            asistencia: {
                nombre: datos.nombre.trim().toLowerCase(),
                tipoAsistencia: datos.tipoAsistencia,
                invitados: datos.invitados,
                cantidadAsistencia: datos.cantidadAsistencia
            },
            servicio: {
                id: datos.id,
                nombre: cultoSeleccionado.nombre,
                tema: cultoSeleccionado.tema,
                horaEmpieza: cultoSeleccionado.horaEmpieza,
                horaTermina: cultoSeleccionado.horaTermina
            }
        }

        // Llenar datos del culto
        document.querySelector('#agradecimiento .culto .nombre').innerText = cultoSeleccionado.nombre;
        document.querySelector('#agradecimiento .culto .tema').innerText = cultoSeleccionado.tema;
        document.querySelector('#agradecimiento .culto .hora').innerText = `${cultoSeleccionado.horaEmpieza} - ${cultoSeleccionado.horaTermina}`;
        if(tipoAsistencia.value == 'miembro') {
            document.querySelector('#agradecimiento .culto .asistencia').style.opacity = '1';
            document.querySelector('#agradecimiento .culto .asistenciaActual').innerText = cultoSeleccionado.asistenciaActual + cantidadAsistencia;
            document.querySelector('#agradecimiento .culto .asistenciaMaxima').innerText = cultoSeleccionado.asistenciaMaxima;
        }else {
            document.querySelector('#agradecimiento .culto .asistencia').style.opacity = '0';
        }

        // Llenar datos de asistencia
        document.querySelector('#agradecimiento .nombre').innerHTML = datos.nombre;
        document.querySelector('#agradecimiento .nombre').style.color = 'var(--rojo)';
        document.querySelector('#agradecimiento .contenido p').innerHTML = cantidadAsistencia > 1?
                                                                            'Los esperamos <i class="bi bi-heart-fill"></i>' 
                                                                            : 'Te esperamos <i class="bi bi-heart-fill"></i>';

        // btn deshacer durante 10 segundos, despues, no se puede deshacer
        let segundos = 11,
            intervalos;
        intervalos = setInterval(async () => {
            if(segundos >= 0) {
                segundos -= 1;
                document.querySelector('#agradecimiento .volver a').innerHTML 
                    = `<i class="bi bi-arrow-90deg-up"></i> Deshacer ( ${segundos} )`; 
            }
            // Si el contador llega a 0, detener intervalo
            if(segundos <= 0) {
                clearInterval(intervalos);
                document.querySelector('#agradecimiento .volver a').innerHTML = 'Listo <i class="bi bi-bookmark-check-fill"></i>';
                document.querySelector('#agradecimiento .volver a').href = '#';
                // Guardar asistencia
                await guardarAsistencia(objParaGuardar);
            }
        }, 1000);
        // Detectar si cliquea deshacer
        document.querySelector('#agradecimiento .volver').addEventListener('click', ev => {
            // Si al cliquear todo esta listo, recargar pagina
            if(ev.target.textContent.trim().toLowerCase() == 'listo') {
                ev.preventDefault();
                window.location.hash = 'agradecimiento';
                window.location.assign(window.location.pathname);
            };
            document.querySelector('#confirmado').classList.remove('confirmadoANIMATION');
            document.querySelector('.siguiente').click();
            // window.location.hash = 'culto';
            clearInterval(intervalos);
        })
        // guardar asistencia
        let timeout;
        async function guardarAsistencia(datos) {
            clearTimeout(timeout)
            timeout = setTimeout(async () => {                
                // Destructuring
                const { servicio, asistencia } = datos;
    
                // guardar datos en el LS
                localStorage.setItem('iglesiaDeDiosBelloCampoAsistencia', JSON.stringify(datos));
    
                // guardar cambios en BD
                let url = `https://iglesiadedios-bellocampo.herokuapp.com/seleccionar-culto/${servicio.id}/${asistencia.nombre}/${asistencia.tipoAsistencia}/${asistencia.cantidadAsistencia}/${asistencia.invitados}`;
                let res = await fetch(url, {
                    method: 'GET'
                });
            
                console.log( await res.json() );    
            }, 1000);
        }
    }

    // funciones de consulta
    // await agregarCulto({
    //     accion : 'agregar-culto',
    //     adminCode : '',
    //     id : 'nuevo',
    //     nombre : 'segundo culto',
    //     tema : 'el amor',
    //     asistenciaMaxima : '100',
    //     horaEmpieza : '10:00',
    //     horaTermina : '12:00'
    // });
    async function getDataHome() {
        let url = `https://iglesiadedios-bellocampo.herokuapp.com/`;
        let res = await fetch(url, {
            method: 'GET'
        });
    
        console.log( await res.json() );
    }
    
    async function getVersiculoBiblico() {
        // let url = 'https://dailyverses.net/get/random?language=rvr60&isdirect=1&position&fbclid=IwAR204J5eGHlbOIPBf68yXd_KMY2cA4yXqcT6XFPcMqRWpkom7MtlcZm2fKc'+ Math.floor(Math.random() * 201) + '&url=' + window.location.hostname
        let url = 'https://dailyverses.net/get/verse?language=rvr60&isdirect=1'+ Math.floor(Math.random() * 201) + '&url=' + window.location.hostname;
    
        $.ajax({
            url,
            dataType: 'JSONP',
            success:function(json){
                // console.log(json.html)
                let elemento = document.querySelectorAll(".versiculo");
                if(elemento.length && elemento.length > 1) {
                    elemento.forEach(el => {
                        el.innerHTML = '';
                        el.innerHTML = json.html;
                    })
                } else {
                    elemento.innerHTML = '';
                    elemento.innerHTML = json.html;
                }
            }
        });
    }
    
    async function getDataAsistencia(datos = {}) {
    
        // validar que no venga vacio
        // validate is not empty
        if(Object.keys(datos).length < 1 || !datos.tipoAsistencia ) return;
    
        let url = `https://iglesiadedios-bellocampo.herokuapp.com/asistencia/${datos.tipoAsistencia}`;
        let res = await fetch(url, {
            method: 'GET'
        }).catch(err => {
            console.log(err)
            document.querySelector('.formAsistencia').innerHTML = '<p class="text-danger">Ha ocurrido un error, trate más tarde.</p>';
        });

        resJson = {
            mensaje: `Oh eres ${datos.tipoAsistencia}, solo o familia?`,
            tipoAsistencia: datos.tipoAsistencia
        }

        res.json().then(resJson => {
        
            // Validar Si no es miembro, no puede llevar invitados
            if(resJson.tipoAsistencia !== 'miembro'){
                invitadosToggle(false);
            }else {
                if( nombreApellidoValido(nombreInput.value) && Number( cantInvitadosInput.value ) >= 1 ){
                    invitadosToggle('abrir');
                }else if( nombreApellidoValido(nombreInput.value) ) {
                    document.querySelector('.formAsistencia .abrir').classList.remove('d-none');
                }
            }
        
            setTimeout( async () => { 
                // Mostrar mensaje
                // show message
                let mensaje = resJson.mensaje.replace(resJson.tipoAsistencia, `<span style='color: var(--rojo)'>${resJson.tipoAsistencia}</span>`);
                document.querySelector('.formAsistencia p').innerHTML = mensaje;
                let timeout;
    
                // Guardar tipo de asistencia
                // Save attendance
                tipoAsistencia.value = resJson.tipoAsistencia;
    
                // Cargar UI
                // Load UI
                document.querySelector('.inputs').addEventListener('input', ev => { 

                    timeout = setTimeout(() => {
                        clearTimeout(timeout);

                        if( ev.target.id == 'nombre' && !nombreApellidoValido(ev.target.value) || nombreInput.value.length < 3) {
                            // Mostrar error en nombre
                            if(ev.target.id == 'nombre'){
                                toggleError(nombreInput, 'error', false);                        
                            }else {
                                toggleError(nombreInput, 'error', true);
                            }
                        }
                        // validar si esta en grupo
                        else if( grupoElement.checked && !soloElement.checked && cantidadInput.value == '' 
                                || grupoElement.checked && Number(cantidadInput.value) < 2 ) {
                                // No mostrar error en el input nombre
                                toggleError(nombreInput, 'exito');
                                // Mostrar error en cantidad
                                if(ev.target.id == 'cantidad'){
                                    toggleError(cantidadInput, 'error', false);
                                }else {
                                    toggleError(cantidadInput, 'error', true);
                                }
                                return;
                        }
                        // Si todo está bien, continuar
                        else {
                            // No mostrar error en el input nombre
                            toggleError(nombreInput, 'exito');
    
                            // Si es grupo No mostrar error en el input cantidad
                            toggleError(cantidadInput, 'exito');
        
                            // Si todo está bien, despues de un rato disparar animation del btn siguiente
                            toggleError(null, 'exito', false);
                        }
                    }, 500);
                    
                });
                document.querySelector('.formAsistencia').addEventListener('click', ev => {
                    // Solo o Grupo
                    if( ev.target.id == 'solo' 
                        || ev.target.firstElementChild
                        && ev.target.firstElementChild.type == 'radio' 
                        && ev.target.firstElementChild.id == 'solo' 
                        || ev.target.classList.contains('bi-person-fill')) {
                        seleccionarSolo();
                    }
                    if( ev.target.id == 'grupo' 
                        || ev.target.firstElementChild
                        && ev.target.firstElementChild.type == 'radio'
                        && ev.target.firstElementChild.id == 'grupo'
                        || ev.target.classList.contains('bi-people-fill')) {
                        seleccionarGrupo();
                    }
                    // Invitados
                    if(ev.target.classList.contains('abrir') ) {
                        invitadosToggle('abrir');
            
                    }else if(ev.target.classList.contains('cerrar') ){
            
                        invitadosToggle('cerrar');
                    }
                    cantInvitadosInput.addEventListener('change', e => {
                        if(e.target.value < 1) {
                            invitadosToggle('cerrar');
                        }
                    });
                    // reset var
                    resJson.tipoAsistencia = '';
                });
                await getVersiculoBiblico();
            }, 500);
        });
        
        // Funciones
        function nombreApellidoValido(datos) {  
            //Validar nombre y apellido, palabra por palabra   
            let nombreYapellido = datos.split(' ');
            let validarNombreApellido = /^[a-z ,.'-]+$/i;
            let validado = nombreYapellido.filter(palabra => {
                if(palabra.length > 2 && validarNombreApellido.test(palabra) ) {
                    return palabra
                }
            }) 
            // Retornar si todo esta bien o no
            if(validado.length >= 2) {return true} else return false;
        }
        function invitadosToggle(abrirCerrar = 'cerrar') {
            let btn = document.querySelector('#asistencia button');    
            // Si no es miembro, no puede llevar invitados
            if(abrirCerrar === false) {    
                btn.classList.add('d-none');
                btn.classList.remove('cerrar');
                btn.classList.add('abrir');
    
                cantInvitadosInput.classList.add('d-none');
                cantInvitadosInput.classList.remove('d-block');
                return;
            }
            
            if(abrirCerrar == 'abrir'){
                btn.classList.remove('abrir');
                btn.classList.remove('d-none');
                btn.classList.add('cerrar');
                
                cantInvitadosInput.classList.remove('d-none');
                cantInvitadosInput.value = cantInvitadosInput.value > 1? cantInvitadosInput.value : 1;
                btn.innerHTML = `Quitar invitados <i class="bi bi-dash-lg"></i>`;
            }else if(abrirCerrar == 'cerrar'){
                btn.classList.remove('cerrar');
                btn.classList.add('abrir');
                
                cantInvitadosInput.value = 0;
                cantInvitadosInput.classList.add('d-none');
                btn.innerHTML = `Añadir invitados <i class="bi bi-plus-lg"></i>`;
            }
        }
        function seleccionarSolo() {
    
            grupoElement.parentElement.classList.remove('bg-secondary');
            soloElement.parentElement.classList.add('bg-secondary');
    
            grupoElement.checked = false;
            soloElement.checked = true;
    
            nombreInput.placeholder = 'Ej: Albert Perez Matos'; 
    
            nombreInput.classList.add('w-100');
            nombreInput.classList.remove('w-75');
            cantidadInput.classList.add('d-none');
            cantidadInput.classList.remove('d-block');

            if(soloElement.checked && !grupoElement.checked && nombreInput.value.length < 3) {
                toggleError(nombreInput, 'error', true)
            }else {
                toggleError(null, 'exito', false)
            };    
        }
        function seleccionarGrupo() {
            soloElement.parentElement.classList.remove('bg-secondary');
            grupoElement.parentElement.classList.add('bg-secondary');
    
            grupoElement.checked = true;
            soloElement.checked = false;
    
            nombreInput.placeholder = 'Ej: Familia Perez Matos';
    
            nombreInput.classList.remove('w-100');
            nombreInput.classList.add('w-75');
            cantidadInput.classList.remove('d-none');
            cantidadInput.classList.add('d-block');

            if(grupoElement.checked && !soloElement.checked 
                && nombreInput.value.length < 3 ) {
                toggleError(nombreInput, 'error', true)
            }else if(cantidadInput.value.length < 1 || Number(cantidadInput.value) < 2) {
                toggleError(cantidadInput, 'error', true)
            }else {
                toggleError(null, 'exito', false)
            };
        }
        let timeout;
        function toggleError(elemento, errorOexito, animacion) {
            if(elemento == null && errorOexito == 'exito') {
                // despues de escribir el nombre muestra opcion para agregar invitado 
                if( tipoAsistencia.value == 'miembro' && document.querySelector('.formAsistencia .abrir.d-none') ) {
                    document.querySelector('.formAsistencia .abrir').classList.remove('d-none');
                    if(Number( cantInvitadosInput.value ) >= 1){
                        invitadosToggle('abrir')
                    }else invitadosToggle('cerrar');
                }
                
                // Si todo está bien, despues de un rato disparar animation del btn siguiente
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    if( soloElement.checked && !grupoElement.checked && nombreInput.value.length < 3 ) {
                        return
                    }else if( grupoElement.checked && !soloElement.checked 
                        && nombreInput.value.length < 3 
                        ||grupoElement.checked && !soloElement.checked 
                        && cantidadInput.value.length < 1 && Number(cantidadInput.value) < 2 ) 
                        return;

                    // mostrar siguiente 
                    document.querySelector('#asistencia .siguiente').classList.add('siguienteANIMATION');
                document.querySelector('#asistencia .siguiente .contenido').classList.add('siguienteContenidoANIMATION')
                }, 700);
                return;
            }
            // Ver cual se valida
            if(elemento.id == 'nombre' || elemento.id == 'cantidad') {
                // exito
                if(errorOexito == 'exito') {
                    // resetear input de nombre
                    elemento.style.border = '5px solid #000';
                    elemento.classList.remove('errorInput');
                    elemento.style.outlineColor = '';
                }
                // error
                if(errorOexito == 'error') {
                    if(animacion){
                        elemento.classList.remove('errorInput');
                        setTimeout(() => {
                            elemento.classList.add('errorInput');
                        }, 500);
                    }
                    elemento.style.border = '5px solid var(--rojoSalsa)';
                    elemento.style.outlineColor = 'var(--rojoSalsa)';
                    // document.querySelector('.formAsistencia .abrir').classList.add('d-none');
                    invitadosToggle(false);
                    // setTimeout(() => {
                        document.querySelector('#asistencia .siguiente').classList.remove('siguienteANIMATION');
                        document.querySelector('#asistencia .siguiente .contenido').classList.remove('siguienteContenidoANIMATION')
                    // }, 500);
                }
            }
        }
    }
    
    async function getDataCulto(datos = {}) {
    
        // validar que no venga vacio
        // validate is not empty
        if(Object.keys(datos).length < 1 || !datos.tipoAsistencia ) return;
        let url = `https://iglesiadedios-bellocampo.herokuapp.com/culto/${datos.nombre}/${datos.tipoAsistencia}/${datos.cantidadAsistencia}/${datos.invitados}`;
        let res = await fetch(url, {
            method: 'GET'
        }).catch(err => {
            console.log(err)
            document.querySelector('#culto .contenido').innerHTML = '<p class="text-danger">Ha ocurrido un error, trate más tarde.</p>';
        });
        // obtener elemento HTML
        // get element
        let cultoContenido = document.querySelector('#culto .contenido'),
            cultoTemplate = ``;

        cultoContenido.innerHTML = `
            <div class="spinner mt-4">
                <div class="bounce1"></div>
                <div class="bounce2"></div>
                <div class="bounce3"></div>
            </div>
        `;

        // offline
        // let resJson = {
        //     cultos: [],
        //     mensajeHTML: {
        //         h5: 'Elije el culto',
        //         p: 'Haga click'
        //     }
        // }
        // resJson.cultos = cultosArray;
        // ==========

        res.json().then(resJson => {
            let soloOgrupo = soloElement.checked && !grupoElement.checked ? 1 : Number(cantidadInput.value);

            // Crear los templates
            // resJson.cultos[0].asistenciaActual = 99;
            
            resJson.cultos.forEach(culto => {
                let cultoNoDisponible = {
                    clase : '',
                    texto: '',
                    textoTachado: '',
                    disponible: true
                };

                // validar si se sobrepasa el limite de asistencia
                // console.log(soloOgrupo)
                if( tipoAsistencia.value == 'miembro' && soloOgrupo + culto.asistenciaActual > culto.asistenciaMaxima ){
                    cultoNoDisponible.texto = `
                        <span class="text-white text-decoration-none">
                            Este servício no está disponible, yá está lleno.
                        </span>
                    `;
                    cultoNoDisponible.clase = 'disabled';
                    cultoNoDisponible.disponible = false;
                    cultoNoDisponible.textoTachado = 'text-decoration-line-through';
                    culto.id = null;
                }

                cultoTemplate +=
                    `<div class="col-sm-12 col-md-6 col-lg-6 mb-3" style="max-height: 180px">
                        <div class="culto ${cultoNoDisponible.clase} row align-items-center w-100 h-100 mx-auto" id="${culto.id}">
                            <div class="info col-12 col-sm-10 p-4">
                                <h5 class="d-flex justify-content-between ${cultoNoDisponible.textoTachado}">
                                    <span class="fw-bold text-capitalize">
                                        ${culto.nombre}
                                    </span>
                                    <span class="culto-btn d-flex d-sm-none align-items-center" id="${culto.id}">
                                        <i class="bi bi-calendar-check-fill d-none"></i>
                                        <i class="bi bi-calendar-check d-none text-muted"></i>
                                        <i class="bi bi-calendar text-muted"></i>
                                    </span>
                                </h5>
                                <small class="text-capitalize ${cultoNoDisponible.textoTachado}">${culto.tema}</small>
                                <p class="m-0 hora ${cultoNoDisponible.textoTachado}">${culto.horaEmpieza} - ${culto.horaTermina}</p>
                                ${ !cultoNoDisponible.disponible? 
                                    cultoNoDisponible.texto
                                : (
                                    tipoAsistencia.value == 'miembro'?
                                    `
                                    <div class="asistencias">
                                        <span class="asistenciaActual">
                                            ${culto.asistenciaActual === false? '':culto.asistenciaActual }
                                        </span>
                                        /
                                        <span class="asistenciaMaxima">
                                            ${culto.asistenciaMaxima === false? '':culto.asistenciaMaxima }
                                        </span>
                                        Miembros
                                    </div>
                                    `: ''
                                )}
                            </div>
                            <div class="culto-btn col-12 col-sm-2 d-none p-0 d-sm-flex align-items-center justify-content-center">
                                <div class="pe-4" id="${culto.id}">
                                    <i class="bi bi-calendar-check-fill d-none"></i>
                                    <i class="bi bi-calendar-check d-none text-muted"></i>
                                    <i class="bi bi-calendar text-muted"></i>
                                </div>
                            </div>
                        </div>
                    </div>`;
            });

            // Despues de 1s Mostrar UI
            setTimeout(() => {
                // insertar HTML
                cultoContenido.innerHTML = `
                    ${resJson.mensajeHTML.h5}
                    ${resJson.mensajeHTML.p}
                    <div class="cultos row mx-auto w-100">
                        ${resJson.cultos.length > 0? cultoTemplate : 'No hay servicios por el momento'}
                    </div>
                `;
                // Detectar clicks
                document.querySelector('#culto').addEventListener('click', e => {
                    // Detectar cual es seleccionado =====================
                    let soloOgrupo = Number(cantidadInput.value) <= 1 ? 1 : Number(cantidadInput.value);
                    // obtener culto ID
                    let cultoId = e.target.parentElement.id,
                        cantidad = 1;
                    // Validad cantidad total
                    cantidad = soloOgrupo > 1? 
                                    Number(cantInvitadosInput.value) > 0 ? 
                                    `${soloOgrupo + Number(cantInvitadosInput.value)} (Grupo)`
                                    : `${soloOgrupo} (Grupo)`
                               : Number(cantInvitadosInput.value) > 0 ?
                                    `${soloOgrupo + Number(cantInvitadosInput.value)} (tu e Invitados)`
                                    :`${soloOgrupo} (Solo tú)`;

                    // validar si hay mas de 1 culto
                    if(cultoId && cultoId.length > 5 && cultoId !== 'confirmado') {
                        if(resJson.cultos.length && resJson.cultos.length > 1) {
                            cultoSeleccionado = resJson.cultos.filter(culto => culto.id == cultoId)[0];
                        }else {
                            cultoSeleccionado = resJson.cultos[0];
                        }
                        // validar si hay culto
                        if(cultoSeleccionado && cultoSeleccionado.id ){
                            // Insertar datos al HTML
                            servicioModal.nombre.innerText = cultoSeleccionado.nombre;
                            servicioModal.tema.innerText = cultoSeleccionado.tema;
                            servicioModal.hora.innerText = `${cultoSeleccionado.horaEmpieza} - ${cultoSeleccionado.horaTermina}`;
                            if(tipoAsistencia.value == 'miembro') {
                                document.querySelector('#servicioModal .asistencia').style.opacity = '1';
                                servicioModal.cantidadAagregar.innerText = `+${ cantidad }`;
                                servicioModal.asistenciaActual.innerText = cultoSeleccionado.asistenciaActual;
                                servicioModal.asistenciaMaxima.innerText = cultoSeleccionado.asistenciaMaxima;
                            }else {
                                document.querySelector('#servicioModal .asistencia').style.opacity = '0';
                            }
                            document.querySelector('#servicioModal #bien').value = cultoSeleccionado.id;
                            // Mostrar modal
                            servicioModal.modalHandle.show();
                        }
                    }
                    // Detectar si el usuario está seguro
                    // Detectar cuando cliquea confirmar
                    if( e.target.id == 'confirmado' 
                        || e.target.parentElement.id == 'confirmado' 
                        || e.target.parentElement.parentElement.id == 'confirmado'){
                        e.stopImmediatePropagation();
                        // Agradecer
                        darAgradecimientos({
                            id: document.getElementById('bien').value,
                            nombre: nombreInput.value,
                            tipoAsistencia: document.getElementById('tipoAsistencia').value,
                            cantidadAsistencia: soloOgrupo,
                            invitados: Number(cantInvitadosInput.value)
                        });
                    }
                })
                document.querySelector('#bien').addEventListener('click', e => {
                    if(e.target.id == 'bien') {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        // Ocultar modal
                        servicioModal.modalHandle.hide();
                        // Mostrar confirmar btn
                        document.querySelector('#confirmado').classList.add('confirmadoANIMATION');
                        // Mantener activo el culto seleccionado y no disponible el que no
                        document.querySelectorAll('.culto').forEach(el => {
                            el.style.pointerEvents = 'none';
                            if(el.id !== e.target.value) {
                                el.classList.add('disabled');
                            }else if(el.id == e.target.value) {
                                el.classList.add('activo');
                                if(el.firstElementChild.lastElementChild.classList.contains("asistencias") ){
                                    let asistenciaActual = Number(el.firstElementChild.lastElementChild.firstElementChild.innerText);
                                    el.firstElementChild.lastElementChild.firstElementChild.innerText = `${asistenciaActual + soloOgrupo}`;
                                }
                            }
                        })
                        // Modificar cards
                        document.querySelectorAll(`#${e.target.value} .culto-btn`).forEach(btn => {
                            // Activar boton
                            btn.innerHTML = `<i style="color: var(--usafaBlue); text-shadow: none;" 
                                                class="bi bi-calendar-check-fill pe-4"></i>`
                        });
                        // cambiar boton de volver a CANCELAR
                        let volver = document.querySelector('#culto .volver').firstElementChild;
                        volver.innerHTML = '<i class="bi bi-arrow-90deg-up"></i> Cancelar';
                        volver.addEventListener('click', event => {
                            if(event.target.textContent.toLowerCase().trim() == 'cancelar') {
                                event.preventDefault();
                            }
                            volver.innerHTML = '<i class="bi bi-arrow-90deg-up"></i> Volver';
                            document.querySelector('#confirmado').classList.remove('confirmadoANIMATION');
                            // Resetear
                            document.querySelector('.siguiente').click();
                        });
                    }
                })
            }, 1500);
        }).catch(err => {
            console.log(err)
            document.querySelector('#culto .contenido').innerHTML = '<p class="text-danger">Ha ocurrido un error, trate más tarde.</p>';
        });
    }
    // async function agregarCulto(datos = {}) {
    
    //     // validar que no venga vacio
    //     // validate is not empty
    //     if(Object.keys(datos).length < 1 ) return;
    
    //     let url = `https://iglesiadedios-bellocampo.herokuapp.com/${datos.accion}/${datos.adminCode}/${datos.id}/${datos.nombre}/${datos.tema}/${datos.asistenciaMaxima}/${datos.horaEmpieza}/${datos.horaTermina}`;
    //     let res = await fetch(url, {
    //         method: 'GET'
    //     });
    
    //     console.log( await res.json() );
    // }
});