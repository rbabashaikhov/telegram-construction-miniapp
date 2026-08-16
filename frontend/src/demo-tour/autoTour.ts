import type { DemoTourDefinition } from './types';

export const CONSTRUCTION_DEMO_TOUR_STORAGE_KEY = 'construction.salesDemoTour.v1';

export const constructionDemoTour: DemoTourDefinition = {
  id: 'construction-sales-demo',
  storageKey: CONSTRUCTION_DEMO_TOUR_STORAGE_KEY,
  intro: {
    title: 'Посмотрим, как строительная компания может превращать Telegram-трафик в квалифицированные заявки.',
    lead: 'Это живой интерфейс, не слайды. Тур заполняет черновик, но заявку создает только ваша кнопка.',
    bullets: [
      'подбор проекта и конфигурация дома',
      'предварительный расчет на backend',
      'квалификация и scoring',
      'карточка лида для отдела продаж',
      'кабинет объекта после договора',
    ],
    startLabel: 'Начать тур',
    skipLabel: 'Пропустить',
  },
  finish: {
    title: 'Один Telegram Mini App: от первого клика до квалифицированного лида и сопровождения строительства.',
    lead: 'Frontend и application layer не знают, SQLite это или CRM. Для пилота нужен adapter, а не переписывание продукта.',
    bullets: [
      'конфигуратор вместо пустой формы',
      'quote считает backend',
      'score и temperature видны менеджеру',
      'ports готовы к Bitrix24 / amoCRM',
      'после продажи — кабинет объекта',
    ],
    adminLabel: 'Открыть sales view',
    continueLabel: 'Продолжить как клиент',
  },
  steps: [
    {
      id: 'project',
      target: 'project-list',
      route: '/',
      title: 'Выберите проект',
      description: 'Клиент начинает не с телефона, а с дома. Популярные проекты сразу на первом экране.',
    },
    {
      id: 'configure',
      target: 'live-quote',
      route: '/configure?project=nordic-125',
      title: 'Настройте дом',
      description: 'Площадь, материал и комплектация. Цена обновляется с каждым шагом.',
      action: 'fill-configurator',
    },
    {
      id: 'quote',
      target: 'quote-result',
      route: '/quote',
      title: 'Предварительный расчет',
      description: 'Это коммерческое предложение, не калькулятор в подвале. Всегда «от / до», никогда финальная сумма.',
      action: 'fill-configurator',
    },
    {
      id: 'qualify',
      target: 'qualify-form',
      route: '/qualify',
      title: 'Квалификация',
      description: 'Участок, регион, срок и бюджет. Короткие вопросы, которые отличают горячий лид от случайного клика.',
      action: 'fill-configurator',
    },
    {
      id: 'submit',
      target: 'cta-submit-lead',
      route: '/qualify',
      title: 'Создание заявки',
      description: 'Лид появится только если вы нажмёте «Отправить расчет». Тур сам ничего не записывает.',
    },
    {
      id: 'sales',
      target: 'lead-score',
      title: 'Что получил отдел продаж',
      description: 'HOT и 87/100 — не бейдж для красоты. Менеджер видит reasons: участок, срок, бюджет, конкретность выбора.',
      action: 'open-hot-lead',
    },
    {
      id: 'cabinet',
      target: 'my-house',
      route: '/house',
      title: 'После договора',
      description: 'Тот же Mini App становится кабинетом объекта: 43%, текущий этап, менеджер проекта.',
      action: 'open-house',
    },
    {
      id: 'photos',
      target: 'photo-list',
      route: '/house/updates',
      title: 'Фотоотчеты и документы',
      description: 'Клиент видит ход строительства без звонка прорабу. Дальше — документы и график платежей.',
      action: 'open-photos',
    },
  ],
};
