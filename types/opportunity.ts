export interface Opportunity {
  id: string;
  org_id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  hours_value: number;
  capacity: number | null;
  created_at: string;
  profiles?: { full_name: string; verified?: boolean };
  // Derived from a signup count query — not a database column
  signup_count?: number;
}

export interface OpportunitySignup {
  id: string;
  opportunity_id: string;
  student_id: string;
  signed_up_at: string;
}

export interface SignupEntry {
  student_id: string;
  signed_up_at: string;
  profiles?: {
    full_name: string;
    school_name: string | null;
  };
}
