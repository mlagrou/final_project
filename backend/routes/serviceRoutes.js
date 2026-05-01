// Import Express — needed to access the Router factory function
const express = require('express')

// Create a Router instance
// keeping route definitions modular and out of the main server.js file
const router = express.Router()

// Import CRUD controller functions from serviceController.js
// Each function handles exactly one operation and is mapped to a route + HTTP method below

const {
    getservices,    // GET    — fetch all services belonging to the authenticated user
    setservice,     // POST   — create a new service
    updateservice,  // PUT    — overwrite an existing service by ID
    deleteservice   // DELETE — remove a service by ID
} = require('../controllers/serviceController')

// Import the `protect` middleware from authMiddleware.js
// `protect` runs BEFORE the controller on any route it's applied to.
// It validates the incoming JWT from the Authorization header, decodes the user ID,
// fetches that user from the DB, and attaches them to req.user.
// If the token is missing, expired, or invalid — it rejects the request with a 401
// and the controller function never runs.
// Please look into this code (../middleware/authMiddleware)

const { protect } = require('../middleware/authMiddleware')

// ---- Routes for /api/services/ --------------------------
// GET  /api/services/  → protect runs first, then getservices (returns all services for req.user)
// POST /api/services/  → protect runs first, then setservice  (creates a service owned by req.user)

router.route('/').get(protect, getservices).post(protect, setservice)

// ---- Routes for /api/services/:id--------------------------
// PUT    /api/services/:id → protect runs first, then updateservice (edits service with matching :id)
// DELETE /api/services/:id → protect runs first, then deleteservice (removes service with matching :id)
// :id is a URL parameter accessible in the controller via req.params.id

router.route('/:id').put(protect, updateservice).delete(protect, deleteservice)

// Export this router so server.js can mount it:
// app.use('/api/services', require('./routes/serviceRoutes'))
// All routes defined above are relative to that /api/services base path
module.exports = router