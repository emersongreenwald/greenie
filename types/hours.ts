export interface HourLog {
  id: string;
  opportunity_id: string;
  student_id: string;
  hours_logged: number;
  actual_date: string;
  service_description: string | null;
  status: 'pending' | 'verified' | 'rejected';
  submitted_at: string;
  verified_at: string | null;
  // Joined when fetching student's own logs
  opportunities?: {
    title: string;
    hours_value: number;
  };
  // Joined when fetching org's pending logs (student profile via student_id FK)
  profiles?: {
    full_name: string;
    school_name: string | null;
  };
}
