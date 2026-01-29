import dotenv from 'dotenv';
dotenv.config()

export const verifyTurnstile = async (token: string, remoteip: string) => {
	const formData = new FormData();
	formData.append('secret', process.env.CF_TURNSTILE_SECRET || "");
	formData.append('response', token);
	formData.append('remoteip', remoteip);

    try {
    	const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        	method: 'POST',
            body: formData
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Turnstile validation error:', error);
        return { success: false, 'error-codes': ['internal-error'] };
    }
}
