var slider = {
    sliderTimeOut: null,
    template: '',
    paginator: 2,
    carrusel: document.querySelector('div.slider > div.carrusel'),
    slider: document.querySelector('div.slider'),
    atrasBoton: document.querySelector('div.atrasBoton'),
    luegoBoton: document.querySelector('div.luegoBoton'),
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
    
    },
    listeners() {
        this.slider.addEventListener('scroll', e => {
    
            if (e.target.scrollLeft >= (e.target.scrollWidth - e.target.clientWidth) - (e.target.clientWidth/2)) {
                clearTimeout(this.sliderTimeOut);
                this.sliderTimeOut = setTimeout(async () => {
                    this.consulta(this.paginator);
                    this.paginator++;
                }, 250);
            }
            this.desaparecerAparecer();
        });
        
        this.slider.addEventListener('click', e => {
            if (e.target.className == 'atrasBoton') {
                this.slider.scrollTo({
                    top: 0,
                    left: this.slider.scrollLeft - (this.slider.clientWidth /2),
                    behavior: 'smooth'
                });
                
            }else if(e.target.className == 'luegoBoton') {
                this.slider.scrollTo({
                    top: 0,
                    left: this.slider.scrollLeft + (this.slider.clientWidth /2),
                    behavior: 'smooth'
                });
            }   

        });
    },
    desaparecerAparecer() {
        if (this.slider.scrollLeft <= 0){
            this.atrasBoton.style.display = 'none';
        }else {
            this.atrasBoton.style.display = 'flex';
        }

        if (this.slider.scrollLeft >= (this.slider.scrollWidth - this.slider.clientWidth)){
            this.luegoBoton.style.display = 'none';
        }else {
            this.luegoBoton.style.display = 'flex';
        }
    },primeraEjecucion() {
        this.consulta(this.paginator);
        this.paginator++;
        this.listeners()
    }
}

slider.primeraEjecucion();






