const API_BASE = "http://localhost:3005";

async function fetchData(endpoint) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

// Funciones de formateo
function formatMatchStatus(status) {
  const statusMap = {
    pending: "New",
    contacted: "Interviewing",
    interviewed: "Interviewed",
    hired: "Hired",
    rejected: "Rejected",
  };
  return statusMap[status] || status;
}

function getStatusClass(status) {
  const classMap = {
    pending: "new",
    contacted: "interview",
    interviewed: "interview",
    hired: "hired",
    rejected: "rejected",
  };
  return classMap[status] || "new";
}

function calculateMatchScore(user, jobOffer) {
  if (!user.skills || !jobOffer.requirements) return 0;

  const userSkills = user.skills.map((skill) => skill.toLowerCase());
  const requirements = jobOffer.requirements.map((req) => req.toLowerCase());

  let matches = 0;
  requirements.forEach((req) => {
    if (
      userSkills.some((skill) => skill.includes(req) || req.includes(skill))
    ) {
      matches++;
    }
  });

  return Math.round((matches / requirements.length) * 100);
}

// Funciones de carga de datos
async function loadStats() {
  try {
    const [jobOffers, users, reservations] = await Promise.all([
      fetchData("/jobOffers"),
      fetchData("/users"),
      fetchData("/reservations"),
    ]);

    if (jobOffers && users && reservations) {
      const activeJobs = jobOffers.filter((job) => job.active === true).length;
      document.querySelector(".stat-card:first-child .stat-value").textContent =
        activeJobs;

      const activeReservations = reservations.filter(
        (res) => res.active === true,
      ).length;
      const totalSlots = 5;
      document.querySelector(
        ".stat-card:nth-child(2) .stat-value",
      ).textContent = `${activeReservations} / ${totalSlots}`;
      document.querySelector(".progress span").style.width =
        `${(activeReservations / totalSlots) * 100}%`;

      const totalCandidates = users.length;
      document.querySelector(
        ".stat-card:nth-child(3) .stat-value",
      ).textContent = totalCandidates.toLocaleString();
    }
  } catch (error) {
    console.error("Error loading stats:", error);
  }
}

async function loadMatches() {
  try {
    const [matches, users, jobOffers, companies] = await Promise.all([
      fetchData("/matches"),
      fetchData("/users"),
      fetchData("/jobOffers"),
      fetchData("/companies"),
    ]);

    if (matches && users && jobOffers && companies) {
      const matchesTable = document.querySelector(".matches tbody");
      matchesTable.innerHTML = "";

      const recentMatches = matches.sort((a, b) => b.id - a.id).slice(0, 10);

      recentMatches.forEach((match) => {
        const user = users.find((u) => u.id === match.userId);
        const jobOffer = jobOffers.find((j) => j.id === match.jobOfferId);
        const company = companies.find((c) => c.id === match.companyId);

        if (user && jobOffer) {
          const score = calculateMatchScore(user, jobOffer);

          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${user.fullName}</td>
            <td>${jobOffer.title}</td>
            <td>${score}%</td>
            <td class="status ${getStatusClass(match.status)}">
              ${formatMatchStatus(match.status)}
            </td>
          `;
          matchesTable.appendChild(row);
        }
      });
    }
  } catch (error) {
    console.error("Error loading matches:", error);
  }
}

// Carga información de la empresa logeada
async function loadCompanyInfo() {
  try {
    const authData = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    
    const companyNameEl = document.getElementById('company-name');
    const companyRoleEl = document.getElementById('company-role');
    
    if (!companyNameEl || !companyRoleEl) {
      return;
    }
    
    if (authData && userType === 'company') {
      const company = JSON.parse(authData);
      companyNameEl.textContent = company.name;
      companyRoleEl.textContent = company.industry || 'Company';
    } else {
      const companies = await fetchData('/companies');
      if (companies && companies.length > 0) {
        const company = companies[0];
        companyNameEl.textContent = company.name;
        companyRoleEl.textContent = company.industry || 'Company';
      }
    }
  } catch (error) {
    const companyNameEl = document.getElementById('company-name');
    const companyRoleEl = document.getElementById('company-role');
    if (companyNameEl) companyNameEl.textContent = 'Company';
    if (companyRoleEl) companyRoleEl.textContent = 'Loading error';
  }
}

// Funcionalidad de interfaz
function initModal() {
  const createJobBtn = document.querySelector(".primary-btn");
  const modal = document.getElementById("create-job-modal");
  const closeBtn = document.getElementById("close-modal");
  const cancelBtn = document.getElementById("cancel-btn");
  
  if (!createJobBtn || !modal || !closeBtn || !cancelBtn) {
    return;
  }
  
  // Open modal
  createJobBtn.addEventListener("click", (e) => {
    e.preventDefault();
    modal.classList.add("show");
  });
  
  // Close modal functions
  function closeModal() {
    modal.classList.remove("show");
  }
  
  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);
  
  // Close modal when clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // Prevent form submission for now (visual only)
  const form = modal.querySelector("form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Visual only - functionality not implemented yet");
      closeModal();
    });
  }
}

function initDropdown() {
  const userAvatar = document.getElementById("user-avatar");
  const userMenu = document.getElementById("user-menu");

  if (!userAvatar || !userMenu) {
    return;
  }

  userAvatar.addEventListener("click", (e) => {
    e.stopPropagation();
    userMenu.classList.toggle("show");
  });

  document.addEventListener("click", (e) => {
    if (!userMenu.contains(e.target) && e.target !== userAvatar) {
      userMenu.classList.remove("show");
    }
  });

  const profileLink = document.getElementById("profile-link");
  if (profileLink) {
    profileLink.addEventListener("click", (e) => {
      e.preventDefault();
      userMenu.classList.remove("show");
      console.log("Profile clicked");
    });
  }

  const logoutLink = document.getElementById("logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      userMenu.classList.remove("show");

      if (confirm("Are you sure you want to log out?")) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userType");
        window.location.href = "auth.html";
      }
    });
  }
}

// Inicialización del dashboard
async function initDashboard() {
  await Promise.all([loadStats(), loadMatches()]);
}

// Verificación de autenticación
function checkAuthentication() {
  const authData = localStorage.getItem('authToken');
  const userType = localStorage.getItem('userType');
  
  if (!authData || userType !== 'company') {
    alert('Access denied. Please login as a company.');
    window.location.href = 'auth.html';
    return false;
  }
  return true;
}

// Función principal de inicialización
async function main() {
  if (!checkAuthentication()) {
    return;
  }
  
  initDropdown();
  initModal();

  await loadCompanyInfo();

  await initDashboard();

  setInterval(initDashboard, 30000);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
