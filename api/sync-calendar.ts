import type { VercelRequest, VercelResponse } from '@vercel/node';
import ical from 'ical';
import fetch from 'node-fetch';
import dayjs from 'dayjs';
import { supabaseServer } from '../lib/supabaseServer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });
    const { calendar_source_id } = req.body || {};
    if (!calendar_source_id) return res.status(400).json({ error: 'calendar_source_id required' });

    const { data: src } = await supabaseServer.from('calendar_sources').select('*').eq('id', calendar_source_id).single();
    if (!src?.is_active) return res.status(400).json({ error: 'calendar source inactive or missing' });
    if (!src.ics_url) return res.status(400).json({ error: 'ics_url required for this source' });

    const r = await fetch(src.ics_url);
    if (!r.ok) return res.status(400).json({ error: `Fetch failed ${r.status}` });
    const text = await r.text();
    const data = ical.parseICS(text);

    const blocks = [] as { title: string; start_at: string; end_at: string }[];
    for (const k of Object.keys(data)) {
      const ev: any = (data as any)[k];
      if (!ev || ev.type !== 'VEVENT') continue;
      const start = ev.start && dayjs(ev.start).toISOString();
      const end = ev.end && dayjs(ev.end).toISOString();
      if (!start || !end) continue;
      blocks.push({
        title: (ev.summary || 'Busy').toString().slice(0, 200),
        start_at: start,
        end_at: end,
      });
    }

    const now = dayjs();
    const horizon = now.add(60, 'day');

    await supabaseServer
      .from('availability_blocks')
      .delete()
      .gte('start_at', now.startOf('day').toISOString())
      .lte('end_at', horizon.endOf('day').toISOString())
      .eq('source', `ics:${src.id}`);

    const batch = blocks
      .filter((b) => dayjs(b.start_at).isBefore(horizon) && dayjs(b.end_at).isAfter(now))
      .map((b) => ({ ...b, is_blocked: true, source: `ics:${src.id}` }));
    if (batch.length) {
      const { error: insErr } = await supabaseServer.from('availability_blocks').insert(batch);
      if (insErr) return res.status(500).json({ error: insErr.message });
    }
    await supabaseServer.from('calendar_sources').update({ last_synced_at: new Date().toISOString() }).eq('id', src.id);
    return res.status(200).json({ imported: batch.length });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
