export interface Opportunity {
  id: string;
  org_id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  hours_value: number;
  created_at: string;
  profiles?: { full_name: string; verified?: boolean };
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
