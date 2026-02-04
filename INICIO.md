# INSTRUCCIONES DE EJECUCIÓN - MatchFlow AsíAyWey

## 📋 Requisitos
- Node.js instalado
- npm o yarn

## 🚀 PASO 1: Instalar json-server

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
npm install -g json-server
```

## 🚀 PASO 2: Levantar json-server

En la **MISMA** carpeta del proyecto (c:\Users\Jupiter\Desktop\AsiAyWey), abre otra terminal y ejecuta:

```bash
json-server --watch general/db.json --port 3001
```

**Deberías ver algo como:**
```
  ✔ watching...
  ✔ loading database
  ✔ listening on port 3001
  ✔ opening http://localhost:3001
```

## 🚀 PASO 3: Abrir la aplicación

### Opción A: Con Live Server (VS Code)
1. Click derecho en `login.html`
2. Selecciona "Open with Live Server"

### Opción B: Acceder directamente
- Abre `http://localhost:5500` (si usas Live Server)
- O arrastra `login.html` al navegador

## ✅ VERIFICAR QUE TODO FUNCIONA

### 1. Login Page
- Deberías ver selectores de Role y User
- Selecciona: Role = "Candidate", User = "Santiago Zapata"
- Click "Enter"

### 2. Dashboard
- Deberías ver el nombre y rol de Santiago
- Enlaces a "My Profile" y "Jobs"

### 3. My Profile (candidate.html)
- Muestra datos de Santiago
- Button: "Activate Open to Work"
- Click para activar

### 4. Volver a Home y login como Empresa
- logout (link en navbar)
- Role = "Company", User = "Tech Corp"
- Click "Enter"

### 5. Company Profile
- Tab 1: Search Candidates (aparece Santiago si OpenToWork=true)
- Click "Select & Match" → debe crear match y reservación

## 🔍 Troubleshooting

### "Cannot fetch from localhost:3001"
**Solución:**
1. Abre http://localhost:3001/candidates en el navegador
2. Si ves JSON, todo está bien
3. Si no, verifica que json-server siga corriendo

### "SyntaxError: Unexpected token <"
**Significa:**
- El archivo HTML se está cargando como JS
- Verifica que Live Server esté activo
- No abras archivos como `file://`

### No aparecen candidatos en búsqueda
1. Asegúrate de que el candidato tenga `openToWork: true`
2. Abre DevTools (F12) → Network → refetch `/candidates`
3. En Console → revisa si hay errores

### "Candidate is reserved by another company"
¡Eso es correcto! Significa que el bloqueo funciona.

## 📱 Flujo Completo de Prueba

```
1. Login como CANDIDATE (Santiago)
   └─> Dashboard → My Profile → "Activate Open to Work" ✓

2. Login como COMPANY (Tech Corp)
   └─> Company Profile → Search Candidates
       └─> "Select & Match" (aparece Santiago) ✓

3. Vuelve a intentar como COMPANY 2 (Design Studios)
   └─> Company Profile → Search Candidates
       └─> Intenta "Select & Match" en Santiago
           └─> ERROR: "reserved by another company" ✓

4. Desde Company Profile → My Matches
   └─> Click "Contact" (status: pending → contacted)
       └─> Ahora aparece el teléfono/email de Santiago ✓

5. Click "Discard"
   └─> Match deleted, reservation released ✓

6. Login como COMPANY 2, intenta de nuevo
   └─> Ahora SÍ puedes reservar a Santiago ✓
```

## 📝 Archivos Principales

```
/login.html → login.js
    ↓
/dashboard.html → dashboard.js
    ├─ /candidate.html → candidate.js (si role=candidate)
    ├─ /companies/index.html → companies/company.js (si role=company)
    └─ /jobs.html → jobs.js

/general/
    ├─ db.json (base de datos)
    ├─ api.js (funciones fetch)
    └─ cache.js (caché con TTL)
```

## 🆘 Contacto / Ayuda

Si algo no funciona:
1. Revisa la consola (F12)
2. Abre el Network tab
3. Verifica que http://localhost:3001 responda

---

**¡Listo! La app debería funcionar completamente. 🎉**
