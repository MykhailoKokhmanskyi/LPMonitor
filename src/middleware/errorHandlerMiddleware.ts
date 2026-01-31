import type {ErrorRequestHandler} from "express";
import {fetchAlerts} from "../utils/alertHelpter.ts";

export const errorHandlerMiddleware: ErrorRequestHandler = (err,req,res,_next) => {
	if(err.code === 'EBADCSRFTOKEN') {
		console.warn(`Bad CSRF Token detected for ${req.ip}`)
		
		req.flash('alerts', JSON.stringify({title: 'Помилка', type: 'danger', msg: 'Термін дії сесії вичерпано. Будь ласка, оновіть сторінку та спробуйте ще раз.'}))
		return res.redirect(req.get('Referrer') || '/');
	}
	console.error("SERVER ERROR:", err.message)
	const status = err.status || 500;
	res.status(status).render('error', { alerts: fetchAlerts(req), 'content_title': 'Помилка сервера', "message": "Сталась невідома помилка. Будь ласка спробуйте пізніше, або повідомте про проблему в телеграм-боті @lpmonitor_bot", 'status_code': 500})
}
