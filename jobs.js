import { apiGet, apiPost, apiDelete, apiPatch } from './general/api.js';
import { getCache, setCache, clearCache } from './general/cache.js';

const role = localStorage.getItem('role');
const userId = localStorage.getItem('userId');

if (!role || !userId) {
  window.location.href = 'login.html';
}

const offersContainer = document.getElementById('offersContainer');
const createOfferForm = document.getElementById('createOfferForm');
const jobForm = document.getElementById('jobForm');
const createBtn = document.getElementById('createBtn');
const messageDiv = document.getElementById('message');
const pageSubtitle = document.getElementById('pageSubtitle');
const headerUserName = document.getElementById('headerUserName');
const headerUserRole = document.getElementById('headerUserRole');
const headerAvatar = document.getElementById('headerAvatar');
const headerAvatarImg = document.getElementById('headerAvatarImg');

if (role === 'company') {
  createOfferForm.style.display = 'block';
  createBtn.style.display = 'block';
  pageSubtitle.textContent = 'Manage your job offers and matches.';
} else {
  pageSubtitle.textContent = 'Browse available job offers.';
}

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
      return;
    }

    if (role === 'company') {
      const company = await apiGet(`/companies/${userId}`);
      if (headerUserName) headerUserName.textContent = company.name || 'User';
      if (headerUserRole) headerUserRole.textContent = 'Company';
      const avatarSrc = company.avatar || company.logo;
      if (avatarSrc && headerAvatar && headerAvatarImg) {
        headerAvatarImg.src = avatarSrc;
        headerAvatar.classList.add('has-photo');
      }
    }
  } catch (err) {
    // silent header load failure
  }
}

function showMessage(text, type = 'success') {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = 'block';
  setTimeout(() => { messageDiv.style.display = 'none'; }, 3000);
}

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

    offers.forEach(offer => {
      const card = createOfferCard(offer);
      offersContainer.appendChild(card);
    });
  } catch (err) {
    showMessage('Error loading offers', 'error');
  }
}

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
      ${role === 'company' ? `
        <div class="offer-actions" style="margin-top: 15px;">
          <button class="btn-edit" onclick="editOffer('${offer.id}')">Edit</button>
          <button class="btn-close-offer" onclick="deleteOffer('${offer.id}')">Delete</button>
        </div>
      ` : ''}
    </div>
  `;
  return card;
}

createBtn.addEventListener('click', () => {
  createOfferForm.style.display = createOfferForm.style.display === 'none' ? 'block' : 'none';
});

jobForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const newOffer = {
    id: `job_${Date.now()}`,
    companyId: userId,
    title: document.getElementById('jobTitle').value,
    description: document.getElementById('jobDescription').value,
    skills: document.getElementById('jobSkills').value.split(',').map(s => s.trim()),
    location: document.getElementById('jobLocation').value,
    salary: document.getElementById('jobSalary').value,
    status: 'active',
    createdAt: new Date().toISOString().split('T')[0],
  };

  try {
    await apiPost('/jobOffers', newOffer);
    clearCache('jobOffers');
    jobForm.reset();
    createOfferForm.style.display = 'none';
    showMessage('Job offer created successfully!');
    loadOffers();
  } catch (err) {
    showMessage('Error creating offer', 'error');
  }
});

async function deleteOffer(offerId) {
  if (!confirm('Are you sure you want to delete this offer?')) return;

  try {
    await apiDelete(`/jobOffers/${offerId}`);
    clearCache('jobOffers');
    showMessage('Offer deleted successfully!');
    loadOffers();
  } catch (err) {
    showMessage('Error deleting offer', 'error');
  }
}

window.deleteOffer = deleteOffer;
window.editOffer = (id) => {
  showMessage('Edit feature coming soon', 'info');
};

loadHeaderUser();
loadOffers();
