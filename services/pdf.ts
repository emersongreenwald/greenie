import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { ServiceRecord } from '../types/hours';
import type { Profile } from '../types/auth';

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function buildHTML(profile: Profile, records: ServiceRecord[]): string {
  const totalHours = records.reduce((sum, r) => sum + Number(r.hours_logged), 0);
  const uniqueOrgs = new Set(
    records.map((r) => r.opportunities?.profiles?.full_name).filter(Boolean)
  ).size;

  const schoolLine =
    profile.school_name
      ? `${profile.school_name}${profile.graduation_year ? ` · Class of ${profile.graduation_year}` : ''}`
      : '';

  const rows = records
    .map((r, i) => {
      const isLast = i === records.length - 1;
      const desc = r.service_description
        ? `<p class="desc">"${r.service_description}"</p>`
        : '';
      return `
        <div class="entry${isLast ? '' : ' border-bottom'}">
          <p class="entry-title">${r.opportunities?.title ?? 'Volunteer Service'}</p>
          <p class="entry-org">${r.opportunities?.profiles?.full_name ?? 'Organization'}</p>
          <p class="entry-meta">
            ${formatDate(r.actual_date)}
            <span class="dot">·</span>
            ${Number(r.hours_logged).toFixed(1)} ${Number(r.hours_logged) === 1 ? 'hour' : 'hours'} verified
          </p>
          ${desc}
        </div>`;
    })
    .join('');

  const emptyState =
    records.length === 0
      ? `<p style="color:#7e9488;font-size:13px;text-align:center;padding:32px 0;">
           No verified service yet.
         </p>`
      : rows;

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, Helvetica, Arial, sans-serif;
    background: #fff;
    color: #1c2620;
    font-size: 14px;
  }

  /* Header */
  .header {
    padding: 48px 48px 32px;
    border-bottom: 1px solid #e0d9d0;
  }
  .wordmark {
    color: #557A62;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.5px;
    text-transform: lowercase;
    margin-bottom: 28px;
  }
  .name {
    font-size: 26px;
    font-weight: 700;
    color: #1c2620;
    line-height: 1.2;
  }
  .school {
    color: #7e9488;
    font-size: 13px;
    margin-top: 4px;
  }

  /* Stats */
  .stats {
    display: flex;
    border-bottom: 1px solid #e0d9d0;
  }
  .stat {
    flex: 1;
    padding: 24px 32px;
    border-right: 1px solid #e0d9d0;
  }
  .stat:last-child { border-right: none; }
  .stat-number {
    font-size: 30px;
    font-weight: 700;
    color: #1c2620;
  }
  .stat-label {
    font-size: 10px;
    color: #7e9488;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 4px;
  }

  /* Log */
  .log-section { padding: 32px 48px; }
  .log-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 24px;
  }
  .log-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: #1c2620;
  }
  .log-count { font-size: 11px; color: #7e9488; }

  .entry { padding-bottom: 24px; margin-bottom: 24px; }
  .border-bottom { border-bottom: 1px solid #e0d9d0; }
  .entry-title { font-size: 15px; font-weight: 600; color: #1c2620; }
  .entry-org { font-size: 13px; font-weight: 500; color: #557A62; margin-top: 2px; }
  .entry-meta { font-size: 13px; color: #7e9488; margin-top: 8px; }
  .dot { margin: 0 8px; color: #e0d9d0; }
  .desc {
    font-size: 13px;
    color: #4a5e54;
    font-style: italic;
    margin-top: 10px;
    line-height: 1.6;
  }

  /* Footer */
  .footer {
    padding: 16px 48px 40px;
    border-top: 1px solid #e0d9d0;
    text-align: center;
  }
  .footer p { font-size: 10px; color: #7e9488; }
</style>
</head>
<body>

<div class="header">
  <div class="wordmark">greenie</div>
  <div class="name">${profile.full_name}</div>
  ${schoolLine ? `<div class="school">${schoolLine}</div>` : ''}
</div>

<div class="stats">
  <div class="stat">
    <div class="stat-number">${totalHours.toFixed(1)}</div>
    <div class="stat-label">Verified Hours</div>
  </div>
  <div class="stat">
    <div class="stat-number">${uniqueOrgs}</div>
    <div class="stat-label">Organizations</div>
  </div>
  <div class="stat">
    <div class="stat-number">${records.length}</div>
    <div class="stat-label">Completed</div>
  </div>
</div>

<div class="log-section">
  <div class="log-header">
    <span class="log-label">Service Log</span>
    <span class="log-count">${records.length} ${records.length === 1 ? 'entry' : 'entries'}</span>
  </div>
  ${emptyState}
</div>

<div class="footer">
  <p>Verified by Greenie · greenie.app</p>
</div>

</body>
</html>`;
}

export async function exportServiceRecordPDF(
  profile: Profile,
  records: ServiceRecord[]
): Promise<void> {
  const html = buildHTML(profile, records);
  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Share Service Record',
    UTI: 'com.adobe.pdf',
  });
}
