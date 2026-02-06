// this file handles the candidate profile
import { apiGet, apiPatch } from '../general/api.js';
import { getCandidatePlan, getCandidateReservationLimit } from '../general/plans.js';

let userId;
let datosUsuario = {};
let plans = [];

const candidateName = document.getElementById('candidateName');
const candidateTitle = document.getElementById('candidateTitle');
const candidateLocation = document.getElementById('candidateLocation');
const candidateBio = document.getElementById('candidateBio');
const candidateEmail = document.getElementById('candidateEmail');
const candidatePhone = document.getElementById('candidatePhone');
const candidateSkills = document.getElementById('candidateSkills');
const candidateDescription = document.getElementById('candidateDescription');
const currentPlanPill = document.getElementById('currentPlanPill');
const planLimitLabel = document.getElementById('planLimitLabel');
const planPriceLabel = document.getElementById('planPriceLabel');

const toggleOtwBtn = document.getElementById('toggleOtw');
const otwStatus = document.getElementById('otwStatus');
const messageDiv = document.getElementById('message');
const headerUserName = document.getElementById('headerUserName');
const headerUserRole = document.getElementById('headerUserRole');
const headerAvatar = document.getElementById('headerAvatar');
const headerAvatarImg = document.getElementById('headerAvatarImg');

const role = localStorage.getItem('role');

// if not a candidate, go back
if (role !== 'candidate') {
  window.location.href = '../dashboard.html';
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// try a few times if it fails
async function apiGetWithRetry(endpoint, retries = 2) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await apiGet(endpoint);
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await wait(500 * (attempt + 1));
      }
    }
  }
  throw lastError;
}

function shortCandidatePlanLabel(planId) {
  if (planId === 'cand_free') return 'Free';
  if (planId === 'cand_pro_1') return 'Pro L1';
  if (planId === 'cand_pro_2') return 'Pro L2';
  return planId || 'Free';
}

// start on page load
window.addEventListener('load', function() {
  showFlashMessageIfAny();
  cargarPerfil();
  document.getElementById('toggleOtw').addEventListener('click', guardarCambios);
  document.getElementById('fotoInput').addEventListener('change', cambiarFoto);
  document.getElementById('saveDescriptionBtn').addEventListener('click', guardarDescripcion);
});

// load profile data
async function cargarPerfil() {
  userId = localStorage.getItem('userId');
  
  if (!userId) {
    window.location.href = '../login.html';
    return;
  }
  
  try {
    const user = await apiGetWithRetry(`/candidates/${userId}`);
    datosUsuario = user;
    // load plan metadata (optional but recommended for labels)
    try {
      plans = await apiGetWithRetry('/plans');
    } catch (e) {
      plans = [];
    }
    llenarFormulario(user);
  } catch (error) {
    mostrarMensaje('No se pudo cargar el perfil. Verifica que el servidor esté activo.', 'error');
  }
}

// fill profile texts
function llenarFormulario(user) {
  candidateName.textContent = user.name || 'No name';
  candidateTitle.textContent = user.title || 'No job title';
  candidateLocation.textContent = user.location ? '📍 ' + user.location : '';
  candidateBio.textContent = user.bio || 'No bio added yet';
  candidateEmail.textContent = user.email || '';
  candidatePhone.textContent = user.phone || '';
  candidateDescription.value = user.description || '';
  if (headerUserName) {
    headerUserName.textContent = user.name || 'User';
  }
  if (headerUserRole) {
    headerUserRole.textContent = 'Candidate';
  }
  
  if (user.avatar) {
    document.getElementById('fotoPreview').src = user.avatar;
    document.getElementById('fotoPreview').style.display = 'block';
    document.getElementById('sinFoto').style.display = 'none';
    if (headerAvatar && headerAvatarImg) {
      headerAvatarImg.src = user.avatar;
      headerAvatar.classList.add('has-photo');
    }
  }
  
  updateOtwStatus();
  renderSkills(user.skills);
  renderPlan(user);
}

