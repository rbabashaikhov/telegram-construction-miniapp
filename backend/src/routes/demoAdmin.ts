import { Router } from 'express';
import { isDemoAdminPreviewEnabled } from '../config.js';
import { AppError } from '../errors.js';
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

export function createDemoAdminRouter(
  data: Providers = defaultProviders,
  options?: { isEnabled?: () => boolean },
): Router {
  const router = Router();
  const isEnabled = options?.isEnabled ?? (() => isDemoAdminPreviewEnabled());

  router.use((req, res, next) => {
    if (!isEnabled()) {
      res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
      return;
    }
    if (req.method !== 'GET') {
      res.status(405).json({
        error: 'Demo admin is read-only',
        code: 'DEMO_ADMIN_READ_ONLY',
      });
      return;
    }
    next();
  });

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
      const lead = data.leads.getLead(Number(req.params.id));
      if (!lead) throw new AppError('Lead not found', 404, 'LEAD_NOT_FOUND');
      res.json({ data: serializeLead(lead) });
    }),
  );

  router.get(
    '/projects',
    asyncHandler((_req, res) => {
      res.json({ data: data.catalog.listProjects().map(serializeProject) });
    }),
  );

  router.get(
    '/materials',
    asyncHandler((_req, res) => {
      res.json({ data: data.catalog.listMaterials().map(serializeMaterial) });
    }),
  );

  router.get(
    '/packages',
    asyncHandler((_req, res) => {
      res.json({ data: data.catalog.listPackages().map(serializePackage) });
    }),
  );

  mountErrorHandler(router);
  return router;
}

export const demoAdminRouter = createDemoAdminRouter();
