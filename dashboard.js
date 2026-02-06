// this file handles the dashboard by role
import { apiGet, apiPatch } from "./general/api.js";
import { clearCache } from "./general/cache.js";

const role = localStorage.getItem("role");
const userId = localStorage.getItem("userId");

// if no session, go back to login
if (!role || !userId) {
  window.location.href = "login.html";
}

const candidateLink = document.getElementById("candidateLink");
const companyLink = document.getElementById("companyLink");
const createJobBtn = document.getElementById("createJobBtn");
const userName = document.getElementById("userName");
const userRole = document.getElementById("userRole");
const tableBody = document.getElementById("tableBody");
const tableTitle = document.getElementById("tableTitle");
const headerAvatar = document.getElementById("headerAvatar");
const headerAvatarImg = document.getElementById("headerAvatarImg");

// load main dashboard data
async function initDashboard() {
  try {
    if (role === "candidate") {
      candidateLink.classList.remove("menu-item-hidden");
      const candidate = await apiGet(`/candidates/${userId}`);
      userName.textContent = candidate.name;
      userRole.textContent = "Candidate";
      if (candidate.avatar && headerAvatar && headerAvatarImg) {
        headerAvatarImg.src = candidate.avatar;
        headerAvatar.classList.add("has-photo");
      }
      loadCandidateMatches();
      loadCandidateStats();
    } else if (role === "company") {
      companyLink.classList.remove("menu-item-hidden");
      createJobBtn.classList.remove("button-hidden");
      const company = await apiGet(`/companies/${userId}`);
      userName.textContent = company.name;
      userRole.textContent = "Company";
      const avatarSrc = company.avatar || company.logo;
      if (avatarSrc && headerAvatar && headerAvatarImg) {
        headerAvatarImg.src = avatarSrc;
        headerAvatar.classList.add("has-photo");
      }
      loadCompanyMatches();
      loadStats();
    }
  } catch (err) {
    console.error("Error initializing dashboard:", err);
  }
}

// show offers for candidates
async function loadCandidateMatches() {
  try {
    const jobs = await apiGet("/jobOffers");
    tableTitle.textContent = "Available Jobs";
    tableBody.innerHTML = "";

    if (jobs.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="4" style="text-align: center; color: #8A8A8A;">No jobs available</td></tr>';
      return;
    }

    jobs.slice(0, 5).forEach((job) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${job.name}</td>
        <td>${job.title}</td>
        <td><span class="status new">Open</span></td>
        <td><a href="jobs.html" style="color: #D72638; text-decoration: none;">View</a></td>
      `;
      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error("Error loading matches:", err);
  }
}

// show company offers
async function loadCompanyMatches() {
  try {
    const offers = await apiGet("/jobOffers");
    const myOffers = offers.filter((o) => o.companyId === userId);
    tableTitle.textContent = "My Recent Offers";
    tableBody.innerHTML = "";

    if (myOffers.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="4" style="text-align: center; color: #8A8A8A;">No job offers yet</td></tr>';
      return;
    }

    myOffers.slice(0, 5).forEach((offer) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${offer.title}</td>
        <td>${offer.location}</td>
        <td><span class="status new">Active</span></td>
        <td><button class="edit-btn" data-job-id="${offer.id}">Edit</button></td>
      `;
      tableBody.appendChild(row);
    });
    
    // Agregar event listeners a los botones de edición
    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", () => openEditModal(btn.dataset.jobId));
    });
  } catch (err) {
    console.error("Error loading company matches:", err);
  }
}

// count quick stats for company
async function loadStats() {
  try {
    const jobs = await apiGet("/jobOffers");
    const candidates = await apiGet("/candidates");
    const matches = await apiGet("/matches");
    const reservations = await apiGet("/reservations");

    // Contar trabajos de esta empresa
    const myJobs = jobs.filter(j => j.companyId === userId).length;
    
    // Contar matches de esta empresa
    const myMatches = matches.filter(m => m.companyId === userId).length;
    
    // Contar reservaciones activas de esta empresa
    const myReservations = reservations.filter(r => r.companyId === userId && r.active).length;
    
    // Contar candidatos disponibles (Open to Work)
    const availableCandidates = candidates.filter(c => c.openToWork).length;

    document.getElementById("activeJobsCount").textContent = myJobs;
    document.getElementById("totalMatchesCount").textContent = myMatches;
    document.getElementById("reservationsCount").textContent = myReservations;
    document.getElementById("totalCandidatesCount").textContent = availableCandidates;
  } catch (err) {
    console.error("Error loading stats:", err);
  }
}

