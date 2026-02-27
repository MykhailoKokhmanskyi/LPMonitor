import type {Request, Response, NextFunction} from "express"
import {verifyToken} from "../services/authController.ts"
import type {TokenInformation} from "../types/auth.types.ts"
import {fetchUser} from '../services/authController.ts'

export const userMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
	const token = req.signedCookies['token']
	const authorizationData = verifyToken(token) as TokenInformation

	if(!authorizationData.provided) { next(); return }
	req.tokenInformation = authorizationData
	req.userInformation = await fetchUser(authorizationData.payload.uuid)
	next()
}
