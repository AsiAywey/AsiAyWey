import { getCandidateReservationLimit } from './plans.js';

// Devuelve solo las reservas ACTIVAS de un candidato.
// Sirve para saber cuántas empresas lo están reservando en este momento.
export function getActiveReservationsForCandidate(reservations, candidateId) {
  if (!Array.isArray(reservations)) return [];

  return reservations.filter(
    r => r.candidateId === candidateId && r.active
  );
}

// Devuelve un Set con los IDs de empresas que tienen una reserva activa.
// Usamos Set para evitar empresas repetidas.
export function getDistinctCompanyIds(activeReservations) {
  const set = new Set();

  if (!Array.isArray(activeReservations)) return set;

  for (let i = 0; i < activeReservations.length; i++) {
    const companyId = activeReservations[i]?.companyId;
    if (companyId) set.add(companyId);
  }

  return set;
}

// Revisa si el candidato ya llegó al límite de reservas según su plan.
// Si el número de empresas es mayor o igual al límite, devuelve true.
export function isCandidateAtCapacity(plans, candidate, activeReservations) {
  const limit = getCandidateReservationLimit(plans, candidate);
  const distinctCompanies = getDistinctCompanyIds(activeReservations);

  return distinctCompanies.size >= limit;
}

// Regla principal para saber si una empresa puede reservar a un candidato.
// Devuelve un objeto para que la UI pueda mostrar mensajes claros.
export function canCompanyReserveCandidate(plans, candidate, companyId, activeReservations) {
  const distinctCompanies = getDistinctCompanyIds(activeReservations);

  // Si esta empresa ya reservó al candidato, no se permite otra reserva
  if (distinctCompanies.has(companyId)) {
    return { ok: false, reason: 'already_reserved_by_you' };
  }

  const limit = getCandidateReservationLimit(plans, candidate);

  // Si el candidato ya llegó a su límite de reservas, se bloquea
  if (distinctCompanies.size >= limit) {
    return {
      ok: false,
      reason: 'candidate_at_capacity',
      limit,
      current: distinctCompanies.size
    };
  }

  // Si pasa todas las reglas, la empresa puede reservar
  return {
    ok: true,
    limit,
    current: distinctCompanies.size
  };
}
