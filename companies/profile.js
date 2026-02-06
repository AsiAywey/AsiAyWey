// este archivo maneja el perfil de empresa
import { apiGet, apiPost, apiPatch, apiDelete } from "../general/api.js";
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
const jobOffersList = $("jobOffersList");
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
      companyLocation.textContent = ` ${company.location || "--"}`;
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
    reservations = await fetchCached("reservations", () => apiGet("/reservations"));
    
    const otwCandidates = Array.isArray(candidates)
      ? candidates.filter((c) => c.openToWork)
      : [];
    
    const nodes = otwCandidates.map((candidate) => {
      // Verificar si el candidato está reservado
      const activeReservation = Array.isArray(reservations)
        ? reservations.find((r) => r.candidateId === candidate.id && r.active)
        : null;
      
      const isReservedByMe = activeReservation && activeReservation.companyId === userId;
      const isReservedByOther = activeReservation && activeReservation.companyId !== userId;
      
      // Determinar clase y estado visual
      let statusBadge = '';
      let buttonHtml = '';
      let cardClass = '';
      
      if (isReservedByMe) {
        statusBadge = '<span class="badge bg-success ms-2">✓ Reserved by you</span>';
        buttonHtml = `<button class="btn btn-secondary btn-sm" disabled>Already Matched</button>`;
        cardClass = 'candidate-reserved-mine';
      } else if (isReservedByOther) {
        statusBadge = '<span class="badge bg-warning text-dark ms-2"> Reserved</span>';
        buttonHtml = `<button class="btn btn-secondary btn-sm" disabled>Not Available</button>`;
        cardClass = 'candidate-reserved-other';
      } else {
        buttonHtml = `<button class="btn btn-primary btn-sm" onclick="selectCandidate('${candidate.id}')">Select & Match</button>`;
        cardClass = 'candidate-available';
      }
      
      const div = document.createElement("div");
      div.className = `d-flex justify-content-between align-items-center border-bottom py-3 ${cardClass}`;
      div.innerHTML = `
        <div>
          <h4 class="mb-0">${candidate.name}${statusBadge}</h4>
          <p class="text-muted mb-1 text-white">${candidate.title || ""}</p>
          <p class="text-secondary small mb-0">Skills: ${Array.isArray(candidate.skills) ? candidate.skills.join(", ") : ""}</p>
        </div>
        ${buttonHtml}
      `;
      return div;
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

// helper para obtener clase de badge según estado
const getStatusBadgeClass = (status) => {
  const classes = {
    pending: 'bg-warning text-dark',
    contacted: 'bg-info text-white',
    interview: 'bg-primary text-white',
    hired: 'bg-success text-white',
    discarded: 'bg-danger text-white'
  };
  return classes[status] || 'bg-secondary text-white';
};

// helper para generar botones según estado del match
const getMatchActionButtons = (match, candidate) => {
  const status = match.status;
  let buttons = '';
  
  // Botón WhatsApp solo disponible desde estado 'contacted'
  const canContact = ['contacted', 'interview', 'hired'].includes(status);
  if (canContact && candidate && candidate.phone) {
    const phone = candidate.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Hi ${candidate.name}, we're interested in your profile for a position at our company!`);
    buttons += `<a href="https://wa.me/${phone}?text=${message}" target="_blank" class="btn btn-success btn-sm"><i class="bi bi-whatsapp"></i> WhatsApp</a>`;
  }
  
  // Botones de progreso según estado
  if (status === 'pending') {
    buttons += `<button class="btn btn-info btn-sm" onclick="changeMatchStatus('${match.id}', 'contacted')">Contact</button>`;
  } else if (status === 'contacted') {
    buttons += `<button class="btn btn-primary btn-sm" onclick="changeMatchStatus('${match.id}', 'interview')">Set Interview</button>`;
  } else if (status === 'interview') {
    buttons += `<button class="btn btn-success btn-sm" onclick="changeMatchStatus('${match.id}', 'hired')">Hire</button>`;
  }
  
  // Botón de descartar para todos excepto hired y discarded
  if (!['hired', 'discarded'].includes(status)) {
    buttons += `<button class="btn btn-danger btn-sm" onclick="discardMatch('${match.id}')">Discard</button>`;
  }
  
  return buttons;
};

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
      
      // Solo mostrar info de contacto si el estado es 'contacted' o superior
      const canSeeContact = ['contacted', 'interview', 'hired'].includes(match.status);
      const contactInfo = canSeeContact && candidate 
        ? `<p class="text-muted small mb-0"> ${candidate.email || 'N/A'} |  ${candidate.phone || 'N/A'}</p>` 
        : '<p class="text-muted small mb-0"> Contact info hidden until contacted</p>';
      
      return row(`
        <div>
          <h4 class="mb-0">${candidate ? candidate.name : "Unknown"}</h4>
          <p class="text-white mb-1">${job ? job.title : "Unknown Job"}</p>
          ${contactInfo}
          <span class="badge ${getStatusBadgeClass(match.status)} mt-2">${match.status.toUpperCase()}</span>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          ${getMatchActionButtons(match, candidate)}
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
  if (!Array.isArray(jobOffers) || !jobOffers.length) {
    showMessage("Please create a job offer first", "error");
    return;
  }

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
    clearCache("candidates");
    showMessage("Match created and candidate reserved!");
    await loadCandidates();
    await loadMatches();
    await loadReservations();
  } catch (err) {
    showMessage("Error creating match", "error");
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
    await loadCandidates();
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
    await loadCandidates();
    await loadReservations();
  } catch (err) {
    showMessage("Error releasing reservation", "error");
  }
};

function renderStats() {
  const statsDiv = document.createElement("div");
  statsDiv.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 20px;">
      <div style="background: #1F1F1F; border: 1px solid #2A2A2A; border-radius: 8px; padding: 15px; text-align: center;">
        <p style="color: #8A8A8A; font-size: 12px;">Available Candidates</p>
        <p style="font-size: 28px; font-weight: 700; color: #F5F5F5; margin-top: 5px;">${Array.isArray(candidates) ? candidates.filter((c) => c.openToWork).length : 0}</p>
      </div>
      <div style="background: #1F1F1F; border: 1px solid #2A2A2A; border-radius: 8px; padding: 15px; text-align: center;">
        <p style="color: #8A8A8A; font-size: 12px;">My Job Offers</p>
        <p style="font-size: 28px; font-weight: 700; color: #F5F5F5; margin-top: 5px;">${Array.isArray(jobOffers) ? jobOffers.filter(j => j.companyId === userId).length : 0}</p>
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

// cargar ofertas de trabajo de la empresa
async function loadJobOffers() {
  try {
    jobOffers = await fetchCached("jobOffers", () => apiGet("/jobOffers"));
    const myOffers = Array.isArray(jobOffers)
      ? jobOffers.filter((j) => j.companyId === userId)
      : [];
    
    if (!jobOffersList) return;
    
    if (myOffers.length === 0) {
      jobOffersList.innerHTML = '<p class="text-muted py-3">No job offers yet. Create your first one!</p>';
      return;
    }
    
    jobOffersList.innerHTML = myOffers.map(offer => `
      <div class="job-offer-card d-flex justify-content-between align-items-start border-bottom py-3">
        <div class="flex-grow-1">
          <h4 class="mb-1">${offer.title}</h4>
          <p class="text-muted mb-1"> ${offer.location} |  ${offer.salary}</p>
          <p class="text-secondary small mb-1">${offer.description}</p>
          <p class="small mb-0"><strong>Skills:</strong> ${Array.isArray(offer.skills) ? offer.skills.join(', ') : ''}</p>
          <span class="badge bg-success mt-2">Active</span>
        </div>
        <div class="d-flex gap-2 flex-shrink-0 ms-3">
          <button class="btn btn-outline-primary btn-sm" onclick="openEditJobModal('${offer.id}')">
            <i class="bi bi-pencil"></i> Edit
          </button>
          <button class="btn btn-outline-danger btn-sm" onclick="deleteJobOffer('${offer.id}')">
            <i class="bi bi-trash"></i> Delete
          </button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    showMessage("Error loading job offers", "error");
  }
}

// toggle del formulario de crear oferta
const toggleCreateJobBtn = $("toggleCreateJobBtn");
const createJobForm = $("createJobForm");
const cancelCreateJob = $("cancelCreateJob");
const newJobForm = $("newJobForm");

if (toggleCreateJobBtn) {
  toggleCreateJobBtn.addEventListener("click", () => {
    createJobForm.style.display = createJobForm.style.display === "none" ? "block" : "none";
  });
}

if (cancelCreateJob) {
  cancelCreateJob.addEventListener("click", () => {
    createJobForm.style.display = "none";
    newJobForm.reset();
  });
}

// crear nueva oferta de trabajo
if (newJobForm) {
  newJobForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const newOffer = {
      id: `job_${Date.now()}`,
      companyId: userId,
      name: company?.name || "Company",
      title: $("newJobTitle").value,
      description: $("newJobDescription").value,
      skills: $("newJobSkills").value.split(",").map(s => s.trim()),
      location: $("newJobLocation").value,
      salary: $("newJobSalary").value,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
    };
    
    try {
      await apiPost("/jobOffers", newOffer);
      clearCache("jobOffers");
      newJobForm.reset();
      createJobForm.style.display = "none";
      showMessage("Job offer created successfully!");
      await loadJobOffers();
    } catch (err) {
      showMessage("Error creating job offer", "error");
    }
  });
}

