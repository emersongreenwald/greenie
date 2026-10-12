import type { Profile } from '../../types/auth';
import type { Opportunity, SignupEntry } from '../../types/opportunity';
import type { HourLog, ServiceRecord } from '../../types/hours';
import { buildSampleData, DEMO_ORG_ID, DEMO_STUDENT_ID } from './sampleData';

// In-memory stand-in for Supabase. Changes last until the page is refreshed.
// Everything returns copies: the student dashboard detects new XP by comparing the old
// profile to a fresh one, which only works if they're different objects.
const db = buildSampleData();

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function findProfile(id: string): Profile | undefined {
  return db.profiles.find((p) => p.id === id);
}

function findOpportunity(id: string): Opportunity | undefined {
  return db.opportunities.find((o) => o.id === id);
}

function withOrgAndCount(opp: Opportunity): Opportunity {
  return {
    ...opp,
    profiles: { full_name: findProfile(opp.org_id)?.full_name ?? 'Organization', verified: true },
    signup_count: db.signups.filter((s) => s.opportunity_id === opp.id).length,
  };
}

function byDate(a: Opportunity, b: Opportunity) {
  return a.date.localeCompare(b.date);
}

// ── auth ────────────────────────────────────────────────────────────────

// Each role's profile as it was when the visitor last switched away. Restoring it (instead of a
// fresh copy) lets the dashboard see the old XP and play the "+xp" animation, as it does after login.
const savedSessions: Record<string, Profile> = {};

export function saveDemoSession(profile: Profile) {
  savedSessions[profile.id] = { ...profile };
}

export function signInAsDemo(role: 'student' | 'org'): Profile {
  const id = role === 'student' ? DEMO_STUDENT_ID : DEMO_ORG_ID;
  return { ...(savedSessions[id] ?? findProfile(id)!) };
}

export async function getProfile(userId: string): Promise<Profile> {
  const profile = findProfile(userId);
  if (!profile) throw new Error('profile not found');
  return { ...profile };
}

// ── opportunities ───────────────────────────────────────────────────────

// Unlike the real query, past events are hidden so discover only shows what's coming up.
export async function getOpportunities(): Promise<Opportunity[]> {
  return db.opportunities.filter((o) => o.date >= today()).sort(byDate).map(withOrgAndCount);
}

export async function getOpportunity(id: string): Promise<Opportunity> {
  const opp = findOpportunity(id);
  if (!opp) throw new Error('opportunity not found');
  return withOrgAndCount(opp);
}

export async function getOrgOpportunities(orgId: string): Promise<Opportunity[]> {
  return db.opportunities.filter((o) => o.org_id === orgId).sort(byDate).map(withOrgAndCount);
}

type OpportunityFields = Pick<Opportunity, 'title' | 'description' | 'location' | 'date' | 'hours_value'> & {
  capacity?: number | null;
};

export async function createOpportunity(orgId: string, fields: OpportunityFields): Promise<void> {
  db.opportunities.push({
    ...fields,
    capacity: fields.capacity ?? null,
    id: `opp-${Date.now()}`,
    org_id: orgId,
    created_at: new Date().toISOString(),
  });
}

export async function updateOpportunity(id: string, fields: OpportunityFields): Promise<void> {
  const opp = findOpportunity(id);
  if (opp) Object.assign(opp, fields);
}

export async function deleteOpportunity(id: string): Promise<void> {
  db.opportunities = db.opportunities.filter((o) => o.id !== id);
  db.signups = db.signups.filter((s) => s.opportunity_id !== id);
}

export async function signUpForOpportunity(opportunityId: string, studentId: string): Promise<void> {
  // Mirrors the database's unique constraint on (opportunity_id, student_id)
  if (db.signups.some((s) => s.opportunity_id === opportunityId && s.student_id === studentId)) {
    throw new Error("you're already signed up for this one.");
  }
  db.signups.push({
    id: `${opportunityId}-${studentId}`,
    opportunity_id: opportunityId,
    student_id: studentId,
    signed_up_at: new Date().toISOString(),
  });
}

export async function cancelSignup(opportunityId: string, studentId: string): Promise<void> {
  db.signups = db.signups.filter((s) => !(s.opportunity_id === opportunityId && s.student_id === studentId));
}

