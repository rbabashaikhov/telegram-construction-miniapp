import type Database from 'better-sqlite3';

export function applyInitialSchema(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_user_id INTEGER UNIQUE,
      name TEXT NOT NULL DEFAULT '',
      phone TEXT,
      username TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS house_projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      floors INTEGER NOT NULL,
      area INTEGER NOT NULL,
      bedrooms INTEGER NOT NULL,
      bathrooms INTEGER NOT NULL,
      style TEXT NOT NULL,
      base_price INTEGER NOT NULL,
      construction_duration_months INTEGER NOT NULL,
      image TEXT NOT NULL DEFAULT '',
      gallery_json TEXT NOT NULL DEFAULT '[]',
      area_options_json TEXT NOT NULL DEFAULT '[]',
      features_json TEXT NOT NULL DEFAULT '[]',
      active INTEGER NOT NULL DEFAULT 1,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS construction_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      price_modifier_type TEXT NOT NULL DEFAULT 'percent'
        CHECK (price_modifier_type IN ('percent', 'fixed')),
      price_modifier_value REAL NOT NULL DEFAULT 0,
      duration_delta_months INTEGER NOT NULL DEFAULT 0,
      description TEXT NOT NULL DEFAULT '',
      active INTEGER NOT NULL DEFAULT 1,
      display_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '',
      multiplier REAL NOT NULL,
      duration_delta_months INTEGER NOT NULL DEFAULT 0,
      features_json TEXT NOT NULL DEFAULT '[]',
      active INTEGER NOT NULL DEFAULT 1,
      display_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      project_id INTEGER NOT NULL,
      area INTEGER NOT NULL,
      material_id INTEGER NOT NULL,
      package_id INTEGER NOT NULL,
      options_json TEXT NOT NULL DEFAULT '[]',
      subtotal INTEGER NOT NULL,
      price_from INTEGER NOT NULL,
      price_to INTEGER NOT NULL,
      duration_months_from INTEGER NOT NULL,
      duration_months_to INTEGER NOT NULL,
      breakdown_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (project_id) REFERENCES house_projects(id),
      FOREIGN KEY (material_id) REFERENCES construction_materials(id),
      FOREIGN KEY (package_id) REFERENCES packages(id)
    );

    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      project_id INTEGER NOT NULL,
      requested_area INTEGER NOT NULL,
      material_id INTEGER NOT NULL,
      package_id INTEGER NOT NULL,
      quote_id INTEGER,
      quote_from INTEGER NOT NULL,
      quote_to INTEGER NOT NULL,
      duration_months_from INTEGER NOT NULL,
      duration_months_to INTEGER NOT NULL,
      has_land TEXT NOT NULL CHECK (has_land IN ('yes', 'choosing', 'no')),
      region TEXT NOT NULL,
      desired_start_period TEXT NOT NULL
        CHECK (desired_start_period IN ('asap', '1_3', '3_6', '6_12', 'exploring')),
      budget_range TEXT NOT NULL
        CHECK (budget_range IN ('under_7', '7_10', '10_15', '15_20', '20_plus')),
      score INTEGER NOT NULL,
      temperature TEXT NOT NULL CHECK (temperature IN ('hot', 'warm', 'cold')),
      reasons_json TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'new'
        CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost')),
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (project_id) REFERENCES house_projects(id),
      FOREIGN KEY (material_id) REFERENCES construction_materials(id),
      FOREIGN KEY (package_id) REFERENCES packages(id),
      FOREIGN KEY (quote_id) REFERENCES quotes(id)
    );

    CREATE TABLE IF NOT EXISTS project_managers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Менеджер проекта',
      phone TEXT
    );

    CREATE TABLE IF NOT EXISTS project_instances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      project_id INTEGER NOT NULL,
      lead_id INTEGER,
      name TEXT NOT NULL,
      region TEXT NOT NULL,
      area INTEGER NOT NULL,
      floors INTEGER NOT NULL,
      bedrooms INTEGER NOT NULL,
      bathrooms INTEGER NOT NULL,
      material_id INTEGER NOT NULL,
      package_id INTEGER NOT NULL,
      contract_amount INTEGER NOT NULL,
      progress INTEGER NOT NULL DEFAULT 0,
      planned_completion_date TEXT NOT NULL,
      manager_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (project_id) REFERENCES house_projects(id),
      FOREIGN KEY (lead_id) REFERENCES leads(id),
      FOREIGN KEY (material_id) REFERENCES construction_materials(id),
      FOREIGN KEY (package_id) REFERENCES packages(id),
      FOREIGN KEY (manager_id) REFERENCES project_managers(id)
    );

    CREATE TABLE IF NOT EXISTS construction_stages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_instance_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_progress', 'completed', 'delayed')),
      progress INTEGER NOT NULL DEFAULT 0,
      planned_start_date TEXT,
      planned_end_date TEXT,
      completed_at TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (project_instance_id) REFERENCES project_instances(id)
    );

    CREATE TABLE IF NOT EXISTS progress_updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_instance_id INTEGER NOT NULL,
      stage_id INTEGER,
      title TEXT NOT NULL,
      text TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL,
      photos_json TEXT NOT NULL DEFAULT '[]',
      FOREIGN KEY (project_instance_id) REFERENCES project_instances(id),
      FOREIGN KEY (stage_id) REFERENCES construction_stages(id)
    );

    CREATE TABLE IF NOT EXISTS project_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_instance_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'other'
        CHECK (type IN ('contract', 'project', 'estimate', 'act', 'other')),
      file_url TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (project_instance_id) REFERENCES project_instances(id)
    );

    CREATE TABLE IF NOT EXISTS payment_schedule_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_instance_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      amount INTEGER NOT NULL,
      due_condition TEXT NOT NULL DEFAULT '',
      due_date TEXT,
      status TEXT NOT NULL DEFAULT 'planned'
        CHECK (status IN ('planned', 'due', 'paid')),
      paid_at TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (project_instance_id) REFERENCES project_instances(id)
    );

    CREATE TABLE IF NOT EXISTS outbound_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      delivered_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status, temperature, created_at);
    CREATE INDEX IF NOT EXISTS idx_leads_customer ON leads (customer_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_leads_project ON leads (project_id);
    CREATE INDEX IF NOT EXISTS idx_projects_active ON house_projects (active, display_order);
    CREATE INDEX IF NOT EXISTS idx_instances_customer ON project_instances (customer_id, status);
    CREATE INDEX IF NOT EXISTS idx_stages_instance ON construction_stages (project_instance_id, display_order);
    CREATE INDEX IF NOT EXISTS idx_updates_instance ON progress_updates (project_instance_id, date);
    CREATE INDEX IF NOT EXISTS idx_docs_instance ON project_documents (project_instance_id);
    CREATE INDEX IF NOT EXISTS idx_payments_instance ON payment_schedule_items (project_instance_id, display_order);
    CREATE INDEX IF NOT EXISTS idx_events_name ON outbound_events (name, created_at);
  `);
}
