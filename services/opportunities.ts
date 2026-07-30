import { supabase } from '../lib/supabase';
import type { Opportunity, SignupEntry } from '../types/opportunity';

// Fetches signup counts for any capacity-limited opportunities in the list
// and attaches them as signup_count. Unlimited opportunities are returned as-is.
async function attachSignupCounts(opps: Opportunity[]): Promise<Opportunity[]> {
  const cappedIds = opps.filter((o) => o.capacity != null).map((o) => o.id);
  if (cappedIds.length === 0) return opps;

  const { data: signupRows } = await supabase
    .from('opportunity_signups')
    .select('opportunity_id')
    .in('opportunity_id', cappedIds);

  const countMap: Record<string, number> = {};
  for (const row of signupRows ?? []) {
    countMap[row.opportunity_id] = (countMap[row.opportunity_id] ?? 0) + 1;
  }

  return opps.map((o) => ({ ...o, signup_count: countMap[o.id] ?? 0 }));
}

export async function getOpportunities(): Promise<Opportunity[]> {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*, profiles(full_name, verified)')
    .order('date', { ascending: true });
  if (error) throw error;
  const verified = (data ?? []).filter((opp: any) => opp.profiles?.verified === true);
  return attachSignupCounts(verified);
}

export async function getOpportunity(id: string): Promise<Opportunity> {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*, profiles(full_name)')
    .eq('id', id)
    .single();
  if (error) throw error;

  if (data.capacity != null) {
    const { count } = await supabase
      .from('opportunity_signups')
      .select('*', { count: 'exact', head: true })
      .eq('opportunity_id', id);
    return { ...data, signup_count: count ?? 0 };
  }

  return data;
}

export async function getOrgOpportunities(orgId: string): Promise<Opportunity[]> {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*, profiles(full_name, verified)')
    .eq('org_id', orgId)
    .order('date', { ascending: true });
  if (error) throw error;
  return attachSignupCounts(data ?? []);
}

export async function createOpportunity(
  orgId: string,
  fields: {
    title: string;
    description: string;
    location: string;
    date: string;
    hours_value: number;
    capacity?: number | null;
  }
): Promise<void> {
  const { error } = await supabase
    .from('opportunities')
    .insert({ org_id: orgId, ...fields });
  if (error) throw error;
}

export async function deleteOpportunity(id: string): Promise<void> {
  const { error } = await supabase
    .from('opportunities')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function signUpForOpportunity(opportunityId: string, studentId: string) {
  const { error } = await supabase
    .from('opportunity_signups')
    .insert({ opportunity_id: opportunityId, student_id: studentId });
  if (error) throw error;
}

// Used by both students (cancelling their own signup) and orgs (removing a student from roster).
// RLS policies enforce which deletes are allowed for each account type.
export async function cancelSignup(opportunityId: string, studentId: string): Promise<void> {
  const { error } = await supabase
    .from('opportunity_signups')
    .delete()
    .eq('opportunity_id', opportunityId)
    .eq('student_id', studentId);
  if (error) throw error;
}

export async function getOpportunitySignups(opportunityId: string): Promise<SignupEntry[]> {
  const { data, error } = await supabase
    .from('opportunity_signups')
    .select('student_id, signed_up_at, profiles(full_name, school_name)')
    .eq('opportunity_id', opportunityId)
    .order('signed_up_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getStudentSignups(studentId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('opportunity_signups')
    .select('opportunity_id')
    .eq('student_id', studentId);
  if (error) throw error;
  return data.map((row) => row.opportunity_id);
}

export async function getSignedUpOpportunities(studentId: string): Promise<Opportunity[]> {
  const { data, error } = await supabase
    .from('opportunity_signups')
    .select('opportunities(*, profiles(full_name))')
    .eq('student_id', studentId)
    .order('signed_up_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: any) => row.opportunities).filter(Boolean);
}
