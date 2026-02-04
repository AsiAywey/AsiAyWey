# 📊 ANÁLISIS PRE-CLEANUP: Matriz de Dependencias

## 🗂️ INVENTARIO DE ARCHIVOS

### Raíz (/)
```
✅ login.html           → Usa: style-login.css, login.js
✅ dashboard.html       → Usa: style-dashboard.css, dashboard.js
✅ candidate.html       → Usa: style-candidate.css, candidate.js
✅ jobs.html            → Usa: styles-job.css, jobs.js
✅ TEST.html            → Test de API (independiente)
```

### companies/
```
✅ companies/index.html → Usa: ../style-candidate.css, company.js
✅ companies/company.js → Usa: ../general/api.js, ../general/cache.js
```

### users/
```
⚠️ users/profile.html     → Enlazado desde: dashboard.html (id=usersLink, oculto por defecto)
⚠️ users/register.html    → NO ENLAZADO desde la app principal
❌ users/index.html       → NO ENLAZADO, HUÉRFANO
⚠️ users/js/profile.js    → Cargado por users/profile.html (pero con bootstrap CDN)
⚠️ users/js/register.js   → Cargado por users/register.html
```

### general/
```
✅ general/api.js       → Importado por: login.js, candidate.js, jobs.js, dashboard.js, company.js
✅ general/cache.js     → Importado por: candidate.js, jobs.js, company.js
✅ general/db.json      → Base de datos para json-server
❌ general/json.js      → NO IMPORTADO, NO USADO, CÓDIGO VIEJO (versión anterior de api.js)
```

### auth/
```
❌ auth/                 → VACÍO (solo tiene auth/img/ vacío)
❌ auth/img/             → NO CONTIENE NADA
```

### CSS
```
✅ style-login.css       → Usado en: login.html
✅ style-dashboard.css   → Usado en: dashboard.html
✅ style-candidate.css   → Usado en: candidate.html, companies/index.html
✅ styles-job.css        → Usado en: jobs.html
```

### Documentación
```
✅ WELCOME.md            → Entry point (importante mantener)
✅ QUICK_START.md        → Setup rápido
✅ README.md             → Documentación completa
✅ SUMMARY.md            → Descripción técnica
✅ INICIO.md             → Instrucciones español
✅ API_REFERENCE.md      → Endpoints
```

### Scripts / Configuración
```
✅ START_SERVER.bat      → Windows batch para levantar servidor
✅ START_SERVER.ps1      → PowerShell script
✅ verify.sh             → Script de verificación (Linux/Mac)
✅ login.js              → Autenticación
✅ dashboard.js          → Inicio según rol
✅ candidate.js          → Perfil candidato
✅ jobs.js               → Gestión ofertas
✅ companies/company.js  → Búsqueda y matches
```

---

## 🔗 MATRIZ DE DEPENDENCIAS (Qué llama a qué)

### HTML → CSS
```
login.html           → style-login.css
dashboard.html       → style-dashboard.css
candidate.html       → style-candidate.css
jobs.html            → styles-job.css
companies/index.html → ../style-candidate.css
users/profile.html   → Bootstrap CDN (no CSS local)
users/register.html  → Bootstrap CDN (no CSS local)
```

### HTML → JS
```
login.html           → login.js
dashboard.html       → dashboard.js
candidate.html       → candidate.js
jobs.html            → jobs.js
companies/index.html → company.js
users/profile.html   → users/js/profile.js
users/register.html  → users/js/register.js
```

### JS → Imports
```
login.js             → ./general/api.js
dashboard.js         → ./general/api.js
candidate.js         → ./general/api.js, ./general/cache.js
jobs.js              → ./general/api.js, ./general/cache.js
companies/company.js → ../general/api.js, ../general/cache.js
```

### HTML → Links/Href
```
login.html              → dashboard.html
dashboard.html          → jobs.html, candidate.html, companies/index.html, 
                        → users/profile.html (oculto), login.html
candidate.html          → dashboard.html, jobs.html, login.html
jobs.html               → dashboard.html, login.html
companies/index.html    → ../dashboard.html, ../jobs.html, ../login.html
users/profile.html      → ??? (no definido, asume login.html)
users/register.html     → login.html, ../index.html (ROTO: no existe raíz/index.html)
TEST.html               → login.html
```

---

## ❌ ARCHIVOS HUÉRFANOS (No usados)

### Categoría 1: Completamente sin referencias
```
❌ general/json.js         - Viejo API helper, reemplazado por api.js
❌ auth/                   - Carpeta vacía sin contenido
❌ auth/img/               - Carpeta vacía
❌ users/index.html        - HTML sin referencias
```

