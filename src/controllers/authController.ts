import type { Request, Response } from 'express';
import {verifyTurnstile} from '../utils/cfTurnstile.ts';
import {createUser, getInviteDetails, sendRegistrationLink, checkPasswordValidity, generateToken} from '../services/authController.ts';
import {fetchAlerts} from '../utils/alertHelpter.ts';

export const registerForm = (req: Request, res: Response) => {
	console.log(req.tokenInformation, req.userInformation)
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
		sendRegistrationLink(email)
	}
	res.render('registerForm', { email, alerts: fetchAlerts(req) })
	
}

export const registerPasswordForm = async (req: Request, res: Response) => {
	const inviteUuid = req.params['inviteUuid']
	const inviteDetails = await getInviteDetails(inviteUuid as string)
	if(inviteDetails === undefined || inviteDetails.expiresAt <= new Date()) {
		return res.render('registrationInviteInvalid', { alerts: fetchAlerts(req) })
	}
	res.render('registerPasswordForm', { email: inviteDetails.email, alerts: fetchAlerts(req) })
}

export const registerPasswordSubmit = async (req: Request, res: Response) => {
	const inviteUuid = req.params['inviteUuid']
	const inviteDetails = await getInviteDetails(inviteUuid as string)
	if(inviteDetails === undefined || inviteDetails.expiresAt <= new Date()) {
		return res.render('registrationInviteInvalid', { alerts: fetchAlerts(req) })
	}
	const password = req.body.password
	const passwordValid = checkPasswordValidity(password)

	if(!passwordValid) {
		req.flash('alerts', JSON.stringify({
			title: 'Помилка',
			type: 'warning',
			msg: 'Ваш пароль не відповідає вимогам! Пароль повинен містити не менше 8 не більше 72 символів, містити як мінімум одну малу букву, одну велику букву, одну цифру.'
		}))
		return res.render('registraterPasswordForm', { alerts: fetchAlerts(req) })
	}
	
	const turnstile_valid = process.env.NODE_ENV === 'production' ? (await verifyTurnstile(req.body['cf-turnstile-response'], req.ip || "")).success : true;
	if(!turnstile_valid) {
		req.flash('alerts', JSON.stringify({
			title: 'Помилка',
			type: 'warning',
			msg: 'Ви не пройшли перевірку! Будь ласка, спробуйте ще раз.'
		}))
		return res.render('registraterPasswordForm', { alerts: fetchAlerts(req) })
	}
	
	const user = await createUser(inviteDetails, password)
	if(user.success == false) {
		req.flash('alerts', JSON.stringify({
			title: 'Помилка',
			type: 'warning',
			msg: 'Сталась помилка під час створення акаунта! Будь ласка, спробуйте знову.'
		}))
		return res.redirect('/auth/register')
	}
	const token = generateToken(user.user!.id)

	const expires = 7 * 24 * 60 * 60 * 1000
	res.cookie('token', token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: "lax",
		signed: true,
		maxAge: expires,
	})
	req.flash('alerts', JSON.stringify({
		title: 'Реєстрація успішна',
		type: 'success',
		msg: 'Реєстрацію успішно завершено!'
	}))
	res.redirect('/')
	
}
