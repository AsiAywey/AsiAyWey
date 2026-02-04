// this file lists offers for candidates
import { apiGet } from '../general/api.js';
import { getCache, setCache } from '../general/cache.js';

const role = localStorage.getItem('role');
const userId = localStorage.getItem('userId');

// if no session, go back to login
if (!role || !userId) {
  window.location.href = '../login.html';
}

const offersContainer = document.getElementById('offersContainer');
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
    if (role === 'candidate') {
      const candidate = await apiGet(`/candidates/${userId}`);
      if (headerUserName) headerUserName.textContent = candidate.name || 'User';
      if (headerUserRole) headerUserRole.textContent = 'Candidate';
      if (candidate.avatar && headerAvatar && headerAvatarImg) {
        headerAvatarImg.src = candidate.avatar;
        headerAvatar.classList.add('has-photo');
      }
    }
  } catch (err) {
    // silent header load failure
  }
}

// load offers, using cache if available
async function loadOffers() {
  try {
    let cached = getCache('jobOffers');
    let offers = [];

    if (cached) {
      offers = cached;
    } else {
      offers = await apiGet('/jobOffers');
      setCache('jobOffers', offers, 60);
    }

    offersContainer.innerHTML = '';

    if (offers.length === 0) {
      offersContainer.innerHTML = '<p style="padding:20px;">No job offers available.</p>';
      return;
    }

    for (let i = 0; i < offers.length; i++) {
      const card = createOfferCard(offers[i]);
      offersContainer.appendChild(card);
    }
  } catch (err) {
    showMessage('Error loading offers', 'error');
  }
}

// build a card with the offer
function createOfferCard(offer) {
  const card = document.createElement('div');
  card.className = 'offer-card';
  card.innerHTML = `
    <div class="offer-content">
      <div class="offer-status">
        <span class="status-badge status-live">Active</span>
        <span class="status-time">• ${new Date(offer.createdAt).toLocaleDateString()}</span>
      </div>
      <div class="offer-title-section">
        <h3 class="offer-title">${offer.title}</h3>
        <p class="offer-location">
          <span class="material-symbols-outlined">location_on</span>
          ${offer.location}
        </p>
      </div>
      <p style="margin: 10px 0; color: #aaa;">${offer.description}</p>
      <p style="margin: 10px 0;"><strong>Salary:</strong> ${offer.salary}</p>
      <p style="margin: 10px 0;"><strong>Skills:</strong> ${offer.skills.join(', ')}</p>
    </div>
  `;
  return card;
}

loadHeaderUser();
loadOffers();
