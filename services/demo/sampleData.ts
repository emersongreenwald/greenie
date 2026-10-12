import type { Profile } from '../../types/auth';
import type { Opportunity, OpportunitySignup } from '../../types/opportunity';
import type { HourLog } from '../../types/hours';

// Places are real East End locations; organizations and people are invented so the
// demo never implies a partnership with a real nonprofit, school, or student.

// Relative to today so the demo always has upcoming events, whenever it's opened.
function daysFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

const CREATED_AT = daysFromToday(-60);

function profile(fields: Partial<Profile> & Pick<Profile, 'id' | 'account_type' | 'full_name'>): Profile {
  return {
    created_at: CREATED_AT,
    school_name: null,
    graduation_year: null,
    xp: 0,
    level: 1,
    streak: 0,
    last_streak_week: null,
    phone: null,
    ...fields,
  };
}

export const DEMO_STUDENT_ID = 'demo-student';
export const DEMO_ORG_ID = 'demo-org-shoreline';

export function buildSampleData() {
  const profiles: Profile[] = [
    profile({
      id: DEMO_STUDENT_ID,
      account_type: 'student',
      full_name: 'Maya Alvarez',
      school_name: 'South Fork High School',
      graduation_year: 2027,
      xp: 120,
      level: 2,
      streak: 3,
    }),
    profile({ id: 'demo-student-2', account_type: 'student', full_name: 'Jordan Kim', school_name: 'South Fork High School', graduation_year: 2026, xp: 210, level: 3 }),
    profile({ id: 'demo-student-3', account_type: 'student', full_name: 'Theo Brennan', school_name: 'South Fork High School', graduation_year: 2028, xp: 60, level: 1 }),
    profile({ id: 'demo-student-4', account_type: 'student', full_name: 'Ava Reyes', school_name: 'South Fork High School', graduation_year: 2027, xp: 90, level: 1 }),
    profile({ id: 'demo-student-5', account_type: 'student', full_name: 'Sam Okafor', school_name: 'South Fork High School', graduation_year: 2026, xp: 330, level: 4 }),
    profile({ id: DEMO_ORG_ID, account_type: 'org', full_name: 'South Fork Shoreline Crew' }),
    profile({ id: 'demo-org-dunes', account_type: 'org', full_name: 'Montauk Dune Keepers' }),
    profile({ id: 'demo-org-reef', account_type: 'org', full_name: 'Bayside Reef Watch' }),
    profile({ id: 'demo-org-trails', account_type: 'org', full_name: 'South Fork Trail Stewards' }),
    profile({ id: 'demo-org-pantry', account_type: 'org', full_name: 'Good Ground Neighbors' }),
  ];

  const opp = (
    id: string,
    org_id: string,
    days: number,
    title: string,
    location: string,
    hours_value: number,
    capacity: number | null,
    description: string
  ): Opportunity => ({ id, org_id, title, description, location, date: daysFromToday(days), hours_value, capacity, created_at: CREATED_AT });

  const opportunities: Opportunity[] = [
    // Past events — these make up Maya's existing service history
    opp('past-1', DEMO_ORG_ID, -24, 'Main Beach morning cleanup', 'Main Beach, East Hampton', 3, null,
      'Sweep the beach and parking area for plastic, fishing line, and summer leftovers before the fall tides pull it out to sea.'),
    opp('past-2', 'demo-org-trails', -12, 'Long Pond Greenbelt trail clearing', 'Long Pond Greenbelt, Sag Harbor', 4, 12,
      'Clear fallen branches and invasive vines from the main loop so the trail stays open through the winter.'),
    opp('past-4', 'demo-org-dunes', -45, 'Ditch Plains spring dune planting', 'Ditch Plains, Montauk', 5, 15,
      'Plant beach grass along the bluff trail before the summer crowds arrive.'),
    opp('past-3', 'demo-org-dunes', -5, 'Hither Hills dune fencing repair', 'Hither Hills State Park, Montauk', 3, 10,
      'Reset sand fencing that keeps foot traffic off the dunes. No experience needed. Wear closed-toe shoes.'),

    // Upcoming — what shows up on the discover screen
    opp('opp-1', DEMO_ORG_ID, 3, 'Main Beach fall cleanup', 'Main Beach, East Hampton', 2, 20,
      'Join a crew of students for a two-hour sweep of Main Beach. Bags, gloves, and grabbers provided. We log everything we find so the town can track where debris comes from.'),
    opp('opp-2', 'demo-org-dunes', 6, 'Ditch Plains dune grass planting', 'Ditch Plains, Montauk', 3, 15,
      'Plant American beach grass to rebuild dunes worn down by storms. Beach grass roots hold sand in place and protect the bluffs behind them.'),
    opp('opp-3', 'demo-org-reef', 9, 'Oyster reef monitoring', 'Shinnecock Bay, Hampton Bays', 3, 8,
      'Wade out from Ponquogue Beach with our team to measure oyster growth and count species living on the restored reef. Data goes into a long-term water quality study.'),
    opp('opp-4', 'demo-org-reef', 11, 'Oyster cage scrubbing', 'Shinnecock Bay, Hampton Bays', 2, 4,
      'Scrub algae off juvenile oyster cages so the young oysters get enough water flow to grow. Expect to get muddy.'),
    opp('opp-5', DEMO_ORG_ID, 14, 'Cooper\'s Beach shoreline survey', 'Cooper\'s Beach, Southampton', 2.5, null,
      'Walk a measured section of shoreline and record debris, erosion, and wildlife sightings. Great for anyone interested in environmental science.'),
    opp('opp-6', 'demo-org-pantry', 17, 'Community food drive sorting', 'Good Ground Park, Hampton Bays', 3, 25,
      'Sort and pack donated food for local families heading into the off-season, when a lot of seasonal jobs disappear.'),
    opp('opp-7', 'demo-org-dunes', 21, 'Shorebird nesting area fencing', 'Sagg Main Beach, Sagaponack', 2, 10,
      'Help take down symbolic fencing from this summer\'s piping plover nesting areas and log the posts for next spring.'),
    opp('opp-8', 'demo-org-trails', 26, 'Napeague trail marker refresh', 'Napeague State Park, Amagansett', 2.5, null,
      'Repaint faded trail blazes and replace missing markers along the walking trails between the bay and the ocean.'),
  ];

  const signup = (opportunity_id: string, student_id: string, days: number): OpportunitySignup => ({
    id: `${opportunity_id}-${student_id}`,
    opportunity_id,
    student_id,
    signed_up_at: daysFromToday(days),
  });

  const signups: OpportunitySignup[] = [
    signup('past-4', DEMO_STUDENT_ID, -50),
    signup('past-1', DEMO_STUDENT_ID, -30),
    signup('past-2', DEMO_STUDENT_ID, -20),
    signup('past-1', 'demo-student-2', -28),
    signup('past-3', 'demo-student-3', -9),
    signup('opp-1', DEMO_STUDENT_ID, -2),
    signup('opp-1', 'demo-student-2', -3),
    // Fills "Oyster cage scrubbing" so the demo shows how full events behave
    signup('opp-4', 'demo-student-2', -4),
    signup('opp-4', 'demo-student-3', -4),
    signup('opp-4', 'demo-student-4', -3),
    signup('opp-4', 'demo-student-5', -1),
  ];

  const log = (
    id: string,
    opportunity_id: string,
    student_id: string,
    hours_logged: number,
    days: number,
    status: HourLog['status'],
    service_description: string | null
  ): HourLog => ({
    id,
    opportunity_id,
    student_id,
    hours_logged,
    actual_date: daysFromToday(days),
    service_description,
    status,
    submitted_at: daysFromToday(days + 1),
    verified_at: status === 'verified' ? daysFromToday(days + 2) : null,
  });

  // Maya's 120 xp must equal round(hours * 10) summed over her verified logs (3 + 4 + 5 hours),
  // the same formula the database trigger uses.
  const hourLogs: HourLog[] = [
    log('log-0', 'past-4', DEMO_STUDENT_ID, 5, -45, 'verified', 'Planted beach grass plugs along the bluff trail.'),
    log('log-1', 'past-1', DEMO_STUDENT_ID, 3, -24, 'verified', 'Cleaned the north end of the beach and the dune crossover paths.'),
    log('log-2', 'past-2', DEMO_STUDENT_ID, 4, -12, 'verified', 'Cleared the east loop and hauled brush to the trailhead.'),
    log('log-3', 'past-1', 'demo-student-2', 3, -24, 'pending', 'Picked up trash along the parking lot and beach entrance.'),
    log('log-4', 'past-3', 'demo-student-3', 3, -5, 'pending', 'Reset about forty feet of sand fence near the campground.'),
  ];

  return { profiles, opportunities, signups, hourLogs };
}
