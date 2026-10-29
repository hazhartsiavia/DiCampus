import "server-only";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import * as seed from "./seed-data";
import * as cn from "./courses/communaute-numerique";

const DB_PATH = path.join(process.cwd(), "data", "dicampus.db");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS domains (
  id INTEGER PRIMARY KEY, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
  description TEXT NOT NULL, icon TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS partners (
  id INTEGER PRIMARY KEY, slug TEXT UNIQUE NOT NULL, short TEXT NOT NULL, name TEXT NOT NULL,
  kind TEXT NOT NULL, description TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS instructors (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, title TEXT NOT NULL,
  partner_id INTEGER NOT NULL REFERENCES partners(id)
);
CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL,
  subtitle TEXT NOT NULL, description TEXT NOT NULL,
  domain_id INTEGER NOT NULL REFERENCES domains(id),
  partner_id INTEGER NOT NULL REFERENCES partners(id),
  instructor_id INTEGER NOT NULL REFERENCES instructors(id),
  level TEXT NOT NULL, hours INTEGER NOT NULL, hue INTEGER NOT NULL,
  outcomes TEXT NOT NULL, skills TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS modules (
  id INTEGER PRIMARY KEY, course_id INTEGER NOT NULL REFERENCES courses(id),
  position INTEGER NOT NULL, title TEXT NOT NULL, summary TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY, module_id INTEGER NOT NULL REFERENCES modules(id),
  position INTEGER NOT NULL, kind TEXT NOT NULL, title TEXT NOT NULL,
  minutes INTEGER NOT NULL, content TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS specializations (
  id INTEGER PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL,
  description TEXT NOT NULL,
  partner_id INTEGER NOT NULL REFERENCES partners(id),
  domain_id INTEGER NOT NULL REFERENCES domains(id)
);
CREATE TABLE IF NOT EXISTS specialization_courses (
  specialization_id INTEGER NOT NULL REFERENCES specializations(id),
  course_id INTEGER NOT NULL REFERENCES courses(id),
  position INTEGER NOT NULL,
  PRIMARY KEY (specialization_id, course_id)
);
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, weekly_goal INTEGER NOT NULL DEFAULT 3,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS enrollments (
  user_id INTEGER NOT NULL REFERENCES users(id),
  course_id INTEGER NOT NULL REFERENCES courses(id),
  enrolled_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT, certificate_code TEXT UNIQUE,
  PRIMARY KEY (user_id, course_id)
);
CREATE TABLE IF NOT EXISTS progress (
  user_id INTEGER NOT NULL REFERENCES users(id),
  item_id INTEGER NOT NULL REFERENCES items(id),
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, item_id)
);
CREATE TABLE IF NOT EXISTS saved (
  user_id INTEGER NOT NULL REFERENCES users(id),
  course_id INTEGER NOT NULL REFERENCES courses(id),
  saved_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, course_id)
);
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  course_id INTEGER NOT NULL REFERENCES courses(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (user_id, course_id)
);
CREATE TABLE IF NOT EXISTS teacher_requests (
  id INTEGER PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
  partner_id INTEGER NOT NULL REFERENCES partners(id),
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'refused')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  decided_at TEXT
);
CREATE TABLE IF NOT EXISTS exams (
  id INTEGER PRIMARY KEY,
  course_id INTEGER UNIQUE NOT NULL REFERENCES courses(id),
  title TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  penalty_minutes INTEGER NOT NULL,
  max_switches INTEGER NOT NULL,
  questions TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS exam_attempts (
  id INTEGER PRIMARY KEY,
  exam_id INTEGER NOT NULL REFERENCES exams(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  started_at TEXT NOT NULL,
  deadline_at TEXT NOT NULL,
  finished_at TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'expired', 'terminated')),
  switches INTEGER NOT NULL DEFAULT 0,
  layout TEXT NOT NULL,
  answers TEXT NOT NULL DEFAULT '{}',
  correct INTEGER,
  total INTEGER,
  score REAL,
  events TEXT NOT NULL DEFAULT '[]',
  UNIQUE (exam_id, user_id)
);
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY,
  item_id INTEGER NOT NULL REFERENCES items(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  text TEXT NOT NULL,
  link TEXT,
  submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
  grade REAL,
  feedback TEXT,
  graded_at TEXT,
  UNIQUE (item_id, user_id)
);
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`;

// Colonnes ajoutées après la première version : ajoutées aux bases existantes sans perte de données.
const ADDED_COLUMNS: [table: string, column: string, definition: string][] = [
  ["users", "role", "TEXT NOT NULL DEFAULT 'student'"],
  ["courses", "owner_id", "INTEGER REFERENCES users(id)"],
  ["courses", "status", "TEXT NOT NULL DEFAULT 'published'"],
  ["courses", "created_at", "TEXT"],
  ["instructors", "user_id", "INTEGER REFERENCES users(id)"],
  ["items", "video_url", "TEXT"],
  ["exams", "is_open", "INTEGER NOT NULL DEFAULT 1"],
  // Profil demandé à l'inscription (vide pour les comptes créés avant).
  ["users", "first_name", "TEXT"],
  ["users", "last_name", "TEXT"],
  ["users", "university", "TEXT"],
  ["users", "program", "TEXT"],
  ["users", "study_level", "TEXT"],
];

function migrate(db: DatabaseSync) {
  for (const [table, column, definition] of ADDED_COLUMNS) {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
    if (!columns.some((c) => c.name === column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

export type QuizQuestion = { question: string; options: string[]; answer: number };

// Chaque module donne une vidéo, une lecture et un quiz construits à partir de ses points clés.
// Les mauvaises réponses du quiz sont des points clés d'autres cours.
function buildItems(courseIndex: number, moduleIndex: number, mod: seed.SeedModule) {
  const otherPoints = seed.courses
    .filter((_, i) => i !== courseIndex)
    .flatMap((c) => c.modules.flatMap((m) => m.points));

  const video = {
    kind: "video",
    title: `${mod.title} : présentation`,
    minutes: 8,
    content: [
      `Dans cette vidéo, nous abordons « ${mod.title.toLowerCase()} ». ${mod.summary}`,
      ...mod.points.map((p) => `${p}.`),
      "Prenez quelques notes : la lecture suivante reprend ces idées en détail.",
    ].join("\n\n"),
  };

  const reading = {
    kind: "reading",
    title: `À retenir : ${mod.title.toLowerCase()}`,
    minutes: 10,
    content: [
      `${mod.summary} Voici les trois idées essentielles de ce module.`,
      ...mod.points.map((p, i) => `**${i + 1}.** ${p}.`),
      "Pour aller plus loin, essayez d'expliquer chacune de ces idées avec vos propres mots avant de passer au quiz.",
    ].join("\n\n"),
  };

  const questions: QuizQuestion[] = mod.points.map((point, i) => {
    const seedIndex = (courseIndex * 31 + moduleIndex * 7 + i * 13) % otherPoints.length;
    const distractors = [otherPoints[seedIndex], otherPoints[(seedIndex + 17) % otherPoints.length]];
    const answer = (courseIndex + moduleIndex + i) % 3;
    const options = [...distractors];
    options.splice(answer, 0, point);
    return { question: `Laquelle de ces affirmations a été présentée dans le module « ${mod.title} » ?`, options, answer };
  });

  const quiz = { kind: "quiz", title: `Quiz : ${mod.title.toLowerCase()}`, minutes: 5, content: JSON.stringify(questions) };

  return [video, reading, quiz];
}

function seedDatabase(db: DatabaseSync) {
  const count = db.prepare("SELECT COUNT(*) AS n FROM courses").get() as { n: number };
  if (count.n > 0) return;

  db.exec("BEGIN");
  try {
    const domainIds = new Map<string, number | bigint>();
    const insertDomain = db.prepare("INSERT INTO domains (slug, name, description, icon) VALUES (?, ?, ?, ?)");
    for (const d of seed.domains) domainIds.set(d.slug, insertDomain.run(d.slug, d.name, d.description, d.icon).lastInsertRowid);

    const partnerIds = new Map<string, number | bigint>();
    const insertPartner = db.prepare("INSERT INTO partners (slug, short, name, kind, description) VALUES (?, ?, ?, ?, ?)");
    for (const p of seed.partners) partnerIds.set(p.slug, insertPartner.run(p.slug, p.short, p.name, p.kind, p.description).lastInsertRowid);

    const instructorIds = new Map<string, number | bigint>();
    const insertInstructor = db.prepare("INSERT INTO instructors (name, title, partner_id) VALUES (?, ?, ?)");
    for (const i of seed.instructors) instructorIds.set(i.name, insertInstructor.run(i.name, i.title, partnerIds.get(i.partner)!).lastInsertRowid);

    const courseIds = new Map<string, number | bigint>();
    const insertCourse = db.prepare(
      `INSERT INTO courses (slug, title, subtitle, description, domain_id, partner_id, instructor_id, level, hours, hue, outcomes, skills)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    const insertModule = db.prepare("INSERT INTO modules (course_id, position, title, summary) VALUES (?, ?, ?, ?)");
    const insertItem = db.prepare("INSERT INTO items (module_id, position, kind, title, minutes, content) VALUES (?, ?, ?, ?, ?, ?)");

    seed.courses.forEach((c, ci) => {
      const courseId = insertCourse.run(
        c.slug, c.title, c.subtitle, c.description,
        domainIds.get(c.domain)!, partnerIds.get(c.partner)!, instructorIds.get(c.instructor)!,
        c.level, c.hours, c.hue, JSON.stringify(c.outcomes), JSON.stringify(c.skills),
      ).lastInsertRowid;
      courseIds.set(c.slug, courseId);
      c.modules.forEach((m, mi) => {
        const moduleId = insertModule.run(courseId, mi + 1, m.title, m.summary).lastInsertRowid;
        buildItems(ci, mi, m).forEach((item, ii) => insertItem.run(moduleId, ii + 1, item.kind, item.title, item.minutes, item.content));
      });
    });

    const insertSpec = db.prepare("INSERT INTO specializations (slug, title, description, partner_id, domain_id) VALUES (?, ?, ?, ?, ?)");
    const insertSpecCourse = db.prepare("INSERT INTO specialization_courses (specialization_id, course_id, position) VALUES (?, ?, ?)");
    for (const s of seed.specializations) {
      const specId = insertSpec.run(s.slug, s.title, s.description, partnerIds.get(s.partner)!, domainIds.get(s.domain)!).lastInsertRowid;
      s.courses.forEach((slug, i) => insertSpecCourse.run(specId, courseIds.get(slug)!, i + 1));
    }
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

