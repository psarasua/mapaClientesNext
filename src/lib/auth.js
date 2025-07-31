import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from './config.js';

const SALT_ROUNDS = 12;

// Hashear contraseña
export async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

// Verificar contraseña
export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// Generar JWT token
export function generateToken(user) {
  const payload = {
    id: user.id,
    usuario: user.usuario
  };

  return jwt.sign(payload, config.jwt.secret, { 
    expiresIn: config.jwt.expiresIn 
  });
}

// Verificar JWT token
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    return { valid: true, data: decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

// Middleware de autenticación para API routes
export function requireAuth(handler) {
  return async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'Token de acceso requerido' });
      }

      const { valid, data, error } = verifyToken(token);
      
      if (!valid) {
        return res.status(401).json({ error: 'Token inválido' });
      }

      // Agregar datos del usuario a la request
      req.user = data;
      
      return handler(req, res);
    } catch (error) {
      return res.status(500).json({ error: 'Error de autenticación' });
    }
  };
}

// Validar contraseña
export function isValidPassword(password) {
  return password && password.length >= 6;
}

// Generar token de reset - simplificado
export function generateResetToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const authUtils = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  requireAuth,
  isValidPassword,
  generateResetToken
};

export default authUtils;
