import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  SERVICES,
  STATUSES,
  createJob,
  nextCode,
  updateStatus,
  useJobs,
  type Status,
} from "@/lib/jobs-store";

export const Route = createFileRoute("/staff")({
  head: () => ({
    meta: [
      { title: "Staff Dashboard | Lavage International" },
      {
        name: "description",
        content:
          "Lavage International staff portal: register new vehicle jobs and update wash and detailing status.",
      },
      { property: "og:title", content: "Staff Dashboard | Lavage International" },
      {
        property: "og:description",
        content: "Register vehicle jobs and update their progress at Lavage International.",
      },
    ],
  }),
  component: StaffPage,
});

const emptyForm = {
  customerName: "",
  phone: "",
  vehicle: "",
  plate: "",
  service: SERVICES[0] as string,
  status: STATUSES[0] as Status,
  notes: "",
};

function StaffPage() {
  const jobs = useJobs();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [created, setCreated] = useState<string | null>(null);

  const active = jobs.filter((j) => j.status !== "Completed");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const job = createJob({ ...form, code: nextCode() });
    setForm(emptyForm);
    setShowForm(false);
    setCreated(job.code);
  }

  const fieldClass =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-card-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none";

  return (
    <AppShell>
      <section className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            setShowForm((v) => !v);
            setCreated(null);
          }}
          className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-4 text-center active:scale-95"
        >
          <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-primary/10">
            <span className="text-xl font-bold text-primary">{showForm ? "×" : "+"}</span>
          </div>
          <span className="text-[10px] font-bold uppercase text-card-foreground">
            {showForm ? "Close" : "New Job"}
          </span>
        </button>
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-4 text-center">
          <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-warning/10">
            <span className="text-sm font-bold text-warning">{active.length}</span>
          </div>
          <span className="text-[10px] font-bold uppercase text-card-foreground">Active</span>
        </div>
      </section>

      {created && (
        <p className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-xs font-bold uppercase tracking-wider text-success">
          Job created — tracking code {created}
        </p>
      )}

      {showForm && (
        <form onSubmit={submit} className="space-y-3 rounded-2xl border border-border bg-card p-6 shadow-xl">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            New Vehicle Job
          </h2>
          <input
            required
            className={fieldClass}
            placeholder="Customer name"
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
          />
          <input
            required
            type="tel"
            className={fieldClass}
            placeholder="Phone number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            required
            className={fieldClass}
            placeholder="Vehicle make / model"
            value={form.vehicle}
            onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
          />
          <input
            required
            className={fieldClass}
            placeholder="Plate number"
            value={form.plate}
            onChange={(e) => setForm({ ...form, plate: e.target.value })}
          />
          <select
            className={fieldClass}
            value={form.service}
            onChange={(e) => setForm({ ...form, service: e.target.value })}
          >
            {SERVICES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className={fieldClass}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <textarea
            rows={3}
            className={fieldClass}
            placeholder="Staff notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <button
            type="submit"
            className="w-full rounded-2xl bg-primary py-4 font-bold text-primary-foreground shadow-[var(--shadow-cta)] active:scale-95"
          >
            Add New Vehicle Job
          </button>
        </form>
      )}

      <section className="space-y-3 pb-8">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          All Jobs
        </p>
        {jobs.map((job) => (
          <div key={job.id} className="rounded-xl border border-border bg-card p-4">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-card-foreground">{job.vehicle}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {job.customerName} · {job.phone}
                </p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {job.plate} · {job.code}
                </p>
                <p className="mt-1 text-[11px] text-card-foreground">{job.service}</p>
                {job.notes && (
                  <p className="mt-1 text-[11px] italic text-muted-foreground">{job.notes}</p>
                )}
              </div>
              <span
                className={`shrink-0 rounded px-2 py-1 text-[10px] font-bold uppercase ${
                  job.status === "Completed"
                    ? "bg-success/10 text-success"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {job.status}
              </span>
            </div>
            <label className="mt-3 block">
              <span className="sr-only">Update status for {job.plate}</span>
              <select
                value={job.status}
                onChange={(e) => updateStatus(job.id, e.target.value as Status)}
                className="h-12 w-full rounded-xl border border-border bg-background px-3 text-sm font-bold uppercase tracking-wide text-primary focus:outline-none"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ))}
      </section>
    </AppShell>
  );
}
