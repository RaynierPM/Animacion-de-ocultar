var slider = {
    sliderTimeOut: null,
    template: '',
    desplazamiento: null,
    paginator: 2,
    carrusel: document.querySelector('.carrusel'),
    slider: document.querySelector('.slider'),
    contenedorCarrusel: document.querySelector('.contenedor-carrusel'),
    atrasBoton: document.querySelector('.botones > .atras'),
    luegoBoton: document.querySelector('.botones >.luego'),
    promise: async function (pag = 1) {
        try {
            pag = pag * 4;
            const response = await fetch(`https://randomuser.me/api/?results=${pag}`);
            
            let res = await response.json();
            return res.results;
        } catch (error) {
            console.log(error)
        }    
    }, 
    consulta: async function(pag) {
        let respuesta = await this.promise(pag);
        respuesta.forEach(element => {
            let fecha = element.registered.date.split('T');
            this.template += `<div class="element" style="background-image: url(${element.picture.large}); background-repeat: no-repeat; background-size: cover; backgroun-position: center center;">
            <h3>${element.name.first} ${element.name.last}</h3>
            <p>Nacio: ${fecha[0]}</p>                
            </div>`;
        });
        this.carrusel.innerHTML += this.template;
        this.template = ``;
        this.desaparecerAparecer()
        this.calcularDesplazamiento();
    
    },
    listeners() {
        this.contenedorCarrusel.addEventListener('scroll', e => {
    
            if (e.target.scrollLeft >= (e.target.scrollWidth - e.target.clientWidth) - (e.target.clientWidth/2)) {
                clearTimeout(this.sliderTimeOut);
                this.sliderTimeOut = setTimeout(async () => {
                    this.consulta(this.paginator);
                    this.paginator++;
                }, 250);
            }
            this.desaparecerAparecer();
        });
        
        // Listener para los botones 
        this.slider.addEventListener('click', e => {
            if (e.target.classList.contains('atras')) {
                this.contenedorCarrusel.scrollTo({
                    top: 0,
                    left: this.contenedorCarrusel.scrollLeft - this.desplazamiento,
                    behavior: 'smooth'
                });
                console.log('click')
                
            }else if(e.target.classList.contains('luego')) {
                this.contenedorCarrusel.scrollTo({
                    top: 0,
                    left: this.contenedorCarrusel.scrollLeft + this.desplazamiento,
                    behavior: 'smooth'
                });
                console.log('click')
            }   

        });

        window.addEventListener('resize', () => {
            this.calcularDesplazamiento();
            this.desaparecerAparecer();
        });
    },
    desaparecerAparecer() {
        // Si no ha elementos en el slider o el tamanio de la pantalla es muy pequenio se eliminan los botones
        if (this.carrusel.children.length == 0 || window.innerWidth <= 768) {
            this.atrasBoton.style.display = 'none';
            this.luegoBoton.style.display = 'none';
        }else {

            // Si el carrusel llega la borde desaparece el boton del respectivo lado
            if (this.contenedorCarrusel.scrollLeft <= 0){
                this.atrasBoton.style.display = 'none';
            }else {
                this.atrasBoton.style.display = 'flex';
            }
            
            if (this.contenedorCarrusel.scrollLeft >= (this.contenedorCarrusel.scrollWidth - this.contenedorCarrusel.clientWidth)){
                this.luegoBoton.style.display = 'none';
            }else {
                this.luegoBoton.style.display = 'flex';
            }
        }

        
    },primeraEjecucion() {
        this.consulta(this.paginator);
        this.paginator++;
        this.listeners()
    },
    calcularDesplazamiento() {
        // Si la pantalla es de 768px o mas, el desplazamiento del slider es de 3 elementos y mas 3 veces el margen izquierdo (10px)
        if (window.innerWidth >= 768) {
            this.desplazamiento = (document.querySelector('.carrusel > .element').clientWidth + 10) * 3;


        // Si la pantalla es de 576px o mas, el desplazamiento del slider es de 2 elementos y mas 2 veces el margen izquierdo (10px)
        }else if (window.innerWidth >= 576) {
            this.desplazamiento = (document.querySelector('.carrusel > .element').clientWidth + 10) * 2;


        // Si la pantalla es de 576px o mas, el desplazamiento del slider es de 1 elemento y mas 1 vez el margen izquierdo (10px)
        }else {
            this.desplazamiento = document.querySelector('.carrusel > .element').clientWidth + 10;
        }
    }
}

slider.primeraEjecucion();