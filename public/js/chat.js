

let usuario=null;
let socket=null;
const url= (window.location.hostname.includes('localhost')) ? 'http://localhost:8080/api/auth/':'https://noderestserverbase.herokuapp.com/api/auth/'

// referencias html

const txtUid= document.querySelector('#txtUid');
const txtMensaje= document.querySelector('#txtMensaje');
const ulUsuarios= document.querySelector('#ulUsuarios');
const ulMensajes= document.querySelector('#ulMensajes');
const btnSalir= document.querySelector('#btnSalir');

// validar el token del localStorage
const validarJWT = async () =>{
    
    const token= localStorage.getItem('token') || '';

    if(token.length <= 10){
        window.location='index.html';
        throw new Error('No hay token en el servidor');
    }

    const resp= await fetch(url,{
        headers: {'x-token': token},
    });

    const {usuario: userDB, token: tokenDB}= await resp.json();
    // console.log(userDB,tokenDB);
    localStorage.setItem('token',tokenDB);
    usuario=userDB;
    document.title= usuario.nombre;

    conectarSocket();
}

const conectarSocket = async () =>{

    socket= io({
        'extraHeaders': {
            'x-token': localStorage.getItem('token')
        }
    });

    socket.on('connect', ()=>{
        console.log('Socket online');
    });
    
    socket.on('disconnect', ()=>{
        console.log('Socket offline');
    });

    socket.on('recibir-mensajes', dibujarMensajes);
    
    socket.on('usuarios-activos',dibujarUsuarios);

    socket.on('mensaje-privado', (payload) =>{
        console.log("MEnsaje privado:", payload);
    });

}

const dibujarUsuarios= (usuarios=[]) =>{
    
    let usersHTML='';
    usuarios.forEach(({nombre,uid}) =>{

        usersHTML+=`
            <li>
                <p>
                    <h5 class="text-success" >${nombre}</h5>
                    <spam class="fs-6 text-muted">${uid}</spam>
                </p>
            </li>
        `;
    })

    ulUsuarios.innerHTML=usersHTML;
}

const dibujarMensajes= (mensajes=[]) =>{
    
    let mensajesHTML='';
    mensajes.forEach(({nombre,mensaje}) =>{

        mensajesHTML+=`
            <li>
                <p>
                    <spam class="text-primary" >${nombre}</spam>
                    <spam">${mensaje}</spam>
                </p>
            </li>
        `;
    })

    ulMensajes.innerHTML=mensajesHTML;
}

txtMensaje.addEventListener('keyup', ({keyCode}) =>{
    
    const mensaje= txtMensaje.value;
    const uid= txtUid.value;
    if(keyCode !== 13){return;}
    if(mensaje.length === 0){return}

    socket.emit('enviar-mensaje',{mensaje,uid});
    txtMensaje.value='';
});

const main = async () =>{

    // Validar JWT
    await validarJWT();
}


main();
