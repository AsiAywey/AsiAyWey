let userId;
let datosUsuario = {};

const candidateName = document.getElementById('candidateName');
const candidateTitle = document.getElementById('candidateTitle');
const candidateLocation = document.getElementById('candidateLocation');
const candidateBio = document.getElementById('candidateBio');
const candidateEmail = document.getElementById('candidateEmail');
const candidatePhone = document.getElementById('candidatePhone');
const candidateSkills = document.getElementById('candidateSkills');
const toggleOtwBtn = document.getElementById('toggleOtw');
const otwStatus = document.getElementById('otwStatus');
const messageDiv = document.getElementById('message');

const role = localStorage.getItem('role');

if (role !== 'candidate') {
  window.location.href = 'dashboard.html';
}

window.addEventListener('load', function() {
  cargarPerfil();
  document.getElementById('toggleOtw').addEventListener('click', guardarCambios);
  document.getElementById('fotoInput').addEventListener('change', cambiarFoto);
});

function cargarPerfil() {
  userId = localStorage.getItem('userId');
  
  if (!userId) {
    mostrarMensaje('No hay usuario logueado', 'error');
    return;
  }
  
  fetch('http://localhost:3001/candidates/' + userId)
    .then(response => {
      if (!response.ok) throw new Error('Usuario no encontrado');
      return response.json();
    })
    .then(user => {
      datosUsuario = user;
      llenarFormulario(user);
    })
    .catch(error => {
      mostrarMensaje('Error al cargar el perfil: ' + error.message, 'error');
    });
}

function llenarFormulario(user) {
  candidateName.textContent = user.name || '';
  candidateTitle.textContent = user.title || '';
  candidateLocation.textContent = '📍 ' + (user.location || '');
  candidateBio.textContent = user.bio || '';
  candidateEmail.textContent = user.email || '';
  candidatePhone.textContent = user.phone || '';
  
  updateOtwStatus();
  renderSkills(user.skills);
}

function renderSkills(skills) {
  candidateSkills.innerHTML = '';
  if (skills && Array.isArray(skills)) {
    skills.forEach(skill => {
      const span = document.createElement('span');
      span.textContent = skill;
      candidateSkills.appendChild(span);
    });
  }
}

function updateOtwStatus() {
  if (datosUsuario.openToWork) {
    toggleOtwBtn.textContent = 'Deactivate Open to Work';
    toggleOtwBtn.classList.add('active');
    otwStatus.textContent = '✓ Open to Work: ACTIVE';
  } else {
    toggleOtwBtn.textContent = 'Activate Open to Work';
    toggleOtwBtn.classList.remove('active');
    otwStatus.textContent = '✗ Open to Work: Not Active';
  }
}

function guardarCambios() {
  if (!userId) {
    mostrarMensaje('No se encontró ID de usuario', 'error');
    return;
  }

  const datosActualizar = {
    openToWork: !datosUsuario.openToWork
  };
  
  fetch('http://localhost:3001/candidates/' + userId, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datosActualizar)
  })
  .then(response => {
    if (!response.ok) throw new Error('Error del servidor: ' + response.status);
    return response.json();
  })
  .then(usuarioActualizado => {
    mostrarMensaje('Perfil guardado correctamente', 'success');
    datosUsuario = usuarioActualizado;
    updateOtwStatus();
  })
  .catch(error => {
    mostrarMensaje('Error al guardar: ' + error.message, 'error');
  });
}

function mostrarMensaje(texto, tipo) {
  messageDiv.textContent = texto;
  messageDiv.className = `message ${tipo}`;
  messageDiv.style.display = 'block';
  
  setTimeout(function() {
    messageDiv.style.display = 'none';
  }, 3000);
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
      
      datosUsuario.avatar = imagenBase64;
      guardarFoto();
    };
    reader.readAsDataURL(archivo);
  }
}

function guardarFoto() {
  const datosActualizar = {
    avatar: datosUsuario.avatar
  };
  
  fetch('http://localhost:3001/candidates/' + userId, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosActualizar)
  })
  .then(response => {
    if (!response.ok) throw new Error('Error saving photo');
    return response.json();
  })
  .then(usuarioActualizado => {
    datosUsuario = usuarioActualizado;
    mostrarMensaje('Photo updated successfully', 'success');
  })
  .catch(error => {
    mostrarMensaje('Error updating photo: ' + error.message, 'error');
  });
}
