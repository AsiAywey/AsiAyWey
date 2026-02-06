// this file handles candidate matches view with accept/decline flow
import { apiGet, apiPatch } from '../general/api.js';
import { getCache, setCache, clearCache } from '../general/cache.js';

const role = localStorage.getItem('role');
const userId = localStorage.getItem('userId');

// if no session or not a candidate, go back
if (!role || !userId || role !== 'candidate') {
  window.location.href = '../dashboard.html';
}

const matchesContainer = document.getElementById('matchesContainer');
const messageDiv = document.getElementById('message');
const headerUserName = document.getElementById('headerUserName');
const headerUserRole = document.getElementById('headerUserRole');
const headerAvatar = document.getElementById('headerAvatar');
const headerAvatarImg = document.getElementById('headerAvatarImg');

// show quick messages
function showMessage(text, type = 'success') {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = 'block';
  setTimeout(() => { messageDiv.style.display = 'none'; }, 3000);
}

// load header name and avatar
async function loadHeaderUser() {
  try {
    const candidate = await apiGet(`/candidates/${userId}`);
    if (headerUserName) headerUserName.textContent = candidate.name || 'User';
    if (headerUserRole) headerUserRole.textContent = 'Candidate';
    if (candidate.avatar && headerAvatar && headerAvatarImg) {
      headerAvatarImg.src = candidate.avatar;
      headerAvatar.classList.add('has-photo');
    }
  } catch (err) {
    console.error('Error loading header:', err);
  }
}

// get status badge color
function getStatusColor(status) {
  const colors = {
    'pending': '#FFA500',
    'accepted': '#4CAF50',
    'contacted': '#2196F3',
    'interview': '#9C27B0',
    'hired': '#FFD700',
    'rejected': '#F44336'
  };
  return colors[status] || '#8A8A8A';
}

// get status label
function getStatusLabel(status) {
  const labels = {
    'pending': 'Pending Your Response',
    'accepted': 'Accepted by You',
    'contacted': 'Company Contacted',
    'interview': 'Interview Process',
    'hired': 'Hired!',
    'rejected': 'Declined by You'
  };
  return labels[status] || status;
}

// load matches for this candidate
async function loadMatches() {
  try {
    // Clear cache to get fresh data
    clearCache('candidateMatches');
    
    const allMatches = await apiGet('/matches');
    const matches = allMatches.filter(m => m.candidateId === userId && m.status !== 'rejected');

    // Load related data
    const companies = await apiGet('/companies');
    const jobOffers = await apiGet('/jobOffers');

    matchesContainer.innerHTML = '';

    if (matches.length === 0) {
      matchesContainer.innerHTML = '<p style="padding:20px; color: #8A8A8A;">No matches yet. Make sure your "Open to Work" status is active!</p>';
      updateStats(matches);
      return;
    }

    // Sort by date (newest first) and status (pending first)
    matches.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const company = companies.find(c => c.id === match.companyId);
      const job = jobOffers.find(j => j.id === match.jobOfferId);

      const card = createMatchCard(match, company, job);
      matchesContainer.appendChild(card);
    }

    updateStats(matches);
  } catch (err) {
    console.error('Error loading matches:', err);
    showMessage('Error loading matches', 'error');
    matchesContainer.innerHTML = '<p style="padding:20px; color: #F44336;">Error loading matches. Please try again.</p>';
  }
}

// update statistics
function updateStats(matches) {
  document.getElementById('pendingCount').textContent = matches.filter(m => m.status === 'pending').length;
  document.getElementById('acceptedCount').textContent = matches.filter(m => m.status === 'accepted').length;
  document.getElementById('inProcessCount').textContent = matches.filter(m => m.status === 'contacted' || m.status === 'interview').length;
  document.getElementById('hiredCount').textContent = matches.filter(m => m.status === 'hired').length;
}