### Categoría 2: Parcialmente en uso (pero con problemas)
```
⚠️ users/profile.html      - Referenciado en dashboard pero oculto (display:none)
⚠️ users/register.html     - NO referenciado, enlace roto a ../index.html
⚠️ users/js/profile.js     - Usa Bootstrap CDN (dependencia externa no declarada)
⚠️ users/js/register.js    - NO llamado desde ningún lado de la app
```

---

## 🔴 PROBLEMAS ENCONTRADOS

### 1. general/json.js
- **Problema**: Código viejo, no se importa en ningún lado
- **Solución**: ELIMINAR
- **Riesgo**: Ninguno, completamente huérfano

### 2. auth/ carpeta
- **Problema**: Vacía, sin contenido útil
- **Solución**: ELIMINAR
- **Riesgo**: Ninguno

### 3. users/index.html
- **Problema**: No está enlazado desde ningún lado
- **Solución**: ELIMINAR o comentar su propósito
- **Riesgo**: Si era placeholder, ninguno. Mejor eliminar

### 4. users/register.html
- **Problema**: 
  - No está enlazado desde la app principal
  - Intenta ir a `../index.html` que NO existe
  - Usa Bootstrap CDN (dependencia no documentada)
- **Solución**: EVALUAR si es necesario. Si no se usa en flujo principal, ELIMINAR
- **Riesgo**: Bajo si no está en el flujo

### 5. users/profile.html
- **Problema**:
  - Está oculto (display:none) en dashboard
  - Usa Bootstrap CDN (dependencia no documentada)
  - No se integra completamente con el flujo de candidato actual
- **Solución**: EVALUAR: ¿Es el mismo que candidate.html? Si no se usa, ELIMINAR
- **Riesgo**: Revisar si es requisito del flujo

### 6. users/js/register.js y users/js/profile.js
- **Problema**: No se usan en el flujo principal
- **Solución**: Eliminar si users/ se elimina
- **Riesgo**: Solo si users/ es necesario

---

## ✅ ARCHIVOS A MANTENER (Core)

```
CORE (Debe funcionar):
✅ login.html + login.js
✅ dashboard.html + dashboard.js
✅ candidate.html + candidate.js
✅ jobs.html + jobs.js
✅ companies/index.html + company.js

HELPERS (Necesarios):
✅ general/api.js
✅ general/cache.js
✅ general/db.json

CSS (Necesario):
✅ style-login.css
✅ style-dashboard.css
✅ style-candidate.css
✅ styles-job.css

DOCS (Mantener):
✅ WELCOME.md
✅ QUICK_START.md
✅ README.md
✅ SUMMARY.md
✅ INICIO.md
✅ API_REFERENCE.md

SETUP (Mantener):
✅ START_SERVER.bat
✅ START_SERVER.ps1
```

---

## 🧹 PLAN DE LIMPIEZA

### FASE 1: Eliminar huérfanos totales
- ❌ general/json.js
- ❌ auth/ (carpeta completa)

### FASE 2: Decidir sobre users/
**Opción A**: Mantener users/ si se considera flujo futuro
**Opción B**: Eliminar users/ si no es parte del flujo principal

→ **RECOMENDACIÓN**: Eliminar (no está integrado en flujo principal, usa Bootstrap CDN no documentado)

### FASE 3: Limpieza CSS
- Revisar style-*.css por selectores no usados
- Revisar duplicaciones

### FASE 4: Limpieza JS
- Revisar variables no usadas
- Revisar funciones huérfanas
- Asegurar try/catch en todas las llamadas a API

### FASE 5: db.json
- Revisar campos no usados en colecciones
- Mantener datos mínimos de ejemplo

---

## 📈 RESUMEN DE CAMBIOS

```
Archivos a Eliminar: 6
  - general/json.js (1)
  - auth/ carpeta (1)
  - users/index.html (1)
  - users/register.html (1)
  - users/profile.html (1)
  - users/js/ carpeta (1)

Total: ~10 KB liberados

Archivos a Mantener: 20 (Core + Docs)
Cambios Menores: CSS/JS limpieza, try/catch
```

---

## ✅ VERIFICACIÓN POST-CLEANUP

```
1. ✅ login.html abre
2. ✅ Login como candidate → candidate.html
3. ✅ Login como company → companies/index.html
4. ✅ Jobs.html funciona
5. ✅ Dashboard redirecciona según rol
6. ✅ json-server levanta sin errores
7. ✅ No hay enlaces rotos
8. ✅ No hay imports fallidos
```

---

Esperando aprobación para proceder con limpieza...
