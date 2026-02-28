import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController.ts'
import {ensureLoggedIn} from '../middleware/userMiddleware.ts';

const router = Router();

router.get('/', ensureLoggedIn, dashboardController.index)

export default router;
