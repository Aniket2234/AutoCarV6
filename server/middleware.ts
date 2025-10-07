import { Request, Response, NextFunction } from 'express';
import { hasPermission } from './auth';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!(req as any).session?.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).session?.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!allowedRoles.includes((req as any).session?.userRole || '')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}

export function requirePermission(resource: string, action: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).session?.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const userRole = (req as any).session?.userRole;
    if (!hasPermission(userRole, resource, action)) {
      return res.status(403).json({ error: 'Insufficient permissions for this action' });
    }
    
    next();
  };
}

export function attachUser(req: Request, res: Response, next: NextFunction) {
  const session = (req as any).session;
  if (session?.userId) {
    (req as any).user = {
      id: session.userId,
      role: session.userRole,
      name: session.userName,
      email: session.userEmail,
    };
  }
  next();
}
