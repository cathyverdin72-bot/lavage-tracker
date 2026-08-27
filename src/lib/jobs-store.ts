import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";

export const STATUSES = [
  "Car Received",
  "Inspection",
  "Washing",
  "Detailing",
  "Quality Check",
  "Ready for Pickup",
  "Completed",
] as const;

export type Status = (typeof STATUSES)[number];

export const SERVICES = [
  "Exterior Wash",
  "Interior Deep Clean",
  "Full Wash & Interior",
  "Polish & Wax",
  "Full Detailing",
  "Ceramic Coating",
] as const;

export type HistoryEntry = { status: Status; at: string };

/** Customer-safe shape: no phone number, no staff notes. */
export type Job = {
  code: string;
  vehicle: string;
  plate: string;
  service: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
  history: HistoryEntry[];
};

/** Full row, only reachable by signed-in staff (RLS enforced). */
export type StaffJob = Job & {
  id: string;
  customerName: string;
  phone: string;
  notes: string;
};

type HistoryRow = { status: string; at?: string; changed_at?: string };

function toHistory(raw: unknown): HistoryEntry[] {
  if (!Array.isArray(raw)) return [];
  return (raw as HistoryRow[])
    .map((h) => ({ status: h.status as Status, at: (h.at ?? h.changed_at ?? "") as string }))
    .filter((h) => STATUSES.includes(h.status))
    .sort((a, b) => a.at.localeCompare(b.at));
}

/* ------------------------------------------------------------------ */
/* Public lookup — anon, exact tracking code only, via security-definer RPC */
/* ------------------------------------------------------------------ */

export async function lookupJob(code: string): Promise<Job | null> {
  const { data, error } = await supabase.rpc("public_job_lookup", { p_code: code.trim() });
  if (error) throw new Error(error.message);
  const row = (Array.isArray(data) ? data[0] : data) as
    | {
        tracking_code: string;
        vehicle: string;
        plate: string;
        service: string;
        status: string;
        created_at: string;
        updated_at: string;
        history: unknown;
      }
    | undefined;
  if (!row) return null;
  return {
    code: row.tracking_code,
    vehicle: row.vehicle,
    plate: row.plate,
    service: row.service,
    status: row.status as Status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    history: toHistory(row.history),
  };
}

/* ------------------------------------------------------------------ */
/* Staff API — requires an authenticated Supabase session               */
/* ------------------------------------------------------------------ */

type JobRow = {
  id: string;
  tracking_code: string;
  customer_name: string;
  phone: string;
  vehicle: string;
  plate: string;
  service: string;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
  job_status_history?: { status: string; changed_at: string }[] | null;
};

function toStaffJob(row: JobRow): StaffJob {
  return {
    id: row.id,
    code: row.tracking_code,
    customerName: row.customer_name,
    phone: row.phone,
    vehicle: row.vehicle,
    plate: row.plate,
    service: row.service,
    status: row.status as Status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    history: toHistory(row.job_status_history ?? []),
  };
}

export async function listJobs(): Promise<StaffJob[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*, job_status_history(status, changed_at)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as JobRow[]).map(toStaffJob);
}

export type NewJobInput = {
  customerName: string;
  phone: string;
  vehicle: string;
  plate: string;
  service: string;
  status: Status;
  notes: string;
};

export async function nextCode(): Promise<string> {
  const { data, error } = await supabase
    .from("jobs")
    .select("tracking_code")
    .order("tracking_code", { ascending: false })
    .limit(1);
  if (error) throw new Error(error.message);
  const last = (data?.[0] as { tracking_code?: string } | undefined)?.tracking_code;
  const num = Math.max(1000, Number(last?.replace(/\D/g, "")) || 1000);
  return `LAV-${num + 1}`;
}

export async function createJob(input: NewJobInput): Promise<StaffJob> {
  const tracking_code = await nextCode();
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      tracking_code,
      customer_name: input.customerName,
      phone: input.phone,
      vehicle: input.vehicle,
      plate: input.plate,
      service: input.service,
      status: input.status,
      notes: input.notes,
    })
    .select("*, job_status_history(status, changed_at)")
    .single();
  if (error) throw new Error(error.message);
  return toStaffJob(data as JobRow);
}

export async function updateStatus(id: string, status: Status): Promise<void> {
  const { error } = await supabase.from("jobs").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateNotes(id: string, notes: string): Promise<void> {
  const { error } = await supabase.from("jobs").update({ notes }).eq("id", id);
  if (error) throw new Error(error.message);
}

/* ------------------------------------------------------------------ */

export function useStaffJobs(enabled: boolean) {
  const [jobs, setJobs] = useState<StaffJob[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      setJobs(await listJobs());
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load jobs.");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { jobs, loading, error, refresh };
}

export function formatTime(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
