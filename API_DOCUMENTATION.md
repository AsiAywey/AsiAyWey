# AsiAyWey - Backend API Documentation

## 📋 Descripción General

Esta es una API RESTful construida con json-server que alimenta la plataforma AsiAyWey, una aplicación web que conecta profesionales buscando trabajo con empresas que ofrecen oportunidades laborales.

## 🚀 Inicio Rápido

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Iniciar servidor**
   ```bash
   npm start
   ```
   
3. **Acceder a la API**
   - URL base: `http://localhost:3001`
   - Los datos se guardan automáticamente en `db.json`

## 📊 Estructura de Datos

### 👤 Users (Usuarios/Profesionales)
```json
{
  "id": "1",
  "username": "nombre_usuario",
  "fullName": "Nombre Completo",
  "email": "email@ejemplo.com",
  "password": "contraseña",
  "phone": "+57 300 123 4567",
  "profession": "Desarrollador Frontend",
  "experience": "3 años",
  "skills": ["JavaScript", "React", "CSS"],
  "education": "Ingeniería de Sistemas",
  "status": "DISPONIBLE|NO_DISPONIBLE|OCUPADO",
  "openToWork": true,
  "description": "Descripción profesional del perfil"
}
```

### 🏢 Companies (Empresas)
```json
{
  "id": "1",
  "name": "Nombre Empresa",
  "email": "contacto@empresa.com",
  "phone": "+57 1 234 5678",
  "address": "Dirección de la empresa",
  "industry": "Tecnología",
  "description": "Descripción de la empresa",
  "website": "https://empresa.com",
  "logo": "url_logo.jpg"
}
```

