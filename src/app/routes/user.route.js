import express from 'express';
import { signup, login, logout, protect } from '../controllers/auth.controller.js';
import {
  getMe,
  updateMe,
  createAdmin,
  updateAdmin,
  getAdmins,
  deleteAdmin,
} from '../controllers/user.controller.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

router.get('/me', protect, getMe);
router.patch('/update-me', protect, updateMe);

router.route('/admin')
  .get(protect, getAdmins)
  .post(protect, createAdmin);

router.route('/admin/:adminId')
  .patch(protect, updateAdmin)
  .delete(protect, deleteAdmin);

export default router;