// abrir modal de edición
window.openEditJobModal = async (offerId) => {
  const modal = $("editJobModal");
  const offer = jobOffers.find(j => j.id === offerId);
  
  if (!offer) {
    showMessage("Offer not found", "error");
    return;
  }
  
  $("editJobId").value = offer.id;
  $("editJobTitle").value = offer.title || "";
  $("editJobDescription").value = offer.description || "";
  $("editJobSkills").value = Array.isArray(offer.skills) ? offer.skills.join(", ") : "";
  $("editJobLocation").value = offer.location || "";
  $("editJobSalary").value = offer.salary || "";
  
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
};

// cerrar modal de edición
window.closeEditJobModal = () => {
  const modal = $("editJobModal");
  modal.style.display = "none";
  document.body.style.overflow = "";
};

// guardar cambios de edición
const editJobForm = $("editJobForm");
if (editJobForm) {
  editJobForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const offerId = $("editJobId").value;
    const updatedOffer = {
      title: $("editJobTitle").value,
      description: $("editJobDescription").value,
      skills: $("editJobSkills").value.split(",").map(s => s.trim()),
      location: $("editJobLocation").value,
      salary: $("editJobSalary").value,
    };
    
    try {
      await apiPatch(`/jobOffers/${offerId}`, updatedOffer);
      clearCache("jobOffers");
      window.closeEditJobModal();
      showMessage("Job offer updated successfully!");
      await loadJobOffers();
    } catch (err) {
      showMessage("Error updating job offer", "error");
    }
  });
}

// eliminar oferta de trabajo
window.deleteJobOffer = async (offerId) => {
  if (!confirm("Are you sure you want to delete this job offer?")) return;
  
  try {
    await apiDelete(`/jobOffers/${offerId}`);
    clearCache("jobOffers");
    showMessage("Job offer deleted successfully!");
    await loadJobOffers();
  } catch (err) {
    showMessage("Error deleting job offer", "error");
  }
};

// cerrar modal al hacer clic fuera
const editJobModal = $("editJobModal");
if (editJobModal) {
  editJobModal.addEventListener("click", (e) => {
    if (e.target === editJobModal) {
      window.closeEditJobModal();
    }
  });
}

// cerrar con Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && editJobModal && editJobModal.style.display !== "none") {
    window.closeEditJobModal();
  }
});

// inicio general del perfil
async function init() {
  await loadCompanyData();
  await loadCandidates();
  await loadJobOffers();
  await loadMatches();
  await loadReservations();
  renderStats();
}

init();
