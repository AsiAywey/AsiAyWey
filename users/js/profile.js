let userId;
let datosUsuario = {};

window.addEventListener('load', function() {
    cargarPerfil();
    document.getElementById('guardarBtn').addEventListener('click', guardarCambios);
    document.getElementById('fotoInput').addEventListener('change', cambiarFoto);
});

function cargarPerfil() {
    userId = localStorage.getItem('userId');
    console.log('UserID desde localStorage:', userId);
    
    if (!userId) {
        mostrarMensaje('No hay usuario logueado', 'danger');
        return;
    }
    
    // Cargar datos del usuario
    fetch('http://localhost:3000/users/' + userId)
        .then(response => {
            console.log('Respuesta GET usuario:', response.status);
            if (!response.ok) {
                throw new Error('Usuario no encontrado');
            }
            return response.json();
        })
        .then(user => {
            console.log('Usuario cargado:', user);
            datosUsuario = user;
            llenarFormulario(user);
        })
        .catch(error => {
            console.log('Error al cargar:', error);
            mostrarMensaje('Error al cargar el perfil: ' + error.message, 'danger');
        });
}

function llenarFormulario(user) {
    document.getElementById('nombreCompleto').value = user.fullName || '';
    document.getElementById('usuario').value = user.username || '';
    document.getElementById('email').value = user.email || '';
    
    document.getElementById('telefono').value = user.phone || '';
    document.getElementById('descripcion').value = user.description || '';
    document.getElementById('profesion').value = user.profession || '';
    document.getElementById('estado').value = user.status || 'DISPONIBLE';
    
    // Manejar foto de perfil
    if (user.avatar && user.avatar !== '') {
        document.getElementById('fotoPreview').src = user.avatar;
        document.getElementById('fotoPreview').style.display = 'block';
        document.getElementById('sinFoto').style.display = 'none';
    } else {
        document.getElementById('fotoPreview').style.display = 'none';
        document.getElementById('sinFoto').style.display = 'block';
    }
}

function cambiarFoto() {
    const archivo = document.getElementById('fotoInput').files[0];
    
    if (archivo) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imagenBase64 = e.target.result;
            document.getElementById('fotoPreview').src = imagenBase64;
            document.getElementById('fotoPreview').style.display = 'block';
            document.getElementById('sinFoto').style.display = 'none';
        };
        reader.readAsDataURL(archivo);
    } else {
        document.getElementById('fotoPreview').style.display = 'none';
        document.getElementById('sinFoto').style.display = 'block';
    }
}

function guardarCambios() {
    const telefono = document.getElementById('telefono').value;
    const descripcion = document.getElementById('descripcion').value;
    const profesion = document.getElementById('profesion').value;
    const estado = document.getElementById('estado').value;
    
    if (!estado) {
        mostrarMensaje('El estado es obligatorio', 'warning');
        return;
    }
    
    if (!userId) {
        mostrarMensaje('No se encontró ID de usuario', 'danger');
        return;
    }
    const datosActualizar = {
        phone: telefono,
        description: descripcion,
        profession: profesion,
        status: estado
    };
    
    const fotoPreview = document.getElementById('fotoPreview');
    if (fotoPreview.style.display !== 'none' && fotoPreview.src && fotoPreview.src !== '') {
        datosActualizar.avatar = fotoPreview.src;
    }
    
    console.log('Enviando datos:', datosActualizar);
    console.log('URL:', 'http://localhost:3000/users/' + userId);
    fetch('http://localhost:3000/users/' + userId, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosActualizar)
    })
    .then(response => {
        console.log('Respuesta del servidor:', response.status);
        if (!response.ok) {
            throw new Error('Error del servidor: ' + response.status);
        }
        return response.json();
    })
    .then(usuarioActualizado => {
        mostrarMensaje('Perfil guardado correctamente', 'success');
        datosUsuario = usuarioActualizado;
        console.log('Usuario actualizado:', usuarioActualizado);
    })
    .catch(error => {
        console.log('Error completo:', error);
        mostrarMensaje('Error al guardar: ' + error.message, 'danger');
    });
}

function mostrarMensaje(texto, tipo) {
    const mensajeDiv = document.getElementById('mensaje');
    mensajeDiv.innerHTML = '<div class="alert alert-' + tipo + '">' + texto + '</div>';
    
    setTimeout(function() {
        mensajeDiv.innerHTML = '';
    }, 3000);
}
