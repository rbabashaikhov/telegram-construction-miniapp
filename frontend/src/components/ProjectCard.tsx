import { Link } from 'react-router-dom';
import type { HouseProject } from '../types';
import { formatArea, formatMoney } from '../lib/format';

export function ProjectCard({
  project,
  featured = false,
}: {
  project: HouseProject;
  featured?: boolean;
}) {
  return (
    <article className={featured ? 'project-card project-card-featured' : 'project-card'} data-demo-tour="project-card">
      <Link to={`/projects/${project.slug}`} className="project-card-media">
        <img src={project.image} alt={project.name} />
      </Link>
      <div className="project-card-body">
        <p className="eyebrow">{project.style}</p>
        <h3>{project.name}</h3>
        <p className="project-meta">
          {formatArea(project.area)} · {project.floors === 1 ? '1 этаж' : `${project.floors} этажа`} · {project.bedrooms} спальни
        </p>
        <p className="project-price">от {formatMoney(project.basePrice)}</p>
        <div className="project-card-actions">
          <Link className="btn btn-secondary" to={`/projects/${project.slug}`}>
            Подробнее
          </Link>
          <Link className="btn btn-primary" to={`/configure?project=${project.slug}`}>
            Рассчитать
          </Link>
        </div>
      </div>
    </article>
  );
}
