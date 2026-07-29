import { supabase } from '../lib/supabase';

export interface SchoolStudent {
  id: string;
  full_name: string;
  xp: number;
  level: number;
  verified_hours: number;
}

export async function getSchoolStudents(schoolName: string): Promise<SchoolStudent[]> {
  const { data: students, error: studentsError } = await supabase
    .from('profiles')
    .select('id, full_name, xp, level')
    .eq('account_type', 'student')
    .eq('school_name', schoolName);
  if (studentsError) throw studentsError;
  if (!students || students.length === 0) return [];

  const studentIds = students.map((s) => s.id);
  const { data: logs, error: logsError } = await supabase
    .from('hour_logs')
    .select('student_id, hours_logged')
    .in('student_id', studentIds)
    .eq('status', 'verified');
  if (logsError) throw logsError;

  const hoursMap: Record<string, number> = {};
  for (const log of logs ?? []) {
    hoursMap[log.student_id] = (hoursMap[log.student_id] ?? 0) + Number(log.hours_logged);
  }

  return students
    .map((s) => ({ ...s, verified_hours: hoursMap[s.id] ?? 0 }))
    .sort((a, b) => b.verified_hours - a.verified_hours);
}
