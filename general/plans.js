// IDs por defecto de los planes.
// Se usan cuando un usuario o empresa no tiene plan guardado.
export const DEFAULT_CANDIDATE_PLAN_ID = 'cand_free';
export const DEFAULT_COMPANY_PLAN_ID = 'comp_free';

// Busca un plan dentro del array de planes usando el id.
// Si no encuentra nada, devuelve null.
export function findPlan(plans, planId) {
  if (!Array.isArray(plans)) return null;

  return plans.find(plan => plan.id === planId) || null;
}

// Obtiene el plan del candidato.
// Si el candidato no tiene plan asignado, usa el plan Free por defecto.
export function getCandidatePlan(plans, candidate) {
  const planId = candidate?.planId || DEFAULT_CANDIDATE_PLAN_ID;
  return findPlan(plans, planId);
}

// Devuelve cuántas empresas pueden reservar al candidato al mismo tiempo.
// Depende del plan del candidato.
// Si algo falla, por seguridad se devuelve 1 (plan Free).
export function getCandidateReservationLimit(plans, candidate) {
  const plan = getCandidatePlan(plans, candidate);
  const limit = plan?.maxActiveCompanyReservations;

  return Number.isFinite(limit) ? Number(limit) : 1;
}

// Obtiene el plan de la empresa.
// Si no tiene plan asignado, se usa el plan Free por defecto.
export function getCompanyPlan(plans, company) {
  const planId = company?.planId || DEFAULT_COMPANY_PLAN_ID;
  return findPlan(plans, planId);
}

// Indica si una empresa puede ver candidatos que ya están reservados.
// Normalmente solo el plan Enterprise puede hacer esto.
export function canCompanySeeReservedCandidates(plans, company) {
  const plan = getCompanyPlan(plans, company);
  return Boolean(plan?.canSeeReservedCandidates);
}

// Indica si la empresa puede usar filtros avanzados 
export function canCompanyUseAdvancedSkillFilter(plans, company) {
  const plan = getCompanyPlan(plans, company);
  return Boolean(plan?.canUseAdvancedSkillFilter);
}

// Devuelve el número máximo de candidatos que la empresa puede ver en búsquedas.
// Si el plan no tiene límite definido, se usa 10 por defecto.
export function getCompanyMaxCandidateResults(plans, company) {
  const plan = getCompanyPlan(plans, company);
  const limit = plan?.maxCandidateSearchResults;

  return Number.isFinite(limit) ? Number(limit) : 10;
}
