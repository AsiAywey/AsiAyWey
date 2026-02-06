// este archivo maneja el perfil de empresa con flujo correcto de match
import { apiGet, apiPost, apiPatch } from "../general/api.js";
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

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// mostramos mensajes rápidos
const showMessage = (text, type = "success") => {
  if (!messageDiv) {
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

// Check if candidate is reserved by another company
function isReservedByOther(candidateId) {
  return reservations.some(
    r => r.candidateId === candidateId && r.active && r.companyId !== userId
  );
}

// Check if we already have a reservation for this candidate
function hasMyReservation(candidateId) {
  return reservations.some(
    r => r.candidateId === candidateId && r.active && r.companyId === userId
  );
}

// cargamos candidatos disponibles
async function loadCandidates() {
  try {
    candidates = await fetchCached("candidates", () => apiGet("/candidates"));
    reservations = await apiGet("/reservations");
    
    const otwCandidates = Array.isArray(candidates)
      ? candidates.filter((c) => c.openToWork)
      : [];
    
    const nodes = otwCandidates.map((candidate) => {
      const reserved = isReservedByOther(candidate.id);
      const myReservation = hasMyReservation(candidate.id);
      
      return row(`
      <div>
        <h4 class="mb-0">${candidate.name}</h4>
        <p class="text-muted mb-1 text-white">${candidate.title || ""}</p>
        <p class="text-secondary small mb-0">Skills: ${Array.isArray(candidate.skills) ? candidate.skills.join(", ") : ""}</p>
        ${reserved ? '<p class="text-warning small mb-0">⚠️ Reserved by another company</p>' : ''}
        ${myReservation ? '<p class="text-success small mb-0">✓ You have reserved this candidate - waiting for their response</p>' : ''}
      </div>
      ${reserved ? 
        '<button class="btn btn-secondary btn-sm" disabled>Reserved</button>' :
        myReservation ?
        '<button class="btn btn-success btn-sm" disabled>Match Sent</button>' :
        `<button class="btn btn-primary btn-sm" onclick="selectCandidate('${candidate.id}')">Select & Match</button>`
      }
    `);
    });

    renderList(
      candidatesList,
      nodes,
      '<p class="text-white pl-3 py-3">No candidates available right now.</p>',
    );
  } catch (err) {
    showMessage("Error loading candidates", "error");
  }
}

// Get status badge HTML
function getStatusBadge(status) {
  const badges = {
    'pending': '<span class="badge bg-warning text-dark">Waiting Response</span>',
    'accepted': '<span class="badge bg-success">Accepted by Candidate</span>',
    'contacted': '<span class="badge bg-info">Contacted</span>',
    'interview': '<span class="badge bg-primary">Interview</span>',
    'hired': '<span class="badge bg-success">Hired</span>',
    'rejected': '<span class="badge bg-danger">Declined by Candidate</span>'
  };
  return badges[status] || '<span class="badge bg-secondary">Unknown</span>';
}

// cargamos matches de la empresa
async function loadMatches() {
  try {
    matches = await apiGet("/matches");
    jobOffers = await fetchCached("jobOffers", () => apiGet("/jobOffers"));

    const myMatches = Array.isArray(matches)
      ? matches.filter((m) => m.companyId === userId && m.status !== 'rejected')
      : [];
    
    const nodes = myMatches.map((match) => {
      const candidate = Array.isArray(candidates)
        ? candidates.find((c) => c.id === match.candidateId)
        : null;
      const job = Array.isArray(jobOffers)
        ? jobOffers.find((j) => j.id === match.jobOfferId)
        : null;
      
      // Determine which actions are available based on status
      const isPending = match.status === 'pending';
      const isAccepted = match.status === 'accepted';
      const canContact = match.status === 'accepted';
      const canInterview = match.status === 'contacted';
      const canHire = match.status === 'interview';
      
      return row(`
        <div>
          <h4 class="mb-0">${candidate ? candidate.name : "Unknown"}</h4>
          <p class="text-white mb-1">${job ? job.title : "Unknown Job"}</p>
          <div style="margin-top: 5px;">
            ${getStatusBadge(match.status)}
            <span class="text-muted small ms-2">Score: ${match.score || 'N/A'}%</span>
          </div>
          ${isPending ? '<p class="text-warning small mb-0 mt-1">⏳ Waiting for candidate to accept</p>' : ''}
          ${isAccepted ? '<p class="text-success small mb-0 mt-1">✓ Ready to contact candidate</p>' : ''}
        </div>
        <div class="d-flex gap-2 flex-wrap" style="max-width: 300px;">
          ${canContact ? `<button class="btn btn-primary btn-sm" onclick="changeMatchStatus('${match.id}', 'contacted')">Contact</button>` : ''}
          ${canInterview ? `<button class="btn btn-info btn-sm" onclick="changeMatchStatus('${match.id}', 'interview')">Interview</button>` : ''}
          ${canHire ? `<button class="btn btn-success btn-sm" onclick="changeMatchStatus('${match.id}', 'hired')">Hire</button>` : ''}
          ${match.status !== 'hired' && !isPending ? `<button class="btn btn-danger btn-sm" onclick="discardMatch('${match.id}')">Discard</button>` : ''}
          ${isPending ? `<button class="btn btn-danger btn-sm" onclick="cancelMatch('${match.id}')">Cancel Match</button>` : ''}
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
    reservations = await apiGet("/reservations");
    const myReservations = Array.isArray(reservations)
      ? reservations.filter((r) => r.companyId === userId && r.active)
      : [];
    const nodes = myReservations.map((res) => {
      const candidate = Array.isArray(candidates)
        ? candidates.find((c) => c.id === res.candidateId)
        : null;
      
      // Find the match to check status
      const match = matches.find(m => m.id === res.matchId);
      const matchStatus = match ? match.status : 'unknown';
      
      return row(`
        <div>
          <h4 class="mb-0">${candidate ? candidate.name : "Unknown"}</h4>
          <p class="text-white mb-0">Reserved since ${new Date(res.createdAt).toLocaleDateString()}</p>
          <p class="text-muted small mb-0 mt-1">Status: ${matchStatus}</p>
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
  if (!Array.isArray(jobOffers) || !jobOffers.length) {
    showMessage("Please create a job offer first", "error");
    return;
  }

  // Double-check reservation status
  const checkReservation = Array.isArray(reservations)
    ? reservations.find(
        (r) =>
          r.candidateId === candidateId && r.active && r.companyId !== userId,
      )
    : null;

  if (checkReservation) {
    showMessage("This candidate is reserved by another company", "error");
    return;
  }

  // Check if we already have a match with this candidate
  const existingMatch = matches.find(
    m => m.candidateId === candidateId && m.companyId === userId && m.status !== 'rejected'
  );

  if (existingMatch) {
    showMessage("You already have a match with this candidate", "error");
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
      score: Math.floor(Math.random() * 20) + 75, // Random score between 75-95
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
    showMessage("Match created! Waiting for candidate to accept.");
    await loadMatches();
    await loadReservations();
    await loadCandidates();
  } catch (err) {
    showMessage("Error creating match", "error");
  }
};

// Cancel match (only available in pending status)
window.cancelMatch = async (matchId) => {
  if (
    typeof confirm === "function" &&
    !confirm("Are you sure you want to cancel this match request?")
  )
    return;

  try {
    await apiPatch(`/matches/${matchId}`, { status: "rejected" });
    const res = Array.isArray(reservations)
      ? reservations.find((r) => r.matchId === matchId)
      : null;
    if (res) await apiPatch(`/reservations/${res.id}`, { active: false });

    clearCache("matches");
    clearCache("reservations");
    showMessage("Match cancelled and candidate released");
    await loadMatches();
    await loadReservations();
    await loadCandidates();
  } catch (err) {
    showMessage("Error cancelling match", "error");
  }
};

// actualizamos el estado del match (only after candidate accepts)
window.changeMatchStatus = async (matchId, newStatus) => {
  try {
    await apiPatch(`/matches/${matchId}`, { status: newStatus });
    clearCache("matches");
    
    const statusMessages = {
      'contacted': 'Candidate contacted successfully!',
      'interview': 'Interview process started!',
      'hired': 'Congratulations! Candidate hired successfully!',
    };
    
    showMessage(statusMessages[newStatus] || `Match status updated to ${newStatus}`);
    await loadMatches();
  } catch (err) {
    showMessage("Error updating match", "error");
  }
};

// descartamos un match (only available after candidate accepts)
window.discardMatch = async (matchId) => {
  if (
    typeof confirm === "function" &&
    !confirm("Are you sure you want to discard this match?")
  )
    return;

  try {
    await apiPatch(`/matches/${matchId}`, { status: "rejected" });
    const res = Array.isArray(reservations)
      ? reservations.find((r) => r.matchId === matchId)
      : null;
    if (res) await apiPatch(`/reservations/${res.id}`, { active: false });

    clearCache("matches");
    clearCache("reservations");
    showMessage("Match discarded and reservation released");
    await loadMatches();
    await loadReservations();
    await loadCandidates();
  } catch (err) {
    showMessage("Error discarding match", "error");
  }
};

// liberamos una reserva
window.releaseReservation = async (resId) => {
  if (
    typeof confirm === "function" &&
    !confirm("Are you sure you want to release this reservation?")
  )
    return;

  try {
    await apiPatch(`/reservations/${resId}`, { active: false });
    
    // Also update the match status
    const reservation = reservations.find(r => r.id === resId);
    if (reservation && reservation.matchId) {
      await apiPatch(`/matches/${reservation.matchId}`, { status: "rejected" });
    }
    
    clearCache("reservations");
    clearCache("matches");
    showMessage("Reservation released");
    await loadReservations();
    await loadMatches();
    await loadCandidates();
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
        <p style="font-size: 28px; font-weight: 700; color: #F5F5F5; margin-top: 5px;">${Array.isArray(candidates) ? candidates.filter((c) => c.openToWork && !isReservedByOther(c.id)).length : 0}</p>
      </div>
      <div style="background: #1F1F1F; border: 1px solid #2A2A2A; border-radius: 8px; padding: 15px; text-align: center;">
        <p style="color: #8A8A8A; font-size: 12px;">Active Matches</p>
        <p style="font-size: 28px; font-weight: 700; color: #F5F5F5; margin-top: 5px;">${Array.isArray(matches) ? matches.filter(m => m.companyId === userId && m.status !== 'rejected').length : 0}</p>
      </div>
      <div style="background: #1F1F1F; border: 1px solid #2A2A2A; border-radius: 8px; padding: 15px; text-align: center;">
        <p style="color: #8A8A8A; font-size: 12px;">Active Reservations</p>
        <p style="font-size: 28px; font-weight: 700; color: #F5F5F5; margin-top: 5px;">${Array.isArray(reservations) ? reservations.filter((r) => r.active && r.companyId === userId).length : 0}</p>
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
  await loadCompanyData();
  await loadCandidates();
  await loadMatches();
  await loadReservations();
  renderStats();
}

init();