// Manage job offers for companies
import { apiGet, apiPost, apiPatch, apiDelete } from '../general/api.js';
import { getCache, setCache, clearCache } from '../general/cache.js';

const role = localStorage.getItem('role');
const userId = localStorage.getItem('userId');

if (!role || !userId || role !== 'company') {
    window.location.href = '../dashboard.html';
}

const jobsContainer = document.getElementById('jobsContainer');
const jobFormContainer = document.getElementById('jobFormContainer');
const jobForm = document.getElementById('jobForm');
const formTitle = document.getElementById('formTitle');
const messageDiv = document.getElementById('message');
const createJobBtn = document.getElementById('createJobBtn');
const cancelBtn = document.getElementById('cancelBtn');
const headerUserName = document.getElementById('headerUserName');
const headerUserRole = document.getElementById('headerUserRole');
const headerAvatar = document.getElementById('headerAvatar');
const headerAvatarImg = document.getElementById('headerAvatarImg');

let editingJobId = null;

function showMessage(text, type = 'success') {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    setTimeout(() => { messageDiv.style.display = 'none'; }, 3000);
}

async function loadHeaderUser() {
    try {
        const company = await apiGet(`/companies/${userId}`);
        if (headerUserName) headerUserName.textContent = company.name || 'User';
        if (headerUserRole) headerUserRole.textContent = 'Company';
        const avatarSrc = company.avatar || company.logo;
        if (avatarSrc && headerAvatar && headerAvatarImg) {
            headerAvatarImg.src = avatarSrc;
            headerAvatar.classList.add('has-photo');
        }
    } catch (err) {
        console.error('Error loading header:', err);
    }
}

async function loadJobs() {
    try {
        clearCache('jobOffers');
        const allJobs = await apiGet('/jobOffers');
        const myJobs = allJobs.filter(j => j.companyId === userId);

        jobsContainer.innerHTML = '';

        if (myJobs.length === 0) {
            jobsContainer.innerHTML = '<p style="padding:20px; color: #8A8A8A;">No job offers yet. Create your first one!</p>';
            return;
        }

        myJobs.forEach(job => {
            const card = createJobCard(job);
            jobsContainer.appendChild(card);
        });
    } catch (err) {
        console.error('Error loading jobs:', err);
        showMessage('Error loading job offers', 'error');
    }
}

function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'offer-card';
    card.innerHTML = `
    <div class="offer-content">
      <div class="offer-status" style="margin-bottom: 15px;">
        <span class="status-badge" style="background-color: #4CAF50;">Active</span>
        <span class="status-time">• ${new Date(job.createdAt).toLocaleDateString()}</span>
      </div>
      
      <div style="margin-bottom: 15px;">
        <h3 class="offer-title" style="margin-bottom: 10px;">${job.title}</h3>
        <p class="offer-location" style="margin-bottom: 5px;">
          <span class="material-symbols-outlined" style="font-size: 18px; vertical-align: middle;">location_on</span>
          ${job.location}
        </p>
      </div>

      <div style="margin: 15px 0; padding: 15px; background: #1A1A1A; border-radius: 8px;">
        <p style="margin: 5px 0; color: #ccc;"><strong>Description:</strong></p>
        <p style="margin: 5px 0 10px 0; color: #aaa;">${job.description}</p>
        
        <p style="margin: 5px 0; color: #ccc;"><strong>Salary:</strong> ${job.salary}</p>
        <p style="margin: 5px 0; color: #ccc;"><strong>Required Skills:</strong> ${Array.isArray(job.skills) ? job.skills.join(', ') : job.skills}</p>
      </div>

      <div class="offer-actions" style="margin-top: 15px; display: flex; gap: 10px;">
        <button class="btn-primary" onclick="editJob('${job.id}')" style="flex: 1; background: #2196F3; color: white; padding: 10px; border: none; border-radius: 6px; cursor: pointer;">
          <span class="material-symbols-outlined" style="font-size: 18px; vertical-align: middle;">edit</span>
          Edit
        </button>
        <button class="btn-danger" onclick="deleteJob('${job.id}')" style="flex: 1; background: #F44336; color: white; padding: 10px; border: none; border-radius: 6px; cursor: pointer;">
          <span class="material-symbols-outlined" style="font-size: 18px; vertical-align: middle;">delete</span>
          Delete
        </button>
      </div>
    </div>
  `;
    return card;
}

createJobBtn.addEventListener('click', () => {
    editingJobId = null;
    formTitle.textContent = 'Create New Job Offer';
    jobForm.reset();
    jobFormContainer.style.display = 'block';
    jobFormContainer.scrollIntoView({ behavior: 'smooth' });
});

cancelBtn.addEventListener('click', () => {
    jobFormContainer.style.display = 'none';
    jobForm.reset();
    editingJobId = null;
});

jobForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const jobData = {
        title: document.getElementById('jobTitle').value.trim(),
        description: document.getElementById('jobDescription').value.trim(),
        location: document.getElementById('jobLocation').value.trim(),
        salary: document.getElementById('jobSalary').value.trim(),
        skills: document.getElementById('jobSkills').value.split(',').map(s => s.trim()).filter(s => s),
    };

    if (jobData.skills.length === 0) {
        showMessage('Please add at least one skill', 'error');
        return;
    }

    try {
        if (editingJobId) {
            // Update existing job
            await apiPatch(`/jobOffers/${editingJobId}`, jobData);
            showMessage('Job offer updated successfully!');
            editingJobId = null;
        } else {
            // Create new job
            const newJob = {
                id: `job_${Date.now()}`,
                companyId: userId,
                ...jobData,
                status: 'active',
                createdAt: new Date().toISOString(),
            };
            await apiPost('/jobOffers', newJob);
            showMessage('Job offer created successfully!');
        }

        jobForm.reset();
        jobFormContainer.style.display = 'none';
        clearCache('jobOffers');
        await loadJobs();
    } catch (err) {
        console.error('Error saving job:', err);
        showMessage('Error saving job offer', 'error');
    }
});

window.editJob = async (jobId) => {
    try {
        const jobs = await apiGet('/jobOffers');
        const job = jobs.find(j => j.id === jobId);

        if (!job) {
            showMessage('Job not found', 'error');
            return;
        }

        editingJobId = jobId;
        formTitle.textContent = 'Edit Job Offer';

        document.getElementById('jobTitle').value = job.title;
        document.getElementById('jobDescription').value = job.description;
        document.getElementById('jobLocation').value = job.location;
        document.getElementById('jobSalary').value = job.salary;
        document.getElementById('jobSkills').value = Array.isArray(job.skills) ? job.skills.join(', ') : job.skills;

        jobFormContainer.style.display = 'block';
        jobFormContainer.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
        console.error('Error loading job:', err);
        showMessage('Error loading job data', 'error');
    }
};

window.deleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job offer? This action cannot be undone.')) {
        return;
    }

    try {
        await apiDelete(`/jobOffers/${jobId}`);
        showMessage('Job offer deleted successfully!');
        clearCache('jobOffers');
        await loadJobs();
    } catch (err) {
        console.error('Error deleting job:', err);
        showMessage('Error deleting job offer', 'error');
    }
};

loadHeaderUser();
loadJobs();