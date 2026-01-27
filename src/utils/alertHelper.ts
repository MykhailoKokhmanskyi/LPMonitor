import type { Response } from 'express';
import type { AlertCategory } from '../types/alerts';

export const addAlert = (res: Response, type: AlertCategory, title: string, msg: string) => {
	res.locals.alerts = res.locals.alerts || [];
	res.locals.alerts.push({title, type, msg});
}
