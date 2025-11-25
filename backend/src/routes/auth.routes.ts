import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

const router = Router();
const prisma = new PrismaClient();

// Configure Google OAuth
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            callbackURL: process.env.GOOGLE_CALLBACK_URL || '',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0].value;
                if (!email) {
                    return done(new Error('No email from Google'), undefined);
                }

                let user = await prisma.user.findUnique({
                    where: { googleId: profile.id },
                });

                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            email,
                            googleId: profile.id,
                            fullName: profile.displayName,
                            avatarUrl: profile.photos?.[0].value,
                        },
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error as Error, undefined);
            }
        }
    )
);

// Register
router.post(
    '/register',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 6 }),
        body('fullName').trim().notEmpty(),
    ],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password, fullName, phone } = req.body;

            // Check if user exists
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });

            if (existingUser) {
                return res.status(400).json({ error: 'Email already registered' });
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);

            // Create user
            const user = await prisma.user.create({
                data: {
                    email,
                    passwordHash,
                    fullName,
                    phone,
                },
            });

            // Generate tokens
            const tokens = generateTokens({
                id: user.id,
                email: user.email,
                role: user.role,
            });

            res.status(201).json({
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                },
                ...tokens,
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Registration failed' });
        }
    }
);

// Login
router.post(
    '/login',
    [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;

            // Find user
            const user = await prisma.user.findUnique({
                where: { email },
            });

            if (!user || !user.passwordHash) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.passwordHash);

            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate tokens
            const tokens = generateTokens({
                id: user.id,
                email: user.email,
                role: user.role,
            });

            res.json({
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    avatarUrl: user.avatarUrl,
                    role: user.role,
                },
                ...tokens,
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    }
);

// Refresh token
router.post('/refresh', async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token required' });
        }

        const payload = verifyRefreshToken(refreshToken);

        const user = await prisma.user.findUnique({
            where: { id: payload.id },
        });

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        const tokens = generateTokens({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        res.json(tokens);
    } catch (error) {
        res.status(401).json({ error: 'Invalid refresh token' });
    }
});

// Google OAuth routes
router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
    '/google/callback',
    passport.authenticate('google', { session: false }),
    (req: Request, res: Response) => {
        const user = req.user as any;

        const tokens = generateTokens({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        // Redirect to mobile app with tokens using Deep Link
        // Scheme: mechanicalshop
        // Path: auth-callback
        const deepLink = `mechanicalshop://auth-callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}&user=${encodeURIComponent(JSON.stringify({
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            avatarUrl: user.avatarUrl,
            role: user.role
        }))}`;

        res.redirect(deepLink);
    }
);

// Google Mobile Login (ID Token)
router.post('/google-mobile', async (req: Request, res: Response) => {
    try {
        const { idToken } = req.body;
        const { OAuth2Client } = require('google-auth-library');
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(400).json({ error: 'Invalid Google token' });
        }

        const { email, sub: googleId, name, picture } = payload;

        if (!email) {
            return res.status(400).json({ error: 'Email not found in Google token' });
        }

        // Find or create user
        let user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    googleId,
                    fullName: name || 'Google User',
                    avatarUrl: picture,
                    passwordHash: '', // No password for Google users
                },
            });
        } else if (!user.googleId) {
            // Link Google account to existing email
            user = await prisma.user.update({
                where: { id: user.id },
                data: { googleId, avatarUrl: picture },
            });
        }

        const tokens = generateTokens({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        res.json({
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                avatarUrl: user.avatarUrl,
                role: user.role,
            },
            ...tokens,
        });
    } catch (error) {
        console.error('Google mobile login error:', error);
        res.status(500).json({ error: 'Google login failed' });
    }
});

export default router;
