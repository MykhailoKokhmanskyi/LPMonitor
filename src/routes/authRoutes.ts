import { Router } from 'express';
import * as authController from '../controllers/authController.ts'
import rateLimit, {ipKeyGenerator} from 'express-rate-limit';
import { addAlert } from '../utils/alertHelper.ts';

const router = Router();

router.get('/register', authController.registerForm);

const registrationIpRateLimiter = rateLimit({
	windowMs: 60*60*1000,
	max: 4,
	handler:(req, res, next, options) => {
		addAlert(res, 'warning', 'Занадто багато запитів', 'Ви перевищили максимальну дозволену кількість запитів на реєстрацію для цього пристрою. Спробуйте знову через 1 годину.')
		authController.registerForm(req, res)
	}
})
const registrationEmailRateLimiter = rateLimit({
	windowMs: 60*60*1000,
	max: 3,
	keyGenerator: (req, _res) => {
		return req.body.email || ipKeyGenerator(req.ip as string)
	},
	handler:(req, res, next, options) => {
		addAlert(res, 'warning', 'Занадто багато запитів', 'Ви перевищили максимальну дозволену кількість запитів на реєстрацію з цієї електронної адреси. Спробуйте знову через 1 годину.')
		authController.registerForm(req,res)
	}
})
router.post('/register', registrationIpRateLimiter, registrationEmailRateLimiter, authController.register);

export default router;
