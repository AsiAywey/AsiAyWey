import { apiGet } from './general/api.js';

const form = document.getElementById('loginForm');
const roleSelect = document.getElementById('role');
const userSelect = document.getElementById('userId');
const messageDiv = document.getElementById('message');

let candidates = [];
let companies = [];

// Cargar datos al abrir
async function loadUsers() {
  try {
    candidates = await apiGet('/candidates');
    companies = await apiGet('/companies');
  } catch (err) {
    showMessage('Error loading users', 'error');
  }
}

function showMessage(text, type = 'success') {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = 'block';
}

function updateUserOptions() {
  const role = roleSelect.value;
  userSelect.innerHTML = '<option value="">-- Choose user --</option>';

  if (role === 'candidate') {
    candidates.forEach(c => {
      const option = document.createElement('option');
      option.value = c.id;
      option.textContent = c.name;
      userSelect.appendChild(option);
    });
  } else if (role === 'company') {
    companies.forEach(c => {
      const option = document.createElement('option');
      option.value = c.id;
      option.textContent = c.name;
      userSelect.appendChild(option);
    });
  }
}

roleSelect.addEventListener('change', updateUserOptions);

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const role = roleSelect.value;
  const userId = userSelect.value;

  if (!role || !userId) {
    showMessage('Please select role and user', 'error');
    return;
  }

  localStorage.setItem('role', role);
  localStorage.setItem('userId', userId);

  window.location.href = 'dashboard.html';
});

loadUsers();
