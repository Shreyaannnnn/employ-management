import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/client.js';
import { requireAuth } from '../middlewares/auth.js';

export const employeesRouter = Router();

const employeeSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  position: z.string().min(1)
});

employeesRouter.use(requireAuth);

employeesRouter.get('/', (req: Request, res: Response) => {
  const q = String(req.query.q || '').trim();
  if (q) {
    const rows = db.prepare(`SELECT id, name, email, position, created_at, updated_at FROM employees WHERE name LIKE ? ORDER BY id DESC`).all(`%${q}%`);
    return res.json(rows);
  }
  const rows = db.prepare('SELECT id, name, email, position, created_at, updated_at FROM employees ORDER BY id DESC').all();
  return res.json(rows);
});

employeesRouter.post('/', (req: Request, res: Response) => {
  const parse = employeeSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { name, email, position } = parse.data;
  try {
    const stmt = db.prepare('INSERT INTO employees (name, email, position) VALUES (?, ?, ?)');
    const info = stmt.run(name, email, position);
    const row = db.prepare('SELECT id, name, email, position, created_at, updated_at FROM employees WHERE id = ?').get(info.lastInsertRowid) as unknown;
    return res.status(201).json(row);
  } catch (e: any) {
    if (e && typeof e.code === 'string') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    return res.status(500).json({ error: 'Failed to create employee' });
  }
});

employeesRouter.put('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
  const parse = employeeSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { name, email, position } = parse.data;
  try {
    const stmt = db.prepare('UPDATE employees SET name=?, email=?, position=?, updated_at=datetime("now") WHERE id=?');
    const info = stmt.run(name, email, position, id);
    if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
    const row = db.prepare('SELECT id, name, email, position, created_at, updated_at FROM employees WHERE id = ?').get(id) as unknown;
    return res.json(row);
  } catch (e: any) {
    if (e && typeof e.code === 'string') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    return res.status(500).json({ error: 'Failed to update employee' });
  }
});

employeesRouter.delete('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });
  const info = db.prepare('DELETE FROM employees WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
  return res.status(204).send();
});



