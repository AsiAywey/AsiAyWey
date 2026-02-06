import { simulateCompanyPayment } from './companyPayments.js';

let company = JSON.parse(localStorage.getItem('loggedUser'));
const text = document.getElementById('currentPlan');

text.textContent = `Plan actual: ${company.planType}`;

window.changePlan = async function(plan) {
    await simulateCompanyPayment(company, plan);
    window.location.href = "../companies/profile.html";
};
