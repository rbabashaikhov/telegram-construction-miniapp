import { Link, useSearchParams } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { useConfigurator } from '../context/ConfiguratorContext';
import { formatArea, formatMoneyRange } from '../lib/format';

export function ThanksPage() {
  const [params] = useSearchParams();
  const { draft } = useConfigurator();
  const quote = draft.quote;

  return (
    <div className="page">
      <TopBar title="Готово" />
      <section className="offer-card" data-demo-tour="lead-thanks">
        <p className="eyebrow">Расчет сохранен</p>
        <h1>Менеджер сможет уточнить детали и подготовить подробное предложение.</h1>
        {quote && (
          <div className="summary-box">
            <p>
              <strong>{quote.displayName}</strong>
            </p>
            <p>
              {formatArea(quote.breakdown.area)} · {quote.material.name} · {quote.package.name}
            </p>
            <p>{formatMoneyRange(quote.priceFrom, quote.priceTo)}</p>
          </div>
        )}
        {params.get('lead') && <p className="muted">Номер заявки: {params.get('lead')}</p>}
        <Link className="btn btn-primary btn-block" to="/">
          На главную
        </Link>
        <Link className="btn btn-ghost btn-block" to="/house">
          Посмотреть кабинет клиента
        </Link>
      </section>
    </div>
  );
}
