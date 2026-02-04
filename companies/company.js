import { apiGet, apiPost, apiPatch, apiDelete } from '../general/api.js';
import { getCache, setCache, clearCache } from '../general/cache.js';

const userId = localStorage.getItem('userId');
const role = localStorage.getItem('role');

if (role !== 'company') {
  window.location.href = '../dashboard.html';
}

const companyName = document.getElementById('companyName');
const companyIndustry = document.getElementById('companyIndustry');
const companyLocation = document.getElementById('companyLocation');
const messageDiv = document.getElementById('message');
const candidatesList = document.getElementById('candidatesList');
const matchesList = document.getElementById('matchesList');
const reservationsList = document.getElementById('reservationsList');

let company = null;
let candidates = [];
let jobOffers = [];
let matches = [];
let reservations = [];

function showMessage(text, type = 'success') {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = 'block';
  setTimeout(() => { messageDiv.style.display = 'none'; }, 3000);
}

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');

    btn.classList.add('active');
    const tabName = btn.dataset.tab;
    document.getElementById(`${tabName}Tab`).style.display = 'block';
  });
});

async function loadCompanyData() {
  try {
    company = await apiGet(`/companies/${userId}`);
    companyName.textContent = company.name;
    companyIndustry.textContent = company.industry;
    companyLocation.textContent = '📍 ' + company.location;
  } catch (err) {
    showMessage('Error loading company data', 'error');
  }
}

async function loadCandidates() {
  try {
    let cached = getCache('candidates');
    if (cached) {
      candidates = cached;
    } else {
      candidates = await apiGet('/candidates');
      setCache('candidates', candidates, 60);
    }

    renderCandidates();
  } catch (err) {
    showMessage('Error loading candidates', 'error');
  }
}

function renderCandidates() {
  candidatesList.innerHTML = '';

  const otwCandidates = candidates.filter(c => c.openToWork);

  if (otwCandidates.length === 0) {
    candidatesList.innerHTML = '<p style="color: #aaa; padding: 20px;">No candidates available right now.</p>';
    return;
  }

  otwCandidates.forEach(candidate => {
    const div = document.createElement('div');
    div.style.cssText = 'padding: 15px; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center;';
    div.innerHTML = `
      <div>
        <h4 style="margin: 0;">${candidate.name}</h4>
        <p style="color: #aaa; margin: 5px 0;">${candidate.title}</p>
        <p style="font-size: 12px; color: #888;">Skills: ${candidate.skills.join(', ')}</p>
      </div>
      <button class="btn-primary" onclick="selectCandidate('${candidate.id}')">Select & Match</button>
    `;
    candidatesList.appendChild(div);
  });
}

async function loadMatches() {
  try {
    let cached = getCache('matches');
    if (cached) {
      matches = cached;
    } else {
      matches = await apiGet('/matches');
      setCache('matches', matches, 60);
    }

    let cached2 = getCache('jobOffers');
    if (cached2) {
      jobOffers = cached2;
    } else {
      jobOffers = await apiGet('/jobOffers');
      setCache('jobOffers', jobOffers, 60);
    }

    renderMatches();
  } catch (err) {
    showMessage('Error loading matches', 'error');
  }
}

function renderMatches() {
  matchesList.innerHTML = '';

  const myMatches = matches.filter(m => m.companyId === userId);

  if (myMatches.length === 0) {
    matchesList.innerHTML = '<p style="color: #aaa; padding: 20px;">No matches yet.</p>';
    return;
  }

  myMatches.forEach(match => {
    const candidate = candidates.find(c => c.id === match.candidateId);
    const job = jobOffers.find(j => j.id === match.jobOfferId);

    const div = document.createElement('div');
    div.className = 'match-row';
    div.innerHTML = `
      <div class="match-candidate">
        <h4 style="margin: 0;">${candidate ? candidate.name : 'Unknown'}</h4>
        <p style="color: #aaa; margin: 5px 0;">${job ? job.title : 'Unknown Job'}</p>
        <span class="match-status">${match.status}</span>
      </div>
      <div class="match-actions">
        <button class="btn-primary" onclick="changeMatchStatus('${match.id}', 'contacted')">Contact</button>
        <button class="btn-danger" onclick="discardMatch('${match.id}')">Discard</button>
      </div>
    `;
    matchesList.appendChild(div);
  });
}

