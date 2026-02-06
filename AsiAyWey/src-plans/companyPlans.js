// src-plans/companyPlans.js

export const COMPANY_PLANS = {
    Free: {
    canSeeReserved: false,
    canUseSkillFilter: false
    },
    Business: {
    canSeeReserved: false,
    canUseSkillFilter: true
    },
    Enterprise: {
    canSeeReserved: true,
    canUseSkillFilter: true
    }
};

export function getCompanyPermissions(planType) {
    return COMPANY_PLANS[planType];
}
