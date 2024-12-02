// Importing modules
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import db from "../models";
const User = db.users;

// Signup authentication
const signup = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { name, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    if (user) {
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET as string,
        {
          expiresIn: 1 * 24 * 60 * 60 * 1000,
        }
      );

      res.cookie("jwt", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });

      // Send user details
      return res.status(201).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      });
    } else {
      return res.status(409).json({ message: "Invalid user details" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Login authentication
const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;

    // Find a user by their email
    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (user) {
      const isSame = await bcrypt.compare(password, user.password);

      if (isSame) {
        const token = jwt.sign(
          { id: user.id },
          process.env.JWT_SECRET as string,
          {
            expiresIn: 1 * 24 * 60 * 60 * 1000,
          }
        );

        // Set the HTTP-only cookie for additional security
        res.cookie("jwt", token, {
          maxAge: 1 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
        });

        // Send user data and token in the response
        return res.status(200).json({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
          token,
        });
      } else {
        return res.status(401).json({ message: "Invalid password" });
      }
    } else {
      return res.status(401).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default { signup, login };
