# API Endpoints Reference

Todos los endpoints están en: `http://localhost:3001`

## Candidates

- `GET /candidates` - Listar todos los candidatos
- `GET /candidates/:id` - Obtener un candidato específico
- `POST /candidates` - Crear candidato
- `PATCH /candidates/:id` - Actualizar candidato
- `DELETE /candidates/:id` - Eliminar candidato

## Companies

- `GET /companies` - Listar empresas
- `GET /companies/:id` - Obtener empresa específica
- `POST /companies` - Crear empresa
- `PATCH /companies/:id` - Actualizar empresa
- `DELETE /companies/:id` - Eliminar empresa

## Job Offers

- `GET /jobOffers` - Listar todas las ofertas
- `GET /jobOffers/:id` - Obtener oferta específica
- `POST /jobOffers` - Crear oferta
- `PATCH /jobOffers/:id` - Actualizar oferta
- `DELETE /jobOffers/:id` - Eliminar oferta

## Matches

- `GET /matches` - Listar todos los matches
- `GET /matches/:id` - Obtener match específico
- `POST /matches` - Crear match
- `PATCH /matches/:id` - Actualizar match (cambiar estado)
- `DELETE /matches/:id` - Eliminar match

## Reservations

- `GET /reservations` - Listar reservas
- `GET /reservations/:id` - Obtener reserva específica
- `POST /reservations` - Crear reserva
- `PATCH /reservations/:id` - Actualizar reserva (active: true/false)
- `DELETE /reservations/:id` - Eliminar reserva

## Ejemplo de Uso (JavaScript)

### GET
```javascript
const candidates = await fetch('http://localhost:3001/candidates')
  .then(res => res.json());
```

### POST
```javascript
const newOffer = {
  companyId: 'comp1',
  title: 'Senior Dev',
  description: '...',
  skills: ['React', 'Node'],
  location: 'Remote',
  salary: '$5000-$7000',
  status: 'active',
  createdAt: '2026-02-04'
};

const created = await fetch('http://localhost:3001/jobOffers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newOffer)
}).then(res => res.json());
```

### PATCH
```javascript
const updated = await fetch('http://localhost:3001/matches/m1', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'contacted' })
}).then(res => res.json());
```

### DELETE
```javascript
await fetch('http://localhost:3001/jobOffers/job1', {
  method: 'DELETE'
});
```

## Ver datos en tiempo real

Abre directamente en el navegador:
- http://localhost:3001/candidates
- http://localhost:3001/companies
- http://localhost:3001/jobOffers
- http://localhost:3001/matches
- http://localhost:3001/reservations

O usa curl:
```bash
curl http://localhost:3001/candidates
```
