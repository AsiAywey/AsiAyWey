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
        // Dropdown del usuario
        const userDropdown = document.querySelector('.user-dropdown img');
        const dropdownMenu = document.getElementById('user-menu');
        
        if (userDropdown && dropdownMenu) {
            userDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('show');
            });
        }

        // Cerrar dropdown al hacer clic fuera
        document.addEventListener('click', () => {
            if (dropdownMenu) {
                dropdownMenu.classList.remove('show');
            }
        });

        // Enlaces del dropdown
        document.getElementById('logout-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Botones principales
        document.getElementById('btnUpdateProfile')?.addEventListener('click', () => this.updateProfile());
        document.getElementById('btnCancelProfile')?.addEventListener('click', () => this.cancelChanges());

        // Switch de disponibilidad
        document.getElementById('statusSwitch')?.addEventListener('change', (e) => this.updateAvailability(e.target.checked));

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

        // Actualizar placeholders con los datos del usuario
        this.updatePlaceholders();

        // Información personal
        this.setFormValue('input[placeholder="User Name"]', this.currentUser.username);
        this.setFormValue('input[placeholder="Nombre completo"]', this.currentUser.fullName);
        this.setFormValue('input[placeholder="Rol profesional"]', this.currentUser.profession);
        this.setFormValue('input[placeholder="Teléfono"]', this.currentUser.phone);
        this.setFormValue('input[placeholder="Correo"]', this.currentUser.email);

        // Experiencia
        const experienceSelect = document.getElementById('selectExperiencia');
        if (experienceSelect) {
            if (this.currentUser.experience) {
                experienceSelect.value = this.currentUser.experience;
            } else {
                // Establecer valor por defecto basado en el rol profesional
                const defaultExperience = this.getDefaultExperience(this.currentUser.profession);
                experienceSelect.value = defaultExperience;
            }
        }

        // Skills
        this.displaySkills(this.currentUser.skills || []);

        // Biografía
        const bioTextArea = document.getElementById('bioTextArea');
        if (bioTextArea) {
            bioTextArea.value = this.currentUser.description || '';
        }

        // Header del perfil
        const profileName = document.querySelector('.profile-name');
        const profileRole = document.querySelector('.profile-role');
        const profileLocation = document.querySelector('.profile-location');
        
        if (profileName) profileName.textContent = this.currentUser.fullName;
        if (profileRole) profileRole.textContent = this.currentUser.profession;
        if (profileLocation) {
            const location = this.currentUser.location || 'No especificada';
            profileLocation.innerHTML = `
                <span class="material-symbols-outlined">location_on</span>
                ${location.toUpperCase()}
            `;
        }

        // Switch de disponibilidad
        const statusSwitch = document.getElementById('statusSwitch');
        if (statusSwitch) {
            statusSwitch.checked = this.currentUser.openToWork !== false;
        }
    }

    updatePlaceholders() {
        if (!this.currentUser) return;

        // Actualizar placeholders con los datos actuales del usuario
        const usernameInput = document.querySelector('input[placeholder="User Name"]');
        const fullNameInput = document.querySelector('input[placeholder="Nombre completo"]');
        const professionInput = document.querySelector('input[placeholder="Rol profesional"]');
        const phoneInput = document.querySelector('input[placeholder="Teléfono"]');
        const emailInput = document.querySelector('input[placeholder="Correo"]');
        const skillsInput = document.getElementById('inputSkill');
        const bioTextArea = document.getElementById('bioTextArea');

        if (usernameInput) usernameInput.placeholder = this.currentUser.username || 'User Name';
        if (fullNameInput) fullNameInput.placeholder = this.currentUser.fullName || 'Nombre completo';
        if (professionInput) professionInput.placeholder = this.currentUser.profession || 'Rol profesional';
        if (phoneInput) phoneInput.placeholder = this.currentUser.phone || 'Teléfono';
        if (emailInput) emailInput.placeholder = this.currentUser.email || 'Correo';
        if (skillsInput) skillsInput.placeholder = 'Ej: React, Node.js...';
        if (bioTextArea) bioTextArea.placeholder = 'Cuéntanos un poco sobre tu experiencia...';
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

    async updateAvailability(isAvailable) {
        if (!this.currentUser) {
            this.showError('No hay usuario cargado');
            return;
        }

        try {
            // Mantener todos los datos existentes del usuario y solo cambiar los necesarios
            const updatedData = {
                ...this.currentUser, // Preservar todos los datos existentes
                openToWork: isAvailable,
                status: isAvailable ? 'DISPONIBLE' : 'NO_DISPONIBLE'
            };

            const response = await fetch(`${this.apiBase}/users/${this.currentUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) throw new Error('Error al actualizar disponibilidad');

            // Actualizar datos locales
            this.currentUser = updatedData;

            // Actualizar UI
            this.toggleAvailabilityUI(isAvailable);
            this.showSuccess(isAvailable ? 'Perfil activado correctamente' : 'Perfil desactivado correctamente');

        } catch (error) {
            console.error('Error actualizando disponibilidad:', error);
            this.showError('No se pudo actualizar la disponibilidad');
            
            // Revertir el switch si hubo error
            const switchElement = document.getElementById('statusSwitch');
            if (switchElement) {
                switchElement.checked = !isAvailable;
            }
        }
    }

    toggleAvailabilityUI(isAvailable) {
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
            // Obtener valores actuales del formulario
            const formData = this.getFormData();
            
            // Detectar qué campos han cambiado
            const changedFields = this.getChangedFields(this.currentUser, formData);
            
            if (Object.keys(changedFields).length === 0) {
                this.showInfo('No hay cambios para guardar');
                return;
            }

            // Preparar datos actualizados (preservar datos existentes + cambios)
            const updatedData = {
                ...this.currentUser,
                ...changedFields
            };

            // Enviar solo los campos que cambiaron
            const response = await fetch(`${this.apiBase}/users/${this.currentUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) throw new Error('Error al actualizar perfil');

            // Actualizar datos locales con todos los datos
            this.currentUser = updatedData;
            this.updateUI();
            this.showSuccess(`Actualizado: ${this.getChangedFieldsMessage(changedFields)}`);

        } catch (error) {
            console.error('Error actualizando perfil:', error);
            this.showError('No se pudo actualizar el perfil');
        }
    }

    getFormData() {
        return {
            username: document.querySelector('input[placeholder="User Name"]').value,
            fullName: document.querySelector('input[placeholder="Nombre completo"]').value,
            profession: document.querySelector('input[placeholder="Rol profesional"]').value,
            phone: document.querySelector('input[placeholder="Teléfono"]').value,
            email: document.querySelector('input[placeholder="Correo"]').value,
            experience: document.getElementById('selectExperiencia').value,
            skills: this.getSkillsFromForm(),
            description: document.getElementById('bioTextArea').value,
            openToWork: document.getElementById('statusSwitch').checked,
            status: document.getElementById('statusSwitch').checked ? 'DISPONIBLE' : 'NO_DISPONIBLE'
        };
    }

    getChangedFields(currentUser, formData) {
        const changedFields = {};
        
        // Comparar cada campo para detectar cambios
        if (formData.username && formData.username !== currentUser.username) {
            changedFields.username = formData.username;
        }
        
        if (formData.fullName && formData.fullName !== currentUser.fullName) {
            changedFields.fullName = formData.fullName;
        }
        
        if (formData.profession && formData.profession !== currentUser.profession) {
            changedFields.profession = formData.profession;
        }
        
        if (formData.phone && formData.phone !== currentUser.phone) {
            changedFields.phone = formData.phone;
        }
        
        if (formData.email && formData.email !== currentUser.email) {
            changedFields.email = formData.email;
        }
        
        if (formData.experience && formData.experience !== currentUser.experience) {
            changedFields.experience = formData.experience;
        }
        
        // Comparar arrays de skills
        const currentSkills = JSON.stringify((currentUser.skills || []).sort());
        const newSkills = JSON.stringify((formData.skills || []).sort());
        if (currentSkills !== newSkills) {
            changedFields.skills = formData.skills;
        }
        
        if (formData.description !== currentUser.description) {
            changedFields.description = formData.description;
        }
        
        if (formData.openToWork !== currentUser.openToWork) {
            changedFields.openToWork = formData.openToWork;
            changedFields.status = formData.status;
        }
        
        return changedFields;
    }

    getChangedFieldsMessage(changedFields) {
        const fieldNames = {
            username: 'nombre de usuario',
            fullName: 'nombre completo',
            profession: 'profesión',
            phone: 'teléfono',
            email: 'correo',
            experience: 'experiencia',
            skills: 'habilidades',
            description: 'biografía',
            openToWork: 'disponibilidad'
        };
        
        const changedFieldNames = Object.keys(changedFields)
            .map(key => fieldNames[key] || key)
            .slice(0, 3); // Limitar a 3 campos para no hacer el mensaje muy largo
            
        return changedFieldNames.join(', ');
    }

    cancelChanges() {
        if (confirm('¿Estás seguro de cancelar los cambios? Se perderán los datos no guardados.')) {
            this.populateForm();
            this.showInfo('Cambios cancelados');
        }
    }

    updateUI() {
        // Actualizar información del header
        const profileName = document.querySelector('.profile-name');
        const profileRole = document.querySelector('.profile-role');
        const profileLocation = document.querySelector('.profile-location');
        
        if (profileName && this.currentUser) profileName.textContent = this.currentUser.fullName;
        if (profileRole && this.currentUser) profileRole.textContent = this.currentUser.profession;
        if (profileLocation && this.currentUser) {
            const location = this.currentUser.location || 'No especificada';
            profileLocation.innerHTML = `
                <span class="material-symbols-outlined">location_on</span>
                ${location.toUpperCase()}
            `;
        }

        // Actualizar información del usuario en el header actions
        const userNameHeader = document.getElementById('user-name-header');
        const userRoleHeader = document.getElementById('user-role-header');
        const userAvatarHeader = document.getElementById('user-avatar-header');
        
        if (userNameHeader && this.currentUser) userNameHeader.textContent = this.currentUser.fullName;
        if (userRoleHeader && this.currentUser) userRoleHeader.textContent = this.currentUser.profession || 'Usuario';
        if (userAvatarHeader && this.currentUser) {
            // Usar un avatar basado en el nombre o ID único
            const avatarId = this.currentUser.username || this.currentUser.id || 'user';
            userAvatarHeader.src = `https://i.pravatar.cc/100?u=${avatarId}`;
        }

        // Actualizar estado de disponibilidad
        const statusSwitch = document.getElementById('statusSwitch');
        if (statusSwitch && this.currentUser) {
            this.toggleAvailabilityUI(this.currentUser.openToWork !== false);
        }
    }

    logout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userType');
            localStorage.removeItem('userId');
            window.location.href = 'auth.html';
        }
    }

    getDefaultExperience(profession) {
        if (!profession) return '3-5'; // Default general
        
        const professionLower = profession.toLowerCase();
        
        // Estimaciones basadas en rol y experiencia típica
        if (professionLower.includes('junior') || professionLower.includes('trainee') || professionLower.includes('practicante')) {
            return '0-1';
        } else if (professionLower.includes('senior') || professionLower.includes('lead') || professionLower.includes('principal')) {
            return '5-8';
        } else if (professionLower.includes('manager') || professionLower.includes('director') || professionLower.includes('head')) {
            return '8-10';
        } else if (professionLower.includes('architect') || professionLower.includes('expert')) {
            return '10-15';
        } else if (professionLower.includes('mid') || professionLower.includes('intermediate')) {
            return '2-3';
        } else {
            return '3-5'; // Default para roles generales
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