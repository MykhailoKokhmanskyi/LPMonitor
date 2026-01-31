import type { Request } from 'express';

export const fetchAlerts = (req: Request) => {
	return req.flash('alerts').map((m: string) => JSON.parse(m))
}
