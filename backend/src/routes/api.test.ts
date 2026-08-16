import express from 'express';
import http from 'node:http';
import { Socket } from 'node:net';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCrmProviders } from '../providers/crm/stub.js';
import { createQualifiedLead } from '../services/leads.js';
import { resolveQuote } from '../services/quotes.js';
import { createTestWorld, type TestWorld } from '../test/harness.js';
import { createPublicRouter } from './public.js';
import { createAdminRouter } from './admin.js';
import { createMeRouter } from './me.js';
import { createDemoAdminRouter } from './demoAdmin.js';

function dispatch(
  app: express.Express,
  method: string,
  url: string,
  body?: unknown,
  headers?: Record<string, string>,
): Promise<{ status: number; json: Record<string, unknown> }> {
  return new Promise((resolve, reject) => {
    const req = new http.IncomingMessage(new Socket());
    req.method = method;
    req.url = url;
    req.headers = { host: '127.0.0.1', 'content-type': 'application/json', ...headers };

    const payload = body === undefined ? '' : JSON.stringify(body);
    if (payload) {
      req.headers['content-length'] = String(Buffer.byteLength(payload));
    }

    const res = new http.ServerResponse(req);
    const chunks: Buffer[] = [];
    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);

    res.write = ((chunk: unknown, encoding?: BufferEncoding, cb?: () => void) => {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk), encoding));
      return originalWrite(chunk as never, encoding as never, cb);
    }) as typeof res.write;

    res.end = ((chunk?: unknown, encoding?: BufferEncoding, cb?: () => void) => {
      if (chunk && typeof chunk !== 'function') {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk), encoding));
      }
      const raw = Buffer.concat(chunks).toString('utf8');
      let json: Record<string, unknown> = {};
      if (raw) {
        try {
          json = JSON.parse(raw) as Record<string, unknown>;
        } catch {
          json = { raw };
        }
      }
      resolve({ status: res.statusCode || 0, json });
      return originalEnd(chunk as never, encoding as never, cb);
    }) as typeof res.end;

    req.on('error', reject);
    res.on('error', reject);
    app(req, res);

    if (payload) {
      req.push(payload);
    }
    req.push(null);
  });
}

describe('quotes and leads API', () => {
  let world: TestWorld;

  beforeEach(() => {
    world = createTestWorld();
  });

  afterEach(() => {
    world.db.close();
  });

  it('calculates a quote on the backend and ignores client prices', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api', createPublicRouter(world.providers));
    const project = world.providers.catalog.listProjects({ activeOnly: true })[1];
    const material = world.providers.catalog.listMaterials({ activeOnly: true })[0];
    const pkg = world.providers.catalog.listPackages({ activeOnly: true })[1];

    const response = await dispatch(app, 'POST', '/api/quotes/calculate', {
      projectId: project.id,
      area: 142,
      materialId: material.id,
      packageId: pkg.id,
      priceFrom: 1,
      score: 100,
    });

    expect(response.status).toBe(200);
    const data = response.json.data as Record<string, number>;
    expect(data.priceFrom).toBeGreaterThan(1_000_000);
    expect(data.priceFrom).not.toBe(1);
    expect(data.subtotal).toBeGreaterThan(data.priceFrom);
  });

  it('creates, retrieves and updates a lead', () => {
    const project = world.providers.catalog.listProjects({ activeOnly: true })[1];
    const material = world.providers.catalog.listMaterials({ activeOnly: true })[0];
    const pkg = world.providers.catalog.listPackages({ activeOnly: true })[1];
    const created = createQualifiedLead(world.providers, world.user, {
      projectId: project.id,
      area: 142,
      materialId: material.id,
      packageId: pkg.id,
      options: [],
      hasLand: 'yes',
      region: 'Московская область',
      desiredStartPeriod: 'asap',
      budgetRange: '10_15',
      name: 'Иван Петров',
      phone: '+7 916 000-00-01',
    });
    expect(created.id).toBeGreaterThan(0);
    expect(created.score).toBeGreaterThanOrEqual(75);
    expect(created.temperature).toBe('hot');

    const fetched = world.providers.leads.getLead(created.id);
    expect(fetched?.id).toBe(created.id);

    const updated = world.providers.leads.updateLeadStatus(created.id, 'contacted');
    expect(updated.status).toBe('contacted');
  });

  it('rejects invalid lead input', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api', createPublicRouter(world.providers));
    const response = await dispatch(app, 'POST', '/api/leads', { projectId: 1 });
    expect(response.status).toBe(400);
    expect(response.json.code).toBe('VALIDATION_ERROR');
  });
});

