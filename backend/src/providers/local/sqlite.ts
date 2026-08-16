import type Database from 'better-sqlite3';
import { AppError } from '../../errors.js';
import type {
  ConstructionMaterial,
  ConstructionStage,
  Customer,
  HouseProject,
  Lead,
  LeadStatus,
  LeadWithDetails,
  OutboundEvent,
  Package,
  PaymentScheduleItem,
  ProgressUpdate,
  ProjectDocument,
  ProjectInstance,
  ProjectInstanceDetails,
  ProjectManager,
  Quote,
  TelegramUser,
} from '../../types.js';
import type {
  CatalogProvider,
  ConstructionProvider,
  CustomerProvider,
  LeadListFilters,
  LeadProvider,
  OutboundEventPublisher,
  Providers,
  QuoteProvider,
} from '../types.js';

function nowSql(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function mapCustomer(row: Record<string, unknown>): Customer {
  return {
    id: Number(row.id),
    telegramUserId: row.telegram_user_id == null ? null : Number(row.telegram_user_id),
    name: String(row.name ?? ''),
    phone: row.phone == null ? null : String(row.phone),
    username: row.username == null ? null : String(row.username),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapProject(row: Record<string, unknown>): HouseProject {
  return {
    id: Number(row.id),
    slug: String(row.slug),
    name: String(row.name),
    description: String(row.description ?? ''),
    floors: Number(row.floors),
    area: Number(row.area),
    bedrooms: Number(row.bedrooms),
    bathrooms: Number(row.bathrooms),
    style: String(row.style),
    basePrice: Number(row.base_price),
    constructionDurationMonths: Number(row.construction_duration_months),
    image: String(row.image ?? ''),
    gallery: parseJson<string[]>(String(row.gallery_json ?? '[]'), []),
    areaOptions: parseJson<number[]>(String(row.area_options_json ?? '[]'), []),
    features: parseJson<string[]>(String(row.features_json ?? '[]'), []),
    active: Boolean(row.active),
    displayOrder: Number(row.display_order),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapMaterial(row: Record<string, unknown>): ConstructionMaterial {
  return {
    id: Number(row.id),
    name: String(row.name),
    slug: String(row.slug),
    priceModifierType: row.price_modifier_type === 'fixed' ? 'fixed' : 'percent',
    priceModifierValue: Number(row.price_modifier_value),
    durationDeltaMonths: Number(row.duration_delta_months),
    description: String(row.description ?? ''),
    active: Boolean(row.active),
    displayOrder: Number(row.display_order),
  };
}

function mapPackage(row: Record<string, unknown>): Package {
  return {
    id: Number(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: String(row.description ?? ''),
    multiplier: Number(row.multiplier),
    durationDeltaMonths: Number(row.duration_delta_months),
    features: parseJson<string[]>(String(row.features_json ?? '[]'), []),
    active: Boolean(row.active),
    displayOrder: Number(row.display_order),
  };
}

function mapQuote(row: Record<string, unknown>): Quote {
  return {
    id: Number(row.id),
    customerId: row.customer_id == null ? null : Number(row.customer_id),
    projectId: Number(row.project_id),
    area: Number(row.area),
    materialId: Number(row.material_id),
    packageId: Number(row.package_id),
    options: parseJson(String(row.options_json ?? '[]'), []),
    subtotal: Number(row.subtotal),
    priceFrom: Number(row.price_from),
    priceTo: Number(row.price_to),
    durationMonthsFrom: Number(row.duration_months_from),
    durationMonthsTo: Number(row.duration_months_to),
    breakdown: parseJson(String(row.breakdown_json ?? '{}'), {
      basePrice: 0,
      area: 0,
      projectArea: 0,
      areaModifier: 1,
      materialModifier: 1,
      packageMultiplier: 1,
      optionsTotal: 0,
    }),
    createdAt: String(row.created_at),
  };
}

function mapLead(row: Record<string, unknown>): Lead {
  return {
    id: Number(row.id),
    customerId: Number(row.customer_id),
    projectId: Number(row.project_id),
    requestedArea: Number(row.requested_area),
    materialId: Number(row.material_id),
    packageId: Number(row.package_id),
    quoteId: row.quote_id == null ? null : Number(row.quote_id),
    quoteFrom: Number(row.quote_from),
    quoteTo: Number(row.quote_to),
    durationMonthsFrom: Number(row.duration_months_from),
    durationMonthsTo: Number(row.duration_months_to),
    hasLand: row.has_land as Lead['hasLand'],
    region: String(row.region),
    desiredStartPeriod: row.desired_start_period as Lead['desiredStartPeriod'],
    budgetRange: row.budget_range as Lead['budgetRange'],
    score: Number(row.score),
    temperature: row.temperature as Lead['temperature'],
    reasons: parseJson<string[]>(String(row.reasons_json ?? '[]'), []),
    status: row.status as LeadStatus,
    notes: row.notes == null ? null : String(row.notes),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapManager(row: Record<string, unknown>): ProjectManager {
  return {
    id: Number(row.id),
    name: String(row.name),
    role: String(row.role ?? 'Менеджер проекта'),
    phone: row.phone == null ? null : String(row.phone),
  };
}

function mapInstance(row: Record<string, unknown>): ProjectInstance {
  return {
    id: Number(row.id),
    customerId: Number(row.customer_id),
    projectId: Number(row.project_id),
    leadId: row.lead_id == null ? null : Number(row.lead_id),
    name: String(row.name),
    region: String(row.region),
    area: Number(row.area),
    floors: Number(row.floors),
    bedrooms: Number(row.bedrooms),
    bathrooms: Number(row.bathrooms),
    materialId: Number(row.material_id),
    packageId: Number(row.package_id),
    contractAmount: Number(row.contract_amount),
    progress: Number(row.progress),
    plannedCompletionDate: String(row.planned_completion_date),
    managerId: Number(row.manager_id),
    status: String(row.status),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapStage(row: Record<string, unknown>): ConstructionStage {
  return {
    id: Number(row.id),
    projectInstanceId: Number(row.project_instance_id),
    name: String(row.name),
    description: String(row.description ?? ''),
    status: row.status as ConstructionStage['status'],
    progress: Number(row.progress),
    plannedStartDate: row.planned_start_date == null ? null : String(row.planned_start_date),
    plannedEndDate: row.planned_end_date == null ? null : String(row.planned_end_date),
    completedAt: row.completed_at == null ? null : String(row.completed_at),
    displayOrder: Number(row.display_order),
  };
}

function mapUpdate(row: Record<string, unknown>): ProgressUpdate {
  return {
    id: Number(row.id),
    projectInstanceId: Number(row.project_instance_id),
    stageId: row.stage_id == null ? null : Number(row.stage_id),
    title: String(row.title),
    text: String(row.text ?? ''),
    date: String(row.date),
    photos: parseJson<string[]>(String(row.photos_json ?? '[]'), []),
  };
}

function mapDocument(row: Record<string, unknown>): ProjectDocument {
  return {
    id: Number(row.id),
    projectInstanceId: Number(row.project_instance_id),
    title: String(row.title),
    type: row.type as ProjectDocument['type'],
    fileUrl: String(row.file_url),
    createdAt: String(row.created_at),
  };
}

function mapPayment(row: Record<string, unknown>): PaymentScheduleItem {
  return {
    id: Number(row.id),
    projectInstanceId: Number(row.project_instance_id),
    title: String(row.title),
    amount: Number(row.amount),
    dueCondition: String(row.due_condition ?? ''),
    dueDate: row.due_date == null ? null : String(row.due_date),
    status: row.status as PaymentScheduleItem['status'],
    paidAt: row.paid_at == null ? null : String(row.paid_at),
    displayOrder: Number(row.display_order),
  };
}

function displayHouseName(project: HouseProject, area: number): string {
  const match = project.name.trim().match(/^(.*?)(\s+)(\d+)$/);
  if (match) return `${match[1]} ${area}`;
  return `${project.name} ${area}`;
}

function notFound(entity: string, id: number): never {
  throw new AppError(`${entity} not found`, 404, 'NOT_FOUND', { id });
}

export function createLocalProviders(database: Database.Database): Providers {
  const getCustomer = database.prepare('SELECT * FROM customers WHERE id = ?');
  const getCustomerByTg = database.prepare('SELECT * FROM customers WHERE telegram_user_id = ?');
  const insertCustomer = database.prepare(`
    INSERT INTO customers (telegram_user_id, name, phone, username, created_at, updated_at)
    VALUES (@telegram_user_id, @name, @phone, @username, @created_at, @updated_at)
  `);
  const updateCustomerSql = database.prepare(`
    UPDATE customers
    SET name = @name, phone = @phone, username = @username, updated_at = @updated_at
    WHERE id = @id
  `);

  const customers: CustomerProvider = {
    upsert(user: TelegramUser, extras) {
      const existing = getCustomerByTg.get(user.id) as Record<string, unknown> | undefined;
      const name =
        extras?.name ||
        [user.first_name, user.last_name].filter(Boolean).join(' ') ||
        (existing ? String(existing.name) : 'Клиент');
      const phone = extras?.phone ?? (existing?.phone as string | null) ?? null;
      const username = user.username ?? (existing?.username as string | null) ?? null;
      const ts = nowSql();
      if (existing) {
        updateCustomerSql.run({
          id: existing.id,
          name,
          phone,
          username,
          updated_at: ts,
        });
        return { id: Number(existing.id), created: false };
      }
      const result = insertCustomer.run({
        telegram_user_id: user.id,
        name,
        phone,
        username,
        created_at: ts,
        updated_at: ts,
      });
      return { id: Number(result.lastInsertRowid), created: true };
    },
    getByTelegramUserId(telegramUserId) {
      const row = getCustomerByTg.get(telegramUserId) as Record<string, unknown> | undefined;
      return row ? mapCustomer(row) : undefined;
    },
    getById(id) {
      const row = getCustomer.get(id) as Record<string, unknown> | undefined;
      return row ? mapCustomer(row) : undefined;
    },
    listAll() {
      return (database.prepare('SELECT * FROM customers ORDER BY created_at DESC').all() as Record<string, unknown>[]).map(
        mapCustomer,
      );
    },
    update(id, patch) {
      const current = customers.getById(id);
      if (!current) notFound('Customer', id);
      updateCustomerSql.run({
        id,
        name: patch.name ?? current.name,
        phone: patch.phone === undefined ? current.phone : patch.phone,
        username: patch.username === undefined ? current.username : patch.username,
        updated_at: nowSql(),
      });
      return customers.getById(id)!;
    },
  };

  const getProjectStmt = database.prepare('SELECT * FROM house_projects WHERE id = ?');
  const getMaterialStmt = database.prepare('SELECT * FROM construction_materials WHERE id = ?');
  const getPackageStmt = database.prepare('SELECT * FROM packages WHERE id = ?');

  const catalog: CatalogProvider = {
    listProjects(filters) {
      const sql = filters?.activeOnly
        ? 'SELECT * FROM house_projects WHERE active = 1 ORDER BY display_order, id'
        : 'SELECT * FROM house_projects ORDER BY display_order, id';
      return (database.prepare(sql).all() as Record<string, unknown>[]).map(mapProject);
    },
    getProject(id) {
      const row = getProjectStmt.get(id) as Record<string, unknown> | undefined;
      return row ? mapProject(row) : undefined;
    },
    getProjectBySlug(slug) {
      const row = database.prepare('SELECT * FROM house_projects WHERE slug = ?').get(slug) as
        | Record<string, unknown>
        | undefined;
      return row ? mapProject(row) : undefined;
    },
    createProject(params) {
      const ts = nowSql();
      const result = database
        .prepare(
          `INSERT INTO house_projects (
            slug, name, description, floors, area, bedrooms, bathrooms, style,
            base_price, construction_duration_months, image, gallery_json, area_options_json,
            features_json, active, display_order, created_at, updated_at
          ) VALUES (
            @slug, @name, @description, @floors, @area, @bedrooms, @bathrooms, @style,
            @base_price, @construction_duration_months, @image, @gallery_json, @area_options_json,
            @features_json, @active, @display_order, @created_at, @updated_at
          )`,
        )
        .run({
          slug: params.slug,
          name: params.name,
          description: params.description,
          floors: params.floors,
          area: params.area,
          bedrooms: params.bedrooms,
          bathrooms: params.bathrooms,
          style: params.style,
          base_price: params.basePrice,
          construction_duration_months: params.constructionDurationMonths,
          image: params.image,
          gallery_json: JSON.stringify(params.gallery),
          area_options_json: JSON.stringify(params.areaOptions),
          features_json: JSON.stringify(params.features),
          active: params.active ? 1 : 0,
          display_order: params.displayOrder,
          created_at: ts,
          updated_at: ts,
        });
      return catalog.getProject(Number(result.lastInsertRowid))!;
    },
    updateProject(id, patch) {
      const current = catalog.getProject(id);
      if (!current) notFound('HouseProject', id);
      const next = { ...current, ...patch };
      database
        .prepare(
          `UPDATE house_projects SET
            slug=@slug, name=@name, description=@description, floors=@floors, area=@area,
            bedrooms=@bedrooms, bathrooms=@bathrooms, style=@style, base_price=@base_price,
            construction_duration_months=@construction_duration_months, image=@image,
            gallery_json=@gallery_json, area_options_json=@area_options_json,
            features_json=@features_json, active=@active, display_order=@display_order,
            updated_at=@updated_at
          WHERE id=@id`,
        )
        .run({
          id,
          slug: next.slug,
          name: next.name,
          description: next.description,
          floors: next.floors,
          area: next.area,
          bedrooms: next.bedrooms,
          bathrooms: next.bathrooms,
          style: next.style,
          base_price: next.basePrice,
          construction_duration_months: next.constructionDurationMonths,
          image: next.image,
          gallery_json: JSON.stringify(next.gallery),
          area_options_json: JSON.stringify(next.areaOptions),
          features_json: JSON.stringify(next.features),
          active: next.active ? 1 : 0,
          display_order: next.displayOrder,
          updated_at: nowSql(),
        });
      return catalog.getProject(id)!;
    },
    listMaterials(filters) {
      const sql = filters?.activeOnly
        ? 'SELECT * FROM construction_materials WHERE active = 1 ORDER BY display_order, id'
        : 'SELECT * FROM construction_materials ORDER BY display_order, id';
      return (database.prepare(sql).all() as Record<string, unknown>[]).map(mapMaterial);
    },
    getMaterial(id) {
      const row = getMaterialStmt.get(id) as Record<string, unknown> | undefined;
      return row ? mapMaterial(row) : undefined;
    },
    createMaterial(params) {
      const result = database
        .prepare(
          `INSERT INTO construction_materials (
            name, slug, price_modifier_type, price_modifier_value, duration_delta_months,
            description, active, display_order
          ) VALUES (@name, @slug, @price_modifier_type, @price_modifier_value, @duration_delta_months,
            @description, @active, @display_order)`,
        )
        .run({
          name: params.name,
          slug: params.slug,
          price_modifier_type: params.priceModifierType,
          price_modifier_value: params.priceModifierValue,
          duration_delta_months: params.durationDeltaMonths,
          description: params.description,
          active: params.active ? 1 : 0,
          display_order: params.displayOrder,
        });
      return catalog.getMaterial(Number(result.lastInsertRowid))!;
    },
    updateMaterial(id, patch) {
      const current = catalog.getMaterial(id);
      if (!current) notFound('ConstructionMaterial', id);
      const next = { ...current, ...patch };
      database
        .prepare(
          `UPDATE construction_materials SET
            name=@name, slug=@slug, price_modifier_type=@price_modifier_type,
            price_modifier_value=@price_modifier_value, duration_delta_months=@duration_delta_months,
            description=@description, active=@active, display_order=@display_order
          WHERE id=@id`,
        )
        .run({
          id,
          name: next.name,
          slug: next.slug,
          price_modifier_type: next.priceModifierType,
          price_modifier_value: next.priceModifierValue,
          duration_delta_months: next.durationDeltaMonths,
          description: next.description,
          active: next.active ? 1 : 0,
          display_order: next.displayOrder,
        });
      return catalog.getMaterial(id)!;
    },
    listPackages(filters) {
      const sql = filters?.activeOnly
        ? 'SELECT * FROM packages WHERE active = 1 ORDER BY display_order, id'
        : 'SELECT * FROM packages ORDER BY display_order, id';
      return (database.prepare(sql).all() as Record<string, unknown>[]).map(mapPackage);
    },
    getPackage(id) {
      const row = getPackageStmt.get(id) as Record<string, unknown> | undefined;
      return row ? mapPackage(row) : undefined;
    },
    createPackage(params) {
      const result = database
        .prepare(
          `INSERT INTO packages (
            name, slug, description, multiplier, duration_delta_months, features_json, active, display_order
          ) VALUES (@name, @slug, @description, @multiplier, @duration_delta_months, @features_json, @active, @display_order)`,
        )
        .run({
          name: params.name,
          slug: params.slug,
          description: params.description,
          multiplier: params.multiplier,
          duration_delta_months: params.durationDeltaMonths,
          features_json: JSON.stringify(params.features),
          active: params.active ? 1 : 0,
          display_order: params.displayOrder,
        });
      return catalog.getPackage(Number(result.lastInsertRowid))!;
    },
    updatePackage(id, patch) {
      const current = catalog.getPackage(id);
      if (!current) notFound('Package', id);
      const next = { ...current, ...patch };
      database
        .prepare(
          `UPDATE packages SET
            name=@name, slug=@slug, description=@description, multiplier=@multiplier,
            duration_delta_months=@duration_delta_months, features_json=@features_json,
            active=@active, display_order=@display_order
          WHERE id=@id`,
        )
        .run({
          id,
          name: next.name,
          slug: next.slug,
          description: next.description,
          multiplier: next.multiplier,
          duration_delta_months: next.durationDeltaMonths,
          features_json: JSON.stringify(next.features),
          active: next.active ? 1 : 0,
          display_order: next.displayOrder,
        });
      return catalog.getPackage(id)!;
    },
  };

  const quotes: QuoteProvider = {
    insert(params) {
      const result = database
        .prepare(
          `INSERT INTO quotes (
            customer_id, project_id, area, material_id, package_id, options_json,
            subtotal, price_from, price_to, duration_months_from, duration_months_to,
            breakdown_json, created_at
          ) VALUES (
            @customer_id, @project_id, @area, @material_id, @package_id, @options_json,
            @subtotal, @price_from, @price_to, @duration_months_from, @duration_months_to,
            @breakdown_json, @created_at
          )`,
        )
        .run({
          customer_id: params.customerId ?? null,
          project_id: params.projectId,
          area: params.area,
          material_id: params.materialId,
          package_id: params.packageId,
          options_json: JSON.stringify(params.options),
          subtotal: params.subtotal,
          price_from: params.priceFrom,
          price_to: params.priceTo,
          duration_months_from: params.durationMonthsFrom,
          duration_months_to: params.durationMonthsTo,
          breakdown_json: JSON.stringify(params.breakdown),
          created_at: nowSql(),
        });
      return quotes.getById(Number(result.lastInsertRowid))!;
    },
    getById(id) {
      const row = database.prepare('SELECT * FROM quotes WHERE id = ?').get(id) as
        | Record<string, unknown>
        | undefined;
      return row ? mapQuote(row) : undefined;
    },
  };

  function hydrateLead(lead: Lead): LeadWithDetails {
    const customer = customers.getById(lead.customerId);
    const project = catalog.getProject(lead.projectId);
    const material = catalog.getMaterial(lead.materialId);
    const pkg = catalog.getPackage(lead.packageId);
    if (!customer || !project || !material || !pkg) {
      throw new AppError('Lead relations are incomplete', 500, 'LEAD_INCOMPLETE', { id: lead.id });
    }
    return {
      ...lead,
      customer,
      project,
      material,
      package: pkg,
      displayName: displayHouseName(project, lead.requestedArea),
    };
  }

  const leads: LeadProvider = {
    createLead(params) {
      const ts = nowSql();
      const result = database
        .prepare(
          `INSERT INTO leads (
            customer_id, project_id, requested_area, material_id, package_id, quote_id,
            quote_from, quote_to, duration_months_from, duration_months_to,
            has_land, region, desired_start_period, budget_range, score, temperature,
            reasons_json, status, notes, created_at, updated_at
          ) VALUES (
            @customer_id, @project_id, @requested_area, @material_id, @package_id, @quote_id,
            @quote_from, @quote_to, @duration_months_from, @duration_months_to,
            @has_land, @region, @desired_start_period, @budget_range, @score, @temperature,
            @reasons_json, @status, @notes, @created_at, @updated_at
          )`,
        )
        .run({
          customer_id: params.customerId,
          project_id: params.projectId,
          requested_area: params.requestedArea,
          material_id: params.materialId,
          package_id: params.packageId,
          quote_id: params.quoteId,
          quote_from: params.quoteFrom,
          quote_to: params.quoteTo,
          duration_months_from: params.durationMonthsFrom,
          duration_months_to: params.durationMonthsTo,
          has_land: params.hasLand,
          region: params.region,
          desired_start_period: params.desiredStartPeriod,
          budget_range: params.budgetRange,
          score: params.score,
          temperature: params.temperature,
          reasons_json: JSON.stringify(params.reasons),
          status: params.status,
          notes: params.notes,
          created_at: ts,
          updated_at: ts,
        });
      const created = leads.getLead(Number(result.lastInsertRowid));
      if (!created) throw new AppError('Failed to create lead', 500, 'LEAD_CREATE_FAILED');
      return created;
    },
    getLead(id) {
      const row = database.prepare('SELECT * FROM leads WHERE id = ?').get(id) as
        | Record<string, unknown>
        | undefined;
      return row ? hydrateLead(mapLead(row)) : undefined;
    },
    listLeads(filters?: LeadListFilters) {
      const clauses: string[] = [];
      const values: unknown[] = [];
      if (filters?.status) {
        clauses.push('status = ?');
        values.push(filters.status);
      }
      if (filters?.temperature) {
        clauses.push('temperature = ?');
        values.push(filters.temperature);
      }
      if (filters?.projectId) {
        clauses.push('project_id = ?');
        values.push(filters.projectId);
      }
      if (filters?.dateFrom) {
        clauses.push('date(created_at) >= date(?)');
        values.push(filters.dateFrom);
      }
      if (filters?.dateTo) {
        clauses.push('date(created_at) <= date(?)');
        values.push(filters.dateTo);
      }
      const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
      const rows = database
        .prepare(
          `SELECT * FROM leads ${where} ORDER BY
            CASE temperature WHEN 'hot' THEN 0 WHEN 'warm' THEN 1 ELSE 2 END,
            score DESC, created_at DESC`,
        )
        .all(...values) as Record<string, unknown>[];
      return rows.map((row) => hydrateLead(mapLead(row)));
    },
    updateLeadStatus(id, status) {
      const current = leads.getLead(id);
      if (!current) notFound('Lead', id);
      database
        .prepare('UPDATE leads SET status = ?, updated_at = ? WHERE id = ?')
        .run(status, nowSql(), id);
      return leads.getLead(id)!;
    },
    updateLead(id, patch) {
      const current = leads.getLead(id);
      if (!current) notFound('Lead', id);
      database
        .prepare('UPDATE leads SET status = ?, notes = ?, updated_at = ? WHERE id = ?')
        .run(patch.status ?? current.status, patch.notes === undefined ? current.notes : patch.notes, nowSql(), id);
      return leads.getLead(id)!;
    },
  };

  const construction: ConstructionProvider = {
    getManager(id) {
      const row = database.prepare('SELECT * FROM project_managers WHERE id = ?').get(id) as
        | Record<string, unknown>
        | undefined;
      return row ? mapManager(row) : undefined;
    },
    createManager(params) {
      const result = database
        .prepare('INSERT INTO project_managers (name, role, phone) VALUES (?, ?, ?)')
        .run(params.name, params.role, params.phone);
      return construction.getManager(Number(result.lastInsertRowid))!;
    },
    getInstance(id) {
      const row = database.prepare('SELECT * FROM project_instances WHERE id = ?').get(id) as
        | Record<string, unknown>
        | undefined;
      if (!row) return undefined;
      return hydrateInstance(mapInstance(row));
    },
    getInstanceByCustomer(customerId) {
      const row = database
        .prepare(
          `SELECT * FROM project_instances WHERE customer_id = ? AND status = 'active'
           ORDER BY id DESC LIMIT 1`,
        )
        .get(customerId) as Record<string, unknown> | undefined;
      if (!row) return undefined;
      return hydrateInstance(mapInstance(row));
    },
    listInstances() {
      return (
        database.prepare('SELECT * FROM project_instances ORDER BY id DESC').all() as Record<string, unknown>[]
      ).map((row) => hydrateInstance(mapInstance(row)));
    },
    createInstance(params) {
      const ts = nowSql();
      const result = database
        .prepare(
          `INSERT INTO project_instances (
            customer_id, project_id, lead_id, name, region, area, floors, bedrooms, bathrooms,
            material_id, package_id, contract_amount, progress, planned_completion_date,
            manager_id, status, created_at, updated_at
          ) VALUES (
            @customer_id, @project_id, @lead_id, @name, @region, @area, @floors, @bedrooms, @bathrooms,
            @material_id, @package_id, @contract_amount, @progress, @planned_completion_date,
            @manager_id, @status, @created_at, @updated_at
          )`,
        )
        .run({
          customer_id: params.customerId,
          project_id: params.projectId,
          lead_id: params.leadId,
          name: params.name,
          region: params.region,
          area: params.area,
          floors: params.floors,
          bedrooms: params.bedrooms,
          bathrooms: params.bathrooms,
          material_id: params.materialId,
          package_id: params.packageId,
          contract_amount: params.contractAmount,
          progress: params.progress,
          planned_completion_date: params.plannedCompletionDate,
          manager_id: params.managerId,
          status: params.status,
          created_at: ts,
          updated_at: ts,
        });
      return mapInstance(
        database.prepare('SELECT * FROM project_instances WHERE id = ?').get(Number(result.lastInsertRowid)) as Record<
          string,
          unknown
        >,
      );
    },
    listStages(projectInstanceId) {
      return (
        database
          .prepare(
            'SELECT * FROM construction_stages WHERE project_instance_id = ? ORDER BY display_order, id',
          )
          .all(projectInstanceId) as Record<string, unknown>[]
      ).map(mapStage);
    },
    createStage(params) {
      const result = database
        .prepare(
          `INSERT INTO construction_stages (
            project_instance_id, name, description, status, progress,
            planned_start_date, planned_end_date, completed_at, display_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          params.projectInstanceId,
          params.name,
          params.description,
          params.status,
          params.progress,
          params.plannedStartDate,
          params.plannedEndDate,
          params.completedAt,
          params.displayOrder,
        );
      return mapStage(
        database.prepare('SELECT * FROM construction_stages WHERE id = ?').get(Number(result.lastInsertRowid)) as Record<
          string,
          unknown
        >,
      );
    },
    listUpdates(projectInstanceId) {
      return (
        database
          .prepare(
            'SELECT * FROM progress_updates WHERE project_instance_id = ? ORDER BY date DESC, id DESC',
          )
          .all(projectInstanceId) as Record<string, unknown>[]
      ).map(mapUpdate);
    },
    createUpdate(params) {
      const result = database
        .prepare(
          `INSERT INTO progress_updates (project_instance_id, stage_id, title, text, date, photos_json)
           VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .run(
          params.projectInstanceId,
          params.stageId,
          params.title,
          params.text,
          params.date,
          JSON.stringify(params.photos),
        );
      return mapUpdate(
        database.prepare('SELECT * FROM progress_updates WHERE id = ?').get(Number(result.lastInsertRowid)) as Record<
          string,
          unknown
        >,
      );
    },
    listDocuments(projectInstanceId) {
      return (
        database
          .prepare('SELECT * FROM project_documents WHERE project_instance_id = ? ORDER BY created_at DESC, id DESC')
          .all(projectInstanceId) as Record<string, unknown>[]
      ).map(mapDocument);
    },
    createDocument(params) {
      const result = database
        .prepare(
          `INSERT INTO project_documents (project_instance_id, title, type, file_url, created_at)
           VALUES (?, ?, ?, ?, ?)`,
        )
        .run(params.projectInstanceId, params.title, params.type, params.fileUrl, nowSql());
      return mapDocument(
        database.prepare('SELECT * FROM project_documents WHERE id = ?').get(Number(result.lastInsertRowid)) as Record<
          string,
          unknown
        >,
      );
    },
    listPayments(projectInstanceId) {
      return (
        database
          .prepare(
            'SELECT * FROM payment_schedule_items WHERE project_instance_id = ? ORDER BY display_order, id',
          )
          .all(projectInstanceId) as Record<string, unknown>[]
      ).map(mapPayment);
    },
    createPayment(params) {
      const result = database
        .prepare(
          `INSERT INTO payment_schedule_items (
            project_instance_id, title, amount, due_condition, due_date, status, paid_at, display_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          params.projectInstanceId,
          params.title,
          params.amount,
          params.dueCondition,
          params.dueDate,
          params.status,
          params.paidAt,
          params.displayOrder,
        );
      return mapPayment(
        database
          .prepare('SELECT * FROM payment_schedule_items WHERE id = ?')
          .get(Number(result.lastInsertRowid)) as Record<string, unknown>,
      );
    },
  };

  function hydrateInstance(instance: ProjectInstance): ProjectInstanceDetails {
    const customer = customers.getById(instance.customerId);
    const project = catalog.getProject(instance.projectId);
    const material = catalog.getMaterial(instance.materialId);
    const pkg = catalog.getPackage(instance.packageId);
    const manager = construction.getManager(instance.managerId);
    if (!customer || !project || !material || !pkg || !manager) {
      throw new AppError('Project instance relations are incomplete', 500, 'PROJECT_INCOMPLETE', {
        id: instance.id,
      });
    }
    return { ...instance, customer, project, material, package: pkg, manager };
  }

  const events: OutboundEventPublisher = {
    publish(name, payload) {
      const result = database
        .prepare(
          `INSERT INTO outbound_events (name, payload_json, created_at, delivered_at)
           VALUES (?, ?, ?, ?)`,
        )
        .run(name, JSON.stringify(payload), nowSql(), nowSql());
      const row = database.prepare('SELECT * FROM outbound_events WHERE id = ?').get(Number(result.lastInsertRowid)) as Record<
        string,
        unknown
      >;
      return {
        id: Number(row.id),
        name: row.name as OutboundEvent['name'],
        payload: parseJson(String(row.payload_json), {}),
        createdAt: String(row.created_at),
        deliveredAt: row.delivered_at == null ? null : String(row.delivered_at),
      };
    },
    list(limit = 50) {
      return (
        database.prepare('SELECT * FROM outbound_events ORDER BY id DESC LIMIT ?').all(limit) as Record<
          string,
          unknown
        >[]
      ).map((row) => ({
        id: Number(row.id),
        name: row.name as OutboundEvent['name'],
        payload: parseJson(String(row.payload_json), {}),
        createdAt: String(row.created_at),
        deliveredAt: row.delivered_at == null ? null : String(row.delivered_at),
      }));
    },
  };

  return {
    customers,
    catalog,
    quotes,
    leads,
    construction,
    events,
    transaction<T>(fn: () => T): T {
      return database.transaction(fn)();
    },
  };
}
