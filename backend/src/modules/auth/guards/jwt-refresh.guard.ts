import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
	/**
	 * Nest calls this after the strategy validates the token. We add a small safety
	 * check so tests (and production) fail fast when the user payload is missing
	 * mandatory fields.
	 */
	handleRequest(err: any, user: any, _info?: any, _context?: any): any {
		if (err || !user) {
			throw err || new UnauthorizedException();
		}

		if (user.tokenVersion === undefined || user.tokenVersion === null) {
			throw new UnauthorizedException('Refresh token version missing');
		}

		return user;
	}
}








