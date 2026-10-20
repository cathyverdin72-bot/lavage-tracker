import { createFileRoute } from “@tanstack/react-router”;
import { useState } from “react”;
import { AppShell } from “@/components/AppShell”;
import { StaffSignIn } from “@/components/StaffSignIn”;
import { useAuth, signOut } from “@/lib/use-auth”;
import {
SERVICES,
STATUSES,
createJob,
updateNotes,
updateStatus,
useStaffJobs,
type StaffJob,
type Status,
} from “@/lib/jobs-store”;

export const Route = createFileRoute(”/staff”)({
ssr: false,
head: () => ({
meta: [
{ title: “Staff Dashboard | Lavage International” },
{
name: “description”,
content: “Lavage International staff portal for vehicle jobs and service progress.”,
},
],
}),
component: StaffPage,
});

const emptyForm = {
customerName: “”,
phone: “”,
vehicle: “”,
plate: “”,
service: SERVICES[0] as string,
status: STATUSES[0] as Status,
notes: “”,
};

const fieldClass =
“w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-card-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none”;

function StaffPage() {
const { session, loading } = useAuth();

if (loading) {
return (
Loading staff portal…
);
}

if (!session) {
return (
);
}

return ;
}

function StaffDashboard() {
const { jobs, loading, error, refresh } = useStaffJobs(true);
const [showForm, setShowForm] = useState(false);
const [form, setForm] = useState(emptyForm);
const [created, setCreated] = useState(””);
const [actionError, setActionError] = useState(””);

const active = jobs.filter((job) => job.status !== “Completed”);
const completed = jobs.filter((job) => job.status === “Completed”);

async function submit(event: React.FormEvent) {
event.preventDefault();
setActionError(””);
setCreated(””);

try {
  const job = await createJob(form);
  setForm({ ...emptyForm });
  setShowForm(false);
  setCreated(job.trackingCode);
  await refresh();
} catch (err) {
  setActionError(err instanceof Error ? err.message : "Could not create job.");
}

}

async function changeStatus(id: string, status: Status) {
setActionError(””);

try {
  await updateStatus(id, status);
  await refresh();
} catch (err) {
  setActionError(err instanceof Error ? err.message : "Could not update status.");
}

}

async function saveNotes(id: string, notes: string) {
setActionError(””);

try {
  await updateNotes(id, notes);
  await refresh();
} catch (err) {
  setActionError(err instanceof Error ? err.message : "Could not save notes.");
}

}

return (
Lavage International
Staff Dashboard
Manage vehicle jobs and track every service stage.
    <section className="grid grid-cols-3 gap-2">
      <StatCard label="All Jobs" value={jobs.length} />
      <StatCard label="Active" value={active.length} />
      <StatCard label="Completed" value={completed.length} />
    </section>
    <button
      type="button"
      onClick={() => {
        setShowForm((current) => !current);
        setCreated("");
        setActionError("");
      }}
      className="w-full rounded-xl border border-primary bg-primary px-4 py-4 text-sm font-bold uppercase tracking-widest text-primary-foreground"
    >
      {showForm ? "Cancel New Job" : "+ Register Vehicle"}
    </button>
    <div className="flex items-center justify-between">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Vehicle Register
      </p>
      <button
        type="button"
        onClick={() => void refresh()}
        className="rounded-lg border border-border px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary"
      >
        {loading ? "Loading..." : "Refresh"}
      </button>
    </div>
    {(error || actionError) && (
      <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
        {actionError || error}
      </p>
    )}
    {created && (
      <div className="rounded-xl border border-primary/40 bg-primary/10 p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          Vehicle registered successfully
        </p>
        <p className="mt-1 text-sm text-card-foreground">
          Tracking code: <strong>{created}</strong>
        </p>
      </div>
    )}
    {showForm && (
      <form
        onSubmit={submit}
        className="space-y-4 rounded-2xl border border-primary/30 bg-card p-4"
      >
        <h2 className="text-sm font-bold uppercase tracking-widest text-primary">
          New Vehicle Job
        </h2>
        <input
          required
          autoComplete="name"
          className={fieldClass}
          placeholder="Customer name"
          value={form.customerName}
          onChange={(event) =>
            setForm({ ...form, customerName: event.target.value })
          }
        />
        <input
          required
          type="tel"
          autoComplete="tel"
          className={fieldClass}
          placeholder="Phone number"
          value={form.phone}
          onChange={(event) =>
            setForm({ ...form, phone: event.target.value })
          }
        />
        <input
          required
          className={fieldClass}
          placeholder="Vehicle make and model"
          value={form.vehicle}
          onChange={(event) =>
            setForm({ ...form, vehicle: event.target.value })
          }
        />
        <input
          required
          className={fieldClass}
          placeholder="Plate number"
          value={form.plate}
          onChange={(event) =>
            setForm({ ...form, plate: event.target.value })
          }
        />
        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Service
          </span>
          <select
            className={fieldClass}
            value={form.service}
            onChange={(event) =>
              setForm({ ...form, service: event.target.value })
            }
          >
            {SERVICES.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Initial Status
          </span>
          <select
            className={fieldClass}
            value={form.status}
            onChange={(event) =>
              setForm({ ...form, status: event.target.value as Status })
            }
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <textarea
          rows={3}
          className={fieldClass}
          placeholder="Staff notes (optional)"
          value={form.notes}
          onChange={(event) =>
            setForm({ ...form, notes: event.target.value })
          }
        />
        <button
          type="submit"
          className="w-full rounded-xl bg-primary px-4 py-4 text-sm font-bold uppercase tracking-widest text-primary-foreground"
        >
          Save Vehicle Job
        </button>
      </form>
    )}
    {loading && jobs.length === 0 ? (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Loading vehicle jobs...
      </p>
    ) : jobs.length === 0 ? (
      <div className="rounded-xl border border-dashed border-border p-6 text-center">
        <p className="text-sm font-semibold text-card-foreground">
          No vehicle jobs yet
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Register a vehicle to get started.
        </p>
      </div>
    ) : (
      <section className="space-y-4">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onStatus={changeStatus}
            onNotes={saveNotes}
          />
        ))}
      </section>
    )}
    <button
      type="button"
      onClick={() => void signOut()}
      className="w-full rounded-xl border border-border px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground"
    >
      Sign Out
    </button>
  </div>
