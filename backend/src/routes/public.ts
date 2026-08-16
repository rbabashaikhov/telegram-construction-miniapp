import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../errors.js';
import { authMiddleware } from '../middleware/auth.js';
import { writeRateLimit } from '../middleware/rateLimit.js';
import { providers as defaultProviders } from '../container.js';
import type { Providers } from '../providers/types.js';
import { calculateQuoteSchema, resolveQuote } from '../services/quotes.js';
import { createLeadSchema, createQualifiedLead } from '../services/leads.js';
import { asyncHandler, mountErrorHandler, requireAuthUser } from './helpers.js';
import {
  serializeLead,
  serializeMaterial,
  serializePackage,
  serializeProject,
  serializeQuote,
} from './serialize.js';

export function createPublicRouter(data: Providers = defaultProviders): Router {
  const router = Router();

  router.get(
    '/projects',
    asyncHandler((_req, res) => {
      res.json({ data: data.catalog.listProjects({ activeOnly: true }).map(serializeProject) });
    }),
  );

  router.get(
    '/projects/:id',
    asyncHandler((req, res) => {
      const byId = Number(req.params.id);
      const project = Number.isFinite(byId)
        ? data.catalog.getProject(byId)
        : data.catalog.getProjectBySlug(req.params.id);
      if (!project || !project.active) {
        throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
      }
      res.json({ data: serializeProject(project) });
    }),
  );

  router.get(
    '/materials',
    asyncHandler((_req, res) => {
      res.json({ data: data.catalog.listMaterials({ activeOnly: true }).map(serializeMaterial) });
    }),
  );

  router.get(
    '/packages',
    asyncHandler((_req, res) => {
      res.json({ data: data.catalog.listPackages({ activeOnly: true }).map(serializePackage) });
    }),
  );

  router.post(
    '/quotes/calculate',
    writeRateLimit,
    asyncHandler((req, res) => {
      const parsed = calculateQuoteSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError('Invalid quote payload', 400, 'VALIDATION_ERROR', parsed.error.flatten());
      }
      const quote = resolveQuote(data, parsed.data);
      res.json({ data: serializeQuote(quote) });
    }),
  );

  router.post(
    '/leads',
    authMiddleware,
    writeRateLimit,
    asyncHandler((req, res) => {
      const user = requireAuthUser(req);
      const parsed = createLeadSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError('Invalid lead payload', 400, 'VALIDATION_ERROR', parsed.error.flatten());
      }
      const lead = createQualifiedLead(data, user, parsed.data);
      res.status(201).json({ data: serializeLead(lead) });
    }),
  );

  router.get(
    '/leads/:id',
    authMiddleware,
    asyncHandler((req, res) => {
      const user = requireAuthUser(req);
      const id = z.coerce.number().int().positive().parse(req.params.id);
      const lead = data.leads.getLead(id);
      if (!lead) {
        throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND');
      }
      const customer = data.customers.getByTelegramUserId(user.id);
      if (!customer || customer.id !== lead.customerId) {
        throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND');
      }
      res.json({ data: serializeLead(lead) });
    }),
  );

  router.get(
    '/leads',
    (_req, res) => {
      res.status(405).json({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' });
    },
  );

  mountErrorHandler(router);
  return router;
}

export const publicRouter = createPublicRouter();
