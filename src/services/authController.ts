import { db } from "../db/index.ts";
import {registration_invites} from "../db/schema.ts";
import { sesClient } from "../aws/ses.ts";
import { SendEmailCommand } from "@aws-sdk/client-ses";

const generateInvite = async (email: string) => {
	const res = await db.insert(registration_invites).values({
		email: email
	}).returning()
	return res[0];
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
	const uuid = invite.invite_uuid
	const url = `${process.env.APP_URL}/auth/register/${uuid}`
	if(process.env.NODE_ENV === 'production') {
		sendEmail(email, url)
	} else {
		console.log(`Made an invite for ${email}, with URL ${url}`)
	}
}
