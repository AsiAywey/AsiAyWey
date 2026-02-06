import { apiGet } from '../general/api.js';

export async function checkCompanyPlanBeforePosting(companyId) {
    const plan = await apiGet(`/companies/${companyId}/plan`);
    const offers = await apiGet(`/companies/${companyId}/jobOffers`);

    const activeOffers = offers.filter(o => o.status === 'active').length;

    const limits = {
    Free: 1,
    Pro1: 3,
    Pro2: 10
    };

    const max = limits[plan.name] || 1;

    if (activeOffers >= max) {
    alert('Has alcanzado el límite de ofertas de tu plan.');
    window.location.href = '../plans/userPlans.html';
    return false;
    }

    return true;
}