// create a match card
function createMatchCard(match, company, job) {
  const card = document.createElement('div');
  card.className = 'offer-card';
  
  const statusColor = getStatusColor(match.status);
  const statusLabel = getStatusLabel(match.status);
  
  // Only show contact info if match is accepted or beyond
  const canSeeContact = ['accepted', 'contacted', 'interview', 'hired'].includes(match.status);
  
  const companyLogo = company?.logo || company?.avatar || '';
  const logoHtml = companyLogo 
    ? `<img src="${companyLogo}" alt="${company?.name || 'Company'}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;">` 
    : `<div style="width: 50px; height: 50px; border-radius: 8px; background: #2A2A2A; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #D72638;">${(company?.name || 'C')[0]}</div>`;

  card.innerHTML = `
    <div class="offer-content">
      <div style="display: flex; gap: 15px; align-items: start; margin-bottom: 15px;">
        ${logoHtml}
        <div style="flex: 1;">
          <div class="offer-status" style="margin-bottom: 10px;">
            <span class="status-badge" style="background-color: ${statusColor};">${statusLabel}</span>
            <span class="status-time">• ${new Date(match.createdAt).toLocaleDateString()}</span>
          </div>
          <h3 class="offer-title">${company?.name || 'Unknown Company'}</h3>
          <p class="offer-location">
            <span class="material-symbols-outlined">work</span>
            ${job?.title || 'Job Position'}
          </p>
        </div>
      </div>

      ${job ? `
        <div style="margin: 15px 0; padding: 15px; background: #1A1A1A; border-radius: 8px;">
          <p style="margin: 5px 0; color: #aaa;"><strong>Location:</strong> ${job.location}</p>
          <p style="margin: 5px 0; color: #aaa;"><strong>Salary:</strong> ${job.salary}</p>
          <p style="margin: 5px 0; color: #aaa;"><strong>Skills Required:</strong> ${job.skills.join(', ')}</p>
          ${job.description ? `<p style="margin: 10px 0 5px 0; color: #ccc;">${job.description}</p>` : ''}
        </div>
      ` : ''}

      ${match.status === 'pending' ? `
        <div style="margin: 15px 0; padding: 15px; background: #2A2A1A; border-radius: 8px; border: 1px solid #FFA500;">
          <p style="color: #FFA500; font-size: 14px; margin: 0;">⏳ This company is interested in you. Accept to continue the process or decline to free your profile for other opportunities.</p>
        </div>
      ` : ''}

      ${canSeeContact && company ? `
        <div style="margin: 15px 0; padding: 15px; background: #1F3A1F; border-radius: 8px; border: 1px solid #4CAF50;">
          <p style="color: #4CAF50; font-weight: 600; margin-bottom: 10px;">📧 Contact Information Available</p>
          ${company.email ? `<p style="margin: 5px 0; color: #ccc;">Email: ${company.email}</p>` : ''}
          ${company.phone ? `<p style="margin: 5px 0; color: #ccc;">Phone: ${company.phone}</p>` : ''}
          ${company.location ? `<p style="margin: 5px 0; color: #ccc;">Address: ${company.location}</p>` : ''}
        </div>
      ` : ''}

      <div class="offer-actions" style="margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
        ${match.status === 'pending' ? `
          <button class="btn-primary" onclick="acceptMatch('${match.id}')" style="background: #4CAF50; flex: 1;">
            <span class="material-symbols-outlined" style="font-size: 18px; vertical-align: middle;">check_circle</span>
            Accept Match
          </button>
          <button class="btn-edit" onclick="declineMatch('${match.id}')" style="background: #F44336; flex: 1;">
            <span class="material-symbols-outlined" style="font-size: 18px; vertical-align: middle;">cancel</span>
            Decline
          </button>
        ` : match.status === 'hired' ? `
          <button class="btn-primary" style="background: #FFD700; color: #000;" disabled>
            <span class="material-symbols-outlined" style="font-size: 18px; vertical-align: middle;">celebration</span>
            Congratulations!
          </button>
        ` : match.status !== 'rejected' ? `
          <button class="btn-edit" style="background: #2196F3; color: white; flex: 1;">
            <span class="material-symbols-outlined" style="font-size: 18px; vertical-align: middle;">info</span>
            Status: ${statusLabel}
          </button>
        ` : ''}
      </div>

      ${match.score ? `
        <div style="margin-top: 15px; padding: 10px; background: #1A1A1A; border-radius: 6px;">
          <p style="color: #8A8A8A; font-size: 12px; margin: 0;">Match Score: <strong style="color: #4CAF50;">${match.score}%</strong></p>
        </div>
      ` : ''}
    </div>
  `;
  
  return card;
}

// Accept match
window.acceptMatch = async (matchId) => {
  if (!confirm('Are you sure you want to accept this match? The company will be notified.')) {
    return;
  }

  try {
    await apiPatch(`/matches/${matchId}`, { status: 'accepted' });
    showMessage('Match accepted! The company can now contact you.', 'success');
    await loadMatches();
  } catch (err) {
    console.error('Error accepting match:', err);
    showMessage('Error accepting match. Please try again.', 'error');
  }
};

// Decline match
window.declineMatch = async (matchId) => {
  if (!confirm('Are you sure you want to decline this match? This will free your profile for other companies.')) {
    return;
  }

  try {
    // Update match status to rejected
    await apiPatch(`/matches/${matchId}`, { status: 'rejected' });
    
    // Find and deactivate the reservation
    const reservations = await apiGet('/reservations');
    const reservation = reservations.find(r => r.matchId === matchId);
    
    if (reservation) {
      await apiPatch(`/reservations/${reservation.id}`, { active: false });
    }
    
    showMessage('Match declined. You are now available for other opportunities.', 'success');
    await loadMatches();
  } catch (err) {
    console.error('Error declining match:', err);
    showMessage('Error declining match. Please try again.', 'error');
  }
};

loadHeaderUser();
loadMatches();
