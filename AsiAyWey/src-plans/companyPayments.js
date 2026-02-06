// src-plans/companyPayments.js

export async function simulateCompanyPayment(company, newPlan) {
    await fetch(`http://localhost:3000/users/${company.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planType: newPlan })
    });

    const updated = { ...company, planType: newPlan };
    localStorage.setItem('loggedUser', JSON.stringify(updated));

    alert(`Ahora tu empresa tiene el plan ${newPlan}`);
}
