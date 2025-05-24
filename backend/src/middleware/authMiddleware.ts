import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/User'; // Ensure IUser is exported from User.ts

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized. Please log in.' });
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as IUser; // Type assertion
  if (req.isAuthenticated() && user && user.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: 'Forbidden. Admin access required.' });
};

export const isStudent = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as IUser; // Type assertion
  if (req.isAuthenticated() && user && user.role === 'student') {
    return next();
  }
  res.status(403).json({ message: 'Forbidden. Student access required.' });
};

export const isStudentApproved = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as IUser; // Type assertion
  if (user && user.role === 'student' && user.isApproved) {
    return next();
  }
  if (user && user.role === 'admin') { // Admins bypass this check
    return next();
  }
  res.status(403).json({ message: 'Forbidden. Student account not yet approved by administrator.' });
};

// This is for initial admin setup if needed, or for admin creating other admins
export const canManageAdmins = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as IUser;
  // Example: Only the first admin or a superadmin can create other admins
  // For simplicity, we'll allow any admin to create another admin for now.
  // You might want to refine this based on specific requirements (e.g., only one primary admin)
  if (req.isAuthenticated() && user && user.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: 'Forbidden. Admin access required to manage admin accounts.' });
}