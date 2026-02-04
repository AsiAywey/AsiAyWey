import { apiGet } from './general/api.js';

const role = localStorage.getItem('role');
const userId = localStorage.getItem('userId');

if (!role || !userId) {
  window.location.href = 'login.html';
}

const candidateLink = document.getElementById('candidateLink');
const companyLink = document.getElementById('companyLink');
const createJobBtn = document.getElementById('createJobBtn');
const userName = document.getElementById('userName');
const userRole = document.getElementById('userRole');
const tableBody = document.getElementById('tableBody');
const tableTitle = document.getElementById('tableTitle');
const headerAvatar = document.getElementById('headerAvatar');
const headerAvatarImg = document.getElementById('headerAvatarImg');

async function initDashboard() {
  try {
    if (role === 'candidate') {
      candidateLink.classList.remove('menu-item-hidden');
      const candidate = await apiGet(`/candidates/${userId}`);
      userName.textContent = candidate.name;
      userRole.textContent = 'Candidate';
      if (candidate.avatar && headerAvatar && headerAvatarImg) {
        headerAvatarImg.src = candidate.avatar;
        headerAvatar.classList.add('has-photo');
      }
      loadCandidateMatches();
    } else if (role === 'company') {
      companyLink.classList.remove('menu-item-hidden');
      createJobBtn.classList.remove('button-hidden');
      const company = await apiGet(`/companies/${userId}`);
      userName.textContent = company.name;
      userRole.textContent = 'Company';
      const avatarSrc = company.avatar || company.logo;
      if (avatarSrc && headerAvatar && headerAvatarImg) {
        headerAvatarImg.src = avatarSrc;
        headerAvatar.classList.add('has-photo');
      }
      loadCompanyMatches();
      loadStats();
    }
  } catch (err) {
    console.error('Error initializing dashboard:', err);
  }
}

async function loadCandidateMatches() {
  try {
    const jobs = await apiGet('/jobs');
    tableTitle.textContent = 'Available Jobs';
    tableBody.innerHTML = '';
    
    if (jobs.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #8A8A8A;">No jobs available</td></tr>';
      return;
    }

    jobs.slice(0, 5).forEach(job => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${job.title}</td>
        <td>${job.company}</td>
        <td><span class="status new">Open</span></td>
        <td><a href="jobs.html" style="color: #D72638; text-decoration: none;">View</a></td>
      `;
      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error('Error loading matches:', err);
  }
}

async function loadCompanyMatches() {
  try {
    const offers = await apiGet('/jobs');
    const myOffers = offers.filter(o => o.companyId === userId);
    tableTitle.textContent = 'My Recent Offers';
    tableBody.innerHTML = '';

    if (myOffers.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #8A8A8A;">No job offers yet</td></tr>';
      return;
    }

    myOffers.slice(0, 5).forEach(offer => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${offer.title}</td>
        <td>${offer.location}</td>
        <td><span class="status new">Active</span></td>
        <td><a href="jobs.html" style="color: #D72638; text-decoration: none;">Edit</a></td>
      `;
      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error('Error loading company matches:', err);
  }
}

async function loadStats() {
  try {
    const jobs = await apiGet('/jobs');
    const candidates = await apiGet('/candidates');
    
    let myJobs = 0;
    let allMatches = 0;
    let allReservations = 0;

    for (let i = 0; i < jobs.length; i++) {
      if (jobs[i].companyId === userId) {
        myJobs++;
      }
    }

    for (let i = 0; i < candidates.length; i++) {
      if (candidates[i].openToWork) {
        allReservations++;
      }
    }

    document.getElementById('activeJobsCount').textContent = myJobs;
    document.getElementById('totalMatchesCount').textContent = allMatches;
    document.getElementById('reservationsCount').textContent = allReservations;
    document.getElementById('totalCandidatesCount').textContent = candidates.length;
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

window.addEventListener('load', initDashboard);
