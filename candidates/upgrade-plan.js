import { apiGet, apiPatch } from '../general/api.js';
import { getCandidatePlan, getCandidateReservationLimit } from '../general/plans.js';

const role = localStorage.getItem('role');
const userId = localStorage.getItem('userId');

if (role !== 'candidate') {
  window.location.href = '../dashboard.html';
}
if (!userId) {
  window.location.href = '../login.html';
}

const messageDiv = document.getElementById('message');
const plansGrid = document.getElementById('plansGrid');
const heroPlanPill = document.getElementById('heroPlanPill');
const heroPlanMeta = document.getElementById('heroPlanMeta');
const headerUserName = document.getElementById('headerUserName');
const headerUserRole = document.getElementById('headerUserRole');
const headerAvatar = document.getElementById('headerAvatar');
const headerAvatarImg = document.getElementById('headerAvatarImg');

let candidate = null;
let plans = [];

function shortCandidatePlanLabel(planId) {
  if (planId === 'cand_free') return 'Free';
  if (planId === 'cand_pro_1') return 'Pro L1';
  if (planId === 'cand_pro_2') return 'Pro L2';
  return planId || 'Free';
}

function showMessage(text, type = 'success') {
  if (!messageDiv) return;
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = 'block';
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 3500);
}

async function loadData() {
  try {
    candidate = await apiGet(`/candidates/${userId}`);
    try {
      plans = await apiGet('/plans');
    } catch (e) {
      plans = [];
    }

    // header
    if (headerUserName) headerUserName.textContent = candidate?.name || 'User';
    if (headerUserRole) headerUserRole.textContent = 'Candidate';

    if (candidate?.avatar && headerAvatar && headerAvatarImg) {
      headerAvatarImg.src = candidate.avatar;
      headerAvatar.classList.add('has-photo');
    }

    render();
  } catch (e) {
    showMessage('No se pudo cargar la información. Verifica json-server.', 'error');
  }
}

function formatPrice(plan) {
  const price = plan?.priceMonthly;
  if (price === 0) return 'Gratis';
  if (typeof price === 'number') return `$${price.toFixed(2)} ` + 'USD';
  return '--';
}

function sortCandidatePlans(plansArr) {
  const candidatePlans = (Array.isArray(plansArr) ? plansArr : []).filter((p) => p.scope === 'candidate');
  const order = ['cand_free', 'cand_pro_1', 'cand_pro_2'];
  candidatePlans.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  return candidatePlans;
}

function getTagForPlan(planId) {
  if (planId === 'cand_free') return { text: 'Empezar', cls: '' };
  if (planId === 'cand_pro_1') return { text: 'Popular', cls: 'hot' };
  if (planId === 'cand_pro_2') return { text: 'Máxima exposición', cls: 'max' };
  return { text: 'Plan', cls: '' };
}

function renderHero() {
  if (!candidate) return;
  const planId = candidate?.planId || 'cand_free';
  const plan = getCandidatePlan(plans, candidate);
  const limit = getCandidateReservationLimit(plans, candidate);

  if (heroPlanPill) {
    heroPlanPill.dataset.plan = planId;
    heroPlanPill.textContent = shortCandidatePlanLabel(planId);
    heroPlanPill.title = plan?.name || planId;
  }
  if (heroPlanMeta) {
    heroPlanMeta.textContent = `Máx. ${limit} empresa${limit === 1 ? '' : 's'} • ${formatPrice(plan)}/mes`; 
  }
}

function render() {
  renderHero();
  renderCards();
}

function renderCards() {
  if (!plansGrid) return;
  plansGrid.innerHTML = '';

  const planId = candidate?.planId || 'cand_free';
  const candidatePlans = sortCandidatePlans(plans);

  for (const plan of candidatePlans) {
    const limit = Number(plan?.maxActiveCompanyReservations ?? 1);
    const isCurrent = plan.id === planId;
    const tag = getTagForPlan(plan.id);

    const card = document.createElement('div');
    card.className = `plan-card ${isCurrent ? 'is-current' : ''}`;

    const price = formatPrice(plan);

    card.innerHTML = `
      <div class="plan-top">
        <div>
          <h3 class="plan-name">${plan?.name || plan.id}</h3>
          <div class="plan-price">${price}${price === 'Gratis' ? '' : '<small>/ mes</small>'}</div>
        </div>
        <span class="plan-tag ${tag.cls}"><i class="bi bi-stars" aria-hidden="true"></i> ${tag.text}</span>
      </div>

      <p class="plan-desc">
        ${plan.id === 'cand_free' ? 'Perfecto para empezar y probar MatchFlow.' : plan.id === 'cand_pro_1' ? 'Para candidatos que quieren más oportunidades sin irse al máximo.' : 'Para máxima exposición: ideal si estás en búsqueda activa.'}
      </p>

      <ul class="plan-features">
        <li><i class="bi bi-check2-circle" aria-hidden="true"></i> Hasta <strong>${limit}</strong> empresa${limit === 1 ? '' : 's'} pueden reservarte al mismo tiempo</li>
        <li><i class="bi bi-check2-circle" aria-hidden="true"></i> Tus datos de contacto siguen protegidos hasta <strong>contacted</strong></li>
        <li><i class="bi bi-check2-circle" aria-hidden="true"></i> Cambios aplican <strong>al instante</strong> (pago simulado)</li>
      </ul>

      <div class="plan-actions">
        <button class="btn ${isCurrent ? 'secondary' : 'primary'}" ${isCurrent ? 'disabled' : ''} data-plan="${plan.id}">
          ${isCurrent ? 'Plan actual' : 'Elegir plan'}
        </button>
        ${!isCurrent ? `<span class="plan-pill" data-plan="${plan.id}">${shortCandidatePlanLabel(plan.id)}</span>` : ''}
      </div>

      ${isCurrent ? '<div class="small-note">Este es tu plan actual. Puedes cambiarlo cuando quieras.</div>' : ''}
    `;

    const btn = card.querySelector('button[data-plan]');
    if (btn && !isCurrent) {
      btn.addEventListener('click', async () => {
        await choosePlan(plan.id);
      });
    }

    plansGrid.appendChild(card);
  }
}

async function choosePlan(newPlanId) {
  if (!candidate) return;

  try {
    const updated = await apiPatch(`/candidates/${userId}`, { planId: newPlanId });
    candidate = updated;

    const plan = getCandidatePlan(plans, candidate);
    showMessage(`Plan actualizado a: ${plan?.name || newPlanId} (pago simulado).`, 'success');

    // flash message for profile
    localStorage.setItem('flashMessage', JSON.stringify({
      type: 'success',
      text: `¡Listo! Tu plan ahora es: ${plan?.name || newPlanId}.`
    }));

    render();
  } catch (e) {
    showMessage('No se pudo actualizar el plan. Intenta de nuevo.', 'error');
  }
}

loadData();
