export type ApiConfig = {
  baseUrl: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

export function getAuthToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('token') || '';
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  const token = getAuthToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    let msg = 'Request failed';
    try { const j = await res.json(); msg = j.error || msg; } catch {}
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export type Employee = { id: number; name: string; email: string; position: string; created_at: string; updated_at: string };

export const EmployeesApi = {
  list: (q?: string) => api<Employee[]>(`/api/employees${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  create: (data: Pick<Employee, 'name'|'email'|'position'>) => api<Employee>('/api/employees', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Pick<Employee, 'name'|'email'|'position'>) => api<Employee>(`/api/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: number) => api<void>(`/api/employees/${id}`, { method: 'DELETE' }),
  login: (email: string, password: string) => api<{ token: string }>(`/api/auth/login`, { method: 'POST', body: JSON.stringify({ email, password }) }),
};



