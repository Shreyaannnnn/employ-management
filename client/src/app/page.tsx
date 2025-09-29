"use client";
import { useEffect, useMemo, useState } from "react";
import { EmployeesApi, type Employee } from "./api";
import Link from "next/link";

export default function Home() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<{ open: boolean; editing?: Employee }>(() => ({ open: false }));
  const [confirm, setConfirm] = useState<{ open: boolean; message: string; onConfirm?: () => Promise<void> | void }>({ open: false, message: "" });

  async function load() {
    try {
      setLoading(true);
      const data = await EmployeesApi.list(q);
      setEmployees(data);
      setError("");
    } catch (e: any) {
      setError(e.message || "Failed to load");
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [q]);

  function logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  useEffect(() => {
    if (!localStorage.getItem("token")) window.location.href = "/login";
  }, []);

  return (
    <div className="container p-6">
      <div className="card p-5 mb-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Employees</h1>
          <div className="flex gap-2">
            <input placeholder="Search by name" className="input w-64" value={q} onChange={(e) => setQ(e.target.value)} />
            <button className="btn btn-primary" onClick={() => setModal({ open: true })}>Add</button>
            <button className="btn" onClick={() => setConfirm({ open: true, message: 'Are you sure you want to logout?', onConfirm: () => { logout(); } })}>Logout</button>
          </div>
        </div>
      </div>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <p className="p-4">Loading...</p>
        ) : (
          <table className="table text-sm">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Position</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id}>
                  <td>{e.name}</td>
                  <td>{e.email}</td>
                  <td>{e.position}</td>
                  <td className="text-center">
                    <button className="btn mr-2" onClick={() => setModal({ open: true, editing: e })}>Edit</button>
                    <button className="btn btn-danger" onClick={() => {
                      const prev = employees;
                      setConfirm({
                        open: true,
                        message: 'Delete this employee? This action cannot be undone.',
                        onConfirm: async () => {
                          setEmployees((arr) => arr.filter(x => x.id !== e.id));
                          try { await EmployeesApi.remove(e.id); } catch (err: any) { alert(err.message || 'Delete failed'); setEmployees(prev); }
                        }
                      });
                    }}>Delete</button>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr><td colSpan={4} className="p-4 text-center opacity-70">No employees</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modal.open && (
        <EmployeeModal initial={modal.editing} onClose={() => setModal({ open: false })} onSaved={() => { setModal({ open: false }); load(); }} />
      )}

      {confirm.open && (
        <ConfirmModal message={confirm.message} onCancel={() => setConfirm({ open: false, message: '' })} onConfirm={async () => { const fn = confirm.onConfirm; setConfirm({ open: false, message: '' }); if (fn) await fn(); }} />
      )}
    </div>
  );
}

function EmployeeModal({ initial, onClose, onSaved }: { initial?: Employee; onClose: () => void; onSaved: () => void; }) {
  const [name, setName] = useState(initial?.name || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [position, setPosition] = useState(initial?.position || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      if (!name.trim() || !position.trim()) throw new Error("Name and position are required");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Valid email required");
      if (initial) await EmployeesApi.update(initial.id, { name, email, position });
      else await EmployeesApi.create({ name, email, position });
      onSaved();
    } catch (e: any) { setError(e.message || "Save failed"); } finally { setSaving(false); }
  }

  return (
    <div className="modal-overlay">
      <div className="card modal p-5">
        <h2 className="text-lg font-semibold mb-3">{initial ? "Edit" : "Add"} Employee</h2>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <div className="space-y-3">
          <div>
            <label className="block mb-1">Name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1">Email</label>
            <input className="input" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1">Position</label>
            <input className="input" value={position} onChange={e => setPosition(e.target.value)} />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={saving} onClick={save}>{saving ? "Saving..." : "Save"}</button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ message, onCancel, onConfirm }: { message: string; onCancel: () => void; onConfirm: () => void | Promise<void>; }) {
  return (
    <div className="modal-overlay">
      <div className="card modal p-5">
        <h2 className="text-lg font-semibold mb-3">Confirm action</h2>
        <p className="mb-4 opacity-80">{message}</p>
        <div className="flex justify-end gap-2">
          <button className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

