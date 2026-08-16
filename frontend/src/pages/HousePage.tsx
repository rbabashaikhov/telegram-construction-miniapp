import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { TopBar } from '../components/TopBar';
import type { ClientProject, ConstructionStage, PaymentSummary, ProgressUpdate, ProjectDocument } from '../types';
import { formatArea, formatDate, formatMoney, STAGE_LABELS } from '../lib/format';

export function HousePage() {
  const [project, setProject] = useState<ClientProject | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getMyProject()
      .then((res) => setProject(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Проект не найден'));
  }, []);

  if (error) {
    return (
      <div className="page">
        <TopBar backTo="/" title="Мой дом" />
        <p className="lead padded">{error}</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="page">
        <TopBar backTo="/" title="Мой дом" />
        <p className="loading">Загрузка…</p>
      </div>
    );
  }

  return (
    <div className="page house-page">
      <TopBar backTo="/" title="Мой дом" />
      <section className="house-hero" data-demo-tour="my-house">
        <img src={project.project.image} alt={project.name} />
        <div className="house-hero-copy">
          <p className="eyebrow">Ваш дом</p>
          <h1>{project.name}</h1>
          <p>{project.region}</p>
          <p className="muted">
            {formatArea(project.area)} · {project.floors === 1 ? '1 этаж' : `${project.floors} этажа`}
          </p>
        </div>
      </section>

      <section className="progress-card" data-demo-tour="house-progress">
        <div className="progress-head">
          <span>Строительство</span>
          <strong>{project.progress}%</strong>
        </div>
        <div className="progress-bar">
          <i style={{ width: `${project.progress}%` }} />
        </div>
        <p>
          Сейчас: <strong>{project.currentStage?.name ?? '—'}</strong>
        </p>
        <p className="muted">План сдачи: {formatDate(project.plannedCompletionDate)}</p>
        <p className="muted">
          {project.manager.role}: {project.manager.name}
        </p>
      </section>

      <nav className="house-nav">
        <Link to="/house/stages" data-demo-tour="nav-stages">
          Этапы
        </Link>
        <Link to="/house/updates" data-demo-tour="nav-photos">
          Фотоотчеты
        </Link>
        <Link to="/house/documents" data-demo-tour="nav-docs">
          Документы
        </Link>
        <Link to="/house/payments" data-demo-tour="nav-payments">
          Платежи
        </Link>
      </nav>
    </div>
  );
}

export function HouseStagesPage() {
  const [stages, setStages] = useState<ConstructionStage[]>([]);
  useEffect(() => {
    api.getMyStages().then((res) => setStages(res.data)).catch(() => setStages([]));
  }, []);
  return (
    <div className="page">
      <TopBar backTo="/house" title="Этапы" />
      <ol className="stage-list" data-demo-tour="stage-list">
        {stages.map((stage) => (
          <li key={stage.id} className={`stage-${stage.status}`}>
            <div>
              <strong>{stage.name}</strong>
              <p>{stage.description}</p>
            </div>
            <span>{STAGE_LABELS[stage.status]}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function HouseUpdatesPage() {
  const [updates, setUpdates] = useState<ProgressUpdate[]>([]);
  useEffect(() => {
    api.getMyUpdates().then((res) => setUpdates(res.data)).catch(() => setUpdates([]));
  }, []);
  return (
    <div className="page">
      <TopBar backTo="/house" title="Фотоотчеты" />
      <div className="update-list" data-demo-tour="photo-list">
        {updates.map((update) => (
          <article key={update.id} className="update-card">
            <p className="muted">{formatDate(update.date)}</p>
            <h2>{update.title}</h2>
            <p>{update.text}</p>
            <div className="photo-row">
              {update.photos.map((photo) => (
                <img key={photo} src={photo} alt="" />
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function HouseDocumentsPage() {
  const [docs, setDocs] = useState<ProjectDocument[]>([]);
  useEffect(() => {
    api.getMyDocuments().then((res) => setDocs(res.data)).catch(() => setDocs([]));
  }, []);
  return (
    <div className="page">
      <TopBar backTo="/house" title="Документы" />
      <ul className="doc-list" data-demo-tour="doc-list">
        {docs.map((doc) => (
          <li key={doc.id}>
            <a href={doc.fileUrl} target="_blank" rel="noreferrer">
              <strong>{doc.title}</strong>
              <span>{formatDate(doc.createdAt)}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HousePaymentsPage() {
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  useEffect(() => {
    api.getMyPayments().then((res) => setSummary(res.data)).catch(() => setSummary(null));
  }, []);
  if (!summary) {
    return (
      <div className="page">
        <TopBar backTo="/house" title="Платежи" />
        <p className="loading">Загрузка…</p>
      </div>
    );
  }
  return (
    <div className="page">
      <TopBar backTo="/house" title="Платежи" />
      <section className="payment-hero" data-demo-tour="payment-summary">
        <p className="muted">Стоимость договора</p>
        <p className="big-number">{formatMoney(summary.contractAmount)}</p>
        <p className="muted">Оплачено</p>
        <p className="big-number">{formatMoney(summary.paidAmount)}</p>
        {summary.nextPayment && (
          <>
            <p className="muted">Следующий платеж</p>
            <p className="big-number">{formatMoney(summary.nextPayment.amount)}</p>
            <p>{summary.nextPayment.dueCondition}</p>
          </>
        )}
      </section>
      <ul className="payment-list">
        {summary.items.map((item) => (
          <li key={item.id}>
            <div>
              <strong>{item.title}</strong>
              <span>{item.dueCondition}</span>
            </div>
            <em>
              {formatMoney(item.amount)}
              <small>{item.status === 'paid' ? 'оплачено' : item.status === 'due' ? 'к оплате' : 'план'}</small>
            </em>
          </li>
        ))}
      </ul>
    </div>
  );
}
