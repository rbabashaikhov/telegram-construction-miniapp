import { z } from 'zod';
import { AppError } from '../errors.js';
import { scoreLead } from '../domain/scoring.js';
import type { Providers } from '../providers/types.js';
import type { LeadWithDetails, TelegramUser } from '../types.js';
import { calculateQuoteSchema, resolveQuote } from './quotes.js';

export const createLeadSchema = calculateQuoteSchema.extend({
  hasLand: z.enum(['yes', 'choosing', 'no']),
  region: z.string().trim().min(2).max(120),
  desiredStartPeriod: z.enum(['asap', '1_3', '3_6', '6_12', 'exploring']),
  budgetRange: z.enum(['under_7', '7_10', '10_15', '15_20', '20_plus']),
  name: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().min(6).max(32).optional(),
  username: z.string().trim().min(2).max(64).optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;

export function createQualifiedLead(
  data: Providers,
  user: TelegramUser,
  input: CreateLeadInput,
): LeadWithDetails {
  const quote = resolveQuote(data, input);
  const scored = scoreLead({
    hasLand: input.hasLand,
    desiredStartPeriod: input.desiredStartPeriod,
    budgetRange: input.budgetRange,
    quoteFrom: quote.priceFrom,
    quoteTo: quote.priceTo,
    hasProject: true,
    hasMaterial: true,
    hasPackage: true,
  });

  return data.transaction(() => {
    const customer = data.customers.upsert(user, {
      name: input.name,
      phone: input.phone,
    });
    if (input.username || input.phone || input.name) {
      data.customers.update(customer.id, {
        name: input.name,
        phone: input.phone ?? null,
        username: input.username ?? user.username ?? null,
      });
    }
    const storedQuote = data.quotes.insert({
      customerId: customer.id,
      projectId: quote.project.id,
      area: input.area,
      materialId: quote.material.id,
      packageId: quote.package.id,
      options: input.options ?? [],
      subtotal: quote.subtotal,
      priceFrom: quote.priceFrom,
      priceTo: quote.priceTo,
      durationMonthsFrom: quote.durationMonthsFrom,
      durationMonthsTo: quote.durationMonthsTo,
      breakdown: quote.breakdown,
    });
    const lead = data.leads.createLead({
      customerId: customer.id,
      projectId: quote.project.id,
      requestedArea: input.area,
      materialId: quote.material.id,
      packageId: quote.package.id,
      quoteId: storedQuote.id,
      quoteFrom: quote.priceFrom,
      quoteTo: quote.priceTo,
      durationMonthsFrom: quote.durationMonthsFrom,
      durationMonthsTo: quote.durationMonthsTo,
      hasLand: input.hasLand,
      region: input.region,
      desiredStartPeriod: input.desiredStartPeriod,
      budgetRange: input.budgetRange,
      score: scored.score,
      temperature: scored.temperature,
      reasons: scored.reasons,
      status: 'new',
      notes: null,
    });
    data.events.publish('lead.created', {
      leadId: lead.id,
      customerId: customer.id,
      score: scored.score,
      temperature: scored.temperature,
      quoteFrom: quote.priceFrom,
      quoteTo: quote.priceTo,
    });
    if (scored.temperature === 'hot' || scored.score >= 75) {
      data.events.publish('lead.qualified', {
        leadId: lead.id,
        score: scored.score,
        temperature: scored.temperature,
      });
    }
    const created = data.leads.getLead(lead.id);
    if (!created) {
      throw new AppError('Lead was not stored', 500, 'LEAD_CREATE_FAILED');
    }
    return created;
  });
}
