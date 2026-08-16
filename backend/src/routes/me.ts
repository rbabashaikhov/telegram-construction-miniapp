import { Router } from 'express';
import { AppError } from '../errors.js';
import { authMiddleware } from '../middleware/auth.js';
import { providers as defaultProviders } from '../container.js';
import type { Providers } from '../providers/types.js';
import { asyncHandler, mountErrorHandler, requireAuthUser } from './helpers.js';
import {
  serializeDocument,
  serializeInstance,
  serializePaymentSummary,
  serializeStage,
  serializeUpdate,
} from './serialize.js';

function requireCustomerProject(data: Providers, telegramUserId: number) {
  const customer = data.customers.getByTelegramUserId(telegramUserId);
  if (!customer) {
    throw new AppError('Client project not found', 404, 'PROJECT_NOT_FOUND');
  }
  const instance = data.construction.getInstanceByCustomer(customer.id);
  if (!instance) {
    throw new AppError('Client project not found', 404, 'PROJECT_NOT_FOUND');
  }
  return instance;
}

export function createMeRouter(data: Providers = defaultProviders): Router {
  const router = Router();
  router.use(authMiddleware);

  router.get(
    '/project',
    asyncHandler((req, res) => {
      const user = requireAuthUser(req);
      const instance = requireCustomerProject(data, user.id);
      const stages = data.construction.listStages(instance.id);
      const currentStage =
        stages.find((stage) => stage.status === 'in_progress') ??
        stages.find((stage) => stage.status === 'delayed') ??
        stages.find((stage) => stage.status === 'pending') ??
        stages[stages.length - 1] ??
        null;
      res.json({
        data: {
          ...serializeInstance(instance),
          currentStage: currentStage ? serializeStage(currentStage) : null,
        },
      });
    }),
  );

  router.get(
    '/project/stages',
    asyncHandler((req, res) => {
      const user = requireAuthUser(req);
      const instance = requireCustomerProject(data, user.id);
      res.json({ data: data.construction.listStages(instance.id).map(serializeStage) });
    }),
  );

  router.get(
    '/project/updates',
    asyncHandler((req, res) => {
      const user = requireAuthUser(req);
      const instance = requireCustomerProject(data, user.id);
      res.json({ data: data.construction.listUpdates(instance.id).map(serializeUpdate) });
    }),
  );

  router.get(
    '/project/documents',
    asyncHandler((req, res) => {
      const user = requireAuthUser(req);
      const instance = requireCustomerProject(data, user.id);
      res.json({ data: data.construction.listDocuments(instance.id).map(serializeDocument) });
    }),
  );

  router.get(
    '/project/payments',
    asyncHandler((req, res) => {
      const user = requireAuthUser(req);
      const instance = requireCustomerProject(data, user.id);
      const items = data.construction.listPayments(instance.id);
      const paidAmount = items.filter((item) => item.status === 'paid').reduce((sum, item) => sum + item.amount, 0);
      const nextPayment =
        items.find((item) => item.status === 'due') ?? items.find((item) => item.status === 'planned') ?? null;
      res.json({
        data: serializePaymentSummary({
          contractAmount: instance.contractAmount,
          paidAmount,
          nextPayment,
          items,
        }),
      });
    }),
  );

  mountErrorHandler(router);
  return router;
}

export const meRouter = createMeRouter();