export async function getOpportunitySignups(opportunityId: string): Promise<SignupEntry[]> {
  return db.signups
    .filter((s) => s.opportunity_id === opportunityId)
    .sort((a, b) => a.signed_up_at.localeCompare(b.signed_up_at))
    .map((s) => {
      const student = findProfile(s.student_id);
      return {
        student_id: s.student_id,
        signed_up_at: s.signed_up_at,
        profiles: student ? { full_name: student.full_name, school_name: student.school_name } : undefined,
      };
    });
}

export async function getStudentSignups(studentId: string): Promise<string[]> {
  return db.signups.filter((s) => s.student_id === studentId).map((s) => s.opportunity_id);
}

export async function getSignedUpOpportunities(studentId: string): Promise<Opportunity[]> {
  return db.signups
    .filter((s) => s.student_id === studentId)
    .sort((a, b) => b.signed_up_at.localeCompare(a.signed_up_at))
    .map((s) => findOpportunity(s.opportunity_id))
    .filter((o): o is Opportunity => Boolean(o))
    .map(withOrgAndCount);
}

// ── hours ───────────────────────────────────────────────────────────────

function withOpportunityAndStudent(log: HourLog): HourLog {
  const opp = findOpportunity(log.opportunity_id);
  const student = findProfile(log.student_id);
  return {
    ...log,
    opportunities: opp ? { title: opp.title, hours_value: opp.hours_value } : undefined,
    profiles: student ? { full_name: student.full_name, school_name: student.school_name } : undefined,
  };
}

export async function logHours(
  opportunityId: string,
  studentId: string,
  hoursLogged: number,
  actualDate: string,
  serviceDescription: string
): Promise<HourLog> {
  const log: HourLog = {
    id: `log-${Date.now()}`,
    opportunity_id: opportunityId,
    student_id: studentId,
    hours_logged: hoursLogged,
    actual_date: actualDate,
    service_description: serviceDescription || null,
    status: 'pending',
    submitted_at: new Date().toISOString(),
    verified_at: null,
  };
  db.hourLogs.push(log);
  return { ...log };
}

export async function getStudentHourLogs(studentId: string): Promise<HourLog[]> {
  return db.hourLogs
    .filter((l) => l.student_id === studentId)
    .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at))
    .map(withOpportunityAndStudent);
}

export async function getStudentServiceRecord(studentId: string): Promise<ServiceRecord[]> {
  return db.hourLogs
    .filter((l) => l.student_id === studentId && l.status === 'verified')
    .sort((a, b) => b.actual_date.localeCompare(a.actual_date))
    .map((l) => {
      const opp = findOpportunity(l.opportunity_id);
      return {
        id: l.id,
        hours_logged: l.hours_logged,
        actual_date: l.actual_date,
        service_description: l.service_description,
        verified_at: l.verified_at,
        opportunities: opp
          ? { title: opp.title, location: opp.location, profiles: { full_name: findProfile(opp.org_id)?.full_name ?? '' } }
          : undefined,
      };
    });
}

// The demo org reviews every pending log, not just its own events, so hours a visitor
// logs as the student always show up when they switch to the org view.
export async function getOrgPendingLogs(_orgId: string): Promise<HourLog[]> {
  return db.hourLogs
    .filter((l) => l.status === 'pending')
    .sort((a, b) => a.submitted_at.localeCompare(b.submitted_at))
    .map(withOpportunityAndStudent);
}

// Does the job of the real database trigger: XP = round(hours * 10), 100 XP per level.
export async function verifyHourLog(logId: string): Promise<void> {
  const log = db.hourLogs.find((l) => l.id === logId);
  if (!log || log.status !== 'pending') return;
  log.status = 'verified';
  log.verified_at = new Date().toISOString();

  const student = findProfile(log.student_id);
  if (student) {
    student.xp += Math.round(Number(log.hours_logged) * 10);
    student.level = Math.floor(student.xp / 100) + 1;
  }
}

export async function rejectHourLog(logId: string): Promise<void> {
  const log = db.hourLogs.find((l) => l.id === logId);
  if (log) log.status = 'rejected';
}