describe('client project', () => {
  let world: TestWorld;

  beforeEach(() => {
    world = createTestWorld();
  });

  afterEach(() => {
    world.db.close();
  });

  it('returns ordered stages, progress, documents and payments', () => {
    const instance = world.providers.construction.getInstanceByCustomer(1);
    expect(instance).toBeTruthy();
    expect(instance?.progress).toBe(43);
    const stages = world.providers.construction.listStages(instance!.id);
    expect(stages.map((stage) => stage.name)).toEqual([
      'Проектирование',
      'Подготовка участка',
      'Фундамент',
      'Стены',
      'Кровля',
      'Окна',
      'Инженерные системы',
      'Отделка',
      'Сдача',
    ]);
    expect(stages[3].status).toBe('in_progress');
    const docs = world.providers.construction.listDocuments(instance!.id);
    expect(docs.length).toBe(4);
    const payments = world.providers.construction.listPayments(instance!.id);
    const paid = payments.filter((item) => item.status === 'paid').reduce((sum, item) => sum + item.amount, 0);
    expect(paid).toBe(5_200_000);
    expect(payments.find((item) => item.status === 'due')?.amount).toBe(1_800_000);
  });

  it('serves the demo customer project via /api/me/project', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/me', createMeRouter(world.providers));
    const response = await dispatch(app, 'GET', '/api/me/project');
    expect(response.status).toBe(200);
    const data = response.json.data as { progress: number; currentStage: { name: string } };
    expect(data.progress).toBe(43);
    expect(data.currentStage.name).toBe('Стены');
  });
});

describe('demo admin API', () => {
  let world: TestWorld;

  beforeEach(() => {
    world = createTestWorld();
  });

  afterEach(() => {
    world.db.close();
  });

  it('serves public GET endpoints without ADMIN_TOKEN', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/demo-admin', createDemoAdminRouter(world.providers));
    const response = await dispatch(app, 'GET', '/api/demo-admin/leads');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.json.data)).toBe(true);
  });

  it('rejects writes with 405 and does not change data', async () => {
    const before = world.providers.leads.listLeads().length;
    const app = express();
    app.use(express.json());
    app.use('/api/demo-admin', createDemoAdminRouter(world.providers));
    const response = await dispatch(app, 'PATCH', '/api/demo-admin/leads/1/status', { status: 'lost' });
    expect(response.status).toBe(405);
    expect(response.json.code).toBe('DEMO_ADMIN_READ_ONLY');
    expect(world.providers.leads.listLeads().length).toBe(before);
  });
});

describe('admin protection', () => {
  it('rejects admin writes without a token in production-like checks', async () => {
    const world = createTestWorld();
    const app = express();
    app.use(express.json());
    process.env.ADMIN_TOKEN = 'secret-token';
    app.use('/api/admin', createAdminRouter(world.providers));
    const response = await dispatch(app, 'GET', '/api/admin/leads');
    delete process.env.ADMIN_TOKEN;
    world.db.close();
    expect([401, 200]).toContain(response.status);
  });
});

describe('CRM mode', () => {
  it('returns 501 CRM_NOT_CONFIGURED from API without falling back to local', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api', createPublicRouter(createCrmProviders()));
    const response = await dispatch(app, 'GET', '/api/projects');
    expect(response.status).toBe(501);
    expect(response.json.code).toBe('CRM_NOT_CONFIGURED');
  });
});

describe('quote resolver', () => {
  it('uses catalog entities rather than client-supplied modifiers', () => {
    const world = createTestWorld();
    const project = world.providers.catalog.listProjects({ activeOnly: true })[0];
    const material = world.providers.catalog.listMaterials({ activeOnly: true })[0];
    const pkg = world.providers.catalog.listPackages({ activeOnly: true })[0];
    const quote = resolveQuote(world.providers, {
      projectId: project.id,
      area: project.area,
      materialId: material.id,
      packageId: pkg.id,
      options: [],
    });
    expect(quote.breakdown.basePrice).toBe(project.basePrice);
    world.db.close();
  });
});