// count quick stats for candidate
async function loadCandidateStats() {
  try {
    const jobs = await apiGet("/jobOffers");
    const matches = await apiGet("/matches");
    const reservations = await apiGet("/reservations");

    // Contar trabajos activos disponibles
    const activeJobs = jobs.filter(j => j.active !== false).length;
    
    // Contar matches del candidato
    const myMatches = matches.filter(m => m.candidateId === userId).length;
    
    // Contar reservaciones activas para este candidato
    const myReservations = reservations.filter(r => r.candidateId === userId && r.active).length;
    
    // Contar entrevistas del candidato
    const interviews = matches.filter(m => m.candidateId === userId && m.status === 'interview').length;

    document.getElementById("activeJobsCount").textContent = activeJobs;
    document.getElementById("totalMatchesCount").textContent = myMatches;
    document.getElementById("reservationsCount").textContent = myReservations;
    document.getElementById("totalCandidatesCount").textContent = interviews;
    
    // Cambiar etiquetas para candidato
    const statCards = document.querySelectorAll(".stat-card h3");
    if (statCards.length >= 4) {
      statCards[2].textContent = "My Reservations";
      statCards[3].textContent = "Interviews";
    }
  } catch (err) {
    console.error("Error loading candidate stats:", err);
  }
}

// Configurar botón "Create New Job"
if (createJobBtn) {
  createJobBtn.addEventListener("click", () => {
    window.location.href = "jobs.html";
  });
}

// Configurar botón "View All"
const viewAllBtn = document.getElementById("viewAllBtn");
if (viewAllBtn) {
  viewAllBtn.addEventListener("click", () => {
    if (role === "company") {
      window.location.href = "companies/profile.html";
    } else {
      window.location.href = "candidates/jobs-browse.html";
    }
  });
}

const editJobModal = document.getElementById("editJobModal");
const editJobForm = document.getElementById("editJobForm");
const closeEditModalBtn = document.getElementById("closeEditModal");
const cancelEditJobBtn = document.getElementById("cancelEditJob");

let allJobOffers = [];

// Abrir modal de edición
async function openEditModal(jobId) {
  try {
    // Cargar todas las ofertas si no las tenemos
    if (allJobOffers.length === 0) {
      allJobOffers = await apiGet("/jobOffers");
    }
    
    const job = allJobOffers.find(j => j.id === jobId);
    if (!job) {
      alert("Job not found");
      return;
    }
    
    // Llenar el formulario
    document.getElementById("editJobId").value = job.id;
    document.getElementById("editJobTitle").value = job.title || "";
    document.getElementById("editJobDescription").value = job.description || "";
    document.getElementById("editJobSkills").value = Array.isArray(job.skills) ? job.skills.join(", ") : "";
    document.getElementById("editJobLocation").value = job.location || "";
    document.getElementById("editJobSalary").value = job.salary || "";
    
    // Mostrar modal
    editJobModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  } catch (err) {
    console.error("Error opening edit modal:", err);
  }
}

// Cerrar modal
function closeEditModal() {
  editJobModal.style.display = "none";
  document.body.style.overflow = "";
  editJobForm.reset();
}

// Event listeners para cerrar
if (closeEditModalBtn) {
  closeEditModalBtn.addEventListener("click", closeEditModal);
}

if (cancelEditJobBtn) {
  cancelEditJobBtn.addEventListener("click", closeEditModal);
}

// Cerrar al hacer clic fuera
if (editJobModal) {
  editJobModal.addEventListener("click", (e) => {
    if (e.target === editJobModal) {
      closeEditModal();
    }
  });
}

// Cerrar con Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && editJobModal && editJobModal.style.display !== "none") {
    closeEditModal();
  }
});

// Guardar cambios
if (editJobForm) {
  editJobForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const jobId = document.getElementById("editJobId").value;
    const updatedJob = {
      title: document.getElementById("editJobTitle").value,
      description: document.getElementById("editJobDescription").value,
      skills: document.getElementById("editJobSkills").value.split(",").map(s => s.trim()),
      location: document.getElementById("editJobLocation").value,
      salary: document.getElementById("editJobSalary").value,
    };
    
    try {
      await apiPatch(`/jobOffers/${jobId}`, updatedJob);
      clearCache("jobOffers");
      closeEditModal();
      
      // Recargar la tabla
      allJobOffers = [];
      loadCompanyMatches();
      loadStats();
    } catch (err) {
      console.error("Error updating job:", err);
      alert("Error updating job offer");
    }
  });
}

// start everything on page load
window.addEventListener("load", initDashboard);
