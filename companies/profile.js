// este archivo maneja el perfil de empresa
import { apiGet, apiPost, apiPatch } from "../general/api.js";
import { canCompanyReserveCandidate, getActiveReservationsForCandidate } from "../general/reservationRules.js";
import { getCandidateReservationLimit } from "../general/plans.js";
import { getCache, setCache, clearCache } from "../general/cache.js";

const userId = localStorage.getItem("userId");
const role = localStorage.getItem("role");
// si no es empresa, se regresa al dashboard
if (role !== "company") window.location.href = "../dashboard.html";

const $ = (id) => document.getElementById(id);
const qs = (sel) => document.querySelector(sel);
const qsa = (sel) => [...document.querySelectorAll(sel)];

const companyName = $("companyName");
const companyIndustry = $("companyIndustry");
const companyLocation = $("companyLocation");
const companyDescription = $("companyDescription");
const companyLogo = $("companyLogo");
const messageDiv = $("message");
const candidatesList = $("candidatesList");
const matchesList = $("matchesList");
const reservationsList = $("reservationsList");
const headerUserName = $("headerUserName");
const headerUserRole = $("headerUserRole");
const headerAvatar = $("headerAvatar");
const headerAvatarImg = $("headerAvatarImg");

let company;
let candidates = [];
let jobOffers = [];
let matches = [];
let reservations = [];
let plans = [];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// mostramos mensajes rápidos
const showMessage = (text, type = "success") => {
  if (!messageDiv) {
    // fallback to alert if the message area isn't present
    // avoid throwing in production UI
    // eslint-disable-next-line no-alert
    alert(text);
    return;
  }
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = "block";
  setTimeout(() => {
    messageDiv.style.display = "none";
  }, 3000);
};

// intentamos varias veces si falla
const apiGetWithRetry = async (endpoint, retries = 2) => {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await apiGet(endpoint);
    } catch (error) {
      lastError = error;
      if (attempt < retries) await wait(500 * (attempt + 1));
    }
  }
  throw lastError;
};

// cargamos planes (meta) desde json-server
async function loadPlans() {
  try {
    plans = await apiGetWithRetry('/plans');
  } catch (e) {
    plans = [];
  }
}

// usamos cache para no pedir lo mismo siempre
const fetchCached = async (key, fetcher) => {
  const cached = getCache(key);
  if (cached) return cached;
  const data = await fetcher();
  setCache(key, data, 60);
  return data;
};

// pintamos listas en pantalla
const renderList = (container, items, emptyHtml) => {
  if (!container) return;
  container.innerHTML = "";
  if (!items.length) {
    container.innerHTML = emptyHtml;
    return;
  }
  items.forEach((node) => container.appendChild(node));
};

const row = (html) => {
  const div = document.createElement("div");
  div.className =
    "d-flex justify-content-between align-items-center border-bottom py-3";
  div.innerHTML = html;
  return div;
};

// cambiamos pestañas
qsa(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    qsa(".tab-btn").forEach((b) => b.classList.remove("active"));
    qsa(".tab-content").forEach((t) => (t.style.display = "none"));
    btn.classList.add("active");
    const tabName = btn.dataset.tab;
    const tabEl = $(`${tabName}Tab`);
    if (tabEl) tabEl.style.display = "block";
  });
});

// cargamos datos principales de la empresa
async function loadCompanyData() {
  try {
    company = await apiGetWithRetry(`/companies/${userId}`);
    if (companyName) companyName.textContent = company.name || "--";
    if (companyIndustry) companyIndustry.textContent = company.industry || "--";
    if (companyLocation)
      companyLocation.textContent = `📍 ${company.location || "--"}`;
    if (companyDescription)
      companyDescription.textContent =
        company.description || "No description added yet";

    if (headerUserName) headerUserName.textContent = company.name || "User";
    if (headerUserRole) headerUserRole.textContent = "Company";

    const avatarSrc = company.avatar || company.logo;
    if (avatarSrc && companyLogo) {
      companyLogo.src = avatarSrc;
      companyLogo.style.display = "block";
    }
    if (avatarSrc && headerAvatar && headerAvatarImg) {
      headerAvatarImg.src = avatarSrc;
      headerAvatar.classList.add("has-photo");
    }
  } catch (err) {
    showMessage(
      "No se pudo cargar el perfil. Verifica que el servidor esté activo.",
      "error",
    );
  }
}

