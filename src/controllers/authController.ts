import type { Request, Response } from 'express';
import { addAlert } from '../utils/alertHelper.ts';

export const registerForm = (req: Request, res: Response) => {
	res.render('registerForm');
}

export const register = (req: Request, res: Response) => {
	const email = req.body.email
	addAlert(res, 'success', 'Реєстрація', 'На вашу електронну пошту було надіслано лист з посиланням для закінчення реєстрації. Якщо ви не отримали лист, первірте "спам" або спробуйте ще раз.')
	res.render('registerForm', { email })
}