</AppShell>

);
}

function StatCard({ label, value }: { label: string; value: number }) {
return (
{value}
{label}
);
}

function JobCard({
job,
onStatus,
onNotes,
}: {
job: StaffJob;
onStatus: (id: string, status: Status) => Promise;
onNotes: (id: string, notes: string) => Promise;
}) {
const [notes, setNotes] = useState(job.notes);
const [savingNotes, setSavingNotes] = useState(false);
const dirty = notes !== job.notes;

async function save() {
setSavingNotes(true);
try {
await onNotes(job.id, notes);
} finally {
setSavingNotes(false);
}
}

const completed = job.status === “Completed”;

return (
<article
className={overflow-hidden rounded-2xl border bg-card ${ completed ? "border-success/40" : "border-primary/30" }}
>
{job.trackingCode}
<span
className={rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-widest ${ completed ? "bg-success/10 text-success" : "bg-primary/10 text-primary" }}
>
{job.status}
  <div className="space-y-4 p-4">
    <div>
      <h3 className="text-lg font-bold text-card-foreground">{job.vehicle}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {job.customerName}
      </p>
      <a
        href={`tel:${job.phone.replace(/[^\d+]/g, "")}`}
        className="mt-1 inline-block text-sm text-primary underline decoration-primary/40 underline-offset-4"
      >
        {job.phone}
      </a>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-lg bg-background p-3">
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          Plate Number
        </p>
        <p className="mt-1 text-sm font-semibold text-card-foreground">
          {job.plate}
        </p>
      </div>
      <div className="rounded-lg bg-background p-3">
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          Service
        </p>
        <p className="mt-1 text-sm font-semibold text-card-foreground">
          {job.service}
        </p>
      </div>
    </div>
    <label className="block space-y-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        Update Job Status
      </span>
      <select
        value={job.status}
        onChange={(event) =>
          void onStatus(job.id, event.target.value as Status)
        }
        className={fieldClass}
      >
        {STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </label>
    <label className="block space-y-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        Staff Notes
      </span>
      <textarea
        rows={3}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Add a note about this vehicle..."
        className={fieldClass}
      />
    </label>
    {dirty && (
      <button
        type="button"
        disabled={savingNotes}
        onClick={() => void save()}
        className="w-full rounded-xl border border-primary px-4 py-3 text-xs font-bold uppercase tracking-widest text-primary disabled:opacity-50"
      >
        {savingNotes ? "Saving..." : "Save Notes"}
      </button>
    )}
  </div>
</article>

);
}
