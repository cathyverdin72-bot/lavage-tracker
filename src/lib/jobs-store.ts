import { useSyncExternalStore } from "react";

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

export type Job = {
  id: string;
  code: string;
  customerName: string;
  phone: string;
  vehicle: string;
  plate: string;
  service: string;
  status: Status;
  notes: string;
  history: { status: Status; at: string }[];
};

const STORAGE_KEY = "lavage-jobs-v1";

function seed(): Job[] {
  const now = Date.now();
  const t = (minsAgo: number) => new Date(now - minsAgo * 60000).toISOString();
  return [
    {
      id: "1",
      code: "LVG-1001",
      customerName: "Amina Diallo",
      phone: "+225 07 12 34 56",
      vehicle: "Toyota Land Cruiser",
      plate: "AB-4471-CI",
      service: "Full Detailing",
      status: "Washing",
      notes: "Customer requested extra attention on the wheel arches.",
      history: [
        { status: "Car Received", at: t(180) },
        { status: "Inspection", at: t(140) },
        { status: "Washing", at: t(35) },
      ],
    },
    {
      id: "2",
      code: "LVG-1002",
      customerName: "Kwame Mensah",
      phone: "+225 05 88 22 10",
      vehicle: "Mercedes-Benz C300",
      plate: "ZY-9920-CI",
      service: "Ceramic Coating",
      status: "Quality Check",
      notes: "Minor scratch on rear bumper noted at intake.",
      history: [
        { status: "Car Received", at: t(400) },
        { status: "Inspection", at: t(370) },
        { status: "Washing", at: t(300) },
        { status: "Detailing", at: t(180) },
        { status: "Quality Check", at: t(20) },
      ],
    },
    {
      id: "3",
      code: "LVG-1003",
      customerName: "Sarah Kouassi",
      phone: "+225 01 44 55 66",
      vehicle: "Hyundai Tucson",
      plate: "KL-3388-CI",
      service: "Exterior Wash",
      status: "Ready for Pickup",
      notes: "Paid at reception.",
      history: [
        { status: "Car Received", at: t(240) },
        { status: "Inspection", at: t(225) },
        { status: "Washing", at: t(190) },
        { status: "Detailing", at: t(150) },
        { status: "Quality Check", at: t(120) },
        { status: "Ready for Pickup", at: t(90) },
      ],
    },
  ];
}

let jobs: Job[] = seed();
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) jobs = JSON.parse(raw) as Job[];
  } catch {
    /* ignore */
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  } catch {
    /* ignore */
  }
}

function emit() {
  persist();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  listener();
  return () => listeners.delete(listener);
}

export function useJobs(): Job[] {
  return useSyncExternalStore(
    subscribe,
    () => jobs,
    () => jobs,
  );
}

export function findByCode(code: string): Job | undefined {
  hydrate();
  const normalized = code.trim().toUpperCase();
  return jobs.find((j) => j.code.toUpperCase() === normalized);
}

export function nextCode(): string {
  hydrate();
  const nums = jobs.map((j) => Number(j.code.replace(/\D/g, "")) || 1000);
  return `LVG-${Math.max(1000, ...nums) + 1}`;
}

export function createJob(input: Omit<Job, "id" | "history">) {
  hydrate();
  const job: Job = {
    ...input,
    id: crypto.randomUUID(),
    history: [{ status: input.status, at: new Date().toISOString() }],
  };
  jobs = [job, ...jobs];
  emit();
  return job;
}

export function updateStatus(id: string, status: Status) {
  hydrate();
  jobs = jobs.map((j) =>
    j.id === id
      ? {
          ...j,
          status,
          history: j.history.some((h) => h.status === status)
            ? j.history
            : [...j.history, { status, at: new Date().toISOString() }],
        }
      : j,
  );
  emit();
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
