import jwt from 'jsonwebtoken';
import { JWTPayload, TokenResponse } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';

export const generateTokens = (payload: JWTPayload): TokenResponse => {
    const accessToken = jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        payload,
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): JWTPayload => {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
};
