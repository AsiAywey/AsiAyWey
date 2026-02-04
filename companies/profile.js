import { apiGet, apiPost, apiPatch } from "../general/api.js";
import { getCache, setCache, clearCache } from "../general/cache.js";

const userId = localStorage.getItem("userId");
const role = localStorage.getItem("role");
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

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const showMessage = (text, type = "success") => {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = "block";
  setTimeout(() => {
    messageDiv.style.display = "none";
  }, 3000);
};

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

const fetchCached = async (key, fetcher) => {
  const cached = getCache(key);
  if (cached) return cached;
  const data = await fetcher();
  setCache(key, data, 60);
  return data;
};

const renderList = (container, items, emptyHtml) => {
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

// Tab switching
qsa(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    qsa(".tab-btn").forEach((b) => b.classList.remove("active"));
    qsa(".tab-content").forEach((t) => (t.style.display = "none"));
    btn.classList.add("active");
    const tabName = btn.dataset.tab;
    $(`${tabName}Tab`).style.display = "block";
  });
});

async function loadCompanyData() {
  try {
    company = await apiGetWithRetry(`/companies/${userId}`);
    companyName.textContent = company.name;
    companyIndustry.textContent = company.industry || "--";
    companyLocation.textContent = `📍 ${company.location || "--"}`;
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

async function loadCandidates() {
  try {
    candidates = await fetchCached("candidates", () => apiGet("/candidates"));
    const otwCandidates = candidates.filter((c) => c.openToWork);
    const nodes = otwCandidates.map((candidate) =>
      row(`
      <div>
        <h4 class="mb-0">${candidate.name}</h4>
        <p class="text-muted mb-1 text-white">${candidate.title}</p>
        <p class="text-secondary small mb-0">Skills: ${candidate.skills.join(", ")}</p>
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

async function loadMatches() {
  try {
    matches = await fetchCached("matches", () => apiGet("/matches"));
    jobOffers = await fetchCached("jobOffers", () => apiGet("/jobOffers"));

    const myMatches = matches.filter((m) => m.companyId === userId);
    const nodes = myMatches.map((match) => {
      const candidate = candidates.find((c) => c.id === match.candidateId);
      const job = jobOffers.find((j) => j.id === match.jobOfferId);
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

async function loadReservations() {
  try {
    reservations = await fetchCached("reservations", () =>
      apiGet("/reservations"),
    );
    const myReservations = reservations.filter(
      (r) => r.companyId === userId && r.active,
    );
    const nodes = myReservations.map((res) => {
      const candidate = candidates.find((c) => c.id === res.candidateId);
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

window.selectCandidate = async (candidateId) => {
  if (!jobOffers.length) {
    showMessage("Please create a job offer first", "error");
    return;
  }

  const checkReservation = reservations.find(
    (r) => r.candidateId === candidateId && r.active && r.companyId !== userId,
  );
  if (checkReservation) {
    showMessage("This candidate is reserved by another company", "error");
    return;
  }

  try {
    const match = {
      id: `match_${Date.now()}`,
      companyId: userId,
      jobOfferId: jobOffers[0].id,
      candidateId,
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0],
      score: 85,
    };

    await apiPost("/matches", match);

    const reservation = {
      id: `res_${Date.now()}`,
      companyId: userId,
      candidateId,
      matchId: match.id,
      active: true,
      createdAt: new Date().toISOString(),
    };

    await apiPost("/reservations", reservation);
    clearCache("matches");
    clearCache("reservations");
    showMessage("Match created and candidate reserved!");
    loadMatches();
    loadReservations();
  } catch (err) {
    showMessage("Error creating match", "error");
  }
};

window.changeMatchStatus = async (matchId, newStatus) => {
  try {
    await apiPatch(`/matches/${matchId}`, { status: newStatus });
    clearCache("matches");
    showMessage(`Match status updated to ${newStatus}`);
    loadMatches();
  } catch (err) {
    showMessage("Error updating match", "error");
  }
};

window.discardMatch = async (matchId) => {
  if (!confirm("Are you sure you want to discard this match?")) return;

  try {
    await apiPatch(`/matches/${matchId}`, { status: "discarded" });
    const res = reservations.find((r) => r.matchId === matchId);
    if (res) await apiPatch(`/reservations/${res.id}`, { active: false });

    clearCache("matches");
    clearCache("reservations");
    showMessage("Match discarded and reservation released");
    loadMatches();
    loadReservations();
  } catch (err) {
    showMessage("Error discarding match", "error");
  }
};

window.releaseReservation = async (resId) => {
  if (!confirm("Are you sure you want to release this reservation?")) return;

  try {
    await apiPatch(`/reservations/${resId}`, { active: false });
    clearCache("reservations");
    showMessage("Reservation released");
    loadReservations();
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
        <p style="font-size: 28px; font-weight: 700; color: #F5F5F5; margin-top: 5px;">${candidates.filter((c) => c.openToWork).length}</p>
      </div>
      <div style="background: #1F1F1F; border: 1px solid #2A2A2A; border-radius: 8px; padding: 15px; text-align: center;">
        <p style="color: #8A8A8A; font-size: 12px;">Active Matches</p>
        <p style="font-size: 28px; font-weight: 700; color: #F5F5F5; margin-top: 5px;">${matches.length}</p>
      </div>
      <div style="background: #1F1F1F; border: 1px solid #2A2A2A; border-radius: 8px; padding: 15px; text-align: center;">
        <p style="color: #8A8A8A; font-size: 12px;">Active Reservations</p>
        <p style="font-size: 28px; font-weight: 700; color: #F5F5F5; margin-top: 5px;">${reservations.filter((r) => r.active).length}</p>
      </div>
    </div>
  `;

  const mainContent = qs("main");
  const insertAfter = qs(".breadcrumb")?.nextElementSibling?.nextElementSibling;
  if (mainContent && insertAfter)
    mainContent.insertBefore(statsDiv, insertAfter);
}

async function init() {
  await loadCompanyData();
  await loadCandidates();
  await loadMatches();
  await loadReservations();
  renderStats();
}

init();
