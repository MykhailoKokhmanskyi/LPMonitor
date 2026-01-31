import type { Request, Response } from 'express';
import {verifyTurnstile} from '../utils/cfTurnstile.ts';
import {sendRegistrationLink} from '../services/authController.ts';
import {fetchAlerts} from '../utils/alertHelpter.ts';

export const registerForm = (req: Request, res: Response) => {
	res.render('registerForm', { alerts: fetchAlerts(req) });
}

export const register = async (req: Request, res: Response) => {
	const email = req.body.email
	const turnstile_valid = process.env.NODE_ENV === 'production' ? (await verifyTurnstile(req.body['cf-turnstile-response'], req.ip || "")).success : true;
	if(!turnstile_valid) {
		req.flash('alerts', JSON.stringify({ title: 'Помилка', type: 'warning', msg: 'Ви не пройшли перевірку! Будь ласка, спробуйте ще раз.'}))
	} else {
		req.flash('alerts', JSON.stringify({ title: 'Реєстрація', type: 'success', msg: 'На вашу електронну пошту було надіслано лист з посиланням для закінчення реєстрації. Якщо ви не отримали лист, первірте "спам" або спробуйте ще раз.'}))
	}
	res.render('registerForm', { email, alerts: fetchAlerts(req) })
	
	sendRegistrationLink(email)
}
