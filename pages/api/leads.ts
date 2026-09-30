import type { NextApiRequest, NextApiResponse } from 'next';
import { LeadRecord } from '../../lib/leads-csv';
import { loadLeadsFromDisk, saveLeadsToDisk } from '../../lib/leads-csv-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const leads = loadLeadsFromDisk();
      return res.status(200).json({ leads, count: leads.length });
    } catch (error: any) {
      return res.status(500).json({ error: error?.message || 'Failed to load leads from disk' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body;

      if (!body) {
        return res.status(400).json({ error: 'Missing request body' });
      }

      let leads: LeadRecord[] = [];

      if (Array.isArray(body.leads)) {
        leads = body.leads;
      } else if (body.lead) {
        // Update or insert single lead
        const existingLeads = loadLeadsFromDisk();
        const incomingLead: LeadRecord = body.lead;
        const index = existingLeads.findIndex(l => l.leadId === incomingLead.leadId);

        if (index >= 0) {
          existingLeads[index] = { ...existingLeads[index], ...incomingLead };
        } else {
          existingLeads.push(incomingLead);
        }
        leads = existingLeads;
      } else if (body.deleteLeadId) {
        // Delete lead
        const existingLeads = loadLeadsFromDisk();
        leads = existingLeads.filter(l => l.leadId !== body.deleteLeadId);
      } else {
        return res.status(400).json({ error: 'Invalid payload. Expected "leads", "lead", or "deleteLeadId".' });
      }

      const result = saveLeadsToDisk(leads);

      if (!result.success) {
        return res.status(500).json({ error: result.error || 'Failed to save leads to disk' });
      }

      return res.status(200).json({
        success: true,
        message: 'Leads CSV successfully updated on disk',
        count: leads.length,
      });
    } catch (error: any) {
      return res.status(500).json({ error: error?.message || 'Failed to process leads update' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
