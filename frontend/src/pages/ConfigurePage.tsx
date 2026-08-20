import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { TopBar } from '../components/TopBar';
import { useConfigurator } from '../context/ConfiguratorContext';
import type { ConstructionMaterial, HouseProject, Package, Quote } from '../types';
import { formatArea, formatMoneyRange } from '../lib/format';

export function ConfigurePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { draft, patch } = useConfigurator();
  const [projects, setProjects] = useState<HouseProject[]>([]);
  const [materials, setMaterials] = useState<ConstructionMaterial[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [quote, setQuote] = useState<Quote | null>(draft.quote);
  const [step, setStep] = useState(1);

  useEffect(() => {
    Promise.all([api.getProjects(), api.getMaterials(), api.getPackages()]).then(
      ([projectRes, materialRes, packageRes]) => {
        setProjects(projectRes.data);
        setMaterials(materialRes.data);
        setPackages(packageRes.data);
        const slug = params.get('project') || draft.projectSlug;
        const selected = projectRes.data.find((item) => item.slug === slug) ?? projectRes.data[0];
        if (selected && !draft.projectId) {
          patch({
            projectId: selected.id,
            projectSlug: selected.slug,
            area: selected.areaOptions[0] ?? selected.area,
            materialId: materialRes.data[0]?.id ?? null,
            packageId: packageRes.data[1]?.id ?? packageRes.data[0]?.id ?? null,
          });
        }
      },
    );
  }, [draft.projectId, draft.projectSlug, params, patch]);

  const project = projects.find((item) => item.id === draft.projectId) ?? null;
  const area = draft.area ?? project?.area ?? null;

  useEffect(() => {
    if (!draft.projectId || !draft.area || !draft.materialId || !draft.packageId) return;
    let cancelled = false;
    api
      .calculateQuote({
        projectId: draft.projectId,
        area: draft.area,
        materialId: draft.materialId,
        packageId: draft.packageId,
      })
      .then((res) => {
        if (cancelled) return;
        setQuote(res.data);
        patch({ quote: res.data });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [draft.area, draft.materialId, draft.packageId, draft.projectId, patch]);

  const livePrice = useMemo(() => {
    if (!quote) return 'Считаем…';
    return formatMoneyRange(quote.priceFrom, quote.priceTo);
  }, [quote]);

  return (
    <div className="page page-configure">
      <TopBar backTo={project ? `/projects/${project.slug}` : '/projects'} title="Конфигуратор" />
      <div className="stepper">
        {[1, 2, 3, 4].map((item) => (
          <button key={item} type="button" className={item === step ? 'on' : ''} onClick={() => setStep(item)}>
            {item}
          </button>
        ))}
      </div>

      <section data-demo-tour="configure-project" style={step === 1 ? undefined : { display: 'none' }}>
          <h2>Проект дома</h2>
          <div className="choice-list">
            {projects.map((item) => (
              <button
                key={item.id}
                type="button"
                className={item.id === draft.projectId ? 'choice on' : 'choice'}
                onClick={() =>
                  patch({
                    projectId: item.id,
                    projectSlug: item.slug,
                    area: item.areaOptions.includes(draft.area ?? -1) ? draft.area : item.areaOptions[0],
                  })
                }
              >
                <img src={item.image} alt="" />
                <span>
                  <strong>{item.name}</strong>
                  <em>
                    {formatArea(item.area)} · {item.bedrooms} спальни
                  </em>
                </span>
              </button>
            ))}
          </div>
        </section>

      {project && (
        <section data-demo-tour="configure-area" style={step === 2 ? undefined : { display: 'none' }}>
          <h2>Площадь</h2>
          <p className="muted">Цена пересчитывается на сервере при каждом изменении.</p>
          <div className="chip-row">
            {project.areaOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={option === area ? 'chip on' : 'chip'}
                onClick={() => patch({ area: option })}
              >
                {formatArea(option)}
              </button>
            ))}
          </div>
        </section>
      )}

      <section data-demo-tour="configure-material" style={step === 3 ? undefined : { display: 'none' }}>
          <h2>Материал стен</h2>
          <div className="choice-list">
            {materials.map((item) => (
              <button
                key={item.id}
                type="button"
                className={item.id === draft.materialId ? 'choice on' : 'choice'}
                onClick={() => patch({ materialId: item.id })}
              >
                <span>
                  <strong>{item.name}</strong>
                  <em>{item.description}</em>
                </span>
              </button>
            ))}
          </div>
        </section>

      <section data-demo-tour="configure-package" style={step === 4 ? undefined : { display: 'none' }}>
          <h2>Комплектация</h2>
          <div className="choice-list">
            {packages.map((item) => (
              <button
                key={item.id}
                type="button"
                className={item.id === draft.packageId ? 'choice on' : 'choice'}
                onClick={() => patch({ packageId: item.id })}
              >
                <span>
                  <strong>{item.name}</strong>
                  <em>{item.description}</em>
                  <small>{item.features.join(' · ')}</small>
                </span>
              </button>
            ))}
          </div>
        </section>

      <aside className="live-quote" data-demo-tour="live-quote">
        <p className="muted">Ориентировочно</p>
        <p className="big-number">{livePrice}</p>
        {quote && (
          <p className="muted">
            {quote.durationMonthsFrom}–{quote.durationMonthsTo} месяцев
          </p>
        )}
      </aside>

      <div className="bottom-actions">
        {step > 1 && (
          <button type="button" className="btn btn-secondary" onClick={() => setStep(step - 1)}>
            Назад
          </button>
        )}
        {step < 4 ? (
          <button type="button" className="btn btn-primary" onClick={() => setStep(step + 1)}>
            Далее
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/quote')}
            disabled={!quote}
          >
            Смотреть расчет
          </button>
        )}
      </div>
    </div>
  );
}
