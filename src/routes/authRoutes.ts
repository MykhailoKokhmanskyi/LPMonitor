import { Router } from 'express';
import * as authController from '../controllers/authController.ts'

const router = Router();

router.get('/register', authController.registerForm);

export default router;