### 💼 JobOffers (Ofertas Laborales)
```json
{
  "id": "1",
  "title": "Desarrollador Frontend Senior",
  "description": "Buscamos desarrollador con experiencia...",
  "requirements": ["React", "JavaScript", "CSS"],
  "salary": "$5.000.000 - $8.000.000",
  "location": "Bogotá, Colombia",
  "modality": "Remoto|Híbrido|Presencial",
  "type": "Tiempo completo|Medio tiempo",
  "companyId": "1",
  "status": "ACTIVA|CERRADA|PAUSADA",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

### 🤝 Matches (Coincidencias)
```json
{
  "id": "1",
  "userId": "1",
  "companyId": "1",
  "jobOfferId": "1",
  "status": "PENDIENTE|ACEPTADO|RECHAZADO",
  "companyMessage": "Interesado en tu perfil...",
  "userMessage": "Gracias por el interés...",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

### 📅 Reservations (Reservas/Entrevistas)
```json
{
  "id": "1",
  "userId": "1",
  "companyId": "1",
  "matchId": "1",
  "title": "Entrevista técnica",
  "description": "Entrevista para posición frontend",
  "date": "2024-01-20T14:00:00Z",
  "duration": "1 hora",
  "location": "Google Meet",
  "status": "PROGRAMADA|COMPLETADA|CANCELADA"
}
```

## 🔌 Endpoints Disponibles

### 📁 Endpoints RESTful (CRUD Automático)

#### 👤 Usuarios
- `GET /users` - Listar todos los usuarios
- `GET /users/:id` - Obtener usuario específico
- `POST /users` - Crear nuevo usuario
- `PUT /users/:id` - Actualizar usuario existente
- `DELETE /users/:id` - Eliminar usuario

#### 🏢 Empresas
- `GET /companies` - Listar todas las empresas
- `GET /companies/:id` - Obtener empresa específica
- `POST /companies` - Crear nueva empresa
- `PUT /companies/:id` - Actualizar empresa existente
- `DELETE /companies/:id` - Eliminar empresa

#### 💼 Ofertas Laborales
- `GET /jobOffers` - Listar todas las ofertas
- `GET /jobOffers/:id` - Obtener oferta específica
- `POST /jobOffers` - Crear nueva oferta
- `PUT /jobOffers/:id` - Actualizar oferta existente
- `DELETE /jobOffers/:id` - Eliminar oferta

#### 🤝 Matches
- `GET /matches` - Listar todos los matches
- `GET /matches/:id` - Obtener match específico
- `POST /matches` - Crear nuevo match
- `PUT /matches/:id` - Actualizar match existente
- `DELETE /matches/:id` - Eliminar match

#### 📅 Reservas
- `GET /reservations` - Listar todas las reservas
- `GET /reservations/:id` - Obtener reserva específica
- `POST /reservations` - Crear nueva reserva
- `PUT /reservations/:id` - Actualizar reserva existente
- `DELETE /reservations/:id` - Eliminar reserva

### 🎯 Endpoints Personalizados

#### ✅ Usuarios Disponibles
```http
GET /available-users
```
Retorna solo los usuarios que tienen `openToWork: true`. Perfecto para empresas que buscan candidatos activos.

**Ejemplo de respuesta:**
```json
[
  {
    "id": "1",
    "username": "alyxzain",
    "fullName": "Sebastian Vargas",
    "profession": "Desarrollador Frontend",
    "openToWork": true,
    ...
  }
]
```

#### 📄 Ofertas por Empresa
```http
GET /companies/:companyId/offers
```
Obtiene todas las ofertas publicadas por una empresa específica.

**Parámetros:**
- `companyId` (string) - ID de la empresa

**Ejemplo:**
```http
GET /companies/1/offers
```

#### 🔗 Matches por Empresa
```http
GET /companies/:companyId/matches
```
Obtiene todas las coincidencias que ha realizado una empresa.

**Parámetros:**
- `companyId` (string) - ID de la empresa

#### 📋 Reservas por Usuario
```http
GET /users/:userId/reservations
```
Obtiene todas las reservas/entrevistas de un usuario específico.

**Parámetros:**
- `userId` (string) - ID del usuario

## 💡 Ejemplos de Uso

### 1. Crear un nuevo usuario
```bash
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "juan_perez",
    "fullName": "Juan Pérez",
    "email": "juan@email.com",
    "password": "password123",
    "profession": "Diseñador UX",
    "skills": ["Figma", "Sketch"]
  }'
```

### 2. Obtener usuarios disponibles
```bash
curl http://localhost:3001/available-users
```

### 3. Crear oferta laboral
```bash
curl -X POST http://localhost:3001/jobOffers \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Desarrollador React",
    "description": "Buscamos desarrollador React senior...",
    "requirements": ["React", "JavaScript", "Redux"],
    "salary": "$6.000.000",
    "location": "Medellín",
    "companyId": "1"
  }'
```

### 4. Obtener ofertas de una empresa
```bash
curl http://localhost:3001/companies/1/offers
```

## ⚙️ Características Especiales

### 🛡️ Middleware de Validación
- **Validación automática**: Solo se permiten crear usuarios con campos obligatorios
- **Autocompletado**: Campos opcionales se completan con valores por defecto
- **Consistencia**: Todos los usuarios tienen la misma estructura de datos

### 🔄 CORS Habilitado
La API está configurada para aceptar peticiones desde cualquier origen (útil para desarrollo frontend).

### 📝 Logging Automático
json-server incluye logging automático de todas las peticiones HTTP.

## 🔧 Desarrollo Local

### Archivos importantes:
- `server.js` - Configuración del servidor y endpoints personalizados
- `db.json` - Base de datos local (se actualiza automáticamente)
- `package.json` - Dependencias del proyecto

### Variables de entorno:
- `PORT=3001` - Puerto donde corre el servidor (configurable)

## 🚨 Notas Importantes

1. **Datos persistentes**: Todos los cambios se guardan automáticamente en `db.json`
2. **IDs únicos**: json-server genera IDs automáticamente
3. **Password**: En producción, las contraseñas deben estar hasheadas
4. **Validación**: La validación actual es básica, considerar validación más robusta en producción

## 🤝 Contribuir

Para añadir nuevos endpoints:
1. Edita `server.js`
2. Añade la nueva ruta con su lógica
3. Documenta el endpoint en este archivo
4. Reinicia el servidor para aplicar cambios

---

**AsiAyWey Backend API** - Conectando talento con oportunidades 🌟