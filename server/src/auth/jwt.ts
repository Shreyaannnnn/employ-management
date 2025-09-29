import jwt, { Secret, SignOptions } from 'jsonwebtoken';

const JWT_SECRET: Secret = (process.env.JWT_SECRET || 'dev-secret-change-me') as Secret;
const RAW_EXPIRES = process.env.JWT_EXPIRES_IN || '1d';
const JWT_EXPIRES_IN: SignOptions['expiresIn'] =
  typeof RAW_EXPIRES === 'string' && /^\d+$/.test(RAW_EXPIRES)
    ? Number(RAW_EXPIRES)
    : (RAW_EXPIRES as unknown as SignOptions['expiresIn']);

export interface JwtPayload {
  userId: number;
  email: string;
}

export function signToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}


