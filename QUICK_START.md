# ⚡ Quick Start - MatchFlow

## 🚀 En 3 pasos:

### Paso 1: Abrir terminal en la carpeta del proyecto
```bash
cd c:\Users\Jupiter\Desktop\AsiAyWey
```

### Paso 2: Ejecutar el servidor
**En Windows (PowerShell):**
```bash
.\START_SERVER.ps1
```

**O si prefieres manualmente:**
```bash
npm install -g json-server
json-server --watch general/db.json --port 3001
```

### Paso 3: Abrir el navegador
Abre **login.html** con Live Server o cualquier navegador

---

## ✅ Verificar que funciona

1. **Antes de nada:** Asegúrate que json-server esté corriendo (paso 2)
2. Abre `TEST.html` en el navegador
3. Si todo está verde ✅, procede a `login.html`

---

## 🧪 Flujo rápido de prueba (5 minutos)

```
1. LOGIN como Candidate (Santiago Zapata)
   └─ Dashboard → My Profile → Click "Activate Open to Work"

2. LOGIN como Company (Tech Corp)
   └─ Company Profile → Search Candidates
   └─ Click "Select & Match" en Santiago
   └─ ¡Candidato reservado! ✓

3. Click "Contact" en el match
   └─ Status cambia a "contacted"
   └─ ¡Ahora aparece el teléfono! ✓

4. Intenta con otra empresa (Design Studios)
   └─ ERROR: "Reserved by another company" ✓

5. Click "Discard" o "Release"
   └─ Reservación liberada ✓
```

---

## 📁 Archivos Principales

```
login.html ────────────> login.js
dashboard.html ────────> dashboard.js
candidate.html ────────> candidate.js
jobs.html ──────────────> jobs.js
companies/index.html ──> companies/company.js

general/
  ├─ db.json (base de datos)
  ├─ api.js (fetch helpers)
  └─ cache.js (localStorage)
```

---

## 🔍 Si algo no funciona

### "Cannot fetch localhost:3001"
→ Asegúrate que json-server esté corriendo (ves `listening on port 3001`)

### "SyntaxError: Unexpected token <"
→ El archivo HTML se está cargando como JS. Usa Live Server, no `file://`

### "No aparecen candidatos"
→ Abre DevTools (F12) → Network → ve si se llama `/candidates`
→ Si falla, json-server no está corriendo

### "Quiero modificar los datos"
→ Edita `general/db.json` mientras json-server NO esté corriendo
→ Reinicia json-server y los cambios se cargarán

---

## 🎯 Estructura de Datos

### Candidates
```json
{
  "id": "c1",
  "name": "Santiago Zapata",
  "email": "santiago@gmail.com",
  "phone": "+57 312 345 6789",
  "title": "Senior Software Engineer",
  "skills": ["JavaScript", "React", "Node.js"],
  "openToWork": true
}
```

### Matches
```json
{
  "id": "m1",
  "companyId": "comp1",
  "jobOfferId": "job1",
  "candidateId": "c1",
  "status": "pending",  // pending → contacted → hired
  "score": 95
}
```

### Reservations
```json
{
  "id": "res1",
  "companyId": "comp1",
  "candidateId": "c1",
  "matchId": "m1",
  "active": true  // true → bloquea a otras empresas
}
```

---

## 📚 Documentación Completa

- **README.md** - Descripción general del proyecto
- **INICIO.md** - Instrucciones paso a paso
- **API_REFERENCE.md** - Endpoints y ejemplos de uso
- **TEST.html** - Test panel para verificar conexión

---

## 🆘 Soporte

Si necesitas modificar datos mientras json-server corre:
1. No cierres json-server
2. Edita `general/db.json`
3. Recarga el navegador
4. json-server detectará cambios automáticamente

---

¡**Lista para usar! Disfruta la app** 🎉
