let userId;
let datosUsuario = {};

const candidateName = document.getElementById('candidateName');
const candidateTitle = document.getElementById('candidateTitle');
const candidateLocation = document.getElementById('candidateLocation');
const candidateBio = document.getElementById('candidateBio');
const candidateEmail = document.getElementById('candidateEmail');
const candidatePhone = document.getElementById('candidatePhone');
const candidateSkills = document.getElementById('candidateSkills');
const candidateDescription = document.getElementById('candidateDescription');
const toggleOtwBtn = document.getElementById('toggleOtw');
const otwStatus = document.getElementById('otwStatus');
const messageDiv = document.getElementById('message');
const saveDescriptionBtn = document.getElementById('saveDescriptionBtn');

const role = localStorage.getItem('role');

if (role !== 'candidate') {
  window.location.href = 'dashboard.html';
}


window.addEventListener('load', function() {
  cargarPerfil();
  document.getElementById('toggleOtw').addEventListener('click', guardarCambios);
  document.getElementById('fotoInput').addEventListener('change', cambiarFoto);
  document.getElementById('saveDescriptionBtn').addEventListener('click', guardarDescripcion);
});

function cargarPerfil() {
  userId = localStorage.getItem('userId');
  
  if (!userId) {
    mostrarMensaje('No hay usuario logueado', 'error');
    return;
  }
  
  fetch('http://localhost:3001/candidates/' + userId)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(user => {
      datosUsuario = user;
      llenarFormulario(user);
    })
    .catch(error => {
      mostrarMensaje('Error al cargar: Verifica que json-server esté corriendo en puerto 3001', 'error');
    });
}

function llenarFormulario(user) {
  candidateName.textContent = user.name || 'No name';
  candidateTitle.textContent = user.title || 'No job title';
  candidateLocation.textContent = user.location ? '📍 ' + user.location : '';
  candidateBio.textContent = user.bio || 'No bio added yet';
  candidateEmail.textContent = user.email || '';
  candidatePhone.textContent = user.phone || '';
  candidateDescription.value = user.description || '';
  
  if (user.avatar) {
    document.getElementById('fotoPreview').src = user.avatar;
    document.getElementById('fotoPreview').style.display = 'block';
    document.getElementById('sinFoto').style.display = 'none';
  }
  
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
      guardarFoto(imagenBase64);
    };
    reader.readAsDataURL(archivo);
  }
}

function guardarFoto(imagenBase64) {
  const datosActualizar = {
    avatar: imagenBase64 || datosUsuario.avatar
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
    mostrarMensaje('Photo saved successfully', 'success');
  })
  .catch(error => {
    mostrarMensaje('Error saving photo: ' + error.message, 'error');
  });
}

function guardarDescripcion() {
  const descripcion = candidateDescription.value.trim();
  
  if (!userId) {
    mostrarMensaje('No se encontró ID de usuario', 'error');
    return;
  }
  
  const datosActualizar = {
    description: descripcion
  };
  
  fetch('http://localhost:3001/candidates/' + userId, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datosActualizar)
  })
  .then(response => {
    if (!response.ok) throw new Error('Error saving description');
    return response.json();
  })
  .then(usuarioActualizado => {
    datosUsuario = usuarioActualizado;
    mostrarMensaje('Description saved successfully', 'success');
  })
  .catch(error => {
    mostrarMensaje('Error saving description: ' + error.message, 'error');
  });
}
