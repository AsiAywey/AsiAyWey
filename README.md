# AsíAyWey

## Project Overview
AsíAyWey is a web application designed to connect companies with candidates.
The project is currently under development and several features are not fully implemented yet.

---

## User Section – Features and Known Issues

### Session Behavior
- If the user logs out and then navigates back to the previous page, access is still allowed.

### Profile
- The profile section does not allow adding skills.

---

## Admin Section – Features and Known Issues

### Registration and Login
- After registering, the system does not automatically redirect the user to the login form.

### Candidate Matching
- The section to select a candidate and perform a match is missing.

### Job Offers
- The functionality to create new job offers is not available.
- The create button does not work.
- If the user tries to navigate to the "Jobs" section from the company profile view, an error occurs.

---

## Project Status
This project is still under development.
Some core features are pending implementation and will be completed in future updates.

JUAN HIGUITA — 18:04
# Project file structure

ASIAWVEY/
├── candidates/               # Vistas y lógica para usuarios candidatos
│   ├── jobs-browse.html      # Página para explorar ofertas de trabajo
│   ├── jobs-browse.js        # Lógica para la página de ofertas de trabajo (candidato)

README.md
7 KB
﻿
# Project file structure

ASIAWVEY/
├── candidates/               # Vistas y lógica para usuarios candidatos
│   ├── jobs-browse.html      # Página para explorar ofertas de trabajo
│   ├── jobs-browse.js        # Lógica para la página de ofertas de trabajo (candidato)
│   ├── profile.html          # Página de perfil del candidato
│   └── profile.js            # Lógica del perfil del candidato
│
├── companies/                # Vistas y lógica para usuarios empresas
│   ├── profile.html          # Página de perfil de la empresa
│   └── profile.js            # Lógica del perfil de la empresa
│
├── general/                  # Código compartido y utilidades generales
│   ├── api.js                # Funciones para llamadas al servidor (JSON Server)
│   └── cache.js              # Manejo de caché y sesión de usuario
│
├── styles/                   # Archivos CSS organizados por funcionalidad/página
│   ├── jobs-browse.css       # Estilos para la página de exploración de ofertas
│   ├── profile_company.css   # Estilos para perfil de empresa
│   ├── style-candidate.css   # Estilos específicos para candidatos
│   ├── style-companies.css   # Estilos específicos para empresas
│   ├── style-dashboard.css   # Estilos del dashboard
│   ├── style-login.css       # Estilos para página de login
│   ├── style-register.css    # Estilos para página de registro

│   ├── style-job.css         # Estilos relacionados a vistas de trabajos
│   └── topbar.css            # Estilos para la barra superior común
│
├── db.json                   # Base de datos simulada para JSON Server
├── node_modules/             # Dependencias instaladas por npm
├── .gitignore                # Archivos y carpetas ignoradas por Git
├── dashboard.html            # Vista principal del dashboard
├── dashboard.js              # Lógica del dashboard
├── jobs.html                 # Página principal de trabajos
├── jobs.js                   # Lógica para la página de trabajos
├── login.html                # Página de login
├── login.js                  # Lógica de autenticación
├── register.html             # Página de registro de usuarios
├── register.js               # Lógica de registro
├── package.json              # Configuración de dependencias y scripts npm
├── package-lock.json         # Archivo de bloqueo de versiones npm




# Mini Project Title

This project is a role-based web application that simulates a professional networking platform similar to LinkedIn. The system is divided into two main roles: **admin** and **user**, each with specific permissions and access levels.

Users can register and log in according to their assigned role. Once authenticated, they can create and manage a professional profile, allowing them to view and interact with other users registered within the platform.

The application enables users to browse professional profiles, simulating a network of people inside the system. All data interactions are handled through a simulated backend, allowing the frontend to consume and display dynamic information as if it were connected to a real server.

The project is designed with a clear separation of concerns, where the visual structure is handled by the views, while the application logic manages authentication, role validation, data handling, and user interactions. This approach makes the project scalable, easy to maintain, and suitable for learning or demonstration purposes.

## Overview

This project is a simulated professional networking web application with role-based access. Users can register and log in, create and manage a professional profile, and interact with other users within the platform.

The application allows users to complete their profile by adding a personal description and professional information. All users can view active job opportunities available on the platform, while access and available actions depend on the assigned role.

The system supports full session management, including login and logout, ensuring a complete and functional user experience. All core features—authentication, profile creation, data visualization, and interaction—are fully operational through a simulated backend.



## Description
This project has login and registration to create a session. It saves the role and id to use later.

The dashboard changes by role. For candidates it shows offers. For companies it shows data, lists, and quick numbers.

The offers page is for viewing jobs and, if you are a company, creating or deleting. It takes data from the server and shows it.

The candidate profile loads their info and lets them change photo and status. What you save there shows in other parts.

The company profile shows its info and lists of candidates, matches, and reservations. From there you do basic actions that affect those lists.

There is a file for server calls and another for cache. That connects all screens with the same data.

The HTML and styles only show the view. The JS adds the logic and connects everything.

## Technologies / Tools

- **Frontend:** HTML5, CSS3, JavaScript
- **UI Framework:** Bootstrap
- **Backend Simulation:** JSON Server
- **Runtime Environment:** Node.js
- **Data Format:** JSON
- **Version Control:** Git


## Prerequisites

Before running this project, make sure you have the following installed on your system:

- **Node.js** (required to run JSON Server and manage dependencies)
- **npm** (comes with Node.js)
- **Git** (to clone and manage the repository)
- A modern web browser (Chrome, Firefox, Edge, etc.)


## Installation and Configuration
Clear steps to run the project locally:
```bash
git clone https://github.com/user/mini-project.git
cd mini-project
npm install # or pip install
cd mini-project
npm install
npm run server