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
content:
“Lavage International staff portal: register new vehicle jobs and update wash and detailing status.”,
},
{ property: “og:title”, content: “Staff Dashboard | Lavage International” },
{
property: “og:description”,
content: “Register vehicle jobs and update their progress at Lavage International.”,
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
“w-full rounded-xl border border-[#39352C] bg-[#151515] px-4 py-3 text-sm text-[#F5F1E8] placeholder:text-[#77736A] focus:border-[#C6A45B] focus:outline-none focus:ring-1 focus:ring-[#C6A45B]/30”;

function StaffPage() {
const { session, loading: authLoading } = useAuth();
const signedIn = Boolean(session);

if (authLoading) {
return (
Loading staff portal…
);
}

if (!signedIn) {
return (
);
}

return ;
}

function StaffDashboard() {
const { jobs, loading, error, refresh } = useStaffJobs(true);
const [showForm, setShowForm] = useState(false);
const [form, setForm] = useState(emptyForm);
const [created, setCreated] = useState<string | null>(null);
const [actionError, setActionError] = useState(””);

const active = jobs.filter((job) => job.status !== “Completed”);
const completed = jobs.filter((job) => job.status === “Completed”);

async function submit(e: React.FormEvent) {
e.preventDefault();

try {
  const job = await createJob(form);
  setForm(emptyForm);
  setShowForm(false);
  setCreated(job.trackingCode);
  setActionError("");
  await refresh();
} catch (err) {
  setActionError(err instanceof Error ? err.message : "Could not create job.");
}

}

async function changeStatus(id: string, status: Status) {
try {
await updateStatus(id, status);
setActionError(””);
await refresh();
} catch (err) {
setActionError(err instanceof Error ? err.message : “Could not update status.”);
}
}

async function saveNotes(id: string, notes: string) {
try {
await updateNotes(id, notes);
setActionError(””);
await refresh();
} catch (err) {
setActionError(err instanceof Error ? err.message : “Could not update notes.”);
}
}

return (
Operations overview
Staff Dashboard
Manage vehicle care, track every service stage, and keep customer jobs moving.
      <div className="rounded-xl border border-[#C6A45B]/30 bg-[#C6A45B]/10 px-3 py-2">
        <p className="text-[9px] uppercase tracking-widest text-[#C6A45B]">
          Service desk
        </p>
        <p className="mt-1 text-xs font-semibold text-[#F5F1E8]">Live operations</p>
      </div>
    </div>
    <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
      <Metric label="All jobs" value={jobs.length} />
      <Metric label="Active" value={active.length} />
      <Metric label="Completed" value={completed.length} />
    </div>
  </section>
  <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <button
      type="button"
      onClick={() => {
        setShowForm((value) => !value);
        setCreated(null);
        setActionError("");
      }}
      className="flex items-center justify-between rounded-xl border border-[#C6A45B]/50 bg-[#C6A45B] px-5 py-4 text-left text-[#14120D] transition hover:bg-[#D9BD78] active:scale-[0.99]"
    >
      <span>
        <span className="block text-sm font-bold">
          {showForm ? "Close new job form" : "Register a vehicle"}
        </span>
        <span className="mt-1 block text-xs text-[#3E3521]">
          {showForm ? "Return to the job list" : "Create a customer service job"}
        </span>
      </span>
      <span className="text-3xl font-light" aria-hidden="true">
        {showForm ? "×" : "+"}
      </span>
    </button>
    <button
      type="button"
      onClick={() => void refresh()}
      className="flex items-center justify-between rounded-xl border border-[#39352C] bg-[#151515] px-5 py-4 text-left transition hover:border-[#C6A45B]/50 active:scale-[0.99]"
    >
      <span>
        <span className="block text-sm font-semibold text-[#F5F1E8]">
          {loading ? "Refreshing jobs…" : "Refresh job list"}
        </span>
        <span className="mt-1 block text-xs text-[#99948A]">
          Load the latest job information
        </span>
      </span>
      <span className="text-xl text-[#C6A45B]" aria-hidden="true">
        ↻
      </span>
    </button>
  </section>
  <div className="flex justify-end">
    <button
      type="button"
      onClick={() => void signOut()}
      className="rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#C6A45B] transition hover:bg-[#C6A45B]/10"
    >
      Sign out ↗
    </button>
  </div>
  {(error || actionError) && (
    <div
      role="alert"
      className="rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200"
    >
      {error || actionError}
    </div>
  )}
  {created && (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">
        Vehicle job created
      </p>
      <p className="mt-2 text-sm text-[#F5F1E8]">
        Tracking code: <span className="font-mono font-bold">{created}</span>
      </p>
    </div>
  )}
  {showForm && (
    <form
      onSubmit={submit}
      className="space-y-5 rounded-2xl border border-[#C6A45B]/25 bg-[#121212] p-5 sm:p-7"
    >
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#C6A45B]">
          Service registration
        </p>
        <h3 className="mt-2 text-xl font-semibold text-[#F5F1E8]">
          New Vehicle Job
        </h3>
        <p className="mt-1 text-xs leading-5 text-[#99948A]">
          Enter the customer and vehicle details below.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Customer name">
          <input
            required
            autoComplete="name"
            className={fieldClass}
            placeholder="Customer full name"
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
          />
        </FormField>
        <FormField label="Phone number">
          <input
            required
            type="tel"
            autoComplete="tel"
            className={fieldClass}
            placeholder="+225…"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </FormField>
        <FormField label="Vehicle make and model">
          <input
            required
            className={fieldClass}
            placeholder="e.g. Toyota Land Cruiser"
            value={form.vehicle}
            onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
          />
        </FormField>
        <FormField label="Registration plate">
          <input
            required
            className={fieldClass}
            placeholder="Vehicle plate number"
            value={form.plate}
            onChange={(e) => setForm({ ...form, plate: e.target.value })}
          />
        </FormField>
        <FormField label="Service type">
          <select
            className={fieldClass}
            value={form.service}
            onChange={(e) => setForm({ ...form, service: e.target.value })}
          >
            {SERVICES.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Initial status">
          <select
            className={fieldClass}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <FormField label="Staff notes (optional)">
        <textarea
          rows={3}
          className={fieldClass}
          placeholder="Service requests or important details"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </FormField>
      <button
        type="submit"
        className="w-full rounded-xl bg-[#C6A45B] px-5 py-4 text-sm font-bold text-[#14120D] transition hover:bg-[#D9BD78] active:scale-[0.99]"
      >
        Create Vehicle Job
      </button>
    </form>
  )}
  <section className="space-y-4 pb-8">
    <div className="flex items-end justify-between gap-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#C6A45B]">
          Service management
        </p>
        <h3 className="mt-1 text-xl font-semibold text-[#F5F1E8]">All Jobs</h3>
      </div>
      <span className="rounded-full border border-[#39352C] px-3 py-1.5 text-[10px] font-semibold text-[#B8B1A4]">
        {jobs.length} total
      </span>
    </div>
    {loading && jobs.length === 0 ? (
      <div className="rounded-xl border border-[#39352C] bg-[#151515] p-6 text-sm text-[#A7A197]">
        Loading vehicle jobs…
      </div>
    ) : jobs.length === 0 ? (
      <div className="rounded-xl border border-dashed border-[#514832] bg-[#141414] p-8 text-center">
        <p className="text-sm font-semibold text-[#F5F1E8]">No vehicle jobs yet</p>
        <p className="mt-2 text-xs text-[#99948A]">
          Register your first vehicle to start tracking service progress.
        </p>
      </div>
    ) : (
      <div className="space-y-4">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onStatus={changeStatus}
            onNotes={saveNotes}
          />
        ))}
      </div>
    )}
  </section>
</AppShell>

);
}

