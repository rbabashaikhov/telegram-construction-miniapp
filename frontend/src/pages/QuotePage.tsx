import { Link, Navigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { useConfigurator } from '../context/ConfiguratorContext';
import { formatArea, formatMoneyRange } from '../lib/format';

export function QuotePage() {
  const { draft } = useConfigurator();
  const quote = draft.quote;

  if (!quote) {
    return <Navigate to="/configure" replace />;
  }

  return (
    <div className="page">
      <TopBar backTo="/configure" title="Расчет" />
      <section className="offer-card" data-demo-tour="quote-result">
        <p className="eyebrow">Ваш будущий дом</p>
        <h1>{quote.displayName}</h1>
        <div className="stat-pills">
          <span>{formatArea(quote.breakdown.area)}</span>
          <span>{quote.project.floors === 1 ? '1 этаж' : `${quote.project.floors} этажа`}</span>
          <span>{quote.project.bedrooms} спальни</span>
          <span>{quote.project.bathrooms} санузла</span>
        </div>
        <p className="offer-spec">
          {quote.material.name}
          <br />
          {quote.package.name} отделка
        </p>
        <p className="muted">Ориентировочная стоимость</p>
        <p className="hero-price">{formatMoneyRange(quote.priceFrom, quote.priceTo)}</p>
        <p className="muted">Срок строительства</p>
        <p className="hero-duration">
          {quote.durationMonthsFrom}–{quote.durationMonthsTo} месяцев
        </p>
        <p className="fineprint">
          Это предварительный ориентир, не окончательная стоимость. Менеджер подготовит подробное предложение.
        </p>
        <Link className="btn btn-primary btn-block btn-lg" to="/qualify" data-demo-tour="cta-qualify">
          Получить подробный расчет
        </Link>
      </section>
    </div>
  );
}
