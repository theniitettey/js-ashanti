import { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/auth';
import { fromNodeHeaders } from 'better-auth/node';

export const getSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Pass headers directly — the bearer() plugin in better-auth natively
        // reads the Authorization: Bearer <token> header, so no manual mapping needed.
        const headers = fromNodeHeaders(req.headers);

        const session = await auth.api.getSession({
            headers
        });

        if (session) {
            (req as any).session = session;
        }
        next();
    } catch (error) {
        next(error);
    }
};

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).session) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
};
