import { supabase } from '../lib/supabase';
import type { Opportunity, SignupEntry } from '../types/opportunity';

export async function getOpportunities(): Promise<Opportunity[]> {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*, profiles(full_name, verified)')
    .order('date', { ascending: true });
  if (error) throw error;
  return (data ?? []).filter((opp: any) => opp.profiles?.verified === true);
}

export async function getOpportunity(id: string): Promise<Opportunity> {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*, profiles(full_name)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function signUpForOpportunity(opportunityId: string, studentId: string) {
  const { error } = await supabase
    .from('opportunity_signups')
    .insert({ opportunity_id: opportunityId, student_id: studentId });
  if (error) throw error;
}

export async function getOrgOpportunities(orgId: string): Promise<Opportunity[]> {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*, profiles(full_name, verified)')
    .eq('org_id', orgId)
    .order('date', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createOpportunity(
  orgId: string,
  fields: {
    title: string;
    description: string;
    location: string;
    date: string;
    hours_value: number;
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
