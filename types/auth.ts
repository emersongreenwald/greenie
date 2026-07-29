export type AccountType = 'student' | 'org' | 'school';

export interface Profile {
  id: string;
  account_type: AccountType;
  full_name: string;
  created_at: string;
  // Student fields — null for orgs
  school_name: string | null;
  graduation_year: number | null;
  xp: number;
  level: number;
  streak: number;
  last_streak_week: string | null;
  // Org fields — null for students
  phone: string | null;
}
