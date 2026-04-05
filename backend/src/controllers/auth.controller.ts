import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Setup Initial Admin user if none exists (for ease of testing the assignment)
export const initAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminExists = await User.findOne({ email: 'admin@feedpulse.com' });
    if (adminExists) {
      res.status(400).json({ success: false, error: 'Admin already initialized.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Admin@123', salt);

    const newAdmin = new User({
      email: 'admin@feedpulse.com',
      passwordHash,
      name: 'Super Admin',
    });

    await newAdmin.save();
    res.status(201).json({ success: true, message: 'Admin created successfully. Login with admin@feedpulse.com / Admin@123' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Please provide email and password' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'super_secret_jwt_key_here',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      success: true,
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email },
      },
      message: 'Logged in successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
