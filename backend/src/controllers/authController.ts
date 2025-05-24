import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import User, { IUser } from '../models/User';
import { body, validationResult } from 'express-validator';

// Admin Registration (could be a one-time setup or restricted)
export const registerAdmin = [
  body('email').isEmail().withMessage('Please enter a valid email.'),
  body('name').notEmpty().withMessage('Name is required.'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
    .matches(/\d/).withMessage('Password must contain a number.')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter.')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter.')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain a special character.'),

  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, name, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'Admin with this email already exists.' });
      }
      
      // For initial setup, you might check if ANY admin exists.
      // const adminCount = await User.countDocuments({ role: 'admin' });
      // if (adminCount > 0 && !(req.user as IUser)?.role === 'admin') { // Or a more specific check
      //   return res.status(403).json({ message: 'Cannot register new admin.' });
      // }

      user = new User({
        email,
        name,
        password, // Hashing is done by pre-save hook in User model
        role: 'admin',
        isApproved: true, // Admins are auto-approved
      });
      await user.save();
      
      // Log in the new admin immediately
      req.login(user, (err) => {
        if (err) return next(err);
        const userResponse = { id: user.id, name: user.name, email: user.email, role: user.role, profilePictureUrl: user.profilePictureUrl, isApproved: user.isApproved };
        return res.status(201).json({ message: 'Admin registered and logged in successfully.', user: userResponse });
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error during admin registration.' });
    }
  }
];

export const loginAdmin = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('admin-local', (err: any, user: IUser | false, info: any) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: info?.message || 'Login failed' });

    req.logIn(user, (err) => {
      if (err) return next(err);
      const userResponse = { id: user.id, name: user.name, email: user.email, role: user.role, profilePictureUrl: user.profilePictureUrl, isApproved: user.isApproved };
      return res.json({ message: 'Admin logged in successfully', user: userResponse });
    });
  })(req, res, next);
};

// Google OAuth Initiator
export const googleLogin = passport.authenticate('google', { scope: ['profile', 'email'] });

// Google OAuth Callback
export const googleCallback = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', (err: any, user: IUser | false, info: any) => {
    if (err) {
        console.error("Google Auth Error:", err);
        return res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed`);
    }
    if (!user) {
        console.error("Google Auth Info:", info);
        return res.redirect(`${process.env.CLIENT_URL}/login?error=no_user_returned`);
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error("Session Login Error:", loginErr);
        return res.redirect(`${process.env.CLIENT_URL}/login?error=session_login_failed`);
      }
      // Redirect to a page that indicates success or to the main app page
      // Pass user info or status if needed, or handle on client side by fetching current user
      const approvalStatus = user.isApproved ? 'approved' : 'pending_approval';
      return res.redirect(`${process.env.CLIENT_URL}/auth/callback?status=${approvalStatus}`);
    });
  })(req, res, next);
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((destroyErr) => {
        if (destroyErr) {
            // Log error but still try to send success response as logout mostly succeeded
            console.error("Session destruction error:", destroyErr);
        }
        res.clearCookie('connect.sid'); // Default session cookie name
        res.status(200).json({ message: 'Logged out successfully' });
    });
  });
};

export const getCurrentUser = (req: Request, res: Response) => {
  if (req.isAuthenticated() && req.user) {
    const user = req.user as IUser; // Cast to IUser
    // Send a subset of user data, excluding sensitive info like password hash
    const userResponse = { id: user.id, name: user.name, email: user.email, role: user.role, profilePictureUrl: user.profilePictureUrl, isApproved: user.isApproved };
    res.json(userResponse);
  } else {
    res.status(401).json(null); // Or an empty object, depending on client expectation
  }
};

// Admin: List pending student approvals
export const getPendingStudents = async (req: Request, res: Response) => {
  try {
    const pendingStudents = await User.find({ role: 'student', isApproved: false })
                                      .select('name email profilePictureUrl createdAt');
    res.json(pendingStudents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching pending students.' });
  }
};

// Admin: Approve a student
export const approveStudent = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.studentId;
    const student = await User.findById(studentId);

    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found or user is not a student.' });
    }

    if (student.isApproved) {
      return res.status(400).json({ message: 'Student is already approved.' });
    }

    student.isApproved = true;
    await student.save();
    res.json({ message: `Student ${student.name} approved successfully.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error approving student.' });
  }
};

// Password recovery functionality (basic implementation)
// For a full implementation, you'd generate a token, store it with expiry, and send an email.
export const requestPasswordResetAdmin = async (req: Request, res: Response) => {
    // This is a placeholder. Real implementation needs crypto token, email service.
    const { email } = req.body;
    const admin = await User.findOne({ email, role: 'admin' });
    if (!admin) {
        return res.status(404).json({ message: "Admin not found or email not for an admin account." });
    }
    // TODO: Generate reset token, save it with expiry, send email with reset link
    console.log(`Password reset requested for admin: ${email}. Token generation and email sending not implemented.`);
    res.status(200).json({ message: "If an admin account with this email exists, a password reset link will be sent (not really, this is a stub)." });
};

export const resetPasswordAdmin = async (req: Request, res: Response) => {
    // This is a placeholder. Real implementation needs token verification.
    const { token, newPassword } = req.body; // Token would be a URL param usually
    // TODO: Verify token, find user, update password
    console.log(`Password reset attempt with token ${token}. Password update not implemented.`);
    res.status(500).json({ message: "Password reset functionality not fully implemented." });
};