// cargamos candidatos disponibles
async function loadCandidates() {
  try {
    candidates = await fetchCached("candidates", () => apiGet("/candidates"));
    const otwCandidates = Array.isArray(candidates)
      ? candidates.filter((c) => c.openToWork)
      : [];
    const nodes = otwCandidates.map((candidate) =>
      row(`
      <div>
        <h4 class="mb-0">${candidate.name}</h4>
        <p class="text-muted mb-1 text-white">${candidate.title || ""}</p>
        <p class="text-secondary small mb-0">Skills: ${Array.isArray(candidate.skills) ? candidate.skills.join(", ") : ""}</p>
      </div>
      <button class="btn btn-primary btn-sm" onclick="selectCandidate('${candidate.id}')">Select & Match</button>
    `),
    );

    renderList(
      candidatesList,
      nodes,
      '<p class="text-white pl-3 py-3">No candidates available right now.</p>',
    );
  } catch (err) {
    showMessage("Error loading candidates", "error");
  }
}

// cargamos matches de la empresa
async function loadMatches() {
  try {
    matches = await fetchCached("matches", () => apiGet("/matches"));
    jobOffers = await fetchCached("jobOffers", () => apiGet("/jobOffers"));

    const myMatches = Array.isArray(matches)
      ? matches.filter((m) => m.companyId === userId)
      : [];
    const nodes = myMatches.map((match) => {
      const candidate = Array.isArray(candidates)
        ? candidates.find((c) => c.id === match.candidateId)
        : null;
      const job = Array.isArray(jobOffers)
        ? jobOffers.find((j) => j.id === match.jobOfferId)
        : null;
      return row(`
        <div>
          <h4 class="mb-0">${candidate ? candidate.name : "Unknown"}</h4>
          <p class="text-white mb-1">${job ? job.title : "Unknown Job"}</p>
          <span class="text-primary fw-semibold">${match.status}</span>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-primary btn-sm" onclick="changeMatchStatus('${match.id}', 'contacted')">Contact</button>
          <button class="btn btn-danger btn-sm" onclick="discardMatch('${match.id}')">Discard</button>
        </div>
      `);
    });

    renderList(
      matchesList,
      nodes,
      '<p class="text-white pl-3 py-3">No matches yet.</p>',
    );
  } catch (err) {
    showMessage("Error loading matches", "error");
  }
}

// cargamos reservas activas
async function loadReservations() {
  try {
    reservations = await fetchCached("reservations", () =>
      apiGet("/reservations"),
    );
    const myReservations = Array.isArray(reservations)
      ? reservations.filter((r) => r.companyId === userId && r.active)
      : [];
    const nodes = myReservations.map((res) => {
      const candidate = Array.isArray(candidates)
        ? candidates.find((c) => c.id === res.candidateId)
        : null;
      return row(`
        <div>
          <h4 class="mb-0">${candidate ? candidate.name : "Unknown"}</h4>
          <p class="text-white mb-0">Reserved since ${new Date(res.createdAt).toLocaleDateString()}</p>
        </div>
        <button class="btn btn-danger btn-sm" onclick="releaseReservation('${res.id}')">Release</button>
      `);
    });

    renderList(
      reservationsList,
      nodes,
      '<p class="text-white pl-3 py-3">No active reservations.</p>',
    );
  } catch (err) {
    showMessage("Error loading reservations", "error");
  }
}

// hacemos match y reservamos candidato
window.selectCandidate = async (candidateId) => {
  // Always validate with FRESH data (no cache) because this is business logic.
  let candidate;
  let allReservations = [];
  let allOffers = [];

  try {
    candidate = await apiGetWithRetry(`/candidates/${candidateId}`);
    allReservations = await apiGetWithRetry('/reservations');
    allOffers = await apiGetWithRetry('/jobOffers');
  } catch (e) {
    showMessage('Error loading data to create match', 'error');
    return;
  }

  const myOffers = Array.isArray(allOffers) ? allOffers.filter((o) => o.companyId === userId) : [];
  if (!myOffers.length) {
    showMessage('Please create a job offer first', 'error');
    return;
  }

  // Candidate must be OpenToWork to be matched (core rule).
  if (!candidate?.openToWork) {
    showMessage('Candidate is not Open to Work', 'error');
    return;
  }

  // Enforce candidate plan reservation capacity.
  const activeForCandidate = getActiveReservationsForCandidate(allReservations, candidateId);

  // Ensure we have plan metadata loaded (fallback if not).
  if (!plans.length) {
    try { plans = await apiGetWithRetry('/plans'); } catch (e) { plans = []; }
  }

  const check = canCompanyReserveCandidate(plans, candidate, userId, activeForCandidate);

  if (!check.ok) {
    if (check.reason === 'already_reserved_by_you') {
      showMessage('You already reserved this candidate.', 'error');
      return;
    }
    if (check.reason === 'candidate_at_capacity') {
      const limit = check.limit ?? getCandidateReservationLimit(plans, candidate);
      showMessage(`This candidate reached their reservation limit (${limit}).`, 'error');
      return;
    }
    showMessage('Reservation not allowed', 'error');
    return;
  }

  try {
    const match = {
      id: `match_${Date.now()}`,
      companyId: userId,
      jobOfferId: myOffers[0].id,
      candidateId,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      score: 85,
    };

    await apiPost('/matches', match);

    const reservation = {
      id: `res_${Date.now()}`,
      companyId: userId,
      candidateId,
      matchId: match.id,
      active: true,
      createdAt: new Date().toISOString(),
    };

    await apiPost('/reservations', reservation);

    clearCache('matches');
    clearCache('reservations');
    showMessage('Match created and candidate reserved!');
    await loadMatches();
    await loadReservations();
    await loadCandidates(); // refresh candidate list (capacity badges)
  } catch (err) {
    showMessage('Error creating match', 'error');
  }
};

