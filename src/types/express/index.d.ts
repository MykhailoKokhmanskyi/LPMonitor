import { TokenInformation } from '../auth.types';
import { UserInformation } from '../auth.types';

declare global {
	namespace Express {
		interface Request {
			tokenInformation?: TokenInformation;
			userInformation?: UserInformation;
		}
	}
}
