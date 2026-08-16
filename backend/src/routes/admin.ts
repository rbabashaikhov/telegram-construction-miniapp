import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../errors.js';
import { adminAuthMiddleware } from '../middleware/adminAuth.js';
import { providers as defaultProviders } from '../container.js';
import type { Providers } from '../providers/types.js';
import { LEAD_STATUSES, LEAD_TEMPERATURES } from '../types.js';
import { asyncHandler, mountErrorHandler } from './helpers.js';
import {
  serializeLead,
  serializeMaterial,
  serializePackage,
  serializeProject,
} from './serialize.js';

const statusSchema = z.object({
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']),
});

const projectPatchSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  description: z.string().max(2000).optional(),
  floors: z.number().int().min(1).max(4).optional(),
  area: z.number().int().min(40).max(500).optional(),
  bedrooms: z.number().int().min(1).max(10).optional(),
  bathrooms: z.number().int().min(1).max(6).optional(),
  basePrice: z.number().int().min(100000).max(100_000_000).optional(),
  constructionDurationMonths: z.number().int().min(3).max(36).optional(),
  active: z.boolean().optional(),
  displayOrder: z.number().int().min(0).max(100).optional(),
  areaOptions: z.array(z.number().int().min(40).max(500)).min(1).max(8).optional(),
});

const materialPatchSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  description: z.string().max(1000).optional(),
  priceModifierType: z.enum(['percent', 'fixed']).optional(),
  priceModifierValue: z.number().min(-50).max(200).optional(),
  durationDeltaMonths: z.number().int().min(-6).max(12).optional(),
  active: z.boolean().optional(),
  displayOrder: z.number().int().min(0).max(100).optional(),
});

const packagePatchSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  description: z.string().max(1000).optional(),
  multiplier: z.number().min(0.5).max(4).optional(),
  durationDeltaMonths: z.number().int().min(-6).max(12).optional(),
  features: z.array(z.string().min(1).max(80)).max(20).optional(),
  active: z.boolean().optional(),
  displayOrder: z.number().int().min(0).max(100).optional(),
});

export function createAdminRouter(data: Providers = defaultProviders): Router {
  const router = Router();
  router.use(adminAuthMiddleware);

  router.get(
    '/leads',
    asyncHandler((req, res) => {
      const status = typeof req.query.status === 'string' ? req.query.status : undefined;
      const temperature = typeof req.query.temperature === 'string' ? req.query.temperature : undefined;
      const projectId = req.query.projectId ? Number(req.query.projectId) : undefined;
      if (status && !LEAD_STATUSES.includes(status as never)) {
        throw new AppError('Invalid status filter', 400, 'VALIDATION_ERROR');
      }
      if (temperature && !LEAD_TEMPERATURES.includes(temperature as never)) {
        throw new AppError('Invalid temperature filter', 400, 'VALIDATION_ERROR');
      }
      res.json({
        data: data.leads
          .listLeads({
            status: status as never,
            temperature: temperature as never,
            projectId: Number.isFinite(projectId) ? projectId : undefined,
            dateFrom: typeof req.query.dateFrom === 'string' ? req.query.dateFrom : undefined,
            dateTo: typeof req.query.dateTo === 'string' ? req.query.dateTo : undefined,
          })
          .map(serializeLead),
      });
    }),
  );

  router.get(
    '/leads/:id',
    asyncHandler((req, res) => {
      const id = Number(req.params.id);
      const lead = data.leads.getLead(id);
      if (!lead) throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND');
      res.json({ data: serializeLead(lead) });
    }),
  );

  router.patch(
    '/leads/:id/status',
    asyncHandler((req, res) => {
      const parsed = statusSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError('Invalid status', 400, 'VALIDATION_ERROR', parsed.error.flatten());
      }
      const id = Number(req.params.id);
      const updated = data.leads.updateLeadStatus(id, parsed.data.status);
      data.events.publish('lead.updated', { leadId: updated.id, status: updated.status });
      res.json({ data: serializeLead(updated) });
    }),
  );

  router.get(
    '/projects',
    asyncHandler((_req, res) => {
      res.json({ data: data.catalog.listProjects().map(serializeProject) });
    }),
  );

  router.patch(
    '/projects/:id',
    asyncHandler((req, res) => {
      const parsed = projectPatchSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError('Invalid project payload', 400, 'VALIDATION_ERROR', parsed.error.flatten());
      }
      const updated = data.catalog.updateProject(Number(req.params.id), parsed.data);
      res.json({ data: serializeProject(updated) });
    }),
  );

  router.get(
    '/materials',
    asyncHandler((_req, res) => {
      res.json({ data: data.catalog.listMaterials().map(serializeMaterial) });
    }),
  );

  router.patch(
    '/materials/:id',
    asyncHandler((req, res) => {
      const parsed = materialPatchSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError('Invalid material payload', 400, 'VALIDATION_ERROR', parsed.error.flatten());
      }
      const updated = data.catalog.updateMaterial(Number(req.params.id), parsed.data);
      res.json({ data: serializeMaterial(updated) });
    }),
  );

  router.get(
    '/packages',
    asyncHandler((_req, res) => {
      res.json({ data: data.catalog.listPackages().map(serializePackage) });
    }),
  );

  router.patch(
    '/packages/:id',
    asyncHandler((req, res) => {
      const parsed = packagePatchSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError('Invalid package payload', 400, 'VALIDATION_ERROR', parsed.error.flatten());
      }
      const updated = data.catalog.updatePackage(Number(req.params.id), parsed.data);
      res.json({ data: serializePackage(updated) });
    }),
  );

  mountErrorHandler(router);
  return router;
}

export const adminRouter = createAdminRouter();