// actualizamos el estado del match
window.changeMatchStatus = async (matchId, newStatus) => {
  try {
    await apiPatch(`/matches/${matchId}`, { status: newStatus });
    clearCache("matches");
    showMessage(`Match status updated to ${newStatus}`);
    await loadMatches();
  } catch (err) {
    showMessage("Error updating match", "error");
  }
};

// descartamos un match
window.discardMatch = async (matchId) => {
  // confirm may not be available in some contexts, guard it
  // eslint-disable-next-line no-alert
  if (
    typeof confirm === "function" &&
    !confirm("Are you sure you want to discard this match?")
  )
    return;

  try {
    await apiPatch(`/matches/${matchId}`, { status: "discarded" });
    const res = Array.isArray(reservations)
      ? reservations.find((r) => r.matchId === matchId)
      : null;
    if (res) await apiPatch(`/reservations/${res.id}`, { active: false });

    clearCache("matches");
    clearCache("reservations");
    showMessage("Match discarded and reservation released");
    await loadMatches();
    await loadReservations();
  } catch (err) {
    showMessage("Error discarding match", "error");
  }
};

// liberamos una reserva
window.releaseReservation = async (resId) => {
  // eslint-disable-next-line no-alert
  if (
    typeof confirm === "function" &&
    !confirm("Are you sure you want to release this reservation?")
  )
    return;

  try {
    await apiPatch(`/reservations/${resId}`, { active: false });
    clearCache("reservations");
    showMessage("Reservation released");
    await loadReservations();
  } catch (err) {
    showMessage("Error releasing reservation", "error");
  }
};

function renderStats() {
  const statsDiv = document.createElement("div");
  statsDiv.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px;">
      <div style="background: #1F1F1F; border: 1px solid #2A2A2A; border-radius: 8px; padding: 15px; text-align: center;">
        <p style="color: #8A8A8A; font-size: 12px;">Available Candidates</p>
        <p style="font-size: 28px; font-weight: 700; color: #F5F5F5; margin-top: 5px;">${Array.isArray(candidates) ? candidates.filter((c) => c.openToWork).length : 0}</p>
      </div>
      <div style="background: #1F1F1F; border: 1px solid #2A2A2A; border-radius: 8px; padding: 15px; text-align: center;">
        <p style="color: #8A8A8A; font-size: 12px;">Active Matches</p>
        <p style="font-size: 28px; font-weight: 700; color: #F5F5F5; margin-top: 5px;">${Array.isArray(matches) ? matches.length : 0}</p>
      </div>
      <div style="background: #1F1F1F; border: 1px solid #2A2A2A; border-radius: 8px; padding: 15px; text-align: center;">
        <p style="color: #8A8A8A; font-size: 12px;">Active Reservations</p>
        <p style="font-size: 28px; font-weight: 700; color: #F5F5F5; margin-top: 5px;">${Array.isArray(reservations) ? reservations.filter((r) => r.active).length : 0}</p>
      </div>
    </div>
  `;

  const mainContent = qs("main");
  const insertAfter = qs(".breadcrumb")?.nextElementSibling?.nextElementSibling;
  if (mainContent && insertAfter)
    mainContent.insertBefore(statsDiv, insertAfter);
}

// inicio general del perfil
async function init() {
  await loadPlans();
  await loadCompanyData();
  await loadCandidates();
  await loadMatches();
  await loadReservations();
  renderStats();
}

init();
