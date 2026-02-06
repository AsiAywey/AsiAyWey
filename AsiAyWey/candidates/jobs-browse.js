import { apiGet } from '../general/api.js';
import { getCache, setCache } from '../general/cache.js';

const offersContainer = document.getElementById('offersContainer');
const typeFilter = document.getElementById('typeFilter');

let allOffers = [];

// Render cards
function renderOffers(offers) {
  offersContainer.innerHTML = '';

  if (offers.length === 0) {
    offersContainer.innerHTML = '<p style="padding:20px;">No job offers available.</p>';
    return;
  }

  offers.forEach(offer => {
    const card = document.createElement('div');
    card.className = 'offer-card';
    card.innerHTML = `
      <h3>${offer.title}</h3>
      <p><strong>Location:</strong> ${offer.location}</p>
      <p>${offer.description}</p>
      <p><strong>Salary:</strong> ${offer.salary}</p>
      <p><strong>Type:</strong> ${offer.type}</p>
      <p><strong>Skills:</strong> ${offer.skills.join(', ')}</p>
    `;
    offersContainer.appendChild(card);
  });
}

// Load offers
async function loadOffers() {
  let cached = getCache('jobOffers');
  let offers = cached ? cached : await apiGet('/jobOffers');
  setCache('jobOffers', offers, 60);

  allOffers = offers;
  renderOffers(offers);
}

// Filter logic
typeFilter.addEventListener('change', () => {
  const value = typeFilter.value;

  if (value === 'all') {
    renderOffers(allOffers);
  } else {
    const filtered = allOffers.filter(o =>
      o.type && o.type.toLowerCase() === value
    );
    renderOffers(filtered);
  }
});

// Init
document.addEventListener('DOMContentLoaded', () => {
  loadOffers();
});
