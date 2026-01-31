# AsiAyWey - Backend Simple

Backend con JSON Server para el proyecto AsiAyWey.

## Cómo iniciar el servidor

### Opción 1: Con el servidor personalizado

```bash
npm start
```

### Opción 2: Modo desarrollo (se actualiza solo)

```bash
npm run dev
```

### Opción 3: Versión más simple

```bash
npm run simple
```

El servidor corre en: **http://localhost:3000**

## Endpoints disponibles

### Usuarios

- `GET /users` - Todos los usuarios
- `GET /users/:id` - Usuario específico
- `POST /users` - Crear usuario
- `PUT /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario

### Usuarios disponibles (solo los que buscan trabajo)

- `GET /available-users` - Usuarios con openToWork: true

### Empresas

- `GET /companies` - Todas las empresas
- `GET /companies/:id` - Empresa específica
- `POST /companies` - Crear empresa
- `PUT /companies/:id` - Actualizar empresa

### Ofertas de trabajo

- `GET /jobOffers` - Todas las ofertas
- `GET /jobOffers/:id` - Oferta específica
- `POST /jobOffers` - Crear oferta
- `GET /companies/:companyId/offers` - Ofertas de una empresa

### Matches

- `GET /matches` - Todos los matches
- `GET /matches/:id` - Match específico
- `POST /matches` - Crear match
- `GET /companies/:companyId/matches` - Matches de una empresa

### Reservas

- `GET /reservations` - Todas las reservas
- `GET /reservations/:id` - Reserva específica
- `POST /reservations` - Crear reserva
- `GET /users/:userId/reservations` - Reservas de un usuario

### Mensajes

- `GET /messages` - Todos los mensajes
- `GET /messages/:id` - Mensaje específico
- `POST /messages` - Crear mensaje

## Estructura de datos

### Usuario

```json
{
  "id": "1",
  "username": "alyxzain",
  "fullName": "Sebastian Vargas",
  "email": "zain-wave@email.com",
  "password": "12345",
  "phone": "+57 300 123 4567",
  "profession": "Desarrollador Frontend",
  "experience": "3 años",
  "skills": ["JavaScript", "React"],
  "status": "DISPONIBLE",
  "openToWork": true
}
```

### Empresa

```json
{
  "id": "1",
  "name": "Tech Solutions",
  "email": "hr@techsolutions.com",
  "password": "12345",
  "nit": "900123456-7"
}
```

### Match

```json
{
  "id": "1",
  "companyId": "1",
  "jobOfferId": "1",
  "userId": "1",
  "status": "pending"
}
```

## Reglas de negocio

✅ Open to Work: Solo usuarios con `openToWork: true` aparecen en búsquedas
✅ Matches: Creados solo por empresas
✅ Reservas: Un usuario solo puede tener una reserva activa
✅ Privacidad: Contacto solo visible en estado `contacted`
