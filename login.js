// this file handles login
const form = document.getElementById('loginForm');
const roleSelect = document.getElementById('role');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const messageDiv = document.getElementById('message');

const API_URL = "http://localhost:3001";

// show quick messages on screen
function showMessage(text, type = 'success') {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = 'block';
  
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 3000);
}

// get data from the server
async function getElement(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Network error');
  return await response.json();
}

// when sending the form, we validate and log in
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const role = roleSelect.value;
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  // validate required fields
  if (!role || !email || !password) {
    showMessage('Please fill all fields', 'error');
    return;
  }

  try {
    // choose list by role
    const endpoint = role === 'candidate' ? '/candidates' : '/companies';
    const dataUsers = await getElement(API_URL + endpoint);

    const user = dataUsers.find(u => u.email === email && u.password === password);

    // if it matches, save session and go to dashboard
    if (user) {
      localStorage.setItem('role', role);
      localStorage.setItem('userId', user.id);
      
      showMessage('Login successful!', 'success');
      
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    } else {
      showMessage('Invalid credentials', 'error');
    }
  } catch (err) {
    showMessage('Could not connect to server. Make sure json-server is running on port 3001.', 'error');
  }
});
