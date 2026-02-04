import { apiGet, apiPatch } from './general/api.js';
import { getCache, setCache, clearCache } from './general/cache.js';

const userId = localStorage.getItem('userId');
const role = localStorage.getItem('role');

if (role !== 'candidate') {
  window.location.href = 'dashboard.html';
}

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

let candidate = null;

function showMessage(text, type = 'success') {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = 'block';
  setTimeout(() => { messageDiv.style.display = 'none'; }, 3000);
}

async function loadCandidate() {
  try {
    candidate = await apiGet(`/candidates/${userId}`);
    
    candidateName.textContent = candidate.name;
    candidateTitle.textContent = candidate.title;
    candidateLocation.textContent = '📍 ' + candidate.location;
    candidateBio.textContent = candidate.bio;
    candidateEmail.textContent = candidate.email;
    candidatePhone.textContent = candidate.phone;
    
    updateOtwStatus();
    renderSkills();
  } catch (err) {
    console.error('Error loading candidate:', err);
    showMessage('Error loading profile', 'error');
  }
}

function updateOtwStatus() {
  if (candidate.openToWork) {
    toggleOtwBtn.textContent = 'Deactivate Open to Work';
    toggleOtwBtn.classList.add('active');
    otwStatus.textContent = '✓ Open to Work: ACTIVE';
  } else {
    toggleOtwBtn.textContent = 'Activate Open to Work';
    toggleOtwBtn.classList.remove('active');
    otwStatus.textContent = '✗ Open to Work: Not Active';
  }
}

function renderSkills() {
  candidateSkills.innerHTML = '';
  candidate.skills.forEach(skill => {
    const span = document.createElement('span');
    span.textContent = skill;
    candidateSkills.appendChild(span);
  });
}

toggleOtwBtn.addEventListener('click', async () => {
  try {
    candidate.openToWork = !candidate.openToWork;
    await apiPatch(`/candidates/${userId}`, { openToWork: candidate.openToWork });
    clearCache('candidates');
    updateOtwStatus();
    showMessage(candidate.openToWork ? 'Open to Work activated' : 'Open to Work deactivated');
  } catch (err) {
    console.error('Error toggling OTW:', err);
    showMessage('Error updating profile', 'error');
  }
});

loadCandidate();
