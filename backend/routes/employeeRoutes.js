const express = require('express');
const router = express.Router();
const {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  getDeleteHistory,
  getStats,
} = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../utils/multerConfig');

// All routes protected
router.use(protect);

router.get('/stats', getStats);
router.get('/delete-history', getDeleteHistory);

router
  .route('/')
  .get(getEmployees)
  .post(upload.single('photo'), createEmployee);

router
  .route('/:id')
  .get(getEmployee)
  .put(upload.single('photo'), updateEmployee)
  .delete(deleteEmployee);

module.exports = router;
