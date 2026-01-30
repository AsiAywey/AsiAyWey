const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

// Usar middlewares por defecto
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Middleware para completar campos faltantes en el registro de usuarios
server.use((req, res, next) => {
  if (req.method === 'POST' && req.path === '/users') {
    const userData = req.body;
    
    // Campos mínimos requeridos
    const requiredFields = ['username', 'fullName', 'email', 'password'];
    const hasRequiredFields = requiredFields.every(field => userData[field]);
    
    if (hasRequiredFields) {
      // Completar campos faltantes con valores por defecto
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

// Endpoint simple para usuarios disponibles (solo los que tienen openToWork: true)
server.get("/available-users", (req, res) => {
  const users = router.db.get("users").filter({ openToWork: true }).value();
  res.json(users);
});

// Endpoint simple para ofertas de una empresa
server.get("/companies/:companyId/offers", (req, res) => {
  const offers = router.db
    .get("jobOffers")
    .filter({ companyId: req.params.companyId })
    .value();
  res.json(offers);
});

// Endpoint simple para matches de una empresa
server.get("/companies/:companyId/matches", (req, res) => {
  const matches = router.db
    .get("matches")
    .filter({ companyId: req.params.companyId })
    .value();
  res.json(matches);
});

// Endpoint simple para reservas de un usuario
server.get("/users/:userId/reservations", (req, res) => {
  const reservations = router.db
    .get("reservations")
    .filter({ userId: req.params.userId })
    .value();
  res.json(reservations);
});

// Usar el router de json-server
server.use(router);

// Iniciar servidor
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Usuarios: http://localhost:${PORT}/users`);
  console.log(`Empresas: http://localhost:${PORT}/companies`);
  console.log(`Ofertas: http://localhost:${PORT}/jobOffers`);
  console.log(`Matches: http://localhost:${PORT}/matches`);
  console.log(`Usuarios disponibles: http://localhost:${PORT}/available-users`);
});