async function loadReservations() {
  try {
    let cached = getCache('reservations');
    if (cached) {
      reservations = cached;
    } else {
      reservations = await apiGet('/reservations');
      setCache('reservations', reservations, 60);
    }

    renderReservations();
  } catch (err) {
    showMessage('Error loading reservations', 'error');
  }
}

function renderReservations() {
  reservationsList.innerHTML = '';

  const myReservations = reservations.filter(r => r.companyId === userId && r.active);

  if (myReservations.length === 0) {
    reservationsList.innerHTML = '<p style="color: #aaa; padding: 20px;">No active reservations.</p>';
    return;
  }

  myReservations.forEach(res => {
    const candidate = candidates.find(c => c.id === res.candidateId);
    const div = document.createElement('div');
    div.style.cssText = 'padding: 15px; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center;';
    div.innerHTML = `
      <div>
        <h4 style="margin: 0;">${candidate ? candidate.name : 'Unknown'}</h4>
        <p style="color: #aaa; margin: 5px 0;">Reserved since ${new Date(res.createdAt).toLocaleDateString()}</p>
      </div>
      <button class="btn-danger" onclick="releaseReservation('${res.id}')">Release</button>
    `;
    reservationsList.appendChild(div);
  });
}

window.selectCandidate = async (candidateId) => {
  if (jobOffers.length === 0) {
    showMessage('Please create a job offer first', 'error');
    return;
  }

  const jobId = jobOffers[0].id;

  const checkReservation = reservations.find(r => r.candidateId === candidateId && r.active && r.companyId !== userId);

  if (checkReservation) {
    showMessage('This candidate is reserved by another company', 'error');
    return;
  }

  try {
    const match = {
      id: `match_${Date.now()}`,
      companyId: userId,
      jobOfferId: jobId,
      candidateId: candidateId,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      score: 85,
    };

    await apiPost('/matches', match);

    const reservation = {
      id: `res_${Date.now()}`,
      companyId: userId,
      candidateId: candidateId,
      matchId: match.id,
      active: true,
      createdAt: new Date().toISOString(),
    };

    await apiPost('/reservations', reservation);

    clearCache('matches');
    clearCache('reservations');
    showMessage('Match created and candidate reserved!');
    loadMatches();
    loadReservations();
  } catch (err) {
    showMessage('Error creating match', 'error');
  }
};

window.changeMatchStatus = async (matchId, newStatus) => {
  try {
    await apiPatch(`/matches/${matchId}`, { status: newStatus });
    clearCache('matches');
    showMessage(`Match status updated to ${newStatus}`);
    loadMatches();
  } catch (err) {
    showMessage('Error updating match', 'error');
  }
};

window.discardMatch = async (matchId) => {
  if (!confirm('Are you sure you want to discard this match?')) return;

  try {
    const match = matches.find(m => m.id === matchId);
    await apiPatch(`/matches/${matchId}`, { status: 'discarded' });

    const res = reservations.find(r => r.matchId === matchId);
    if (res) {
      await apiPatch(`/reservations/${res.id}`, { active: false });
    }

    clearCache('matches');
    clearCache('reservations');
    showMessage('Match discarded and reservation released');
    loadMatches();
    loadReservations();
  } catch (err) {
    showMessage('Error discarding match', 'error');
  }
};

window.releaseReservation = async (resId) => {
  if (!confirm('Are you sure you want to release this reservation?')) return;

  try {
    await apiPatch(`/reservations/${resId}`, { active: false });
    clearCache('reservations');
    showMessage('Reservation released');
    loadReservations();
  } catch (err) {
    showMessage('Error releasing reservation', 'error');
  }
};

async function init() {
  await loadCompanyData();
  await loadCandidates();
  await loadMatches();
  await loadReservations();
}

init();
