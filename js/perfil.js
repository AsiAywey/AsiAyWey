/**
 * Perfil de Usuario - MatchFlow
 * Maneja la carga y actualización de datos del perfil de usuario
 */

class ProfileManager {
    constructor() {
        this.currentUser = null;
        this.apiBase = 'http://localhost:3005';
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadUserProfile();
    }

    setupEventListeners() {
        // Botones principales
        document.getElementById('btnUpdateProfile')?.addEventListener('click', () => this.updateProfile());
        document.getElementById('btnCancelProfile')?.addEventListener('click', () => this.cancelChanges());

        // Switch de disponibilidad
        document.getElementById('statusSwitch')?.addEventListener('change', (e) => this.toggleAvailability(e.target.checked));

        // Input de skills con Enter
        document.getElementById('inputSkill')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addSkill(e.target.value.trim());
                e.target.value = '';
            }
        });

        // Limitar caracteres de biografía
        const bioTextArea = document.getElementById('bioTextArea');
        if (bioTextArea) {
            bioTextArea.addEventListener('input', (e) => {
                if (e.target.value.length > 500) {
                    e.target.value = e.target.value.substring(0, 500);
                }
            });
        }
    }

    async loadUserProfile() {
        try {
            // Obtener el ID del usuario desde el almacenamiento local
            const userId = localStorage.getItem('userId') || '1'; // Default a '1' para pruebas
            
            const response = await fetch(`${this.apiBase}/users/${userId}`);
            if (!response.ok) throw new Error('Error al cargar perfil');
            
            this.currentUser = await response.json();
            this.populateForm();
            this.updateUI();
            
        } catch (error) {
            console.error('Error cargando perfil:', error);
            this.showError('No se pudo cargar el perfil del usuario');
        }
    }

    populateForm() {
        if (!this.currentUser) return;

        // Información personal
        this.setFormValue('input[placeholder="User Name"]', this.currentUser.username);
        this.setFormValue('input[placeholder="Juan Pérez"]', this.currentUser.fullName);
        this.setFormValue('input[placeholder="Senior Software Engineer"]', this.currentUser.profession);
        this.setFormValue('input[placeholder="Phone"]', this.currentUser.phone);
        this.setFormValue('input[placeholder="Email"]', this.currentUser.email);

        // Experiencia
        const experienceSelect = document.getElementById('selectExperiencia');
        if (experienceSelect && this.currentUser.experience) {
            experienceSelect.value = this.currentUser.experience;
        }

        // Skills
        this.displaySkills(this.currentUser.skills || []);

        // Biografía
        const bioTextArea = document.getElementById('bioTextArea');
        if (bioTextArea) {
            bioTextArea.value = this.currentUser.description || '';
        }

        // Header del perfil
        const profileName = document.querySelector('.profile-main-card h2');
        const profileRole = document.querySelector('.profile-main-card p:nth-child(2)');
        if (profileName) profileName.textContent = this.currentUser.fullName;
        if (profileRole) profileRole.textContent = this.currentUser.profession;

        // Switch de disponibilidad
        const statusSwitch = document.getElementById('statusSwitch');
        if (statusSwitch) {
            statusSwitch.checked = this.currentUser.openToWork !== false;
        }
    }

    setFormValue(selector, value) {
        const element = document.querySelector(selector);
        if (element && value) {
            element.value = value;
        }
    }

    displaySkills(skills) {
        const container = document.getElementById('skillsContainer');
        if (!container) return;

        // Limpiar skills existentes (excepto el input)
        const existingSkills = container.querySelectorAll('.skill-tag');
        existingSkills.forEach(skill => skill.remove());

        // Añadir skills
        skills.forEach(skill => {
            if (skill && skill.trim()) {
                this.createSkillElement(skill.trim());
            }
        });
    }

    addSkill(skillText) {
        if (!skillText || skillText.length < 2) return;

        // Verificar si ya existe
        const existingSkills = Array.from(document.querySelectorAll('.skill-tag')).map(
            tag => tag.textContent.replace('×', '').trim()
        );

        if (existingSkills.includes(skillText)) {
            return;
        }

        this.createSkillElement(skillText);
    }

    createSkillElement(skillText) {
        const container = document.getElementById('skillsContainer');
        if (!container) return;

        const skillTag = document.createElement('div');
        skillTag.className = 'skill-tag';
        skillTag.innerHTML = `
            ${skillText}
            <span class="skill-remove" onclick="this.parentElement.remove()">×</span>
        `;
        
        // Insertar antes del input
        const input = document.getElementById('inputSkill');
        container.insertBefore(skillTag, input);
    }

    getSkillsFromForm() {
        const skillTags = document.querySelectorAll('.skill-tag');
        return Array.from(skillTags).map(tag => 
            tag.textContent.replace('×', '').trim()
        ).filter(skill => skill);
    }

    toggleAvailability(isAvailable) {
        const badgeDot = document.getElementById('badgeDot');
        const statusText = document.getElementById('statusText');
        const statusSubtitle = document.querySelector('.status-text p');
        
        if (isAvailable) {
            badgeDot.style.backgroundColor = '#4CAF50';
            statusText.textContent = 'ACTIVO';
            statusSubtitle.textContent = 'Tu perfil es visible para reclutadores';
        } else {
            badgeDot.style.backgroundColor = '#FF9800';
            statusText.textContent = 'INACTIVO';
            statusSubtitle.textContent = 'Tu perfil no está visible para reclutadores';
        }
    }

    async updateProfile() {
        if (!this.currentUser) {
            this.showError('No hay usuario cargado');
            return;
        }

        try {
            // Recopilar datos del formulario
            const updatedData = {
                username: document.querySelector('input[placeholder="User Name"]').value,
                fullName: document.querySelector('input[placeholder="Juan Pérez"]').value,
                profession: document.querySelector('input[placeholder="Senior Software Engineer"]').value,
                phone: document.querySelector('input[placeholder="Phone"]').value,
                email: document.querySelector('input[placeholder="Email"]').value,
                experience: document.getElementById('selectExperiencia').value,
                skills: this.getSkillsFromForm(),
                description: document.getElementById('bioTextArea').value,
                openToWork: document.getElementById('statusSwitch').checked,
                status: document.getElementById('statusSwitch').checked ? 'DISPONIBLE' : 'NO_DISPONIBLE'
            };

            // Enviar actualización
            const response = await fetch(`${this.apiBase}/users/${this.currentUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) throw new Error('Error al actualizar perfil');

            // Actualizar datos locales
            this.currentUser = { ...this.currentUser, ...updatedData };
            this.updateUI();
            this.showSuccess('Perfil actualizado correctamente');

        } catch (error) {
            console.error('Error actualizando perfil:', error);
            this.showError('No se pudo actualizar el perfil');
        }
    }

    cancelChanges() {
        if (confirm('¿Estás seguro de cancelar los cambios? Se perderán los datos no guardados.')) {
            this.populateForm();
            this.showInfo('Cambios cancelados');
        }
    }

    updateUI() {
        // Actualizar información del header
        const profileName = document.querySelector('.profile-main-card h2');
        const profileRole = document.querySelector('.profile-main-card p:nth-child(2)');
        
        if (profileName && this.currentUser) profileName.textContent = this.currentUser.fullName;
        if (profileRole && this.currentUser) profileRole.textContent = this.currentUser.profession;

        // Actualizar estado de disponibilidad
        const statusSwitch = document.getElementById('statusSwitch');
        if (statusSwitch && this.currentUser) {
            this.toggleAvailability(this.currentUser.openToWork !== false);
        }
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showInfo(message) {
        this.showToast(message, 'info');
    }

    showToast(message, type = 'info') {
        // Crear toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="bi ${type === 'success' ? 'bi-check-circle' : type === 'error' ? 'bi-x-circle' : 'bi-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Estilos para el toast
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            zIndex: '9999',
            minWidth: '300px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            animation: 'slideInRight 0.3s ease-out'
        });

        // Añadir animación CSS si no existe
        if (!document.querySelector('#toast-animations')) {
            const style = document.createElement('style');
            style.id = 'toast-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                .toast-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);

        // Remover después de 3 segundos
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Inicializar el gestor de perfil cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ProfileManager();
});

// Hacer accesible globalmente para eventos inline
window.ProfileManager = ProfileManager;