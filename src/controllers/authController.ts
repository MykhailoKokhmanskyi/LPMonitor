import type { Request, Response } from 'express';
import { addAlert } from '../utils/alertHelper.ts';
import {verifyTurnstile} from '../utils/cfTurnstile.ts';

export const registerForm = (req: Request, res: Response) => {
	res.render('registerForm');
}

export const register = async (req: Request, res: Response) => {
	const email = req.body.email
	const turnstile_result = await verifyTurnstile(req.body['cf-turnstile-response'], req.ip || "")
	console.log(turnstile_result)
	addAlert(res, 'success', 'Реєстрація', 'На вашу електронну пошту було надіслано лист з посиланням для закінчення реєстрації. Якщо ви не отримали лист, первірте "спам" або спробуйте ще раз.')
	res.render('registerForm', { email })
}
