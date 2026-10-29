import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { one, run } from "./db";

const COOKIE = "dicampus_session";
const SESSION_DAYS = 30;

export type User = { id: number; name: string; email: string; weekly_goal: number; role: "student" | "teacher"; isAdmin: boolean };

// Les administrateurs sont désignés par e-mail dans DICAMPUS_ADMIN_EMAILS (séparés par des virgules).
function adminEmails() {
  return (process.env.DICAMPUS_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  run("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)", token, userId, expires.toISOString());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) run("DELETE FROM sessions WHERE token = ?", token);
  jar.delete(COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const user = one<Omit<User, "isAdmin">>(
    `SELECT u.id, u.name, u.email, u.weekly_goal, u.role FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token = ? AND s.expires_at > ?`,
    token,
    new Date().toISOString(),
  );
  return user ? { ...user, isAdmin: adminEmails().includes(user.email) } : null;
}

/** Les administrateurs ont aussi les droits enseignant. */
export function canTeach(user: User | null) {
  return !!user && (user.role === "teacher" || user.isAdmin);
}

export async function requireTeacher(): Promise<User> {
  const user = await requireUser("/enseignant");
  if (!canTeach(user)) redirect("/enseignant");
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser("/admin/enseignants");
  if (!user.isAdmin) redirect("/");
  return user;
}

export async function requireUser(next?: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(next ? `/connexion?suite=${encodeURIComponent(next)}` : "/connexion");
  return user;
}
