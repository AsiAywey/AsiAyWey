// this file handles registration
const form = document.getElementById("registerForm");
const messageArea = document.getElementById("message");
const roleSelect = document.getElementById("role");
const candidateFields = document.getElementById("candidateFields");
const companyFields = document.getElementById("companyFields");
const API_URL = "http://localhost:3001";

// show messages to the user
function showMessage(text, type) {
    const alertType = type === 'error' ? 'danger' : type;
    messageArea.innerHTML = `<div class="alert alert-${alertType} alert-dismissible fade show" role="alert">
        ${text}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
    setTimeout(() => messageArea.innerHTML = '', 5000);
}

// validate email format
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// change fields by role
roleSelect.addEventListener('change', function() {
    const role = roleSelect.value;
    
    if (role === 'candidate') {
        candidateFields.style.display = 'block';
        companyFields.style.display = 'none';
        document.getElementById('title').required = true;
        document.getElementById('location').required = true;
        document.getElementById('nit').required = false;
        document.getElementById('industry').required = false;
    } else if (role === 'company') {
        candidateFields.style.display = 'none';
        companyFields.style.display = 'block';
        document.getElementById('title').required = false;
        document.getElementById('location').required = false;
        document.getElementById('nit').required = true;
        document.getElementById('industry').required = true;
    } else {
        candidateFields.style.display = 'none';
        companyFields.style.display = 'none';
    }
});

// check if the email already exists
async function checkUserExists(email, role) {
    const endpoint = role === 'candidate' ? '/candidates' : '/companies';
    const response = await fetch(API_URL + endpoint);
    const users = await response.json();
    return users.some(user => user.email === email);
}

// save the user in the database
async function saveUserToDatabase(userData, role) {
    const endpoint = role === 'candidate' ? '/candidates' : '/companies';
    const response = await fetch(API_URL + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
    });
    
    if (!response.ok) throw new Error("Error saving user");
    return await response.json();
}

// main registration function
async function handleRegistration(event) {
    event.preventDefault();
    
    const role = document.getElementById("role").value;
    const fullName = document.getElementById("fullname").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    
    // validate basic fields
    if (!role || !fullName || !email || !phone || !password || !confirmPassword) {
        showMessage("Please fill all required fields", "error");
        return;
    }
    
    if (!validateEmail(email)) {
        showMessage("Please enter a valid email", "error");
        return;
    }
    
    if (password.length < 6) {
        showMessage("Password must have at least 6 characters", "error");
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage("Passwords do not match", "error");
        return;
    }
    
    const userExists = await checkUserExists(email, role);
    if (userExists) {
        showMessage("This email is already registered", "error");
        return;
    }
    
    let userData;
    
    // build data by role
    if (role === 'candidate') {
        const title = document.getElementById("title").value.trim();
        const location = document.getElementById("location").value.trim();
        
        if (!title || !location) {
            showMessage("Please fill all candidate fields", "error");
            return;
        }
        
        userData = {
            id: "c" + Date.now(),
            name: fullName,
            email: email,
            password: password,
            phone: phone,
            title: title,
            location: location,
            skills: [],
            openToWork: false,
            bio: "New candidate"
        };
    } else if (role === 'company') {
        const nit = document.getElementById("nit").value.trim();
        const industry = document.getElementById("industry").value.trim();
        
        if (!nit || !industry) {
            showMessage("Please fill all company fields", "error");
            return;
        }
        
        userData = {
            id: "comp" + Date.now(),
            name: fullName,
            email: email,
            password: password,
            nit: nit,
            industry: industry,
            location: phone // using phone as location for companies
        };
    }
    
    // save and redirect
    try {
        await saveUserToDatabase(userData, role);
        showMessage("Registration successful! Redirecting to login...", "success");
        form.reset();
        candidateFields.style.display = 'none';
        companyFields.style.display = 'none';
        setTimeout(() => window.location.href = "login.html", 2000);
    } catch (error) {
        showMessage("Error during registration. Make sure JSON server is running on port 3001.", "error");
    }
}

form.addEventListener("submit", handleRegistration);
