import { Request, Response, NextFunction } from 'express';

const MOCK_USERS: Record<string, { username: string, role: string }> = {
  'admin-secret-token': { username: 'admin_user', role: 'admin' },
  'contrib-secret-token': { username: 'volunteer_1', role: 'contributor' }
};

// 2. Authentication Middleware
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  const user = MOCK_USERS[token];

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  res.locals.user = user;
  next();
};

// 3. Authorization Middleware
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;

    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ 
        error: `Forbidden: Requires one of roles: ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
};