import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { ProjectCard } from '../components/ProjectCard';
import { TopBar } from '../components/TopBar';
import type { HouseProject } from '../types';

export function CatalogPage() {
  const [projects, setProjects] = useState<HouseProject[]>([]);

  useEffect(() => {
    api.getProjects().then((res) => setProjects(res.data)).catch(() => setProjects([]));
  }, []);

  return (
    <div className="page">
      <TopBar title="Проекты" backTo="/" />
      <p className="lead padded">Шесть готовых домов. Площадь, материал и комплектацию настраиваете на следующем шаге.</p>
      <div className="project-grid">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