// Ajouté après coup : inséré dans les bases existantes s'il n'y est pas encore.
function seedCommunauteNumerique(db: DatabaseSync) {
  if (db.prepare("SELECT 1 FROM courses WHERE slug = ?").get(cn.COURSE.slug)) return;
  const c = cn.COURSE;
  const id = (table: string, slug: string) => (db.prepare(`SELECT id FROM ${table} WHERE slug = ?`).get(slug) as { id: number }).id;
  const instructor = db.prepare("SELECT id FROM instructors WHERE name = ?").get(c.instructor) as { id: number };
  db.exec("BEGIN");
  try {
    const courseId = db.prepare(
      `INSERT INTO courses (slug, title, subtitle, description, domain_id, partner_id, instructor_id, level, hours, hue, outcomes, skills, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', datetime('now'))`,
    ).run(
      c.slug, c.title, c.subtitle, c.description, id("domains", c.domain), id("partners", c.partner), instructor.id,
      c.level, c.hours, c.hue, JSON.stringify(c.outcomes), JSON.stringify(c.skills),
    ).lastInsertRowid;
    const insertModule = db.prepare("INSERT INTO modules (course_id, position, title, summary) VALUES (?, ?, ?, ?)");
    const insertItem = db.prepare("INSERT INTO items (module_id, position, kind, title, minutes, content) VALUES (?, ?, ?, ?, ?, ?)");
    cn.buildModules().forEach((m, mi) => {
      const moduleId = insertModule.run(courseId, mi + 1, m.title, m.summary).lastInsertRowid;
      m.items.forEach((it, ii) => insertItem.run(moduleId, ii + 1, it.kind, it.title, it.minutes, it.content));
    });
    const e = cn.EXAM;
    db.prepare("INSERT INTO exams (course_id, title, duration_minutes, penalty_minutes, max_switches, questions) VALUES (?, ?, ?, ?, ?, ?)")
      .run(courseId, e.title, e.durationMinutes, e.penaltyMinutes, e.maxSwitches, JSON.stringify(e.questions));
    db.prepare("INSERT OR REPLACE INTO meta (key, value) VALUES ('communaute-numerique', ?)").run(String(cn.CONTENT_VERSION));
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

// Quand le contenu du cours change (CONTENT_VERSION), la base existante est mise à jour :
// les éléments sont retrouvés par titre (progression conservée), les nouveaux sont insérés,
// et les éléments ajoutés par l'enseignant restent en fin de séance.
function syncCommunauteNumerique(db: DatabaseSync) {
  const stored = db.prepare("SELECT value FROM meta WHERE key = 'communaute-numerique'").get() as { value: string } | undefined;
  if (Number(stored?.value ?? 1) >= cn.CONTENT_VERSION) return;
  const course = db.prepare("SELECT id FROM courses WHERE slug = ?").get(cn.COURSE.slug) as { id: number } | undefined;
  if (!course) return;
  db.exec("BEGIN");
  try {
    const c = cn.COURSE;
    db.prepare("UPDATE courses SET subtitle = ?, description = ?, level = ?, outcomes = ?, skills = ? WHERE id = ?")
      .run(c.subtitle, c.description, c.level, JSON.stringify(c.outcomes), JSON.stringify(c.skills), course.id);
    const modules = db.prepare("SELECT id FROM modules WHERE course_id = ? ORDER BY position").all(course.id) as { id: number }[];
    const insertItem = db.prepare("INSERT INTO items (module_id, position, kind, title, minutes, content) VALUES (?, ?, ?, ?, ?, ?)");
    const updateItem = db.prepare("UPDATE items SET position = ?, kind = ?, minutes = ?, content = ? WHERE id = ?");
    cn.buildModules().forEach((m, mi) => {
      const moduleId = modules[mi]?.id ?? Number(
        db.prepare("INSERT INTO modules (course_id, position, title, summary) VALUES (?, ?, ?, ?)").run(course.id, mi + 1, m.title, m.summary).lastInsertRowid,
      );
      const existing = db.prepare("SELECT id, title FROM items WHERE module_id = ? ORDER BY position").all(moduleId) as { id: number; title: string }[];
      const used = new Set<number>();
      m.items.forEach((it, ii) => {
        const match = existing.find((e) => e.title === it.title && !used.has(e.id));
        if (match) {
          used.add(match.id);
          updateItem.run(ii + 1, it.kind, it.minutes, it.content, match.id);
        } else {
          insertItem.run(moduleId, ii + 1, it.kind, it.title, it.minutes, it.content);
        }
      });
      existing.filter((e) => !used.has(e.id)).forEach((e, k) => db.prepare("UPDATE items SET position = ? WHERE id = ?").run(m.items.length + k + 1, e.id));
    });
    db.prepare("UPDATE exams SET questions = ? WHERE course_id = ?").run(JSON.stringify(cn.EXAM.questions), course.id);
    db.prepare("INSERT OR REPLACE INTO meta (key, value) VALUES ('communaute-numerique', ?)").run(String(cn.CONTENT_VERSION));
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

function open() {
  mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA);
  migrate(db);
  seedDatabase(db);
  seedCommunauteNumerique(db);
  syncCommunauteNumerique(db);
  return db;
}

const globalForDb = globalThis as unknown as { dicampusDb?: DatabaseSync };

export const db = globalForDb.dicampusDb ?? open();
if (process.env.NODE_ENV !== "production") globalForDb.dicampusDb = db;

// node:sqlite renvoie des objets sans prototype, que React refuse de transmettre aux composants client.
export function one<T>(sql: string, ...params: (string | number | null)[]): T | undefined {
  const row = db.prepare(sql).get(...params);
  return row ? ({ ...row } as T) : undefined;
}

export function all<T>(sql: string, ...params: (string | number | null)[]): T[] {
  return db.prepare(sql).all(...params).map((row) => ({ ...row }) as T);
}

export function run(sql: string, ...params: (string | number | null)[]) {
  return db.prepare(sql).run(...params);
}