function Metric({ label, value }: { label: string; value: number }) {
return (
{label}
{value}
);
}

function FormField({
label,
children,
}: {
label: string;
children: React.ReactNode;
}) {
return (
{label}
{children}
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
const dirty = notes !== job.notes;

const statusStyle =
job.status === “Completed”
? “border-emerald-500/30 bg-emerald-950/30 text-emerald-300”
: job.status === “Ready for Pickup”
? “border-sky-400/30 bg-sky-950/30 text-sky-300”
: job.status === “Quality Check”
? “border-violet-400/30 bg-violet-950/30 text-violet-300”
: “border-[#C6A45B]/30 bg-[#C6A45B]/10 text-[#E4C779]”;

return (
  <div className="space-y-4 p-4 sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#C6A45B]">
          {job.trackingCode}
        </p>
        <h4 className="mt-2 break-words text-lg font-semibold leading-snug text-[#F5F1E8]">
          {job.vehicle}
        </h4>
        <p className="mt-1 text-xs text-[#A7A197]">{job.service}</p>
      </div>
      <span
        className={`max-w-[48%] shrink-0 rounded-lg border px-2.5 py-2 text-center text-[9px] font-bold uppercase leading-4 tracking-wide sm:text-[10px] ${statusStyle}`}
      >
        {job.status}
      </span>
    </div>
    <div className="grid grid-cols-1 gap-3 rounded-xl border border-white/[0.06] bg-black/20 p-3 sm:grid-cols-2">
      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-widest text-[#77736A]">
          Customer
        </p>
        <p className="mt-1 break-words text-sm font-medium text-[#E7E0D4]">
          {job.customerName}
        </p>
        <p className="mt-1 break-words text-xs text-[#A7A197]">{job.phone}</p>
      </div>
      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-widest text-[#77736A]">
          Registration
        </p>
        <p className="mt-1 break-words font-mono text-sm font-semibold text-[#E4C779]">
          {job.plate}
        </p>
      </div>
    </div>
    <div>
      <label className="block">
        <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.18em] text-[#C6A45B]">
          Update service status
        </span>
        <select
          value={job.status}
          onChange={(e) => void onStatus(job.id, e.target.value as Status)}
          className="h-12 w-full rounded-xl border border-[#514832] bg-[#191816] px-3 text-sm font-semibold text-[#F5F1E8] focus:border-[#C6A45B] focus:outline-none focus:ring-1 focus:ring-[#C6A45B]/30"
        >
          {STATUSES.map((status) => (
            <option key={status} value={status} className="bg-[#191816] text-[#F5F1E8]">
              {status}
            </option>
          ))}
        </select>
      </label>
    </div>
    <div>
      <label className="block">
        <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.18em] text-[#A7A197]">
          Staff notes
        </span>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add service notes…"
          className={fieldClass}
        />
      </label>
      {dirty && (
        <button
          type="button"
          onClick={() => void onNotes(job.id, notes)}
          className="mt-2 w-full rounded-xl border border-[#C6A45B]/40 bg-[#C6A45B]/10 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#E4C779] transition hover:bg-[#C6A45B]/20 active:scale-[0.99]"
        >
          Save Staff Notes
        </button>
      )}
    </div>
  </div>
</article>

);
}
