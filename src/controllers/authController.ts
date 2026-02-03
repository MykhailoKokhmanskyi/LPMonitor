import type { Request, Response } from 'express';
import {verifyTurnstile} from '../utils/cfTurnstile.ts';
import {getInviteDetails, sendRegistrationLink} from '../services/authController.ts';
import {fetchAlerts} from '../utils/alertHelpter.ts';

export const registerForm = (req: Request, res: Response) => {
	res.render('registerForm', { alerts: fetchAlerts(req) });
}

export const register = async (req: Request, res: Response) => {
	const email = req.body.email
	const email_regex = /[a-zA-Z0-9.]+@lpnu\.ua/
	if(!email_regex.test(email)) {
		req.flash('alerts', JSON.stringify({
			title: 'Помилка',
			type: 'warning',
			msg: 'Електронна адреса не відповідає формату! Реєстрація можлива лише з електронною адресою @lpnu.ua'
		}))
	}

	const turnstile_valid = process.env.NODE_ENV === 'production' ? (await verifyTurnstile(req.body['cf-turnstile-response'], req.ip || "")).success : true;
	if(!turnstile_valid) {
		req.flash('alerts', JSON.stringify({
			title: 'Помилка',
			type: 'warning',
			msg: 'Ви не пройшли перевірку! Будь ласка, спробуйте ще раз.'
		}))
	} else {
		req.flash('alerts', JSON.stringify({
			title: 'Реєстрація',
			type: 'success',
			msg: 'На вашу електронну пошту було надіслано лист з посиланням для закінчення реєстрації. Якщо ви не отримали лист, первірте "спам" або спробуйте ще раз.'
		}))
	}
	res.render('registerForm', { email, alerts: fetchAlerts(req) })
	
	sendRegistrationLink(email)
}

export const registerPasswordForm = async (req: Request, res: Response) => {
	const inviteUuid = req.params['inviteUuid']
	console.log(inviteUuid as string)
	const inviteDetails = await getInviteDetails(inviteUuid as string)
	console.log(inviteDetails)
	res.render('registerPasswordForm', { alerts: fetchAlerts(req) })
}

export const registerPasswordSubmit = (req: Request, res: Response) => {

}
