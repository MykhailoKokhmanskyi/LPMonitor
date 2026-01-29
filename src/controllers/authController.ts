import type { Request, Response } from 'express';
import { addAlert } from '../utils/alertHelper.ts';
import {verifyTurnstile} from '../utils/cfTurnstile.ts';
import {sendRegistrationLink} from '../services/authController.ts';

export const registerForm = (_req: Request, res: Response) => {
	res.render('registerForm');
}

export const register = async (req: Request, res: Response) => {
	const email = req.body.email
	const turnstile_valid = process.env.NODE_ENV === 'production' ? (await verifyTurnstile(req.body['cf-turnstile-response'], req.ip || "")).success : true;
	if(!turnstile_valid) {
		addAlert(res, 'warning', 'Капча', 'Ви не пройшли перевірку! Будь ласка, спробуйте ще раз.')
	} else {
		addAlert(res, 'success', 'Реєстрація', 'На вашу електронну пошту було надіслано лист з посиланням для закінчення реєстрації. Якщо ви не отримали лист, первірте "спам" або спробуйте ще раз.')
	}
	res.render('registerForm', { email })
	
	sendRegistrationLink(email)
}
