const API_BASE = "http://localhost:3005";

// Funcionalidad cambio login/register
const loginTab = document.getElementById("login-tab");
const registerTab = document.getElementById("register-tab");
const loginContent = document.getElementById("login-content");
const registerContent = document.getElementById("register-content");

function switchTab(tab) {
  if (tab === "login") {
    loginTab.classList.add("active");
    registerTab.classList.remove("active");
    loginContent.style.display = "block";
    registerContent.style.display = "none";
  } else {
    registerTab.classList.add("active");
    loginTab.classList.remove("active");
    registerContent.style.display = "block";
    loginContent.style.display = "none";
  }
}

loginTab.addEventListener("click", () => switchTab("login"));
registerTab.addEventListener("click", () => switchTab("register"));

// Funcionalidad logeo
async function handleLogin(event) {
  event.preventDefault();

  const loginForm = event.target.closest("form");
  const email = loginForm.querySelector('input[type="email"]').value;
  const password = loginForm.querySelector('input[type="password"]').value;

  try {
    // se revisa primero si es una empresa
    const companiesResponse = await fetch(`${API_BASE}/companies`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const companies = await companiesResponse.json();
    const company = companies.find(
      (c) => c.email === email && c.password === password,
    );

    if (company) {
      alert("Login exitoso como empresa");
      localStorage.setItem("authToken", JSON.stringify(company));
      localStorage.setItem("userType", "company");
      window.location.href = "admin-dashboard.html";
      return;
    }

    // si no es una empresa, revisa si es un usuario normal
    const usersResponse = await fetch(`${API_BASE}/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const users = await usersResponse.json();
    const user = users.find(
      (u) => u.email === email && u.password === password,
    );

    if (user) {
      alert("Login exitoso como usuario");
      localStorage.setItem("authToken", JSON.stringify(user));
      localStorage.setItem("userType", "user");
      localStorage.setItem("userId", user.id); // Guardar el ID para el perfil
      window.location.href = "vista-perfil.html";
    } else {
      alert("Error en el login: Credenciales incorrectas");
    }
  } catch (error) {
    alert("Error de conexión: " + error.message);
  }
}

// Funcionalidad registro
async function handleRegister(event) {
  event.preventDefault();

  const registerForm = event.target.closest("form");
  const username = registerForm.querySelector(
    'input[placeholder="pepito25"]',
  ).value;
  const fullName = registerForm.querySelector(
    'input[placeholder="Pepito Ochoa"]',
  ).value;
  const email = registerForm.querySelector('input[type="email"]').value;
  const password = registerForm.querySelectorAll('input[type="password"]')[0]
    .value;
  const confirmPassword = registerForm.querySelectorAll(
    'input[type="password"]',
  )[1].value;

  // Validar que las claves sean iguales
  if (password !== confirmPassword) {
    alert("Las contraseñas no coinciden");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        fullName,
        email,
        password,
      }),
    });

    if (response.ok) {
      alert("Registro exitoso");
      // Cambia a la ventana de login
      switchTab("login");
    } else {
      const errorData = await response.json();
      alert(
        "Error en el registro: " + (errorData.message || "Error desconocido"),
      );
    }
  } catch (error) {
    alert("Error de conexión: " + error.message);
  }
}

// Envio de el formulario
document.querySelectorAll(".btn-primary").forEach((button) => {
  button.addEventListener("click", function (e) {
    if (this.textContent === "Sign In") {
      handleLogin(e);
    } else {
      handleRegister(e);
    }
  });
});
