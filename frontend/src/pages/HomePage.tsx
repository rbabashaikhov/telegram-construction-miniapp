import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { ProjectCard } from '../components/ProjectCard';
import { TopBar } from '../components/TopBar';
import type { HouseProject } from '../types';
import { formatMoney } from '../lib/format';

export function HomePage() {
  const [projects, setProjects] = useState<HouseProject[]>([]);

  useEffect(() => {
    api.getProjects().then((res) => setProjects(res.data.slice(0, 4))).catch(() => setProjects([]));
  }, []);

  const minPrice = projects.reduce((min, project) => Math.min(min, project.basePrice), Number.POSITIVE_INFINITY);

  return (
    <div className="page">
      <TopBar />
      <section className="hero" data-demo-tour="hero">
        <p className="eyebrow">Nordhaus · Москва и область</p>
        <h1>Постройте дом, который подходит именно вам</h1>
        <p className="lead">
          Ответьте на несколько вопросов и получите предварительный расчет стоимости.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary btn-lg" to="/configure" data-demo-tour="cta-calculate">
            Рассчитать дом
          </Link>
          <Link className="btn btn-ghost btn-lg" to="/projects">
            Посмотреть проекты
          </Link>
        </div>
      </section>

      <section className="stats-row">
        <div>
          <strong>{Number.isFinite(minPrice) ? `от ${formatMoney(minPrice)}` : 'от 5,4 млн ₽'}</strong>
          <span>ориентировочно за тёплый контур</span>
        </div>
        <div>
          <strong>6–10 мес.</strong>
          <span>срок строительства</span>
        </div>
        <div>
          <strong>96–185 м²</strong>
          <span>готовые проекты</span>
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Популярные проекты</h2>
          <Link to="/projects">Все проекты</Link>
        </div>
        <div className="project-grid" data-demo-tour="project-list">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      <section className="advantages">
        <h2>Почему Nordhaus</h2>
        <ul>
          <li>
            <strong>Сначала дом, потом заявка</strong>
            <span>Клиент видит конфигурацию и ориентир по цене до разговора с менеджером.</span>
          </li>
          <li>
            <strong>Фиксированный контур работ</strong>
            <span>Тёплый контур, предчистовая или под ключ — без скрытой сметы на первом шаге.</span>
          </li>
          <li>
            <strong>Кабинет объекта</strong>
            <span>После договора тот же Mini App показывает этапы, фото, документы и платежи.</span>
          </li>
        </ul>
      </section>

      <p className="demo-house-link">
        <Link to="/house" data-demo-tour="cabinet-link">
          Посмотреть кабинет клиента
        </Link>
      </p>
    </div>
  );
}
