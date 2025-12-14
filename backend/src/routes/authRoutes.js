import express from 'express';
import {
  adminLogin,
  userRegister,
  userLogin,
  logout,
} from '../controllers/authController.js';

const router = express.Router();

// Admin routes
router.post('/admin/login', adminLogin);

// User routes
router.post('/register', userRegister);
router.post('/login', userLogin);
router.post('/logout', logout);

export default router;



