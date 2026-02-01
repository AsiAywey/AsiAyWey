const API_URL = "http://localhost:3000";

async function fetchData(endpoint) {
    try {
        const res = await fetch(`${API_URL}/${endpoint}`);
        if (!res.ok) throw new Error(`Error en ${endpoint}: ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error(err);
        return [];
    }
}

async function renderOffers(filter = "active") {
    const offers = await fetchData("offers");
    const filtered = offers.filter(o => o.status === filter || (filter === "active" && !o.status));

    const grid = document.getElementById("ofertas-de-chamba");
    if (!grid) {
        console.error("No se encontró el contenedor con ID 'ofertas-de-chamba'");
        return;
    }

    grid.innerHTML = "";

    if (filtered.length === 0) {
        grid.innerHTML = `<p style="color:gray;">No hay ofertas ${filter} disponibles.</p>`;
    }

    filtered.forEach(offer => {
        const card = document.createElement("div");
        card.className = "offer-card";
        card.innerHTML = `
        <div class="offer-content">
            <div class="offer-status">
            <span class="status-badge ${offer.status === "closed" ? "status-muted" : "status-live"}">
                ${offer.status === "closed" ? "Closed" : "Live Now"}
            </span>
            <span class="status-time">• Posted ${offer.posted}</span>
            </div>
            <div class="offer-title-section">
            <h3 class="offer-title">${offer.title}</h3>
            <p class="offer-location">
                <span class="material-symbols-outlined">apartment</span>
                ${offer.department} • ${offer.location}
            </p>
            </div>
            <div class="offer-actions">
            <button class="btn-reserve" data-id="${offer.id}">Reserve Candidate</button>
            <button class="btn-close-offer" data-id="${offer.id}">Close Offer</button>
            <button class="btn-edit" data-id="${offer.id}">Edit Details</button>
            <button class="btn-report" data-id="${offer.id}">View Report</button>
            <button class="btn-archive" data-id="${offer.id}">Archive</button>
            <button class="btn-delete" data-id="${offer.id}">Delete Offer</button>
            </div>
        </div>
    `;
        grid.appendChild(card);
    });

    const activeCount = offers.filter(o => o.status === "active" || !o.status).length;
    const closedCount = offers.filter(o => o.status === "closed").length;
    document.querySelector(".tab-badge-primary").textContent = activeCount;
    document.querySelector(".tab-badge-muted").textContent = closedCount;

    document.querySelectorAll(".btn-reserve").forEach(btn => {
        btn.addEventListener("click", () => reserveCandidate(btn.dataset.id));
    });
}

async function reserveCandidate(offerId) {
    const candidateId = prompt("Ingrese ID del candidato a reservar:");
    if (!candidateId) return;

    const reservations = await fetchData("reservations");
    const alreadyReserved = reservations.find(r => r.candidateId === candidateId && r.active);

    if (alreadyReserved) {
        alert("Este candidato ya está reservado por otra empresa.");
        return;
    }

    const reservation = { candidateId, offerId, active: true };
    await fetch(`${API_URL}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservation)
    });

    alert(`Candidato ${candidateId} reservado para oferta ${offerId}`);
}

document.addEventListener("DOMContentLoaded", () => {
    renderOffers();

    const createBtn = document.querySelector(".btn-create-offer");
    if (createBtn) {
        createBtn.addEventListener("click", async () => {
            const newOffer = {
                title: prompt("Título de la oferta:"),
                department: prompt("Departamento:"),
                location: prompt("Ubicación:"),
                posted: "just now",
                status: "active"
            };

            await fetch(`${API_URL}/offers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newOffer)
            });

            alert("Oferta creada correctamente");
            renderOffers("active");
        });
    }

    document.body.addEventListener("click", async (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;

        const offerId = btn.dataset.id;

        if (btn.classList.contains("btn-close-offer")) {
            await fetch(`${API_URL}/offers/${offerId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "closed" })
            });
            alert(`Oferta ${offerId} cerrada.`);
            renderOffers();
        }

        if (btn.classList.contains("btn-edit")) {
            const newTitle = prompt("Nuevo título:");
            await fetch(`${API_URL}/offers/${offerId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newTitle })
            });
            alert("Oferta actualizada.");
            renderOffers();
        }

        if (btn.classList.contains("btn-report")) {
            const matches = await fetchData("matches");
            console.table(matches);
            alert("Revisa la consola para ver el reporte de matches.");
        }

        if (btn.classList.contains("btn-archive")) {
            await fetch(`${API_URL}/offers/${offerId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ archived: true })
            });
            alert("Oferta archivada.");
            renderOffers();
        }

        if (btn.classList.contains("btn-delete")) {
            const confirmDelete = confirm("¿Estás seguro de eliminar esta oferta?");
            if (!confirmDelete) return;

            await fetch(`${API_URL}/offers/${offerId}`, {
                method: "DELETE"
            });

            alert(`Oferta ${offerId} eliminada.`);
            renderOffers();
        }
    });

    document.querySelectorAll(".tab-link").forEach(tab => {
        tab.addEventListener("click", e => {
            e.preventDefault();
            document.querySelectorAll(".tab-link").forEach(t => t.classList.remove("tab-active"));
            tab.classList.add("tab-active");
            const filter = tab.dataset.filter;
            renderOffers(filter);
        });
    });
});