function renderSkills(skills) {
  candidateSkills.innerHTML = '';
  if (skills && Array.isArray(skills)) {
    for (let i = 0; i < skills.length; i++) {
      const span = document.createElement('span');
      span.textContent = skills[i];
      candidateSkills.appendChild(span);
    }
  }
}

// show open to work status
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

// save status change
async function guardarCambios() {
  if (!userId) {
    mostrarMensaje('No se encontró ID de usuario', 'error');
    return;
  }

  try {
    const datosActualizar = {
      openToWork: !datosUsuario.openToWork
    };
    
    const usuarioActualizado = await apiPatch(`/candidates/${userId}`, datosActualizar);
    datosUsuario = usuarioActualizado;
    updateOtwStatus();
    mostrarMensaje('Perfil guardado correctamente', 'success');
  } catch (error) {
    mostrarMensaje('Error al guardar', 'error');
  }
}


function renderPlan(user) {
  if (!currentPlanPill || !planLimitLabel || !planPriceLabel) return;

  const planId = user?.planId || 'cand_free';
  const plan = getCandidatePlan(plans, user);
  const limit = getCandidateReservationLimit(plans, user);

  // colored pill
  currentPlanPill.dataset.plan = planId;
  currentPlanPill.textContent = shortCandidatePlanLabel(planId);
  currentPlanPill.title = plan?.name || planId;

  // numbers / price
  planLimitLabel.textContent = `${limit} empresa${limit === 1 ? '' : 's'}`;

  const price = plan?.priceMonthly;
  if (price === 0) {
    planPriceLabel.textContent = 'Gratis';
  } else if (typeof price === 'number') {
    planPriceLabel.textContent = `$${price.toFixed(2)} USD`;
  } else {
    planPriceLabel.textContent = '--';
  }
}



function showFlashMessageIfAny() {
  try {
    const raw = localStorage.getItem('flashMessage');
    if (!raw) return;
    const data = JSON.parse(raw);
    localStorage.removeItem('flashMessage');
    if (data?.text) {
      mostrarMensaje(data.text, data.type || 'success');
    }
  } catch (e) {
    localStorage.removeItem('flashMessage');
  }
}

function mostrarMensaje(texto, tipo) {
  messageDiv.textContent = texto;
  messageDiv.className = `message ${tipo}`;
  messageDiv.style.display = 'block';
  
  setTimeout(function() {
    messageDiv.style.display = 'none';
  }, 3000);
}

// change the photo and compress it
function cambiarFoto() {
  const archivo = document.getElementById('fotoInput').files[0];
  
  if (!archivo) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      let width = img.width;
      let height = img.height;
      const maxSize = 600;
      
      if (width > height) {
        if (width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      const imagenComprimida = canvas.toDataURL('image/jpeg', 0.7);
      guardarFoto(imagenComprimida);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(archivo);
}

// save the photo on the server
async function guardarFoto(imagenBase64) {
  try {
    const usuarioActualizado = await apiPatch(`/candidates/${userId}`, { avatar: imagenBase64 });
    datosUsuario = usuarioActualizado;
    document.getElementById('fotoPreview').src = imagenBase64;
    document.getElementById('fotoPreview').style.display = 'block';
    document.getElementById('sinFoto').style.display = 'none';
    mostrarMensaje('Photo saved successfully', 'success');
  } catch (error) {
    mostrarMensaje('Error saving photo', 'error');
  }
}

// save the description
async function guardarDescripcion() {
  const descripcion = candidateDescription.value.trim();
  
  if (!userId) {
    mostrarMensaje('No se encontró ID de usuario', 'error');
    return;
  }
  
  try {
    const datosActualizar = {
      description: descripcion
    };
    
    const usuarioActualizado = await apiPatch(`/candidates/${userId}`, datosActualizar);
    datosUsuario = usuarioActualizado;
    mostrarMensaje('Description saved successfully', 'success');
  } catch (error) {
    mostrarMensaje('Error saving description', 'error');
  }
}
