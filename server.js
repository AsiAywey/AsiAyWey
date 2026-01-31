/**
 * AsiAyWey - Backend API
 * Servidor REST para plataforma de conexión laboral entre profesionales y empresas
 * 
 * Tecnologías: json-server (basado en Express.js)
 * Base de datos: JSON file (db.json)
 * Puerto: 3000 || 3001 || 3002 || 3003 || 3004 || 3005
 * 
 * Autor: El equipo de AsiAyWey
 * Última actualización: Enero 2026 
 */

const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

// ========================================
// MIDDLEWARES
// ========================================

// Usar middlewares por defecto de json-server (CORS, logging, etc.)
server.use(middlewares);

// Parser para procesar el cuerpo de las solicitudes en formato JSON
server.use(jsonServer.bodyParser);

/**
 * Middleware personalizado para validar y enriquecer datos de usuarios
 * 
 * Se ejecuta automáticamente cuando alguien intenta registrar un nuevo usuario
 * - Valida que los campos obligatorios estén presentes
 * - Completa automáticamente campos opcionales con valores por defecto
 * - Asegura consistencia en la estructura de datos
 */
server.use((req, res, next) => {
  if (req.method === 'POST' && req.path === '/users') {
    const userData = req.body;
    
    // Campos mínimos que SI O SI debe proporcionar el cliente
    const requiredFields = ['username', 'fullName', 'email', 'password'];
    const hasRequiredFields = requiredFields.every(field => userData[field]);
    
    if (hasRequiredFields) {
      // Si los campos obligatorios están completos, rellenamos los opcionales
      req.body = {
        ...userData,
        phone: userData.phone || "",
        profession: userData.profession || "",
        experience: userData.experience || "",
        skills: userData.skills || [],
        education: userData.education || "",
        status: userData.status || "DISPONIBLE",
        openToWork: userData.openToWork !== undefined ? userData.openToWork : true,
        description: userData.description || ""
      };
    }
  }
  next();
});

// ========================================
// ENDPOINTS PERSONALIZADOS
// ========================================

/**
 * GET /available-users
 * Obtiene lista de profesionales que están buscando trabajo activamente
 * 
 * Retorna solo los usuarios que tienen openToWork: true
 * Útil para empresas que quieren ver candidatos disponibles
 * 
 * @returns {Array} Lista de usuarios disponibles con todos sus datos
 */
server.get("/available-users", (req, res) => {
  const users = router.db.get("users").filter({ openToWork: true }).value();
  res.json(users);
});

/**
 * GET /companies/:companyId/offers
 * Obtiene todas las ofertas laborales publicadas por una empresa específica
 * 
 * @param {string} companyId - ID único de la empresa
 * @returns {Array} Lista de ofertas laborales de esa empresa
 */
server.get("/companies/:companyId/offers", (req, res) => {
  const offers = router.db
    .get("jobOffers")
    .filter({ companyId: req.params.companyId })
    .value();
  res.json(offers);
});

/**
 * GET /companies/:companyId/matches
 * Obtiene todos los matches que ha realizado una empresa
 * 
 * Un match ocurre cuando una empresa muestra interés en un candidato
 * @param {string} companyId - ID único de la empresa
 * @returns {Array} Lista de matches con información de usuarios vinculados
 */
server.get("/companies/:companyId/matches", (req, res) => {
  const matches = router.db
    .get("matches")
    .filter({ companyId: req.params.companyId })
    .value();
  res.json(matches);
});

/**
 * GET /users/:userId/reservations
 * Obtiene todas las reservas de entrevistas o citas de un usuario
 * 
 * Útil para que los profesionales vean sus próximas entrevistas
 * @param {string} userId - ID único del usuario
 * @returns {Array} Lista de reservas del usuario
 */
server.get("/users/:userId/reservations", (req, res) => {
  const reservations = router.db
    .get("reservations")
    .filter({ userId: req.params.userId })
    .value();
  res.json(reservations);
});

// ========================================
// ENDPOINTS AUTOMÁTICOS (CRUD)
// ========================================

// Usar el router de json-server para generar automáticamente:
// GET /users - Listar todos los usuarios
// GET /users/:id - Obtener usuario específico
// POST /users - Crear nuevo usuario
// PUT /users/:id - Actualizar usuario existente
// DELETE /users/:id - Eliminar usuario
//
// Lo mismo para: companies, jobOffers, matches, reservations

server.use(router);