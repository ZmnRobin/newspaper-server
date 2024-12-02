import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: any;
}

const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // Check Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // If not in header, check cookie
  if (!token) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res
      .status(403)
      .send("Access denied. No token provided in header or cookie.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).send("Invalid token.");
  }
};
export default verifyToken;
