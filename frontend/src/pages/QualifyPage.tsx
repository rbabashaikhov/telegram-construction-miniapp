import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { TopBar } from '../components/TopBar';
import { useApp } from '../context/AppContext';
import { useConfigurator } from '../context/ConfiguratorContext';
import { BUDGET_LABELS, START_LABELS } from '../lib/format';

export function QualifyPage() {
  const navigate = useNavigate();
  const { user } = useApp();
  const { draft, patch } = useConfigurator();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  if (!draft.quote || !draft.projectId || !draft.area || !draft.materialId || !draft.packageId) {
    return <Navigate to="/configure" replace />;
  }

  const regionValue = draft.region === 'Другой регион' ? draft.regionCustom || draft.region : draft.region;

  async function submit() {
    if (!draft.hasLand || !draft.region || !draft.desiredStartPeriod || !draft.budgetRange) {
      setError('Ответьте на все вопросы, чтобы менеджер понял задачу.');
      return;
    }
    if (draft.region === 'Другой регион' && draft.regionCustom.trim().length < 2) {
      setError('Укажите регион строительства.');
      return;
    }
    setPending(true);
    setError('');
    try {
      const lead = await api.createLead({
        projectId: draft.projectId!,
        area: draft.area!,
        materialId: draft.materialId!,
        packageId: draft.packageId!,
        hasLand: draft.hasLand,
        region: regionValue,
        desiredStartPeriod: draft.desiredStartPeriod,
        budgetRange: draft.budgetRange,
        name: draft.name || [user.firstName, user.lastName].filter(Boolean).join(' '),
        phone: draft.phone || undefined,
        username: user.username,
      });
      navigate(`/qualify/thanks?lead=${lead.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось отправить заявку');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="page">
      <TopBar backTo="/quote" title="Несколько вопросов" />
      <section className="qualify" data-demo-tour="qualify-form">
        <fieldset>
          <legend>Есть ли участок?</legend>
          <div className="chip-row">
            {[
              ['yes', 'Да'],
              ['choosing', 'Выбираю'],
              ['no', 'Пока нет'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={draft.hasLand === value ? 'chip on' : 'chip'}
                onClick={() => patch({ hasLand: value })}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Регион строительства</legend>
          <div className="chip-row">
            {['Москва', 'Московская область', 'Другой регион'].map((value) => (
              <button
                key={value}
                type="button"
                className={draft.region === value ? 'chip on' : 'chip'}
                onClick={() => patch({ region: value })}
              >
                {value}
              </button>
            ))}
          </div>
          {draft.region === 'Другой регион' && (
            <input
              className="text-input"
              placeholder="Например, Калужская область"
              value={draft.regionCustom}
              onChange={(event) => patch({ regionCustom: event.target.value })}
            />
          )}
        </fieldset>

        <fieldset>
          <legend>Когда хотите начать?</legend>
          <div className="chip-row">
            {Object.entries(START_LABELS).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={draft.desiredStartPeriod === value ? 'chip on' : 'chip'}
                onClick={() => patch({ desiredStartPeriod: value })}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Бюджет</legend>
          <div className="chip-row">
            {Object.entries(BUDGET_LABELS).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={draft.budgetRange === value ? 'chip on' : 'chip'}
                onClick={() => patch({ budgetRange: value })}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Контакты</legend>
          <input
            className="text-input"
            placeholder="Имя"
            value={draft.name || [user.firstName, user.lastName].filter(Boolean).join(' ')}
            onChange={(event) => patch({ name: event.target.value })}
          />
          <input
            className="text-input"
            placeholder="Телефон"
            value={draft.phone}
            onChange={(event) => patch({ phone: event.target.value })}
          />
          {user.username && <p className="muted">Telegram: @{user.username}</p>}
        </fieldset>

        {error && <p className="error">{error}</p>}
        <button
          type="button"
          className="btn btn-primary btn-block btn-lg"
          onClick={() => void submit()}
          disabled={pending}
          data-demo-tour="cta-submit-lead"
        >
          {pending ? 'Отправляем…' : 'Отправить расчет'}
        </button>
      </section>
    </div>
  );
}
