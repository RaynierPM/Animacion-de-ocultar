var pseudoFondo = {
    fondo: document.querySelector('.pseudoFondo'),
    subMenu: document.querySelector('.subMenu'),
    botones: ['search-toggle-menu', 'toggle-menu'],
    breakpoint: 558,


    listener() {
        document.querySelector('.menu').addEventListener('click', e => {
            // Si la pantalla es menor o igual al breakpoint y se clickea uno de los botones predefinidos
            // Entonces el aparece el sub menu y detras de el un fondo negro traslucido clickeable
            if ((e.target.classList.contains(this.botones[0]) 
            || e.target.classList.contains(this.botones[1])) && window.innerWidth <= this.breakpoint) {
                if (this.fondo.classList.contains('d-block')){
                    // Si tiene la clase block elimina su color para crear un animacion y luego espera 
                    //300ms para desaparecerlo de pantalla
                    this.cerrar();

                }else {
                    this.abrir();
                }
            } 
        });

        this.fondo.addEventListener('click', e => {
            this.cerrar()
        });
    },
    cerrar() {
        this.subMenu.style.opacity = '0';
        this.fondo.style.background = '#0000';
        setTimeout(()=> {this.fondo.classList.remove('d-block');this.subMenu.classList.remove('d-block');}, 300)
    },
    abrir() {
        this.subMenu.classList.add('d-block')
        this.fondo.classList.add('d-block')
        setTimeout(()=> {this.fondo.style.background = '#000';this.subMenu.style.opacity = '1';}, 300)
    }
}

pseudoFondo.listener();