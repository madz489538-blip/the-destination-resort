import { db } from './db.js';
import crypto from 'node:crypto';

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

export function verifyAdminCredentials(username: string, password: string): { user?: any; error?: string } {
  if (!username || !password) {
    return { error: 'Username and password are required.' };
  }

  const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username) as any;
  if (!user) {
    return { error: 'Invalid credentials.' };
  }

  const hashed = hashPassword(password, user.salt);
  if (hashed !== user.password_hash) {
    return { error: 'Invalid credentials.' };
  }

  // Update last login
  db.prepare('UPDATE admin_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  };
}

export function createAdminSession(adminId: number): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  db.prepare(`
    INSERT INTO admin_sessions (token, admin_id, expires_at)
    VALUES (?, ?, ?)
  `).run(token, adminId, expiresAt);

  return token;
}

export function validateAdminSession(token: string): { admin?: any; valid: boolean } {
  if (!token) return { valid: false };

  const session = db.prepare(`
    SELECT s.*, u.username, u.email, u.role
    FROM admin_sessions s
    JOIN admin_users u ON u.id = s.admin_id
    WHERE s.token = ? AND s.expires_at > CURRENT_TIMESTAMP
  `).get(token) as any;

  if (!session) {
    return { valid: false };
  }

  return {
    valid: true,
    admin: {
      id: session.admin_id,
      username: session.username,
      email: session.email,
      role: session.role,
    },
  };
}

export function destroyAdminSession(token: string) {
  if (token) {
    db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
  }
}

export function updateAdminPassword(adminId: number, currentPass: string, newPass: string): { success: boolean; error?: string } {
  if (!newPass || newPass.length < 8) {
    return { success: false, error: 'New password must be at least 8 characters long.' };
  }

  const user = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(adminId) as any;
  if (!user) {
    return { success: false, error: 'User not found.' };
  }

  const currentHashed = hashPassword(currentPass, user.salt);
  if (currentHashed !== user.password_hash) {
    return { success: false, error: 'Current password is incorrect.' };
  }

  const newSalt = crypto.randomBytes(16).toString('hex');
  const newHashed = hashPassword(newPass, newSalt);

  db.prepare('UPDATE admin_users SET password_hash = ?, salt = ? WHERE id = ?').run(newHashed, newSalt, adminId);
  return { success: true };
}
