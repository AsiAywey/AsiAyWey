import { getElement } from "../../general/json.js";

const $ = s => document.querySelector(s);
const form = $("#login_form");

if (!form) {
    console.error("Formulario no encontrado");
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = $("#email").value.trim();
    const password = $("#password").value.trim();

    try {
    const dataUsers = await getElement("http://localhost:3000/users");
    const dataCompanies = await getElement("http://localhost:3000/companies");

    const user = dataUsers.find(u => u.email === email && u.password === password);
    const company = dataCompanies.find(c => c.email === email && c.password === password);

    if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        alert("Login successful (User)");
        window.location.href = "#";
        } else if (company) {
        localStorage.setItem("company", JSON.stringify(company));
        alert("Login successful (Company)");
        window.location.href = "#";
        } else {
        alert("Invalid credentials");
        }
    } catch (err) {
        console.error("Error de conexión:", err);
        alert("No se pudo conectar con el servidor");
    }
});
