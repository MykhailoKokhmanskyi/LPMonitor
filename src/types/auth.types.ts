import type {JwtPayload} from "jsonwebtoken";

export interface TokenInformation {
	provided: boolean;
	payload: JwtPayload;
}

export interface UserInformation {
	id: string,
	email: string,
	createdAt: Date | null,
}
