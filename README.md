# MatchFlow - AsíAyWey Recruitment Platform

Una app web básica multi-página para matching entre candidatos y empresas.

## Instalación y Setup

### 1. Instalar json-server (simulador backend)

```bash
npm install -g json-server
```

### 2. Ejecutar json-server

En la carpeta del proyecto, ejecuta:

```bash
json-server --watch general/db.json --port 3001
```

El servidor estará en: `http://localhost:3001`

### 3. Abrir la app

Abre `login.html` en el navegador (puedes usar Live Server si tienes VS Code)

## Flujo de la App

### Login (login.html)
- Selecciona rol: **Candidate** o **Company**
- Selecciona usuario
- Se guardan en localStorage: `role` y `userId`

### Dashboard (dashboard.html)
- Muestra información del usuario actual
- Navegación según rol:
  - **Candidate**: My Profile, Jobs
  - **Company**: Company Profile, Jobs

### Candidate (candidate.html)
- Ver perfil: nombre, título, skills, contacto
- **Toggle Open to Work** - activa/desactiva disponibilidad
- Ver ofertas en modo lectura

### Jobs (jobs.html)
- **Si eres Candidate**: Ver ofertas (solo lectura)
- **Si eres Company**: 
  - Ver ofertas propias
  - Crear nueva oferta
  - Editar y eliminar ofertas

### Company Profile (companies/index.html)
- **Search Candidates**: Lista de candidatos con OTW=true
- **My Matches**: Matches creados, cambiar estado (pending → contacted → hired)
- **Reservations**: Ver candidatos reservados (bloqueo)

## Reglas de Negocio Implementadas

### Open to Work (OTW)
✓ Candidato activa/desactiva en su perfil  
✓ Solo aparecen en búsqueda si OTW=true

### Matches
✓ Se crean desde Company Profile  
✓ Siempre: companyId + jobOfferId + candidateId  
✓ Estados: pending → contacted → hired/discarded

### Reservations (Bloqueo)
✓ Se crea automático al hacer match  
✓ Bloquea que otra empresa reserve el candidato  
✓ Se libera si: discard match o release manual

### Privacidad de Contacto
✓ Contact info OCULTO hasta status="contacted"  
✓ En lista de candidatos no se ve  
✓ En match en estado "contacted" se muestra

## Estructura de Archivos

```
/
├── login.html + login.js
├── dashboard.html + dashboard.js
├── candidate.html + candidate.js
├── jobs.html + jobs.js
├── style-*.css (sin cambios, mantenidos)
│
├── general/
│   ├── db.json (base de datos simulada)
│   ├── api.js (fetch helpers: get/post/patch/delete)
│   └── cache.js (localStorage con TTL)
│
├── companies/
│   ├── index.html
│   └── company.js
│
└── users/
    ├── index.html
    ├── profile.html
    ├── register.html
    └── js/
        ├── profile.js
        └── register.js
```

## Base de Datos (db.json)

Colecciones:
- **candidates**: id, name, email, phone, title, skills, location, openToWork, bio
- **companies**: id, name, nit, email, website, industry, location
- **jobOffers**: id, companyId, title, description, skills[], location, salary, status, createdAt
- **matches**: id, companyId, jobOfferId, candidateId, status, createdAt, score
- **reservations**: id, companyId, candidateId, matchId, active, createdAt

## Caching

Cache simple con TTL (30-60 segundos):
- candidates
- companies
- jobOffers
- matches
- reservations

Se limpia al hacer cambios (create/update/delete).

## Ejemplo de Flujo Completo

1. **Login como Candidate (c1 - Santiago)**
   - Ir a My Profile
   - Activar "Open to Work"
   - Ver Jobs (aparecen las ofertas)

2. **Login como Company (comp1 - Tech Corp)**
   - Crear una Job Offer (Ej: "React Developer")
   - Ir a Company Profile → Search Candidates
   - Ver a Santiago (está OTW)
   - Clickear "Select & Match" → se crea match y reservation
   - Ir a My Matches → cambiar status a "contacted"
   - ¡Ahora aparece el teléfono de Santiago!

3. **Login de nuevo como Company**
   - Intentar reservar a Santiago
   - ERROR: "Ya está reservado por otra empresa"

4. **Discard o Release**
   - Desde My Matches: Discard → se libera la reservation
   - O desde Reservations: Release

## Notas

- **NO SPA**: Cada página es HTML independiente con su JS
- **NO Router**: Navegación normal con `<a href="...">`
- **Fetch + localStorage**: Sin librerías externas
- **Código básico**: Funciones pequeñas, nombres claros
- **Estilos**: Se mantuvieron los CSS originales sin grandes cambios

## Troubleshooting

**Error "Cannot fetch from localhost:3001"**
- Verifica que json-server esté corriendo
- Abre http://localhost:3001/candidates en el navegador

**No aparecen candidatos en búsqueda**
- Verifica que el candidato tenga openToWork=true
- Abre las DevTools (F12) → Network para ver requests

**localStorage vacío**
- Verifica que LoginForm guardó role/userId
- En DevTools → Storage → localStorage

## Próximas Mejoras (No Implementadas)

- [ ] UI para editar ofertas
- [ ] Avisos de match por email
- [ ] Historial de entrevistas
- [ ] Scoring automático de matches
- [ ] Filtros avanzados en búsqueda

---

**Made with 🚀 by GitHub Copilot**
