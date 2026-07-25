export type AccountType = 'student' | 'org';

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
  // Org fields — null for students
  phone: string | null;
}
