document.addEventListener("DOMContentLoaded", function() {
    
    const form = document.getElementById("registerForm");
    const messageArea = document.getElementById("message");
    const API_URL = "http://localhost:3000/users";
    
    if (!form || !messageArea) {
        console.error("ERROR: Form elements not found");
        return;
    }
    
    function showMessage(text, type) {
        messageArea.innerHTML = `
            <div class="alert alert-${type} mb-3" role="alert">
                ${text}
            </div>
        `;
    }
    
    function validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }
    
    function validatePassword(password) {
        return password.length >= 6;
    }
    
    async function checkUserExists(email, username) {
        try {
            const response = await fetch(API_URL);
            const users = await response.json();
            return users.some(user => user.email === email || user.name === username);
        } catch (error) {
            console.error("Error checking existing users:", error);
            return false;
        }
    }
    
    async function saveUserToDatabase(userData) {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            });
            
            if (!response.ok) {
                throw new Error("Error saving user");
            }
            
            return await response.json();
        } catch (error) {
            console.error("Error saving to database:", error);
            throw error;
        }
    }
    
    async function handleRegistration(event) {
        event.preventDefault();
        
        const username = document.getElementById("username").value.trim();
        const fullName = document.getElementById("fullname").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        
        if (!username || !fullName || !email || !password || !confirmPassword) {
            showMessage("Please fill all fields", "warning");
            return;
        }
        
        if (!validateEmail(email)) {
            showMessage("Please enter a valid email", "warning");
            return;
        }
        
        if (!validatePassword(password)) {
            showMessage("Password must have at least 6 characters", "warning");
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage("Passwords do not match", "danger");
            return;
        }
        
        // Verificar si el usuario ya existe en el servidor
        const userExists = await checkUserExists(email, username);
        if (userExists) {
            showMessage("This email or username is already registered", "danger");
            return;
        }
        
        // Preparar datos del usuario para JSON server
        const userData = {
            name: fullName,
            email: email,
            password: password,
            id: Date.now().toString()
        };
        
        try {
            // Guardar en JSON server (db.json)
            await saveUserToDatabase(userData);
            
            // También guardar en localStorage para compatibilidad
            localStorage.setItem("taskflow_usuario", JSON.stringify({
                usuario: username,
                nombreCompleto: fullName,
                email: email,
                fechaRegistro: new Date().toLocaleDateString()
            }));
            
            showMessage("Registration successful! You can now log in.", "success");
            
            form.reset();
            
            setTimeout(function() {
                window.location.href = "login.html";
            }, 2000);
        } catch (error) {
            showMessage("Error during registration. Please make sure JSON server is running.", "danger");
            console.error(error);
        }
    }
    
    form.addEventListener("submit", handleRegistration);
    
    console.log("Registration system initialized correctly");
});