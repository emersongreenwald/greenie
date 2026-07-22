export type AccountType = 'student' | 'org';

export interface Profile {
  id: string;
  account_type: AccountType;
  full_name: string;
  created_at: string;
}
