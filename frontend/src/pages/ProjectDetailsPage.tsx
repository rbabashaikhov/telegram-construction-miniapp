import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { TopBar } from '../components/TopBar';
import type { HouseProject } from '../types';
import { formatArea, formatMoney } from '../lib/format';

export function ProjectDetailsPage() {
  const { slug } = useParams();
  const [project, setProject] = useState<HouseProject | null>(null);

  useEffect(() => {
    if (!slug) return;
    api.getProject(slug).then((res) => setProject(res.data)).catch(() => setProject(null));
  }, [slug]);

  if (!project) {
    return (
      <div className="page">
        <TopBar backTo="/projects" title="Проект" />
        <p className="loading">Загрузка…</p>
      </div>
    );
  }

  return (
    <div className="page">
      <TopBar backTo="/projects" title={project.name} />
      <div className="detail-hero">
        <img src={project.image} alt={project.name} />
      </div>
      <section className="detail-body">
        <p className="eyebrow">{project.style}</p>
        <h1>{project.name}</h1>
        <div className="stat-pills">
          <span>{formatArea(project.area)}</span>
          <span>{project.floors === 1 ? '1 этаж' : `${project.floors} этажа`}</span>
          <span>{project.bedrooms} спальни</span>
          <span>{project.bathrooms} с/у</span>
        </div>
        <p className="lead">{project.description}</p>
        <ul className="feature-list">
          {project.features.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="quote-strip">
          <div>
            <p className="muted">Базовая стоимость тёплого контура</p>
            <p className="big-number">{formatMoney(project.basePrice)}</p>
          </div>
          <div>
            <p className="muted">Срок строительства</p>
            <p className="big-number">{project.constructionDurationMonths} мес.</p>
          </div>
        </div>
        <Link className="btn btn-primary btn-block btn-lg" to={`/configure?project=${project.slug}`}>
          Настроить и рассчитать
        </Link>
      </section>
    </div>
  );
}
