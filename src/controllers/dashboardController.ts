import {fetchAlerts} from "../utils/alertHelpter.ts"
import type {Request, Response} from 'express'

export const index = (req: Request, res: Response) => {
	res.render("dashboardIndex", { alerts: fetchAlerts(req) })
}
