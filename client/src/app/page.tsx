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
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Employees</h1>
        <div className="flex gap-2">
          <input placeholder="Search by name" className="border px-3 py-2" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="bg-black text-white px-3" onClick={() => setModal({ open: true })}>Add</button>
          <button className="border px-3" onClick={logout}>Logout</button>
        </div>
      </div>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Email</th>
              <th className="border p-2 text-left">Position</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id}>
                <td className="border p-2">{e.name}</td>
                <td className="border p-2">{e.email}</td>
                <td className="border p-2">{e.position}</td>
                <td className="border p-2 text-center">
                  <button className="underline mr-3" onClick={() => setModal({ open: true, editing: e })}>Edit</button>
                  <button className="text-red-600" onClick={async () => {
                    if (!confirm('Delete this employee?')) return;
                    const prev = employees;
                    setEmployees((arr) => arr.filter(x => x.id !== e.id));
                    try { await EmployeesApi.remove(e.id); } catch (err: any) { alert(err.message || 'Delete failed'); setEmployees(prev); }
                  }}>Delete</button>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">No employees</td></tr>
            )}
          </tbody>
        </table>
      )}

      {modal.open && (
        <EmployeeModal initial={modal.editing} onClose={() => setModal({ open: false })} onSaved={() => { setModal({ open: false }); load(); }} />
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
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white p-4 w-[420px] shadow">
        <h2 className="text-lg font-semibold mb-3">{initial ? "Edit" : "Add"} Employee</h2>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <div className="space-y-3">
          <div>
            <label className="block mb-1">Name</label>
            <input className="border px-3 py-2 w-full" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1">Email</label>
            <input className="border px-3 py-2 w-full" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1">Position</label>
            <input className="border px-3 py-2 w-full" value={position} onChange={e => setPosition(e.target.value)} />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button className="border px-3 py-2" onClick={onClose}>Cancel</button>
          <button className="bg-black text-white px-3 py-2" disabled={saving} onClick={save}>{saving ? "Saving..." : "Save"}</button>
        </div>
      </div>
    </div>
  );
}

