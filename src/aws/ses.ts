import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import dotenv from 'dotenv';
dotenv.config()

export const sesClient = new SESClient({ region: process.env.AWS_REGION });

const run = async (email: string) => {
};
