import { supabase } from '../lib/supabase';
import type { HourLog } from '../types/hours';

export async function logHours(
  opportunityId: string,
  studentId: string,
  hoursLogged: number,
  actualDate: string,
  serviceDescription: string
): Promise<HourLog> {
  const { data, error } = await supabase
    .from('hour_logs')
    .insert({
      opportunity_id: opportunityId,
      student_id: studentId,
      hours_logged: hoursLogged,
      actual_date: actualDate,
      service_description: serviceDescription || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getStudentHourLogs(studentId: string): Promise<HourLog[]> {
  const { data, error } = await supabase
    .from('hour_logs')
    .select('*, opportunities(title, hours_value)')
    .eq('student_id', studentId)
    .order('submitted_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getOrgPendingLogs(_orgId: string): Promise<HourLog[]> {
  const { data, error } = await supabase
    .from('hour_logs')
    .select('*, opportunities(title, hours_value), profiles(full_name, school_name)')
    .eq('status', 'pending')
    .order('submitted_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function verifyHourLog(logId: string): Promise<void> {
  const { error } = await supabase
    .from('hour_logs')
    .update({ status: 'verified', verified_at: new Date().toISOString() })
    .eq('id', logId);
  if (error) throw error;
}

export async function rejectHourLog(logId: string): Promise<void> {
  const { error } = await supabase
    .from('hour_logs')
    .update({ status: 'rejected' })
    .eq('id', logId);
  if (error) throw error;
}
