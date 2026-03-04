import { Router } from 'express';
import * as authController from '../controllers/authController.ts'
import rateLimit, {ipKeyGenerator} from 'express-rate-limit';

const router = Router();

router.get('/register', authController.registerForm);

const registrationIpRateLimiter = rateLimit({
	windowMs: 60*60*1000,
	max: 4,
	handler:(req, res, next, options) => {
		req.flash('alerts', JSON.stringify({title: 'Занадто багато запитів', type: 'warning', msg:'Ви перевищили максимальну дозволену кількість запитів на реєстрацію для цього пристрою. Спробуйте знову через 1 годину.'}))
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
		req.flash('alerts', JSON.stringify({title: 'Занадто багато запитів', type: 'warning', msg:'Ви перевищили максимальну дозволену кількість запитів на реєстрацію з цієї електронної адреси. Спробуйте знову через 1 годину.'}))
		authController.registerForm(req,res)
	}
})
router.post('/register', registrationIpRateLimiter, registrationEmailRateLimiter, authController.register);

router.get('/register/:inviteUuid', authController.registerPasswordForm);
router.post('/register/:inviteUuid', authController.registerPasswordSubmit);

const loginIpRateLimiter = rateLimit({
	windowMs: 60*60*1000,
	max: 4,
	handler:(req, res, next, options) => {
		req.flash('alerts', JSON.stringify({title: 'Занадто багато запитів', type: 'warning', msg:'Ви перевищили максимальну дозволену кількість запитів на вхід для цього пристрою. Спробуйте знову через 1 годину.'}))
		authController.registerForm(req, res)
	}
})
const loginEmailRateLimiter = rateLimit({
	windowMs: 60*60*1000,
	max: 3,
	keyGenerator: (req, _res) => {
		return req.body.email || ipKeyGenerator(req.ip as string)
	},
	handler:(req, res, next, options) => {
		req.flash('alerts', JSON.stringify({title: 'Занадто багато запитів', type: 'warning', msg:'Ви перевищили максимальну дозволену кількість запитів на вхід з цієї електронної адреси. Спробуйте знову через 1 годину.'}))
		authController.registerForm(req,res)
	}
})
router.get('/login', authController.loginForm)
router.post('/login', loginIpRateLimiter, loginEmailRateLimiter, authController.login)

router.post('/logout', authController.logout)

const resetIpRateLimiter = rateLimit({
	windowMs: 60*60*1000,
	max: 4,
	handler:(req, res, next, options) => {
		req.flash('alerts', JSON.stringify({title: 'Занадто багато запитів', type: 'warning', msg:'Ви перевищили максимальну дозволену кількість запитів на скидання пароля для цього пристрою. Спробуйте знову через 1 годину.'}))
		authController.registerForm(req, res)
	}
})
const resetEmailRateLimiter = rateLimit({
	windowMs: 60*60*1000,
	max: 3,
	keyGenerator: (req, _res) => {
		return req.body.email || ipKeyGenerator(req.ip as string)
	},
	handler:(req, res, next, options) => {
		req.flash('alerts', JSON.stringify({title: 'Занадто багато запитів', type: 'warning', msg:'Ви перевищили максимальну дозволену кількість запитів на скидання пароля з цієї електронної адреси. Спробуйте знову через 1 годину.'}))
		authController.registerForm(req,res)
	}
})
router.get('/reset-password', authController.resetPasswordForm)
router.post('/reset-password', resetIpRateLimiter, resetEmailRateLimiter, authController.resetPassword)

router.get('/reset-password/:resetUuid', authController.resetPasswordSecondForm)
router.post('/reset-password/:resetUuid', authController.resetPasswordSecond)

export default router;
