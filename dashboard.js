import { apiGet } from './general/api.js';

const role = localStorage.getItem('role');
const userId = localStorage.getItem('userId');

if (!role || !userId) {
  window.location.href = 'login.html';
}

const candidateLink = document.getElementById('candidateLink');
const companyLink = document.getElementById('companyLink');
const usersLink = document.getElementById('usersLink');
const createJobBtn = document.getElementById('createJobBtn');
const userName = document.getElementById('userName');
const userRole = document.getElementById('userRole');

async function initDashboard() {
  try {
    if (role === 'candidate') {
      candidateLink.style.display = 'block';
      usersLink.style.display = 'block';
      
      const candidate = await apiGet(`/candidates/${userId}`);
      userName.textContent = candidate.name;
      userRole.textContent = 'Candidate';
    } else if (role === 'company') {
      companyLink.style.display = 'block';
      createJobBtn.style.display = 'block';
      
      const company = await apiGet(`/companies/${userId}`);
      userName.textContent = company.name;
      userRole.textContent = 'Company';
    }
  } catch (err) {
    console.error('Error initializing dashboard:', err);
  }
}

initDashboard();
