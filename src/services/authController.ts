import { db } from "../db/index.ts";
import {registration_invites, users} from "../db/schema.ts";
import { sesClient } from "../aws/ses.ts";
import { SendEmailCommand } from "@aws-sdk/client-ses";
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import {eq} from "drizzle-orm";
import jsonwebtoken from 'jsonwebtoken';
import type {JwtPayload} from 'jsonwebtoken';
import type {UserInformation} from "../types/auth.types.ts";

export const checkPasswordValidity = (password: string) => {
	const goodLength = password.length >= 8 && password.length <= 72

	const uppercaseAlphabet = "QWERTYUIOPASDFGHJKLZXCVBNMЙЦУКЕНГШЩЗФІВАПРОЛДЯЧСМИТЬБЮ"
	const numbers = "0123456789"

	let containsUppercase = false;
	let containsLowercase = false;
	let containsNumbers = false;
	for(let i = 0; i < password.length; i++) {
		for(let c = 0; c < uppercaseAlphabet.length; c++) {
			if(password.indexOf(uppercaseAlphabet[c]) != -1 && !containsUppercase) {
				containsUppercase = true;
			}
			if(password.indexOf(uppercaseAlphabet[c].toLowerCase()) != -1 && !containsLowercase) {
				containsLowercase = true;
			}
		}
		for(let d = 0; d < numbers.length; d++) {
			if(password.indexOf(numbers[d]) != -1) {
				containsNumbers = true;
				break
			}
		}
	}
	return goodLength && containsLowercase && containsUppercase && containsNumbers
}


const generateInvite = async (email: string) => {
	const uuid = crypto.randomUUID()
	const uuid_hash = crypto.createHash('sha256').update(uuid).digest('hex')
	const res = await db.insert(registration_invites).values({
		email: email,
		uuid_hash
	}).returning()
	return { row: res[0], uuid };
}

const deleteInvite = async (uuid_hash: string) => {
	try {
		await db.delete(registration_invites).where(eq(registration_invites.uuid_hash, uuid_hash))
		return true
	} catch(err) {
		console.error(err)
		return false
	}
}

const sendEmail = async (email: string, url: string) => {
	const command = new SendEmailCommand({
    	Source: "noreply@lpmonitor.org",
    	Destination: {
    		ToAddresses: [ email ],
    	},
    	Message: {
    		Subject: { Data: "Завершення реєстрації LPMonitor" },
    		Body: {
        		Text: { Data: `Натисніть на посилання, щоб завершити реєстрацію: <a href='${url}'>${url}</a>` },
      		},
    	},
	});

	try {
    	await sesClient.send(command);
		return { success: true }
  	} catch (err: any) {
	  	return { success: false, error: { code: err.name, message: err.message } }
	}
}

export const isEmailTaken = async (email: string) => {
	const invite = await db.query.registration_invites.findFirst({
		where: (registration_invites, { eq }) => eq(registration_invites.email, email)
	})
	
	if(invite && invite.expiresAt > new Date()) return true;
	
	const user = await db.query.users.findFirst({
		where: (users, { eq }) => eq(users.email, email)
	})

	if(user) { return true }
		
	return false
}

export const sendRegistrationLink = async (email: string) => {
	const emailTaken = await isEmailTaken(email)
	if(emailTaken) { return false }
	const invite = await generateInvite(email)
	const uuid = invite.uuid
	const url = `${process.env.APP_URL}/auth/register/${uuid}`
	if(process.env.NODE_ENV === 'production') {
		sendEmail(email, url)
	} else {
		console.log(`Made an invite for ${email}, with URL ${url}`)
	}
}

export const getInviteDetails = async (inviteUuid: string) => {
	const uuid_hash = crypto.createHash('sha256').update(inviteUuid).digest('hex')
	return await db.query.registration_invites.findFirst({
		where: (registration_invites, { eq }) => eq(registration_invites.uuid_hash, uuid_hash)
	})
}

export const createUser = async (inviteDetails: { email: string, uuid_hash: string, expiresAt: Date }, password: string) => {
	await deleteInvite(inviteDetails.uuid_hash)
	const saltRounds = 13;
	const hash = await bcrypt.hash(password, saltRounds);
		
	try {
		const user = (await db.insert(users).values({
			email: inviteDetails.email,
			passwordHash: hash
		}).returning())[0]
		return { success: true, user }
	} catch (err) {
		console.error(err)
		return { success: false }
	}
}

export const generateToken = (user_id: string) => {
	const payload = {
		uuid: user_id,
		jti: crypto.randomBytes(16).toString('hex')
	}
	return jsonwebtoken.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' })
}

export const verifyToken = (token: string) => {
	try {

		const payload = jsonwebtoken.verify(token, process.env.JWT_SECRET!) as JwtPayload
		if(typeof payload === "string") {
			return { provided: false }
		}
		return { provided: true, payload: payload }
	} catch {
		return { provided: false }
	}
}

export const fetchUser = async (uuid: string) => {
	try {
		const QueryResult = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, uuid),
			columns: {
				id: true,
				email: true,
				createdAt: true
			}
		}) as UserInformation
		return QueryResult ?? undefined
	} catch(error) {
		console.error(error)
		return undefined
	}
}

export const verifyUserExistence = async (email: string, password: string) => {
	try {
		const queryResult = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.email, email)
		})
		if(queryResult === undefined) {
			//Run a dummy hash to prevent basic timing attacks
			await bcrypt.compare(password, "$2a$13$wSkHvnpGrzegcXKiHkZLAOlmuyhW8ATa3XAQiBhGaApjLYG49EUCa")
			return { success: true, exists: false, passwordValid: false, user: undefined }
		}
		
		const isValid = await bcrypt.compare(password, queryResult.passwordHash)
		
		return { success: true, exists: true, passwordValid: isValid, user: isValid ? queryResult : undefined }
	} catch(error) {
		console.error(error)
		return { success: false, exists: false, passwordValid: false, user: undefined }
	}
}
