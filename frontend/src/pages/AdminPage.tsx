import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, getAdminToken, setAdminToken } from '../api/client';
import type { ConstructionMaterial, HouseProject, Lead, LeadStatus, Package } from '../types';
import { BUDGET_LABELS, LAND_LABELS, START_LABELS, STATUS_LABELS, formatMoneyRange } from '../lib/format';

function temperatureClass(value: string): string {
  return `temp temp-${value}`;
}

export function AdminPage({ readOnly = false }: { readOnly?: boolean }) {
  const base = readOnly ? '/demo/admin' : '/admin';
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<HouseProject[]>([]);
  const [status, setStatus] = useState('');
  const [temperature, setTemperature] = useState('');
  const [projectId, setProjectId] = useState('');
  const [token, setToken] = useState(getAdminToken());
  const [error, setError] = useState('');

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (temperature) params.set('temperature', temperature);
    if (projectId) params.set('projectId', projectId);
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }, [projectId, status, temperature]);

  useEffect(() => {
    const load = readOnly ? api.getDemoAdminLeads : api.getAdminLeads;
    load(query)
      .then((res) => {
        setLeads(res.data);
        setError('');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Ошибка загрузки'));
    api.getProjects().then((res) => setProjects(res.data)).catch(() => undefined);
  }, [query, readOnly]);

  return (
    <div className="admin-shell">
      <header className="admin-top">
        <div>
          <p className="eyebrow">{readOnly ? 'Sales view' : 'Admin'}</p>
          <h1>Заявки Nordhaus</h1>
        </div>
        <nav>
          <Link to={base}>Лиды</Link>
          {!readOnly && <Link to={`${base}/catalog`}>Каталог</Link>}
          <Link to="/">Клиент</Link>
        </nav>
      </header>

      {!readOnly && (
        <div className="admin-token">
          <input
            className="text-input"
            placeholder="ADMIN_TOKEN"
            value={token}
            onChange={(event) => {
              setToken(event.target.value);
              setAdminToken(event.target.value);
            }}
          />
        </div>
      )}

      <div className="filters">
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Все статусы</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select value={temperature} onChange={(event) => setTemperature(event.target.value)}>
          <option value="">Все температуры</option>
          <option value="hot">HOT</option>
          <option value="warm">WARM</option>
          <option value="cold">COLD</option>
        </select>
        <select value={projectId} onChange={(event) => setProjectId(event.target.value)}>
          <option value="">Все проекты</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="lead-table" data-demo-tour="admin-leads">
        {leads.map((lead) => (
          <Link key={lead.id} className="lead-row" to={`${base}/leads/${lead.id}`}>
            <span className={temperatureClass(lead.temperature)}>
              {lead.temperature.toUpperCase()} {lead.score}
            </span>
            <span>
              <strong>{lead.customer.name}</strong>
              <em>{lead.displayName}</em>
            </span>
            <span>{BUDGET_LABELS[lead.budgetRange]}</span>
            <span>{LAND_LABELS[lead.hasLand]}</span>
            <span>{START_LABELS[lead.desiredStartPeriod]}</span>
            <span className="status-pill">{STATUS_LABELS[lead.status]}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function AdminLeadPage({ readOnly = false }: { readOnly?: boolean }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const base = readOnly ? '/demo/admin' : '/admin';
  const [lead, setLead] = useState<Lead | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const load = readOnly ? api.getDemoAdminLead : api.getAdminLead;
    load(Number(id))
      .then((res) => setLead(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Не найдено'));
  }, [id, readOnly]);

  async function changeStatus(status: LeadStatus) {
    if (!lead || readOnly) return;
    const updated = await api.patchLeadStatus(lead.id, status);
    setLead(updated.data);
  }

  if (error) {
    return (
      <div className="admin-shell">
        <p className="error">{error}</p>
        <button type="button" className="btn btn-secondary" onClick={() => navigate(base)}>
          К списку
        </button>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="admin-shell">
        <p className="loading">Загрузка…</p>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <button type="button" className="back-link" onClick={() => navigate(base)}>
        ← К заявкам
      </button>
      <article className="lead-card" data-demo-tour="lead-card">
        <div className={temperatureClass(lead.temperature)} data-demo-tour="lead-score">
          {lead.temperature.toUpperCase()} {lead.score}/100
        </div>
        <h1>{lead.customer.name}</h1>
        <p>
          {lead.customer.phone || 'телефон не указан'}
          {lead.customer.username ? ` · @${lead.customer.username}` : ''}
        </p>
        <section>
          <h2>Конфигурация</h2>
          <p>
            <strong>{lead.displayName}</strong>
          </p>
          <p>
            {lead.requestedArea} м² · {lead.material.name} · {lead.package.name}
          </p>
          <p>{formatMoneyRange(lead.quoteFrom, lead.quoteTo)}</p>
        </section>
        <section>
          <h2>Квалификация</h2>
          <p>{LAND_LABELS[lead.hasLand]}</p>
          <p>{lead.region}</p>
          <p>{START_LABELS[lead.desiredStartPeriod]}</p>
          <p>{BUDGET_LABELS[lead.budgetRange]}</p>
        </section>
        <section data-demo-tour="lead-reasons">
          <h2>Почему такой score</h2>
          <ul>
            {lead.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2>Статус</h2>
          {readOnly ? (
            <p className="status-pill">{STATUS_LABELS[lead.status]}</p>
          ) : (
            <div className="chip-row">
              {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  className={lead.status === status ? 'chip on' : 'chip'}
                  onClick={() => void changeStatus(status)}
                >
                  {STATUS_LABELS[status]}
                </button>
              ))}
            </div>
          )}
        </section>
      </article>
    </div>
  );
}

export function AdminCatalogPage() {
  const [projects, setProjects] = useState<HouseProject[]>([]);
  const [materials, setMaterials] = useState<ConstructionMaterial[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);

  useEffect(() => {
    Promise.all([api.getAdminProjects(), api.getAdminMaterials(), api.getAdminPackages()]).then(
      ([projectRes, materialRes, packageRes]) => {
        setProjects(projectRes.data);
        setMaterials(materialRes.data);
        setPackages(packageRes.data);
      },
    );
  }, []);

  return (
    <div className="admin-shell">
      <header className="admin-top">
        <h1>Каталог</h1>
        <Link to="/admin">Лиды</Link>
      </header>
      <h2>Проекты</h2>
      {projects.map((project) => (
        <label key={project.id} className="admin-edit">
          {project.name}
          <input
            type="number"
            defaultValue={project.basePrice}
            onBlur={(event) => {
              const value = Number(event.target.value);
              if (!value) return;
              void api.patchAdminProject(project.id, { basePrice: value });
            }}
          />
        </label>
      ))}
      <h2>Материалы</h2>
      {materials.map((material) => (
        <label key={material.id} className="admin-edit">
          {material.name}
          <input
            type="number"
            defaultValue={material.priceModifierValue}
            onBlur={(event) => {
              void api.patchAdminMaterial(material.id, {
                priceModifierValue: Number(event.target.value),
              });
            }}
          />
        </label>
      ))}
      <h2>Комплектации</h2>
      {packages.map((pkg) => (
        <label key={pkg.id} className="admin-edit">
          {pkg.name}
          <input
            type="number"
            step="0.01"
            defaultValue={pkg.multiplier}
            onBlur={(event) => {
              void api.patchAdminPackage(pkg.id, { multiplier: Number(event.target.value) });
            }}
          />
        </label>
      ))}
    </div>
  );
}

export function DemoAdminPage() {
  return <AdminPage readOnly />;
}

export function DemoAdminLeadPage() {
  return <AdminLeadPage readOnly />;
}
