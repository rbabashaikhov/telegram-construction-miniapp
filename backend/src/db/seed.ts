import type Database from 'better-sqlite3';
import { scoreLead } from '../domain/scoring.js';
import { createLocalProviders } from '../providers/local/sqlite.js';

const STAGE_DEFS = [
  { name: 'Проектирование', description: 'Рабочая документация и согласование планировки.', start: '2026-03-01', end: '2026-03-28', status: 'completed' as const, progress: 100, completedAt: '2026-03-26' },
  { name: 'Подготовка участка', description: 'Расчистка, разметка, временные коммуникации.', start: '2026-04-01', end: '2026-04-18', status: 'completed' as const, progress: 100, completedAt: '2026-04-16' },
  { name: 'Фундамент', description: 'Утеплённая шведская плита и закладные.', start: '2026-04-20', end: '2026-05-20', status: 'completed' as const, progress: 100, completedAt: '2026-05-18' },
  { name: 'Стены', description: 'Кладка газобетона, перемычки, армопояс.', start: '2026-05-22', end: '2026-07-10', status: 'in_progress' as const, progress: 55, completedAt: null },
  { name: 'Кровля', description: 'Стропильная система, утепление, покрытие.', start: '2026-07-12', end: '2026-08-05', status: 'pending' as const, progress: 0, completedAt: null },
  { name: 'Окна', description: 'Панорамные окна и входная группа.', start: '2026-08-06', end: '2026-08-20', status: 'pending' as const, progress: 0, completedAt: null },
  { name: 'Инженерные системы', description: 'Отопление, электрика, вода, вентиляция.', start: '2026-08-22', end: '2026-09-30', status: 'pending' as const, progress: 0, completedAt: null },
  { name: 'Отделка', description: 'Предчистовая и чистовая отделка по договору.', start: '2026-10-01', end: '2026-11-20', status: 'pending' as const, progress: 0, completedAt: null },
  { name: 'Сдача', description: 'Приёмка, акты, передача ключей.', start: '2026-11-21', end: '2026-12-05', status: 'pending' as const, progress: 0, completedAt: null },
];

export function seed(database: Database.Database): void {
  const existing = database.prepare('SELECT COUNT(*) AS count FROM house_projects').get() as { count: number };
  if (existing.count > 0) return;

  const providers = createLocalProviders(database);

  const nordic96 = providers.catalog.createProject({
    slug: 'nordic-96',
    name: 'Nordic 96',
    description:
      'Компактный одноэтажный дом для пары или небольшой семьи. Светлая планировка, панорамное остекление гостиной и выход на террасу.',
    floors: 1,
    area: 96,
    bedrooms: 2,
    bathrooms: 1,
    style: 'nordic',
    basePrice: 5_400_000,
    constructionDurationMonths: 6,
    image: '/houses/nordic-96.jpg',
    gallery: ['/houses/nordic-96.jpg'],
    areaOptions: [96, 110, 125],
    features: ['1 этаж', '2 спальни', 'терраса', 'панорамные окна'],
    active: true,
    displayOrder: 1,
  });
  const nordic125 = providers.catalog.createProject({
    slug: 'nordic-125',
    name: 'Nordic 125',
    description:
      'Северный дом с кабинетом и мастер-спальней. Спокойный силуэт, тёплое дерево и большие окна на сад.',
    floors: 1,
    area: 125,
    bedrooms: 3,
    bathrooms: 2,
    style: 'nordic',
    basePrice: 6_150_000,
    constructionDurationMonths: 7,
    image: '/houses/nordic-125.jpg',
    gallery: ['/houses/nordic-125.jpg'],
    areaOptions: [125, 142, 155],
    features: ['1 этаж', '3 спальни', 'кабинет', 'мастер-спальня'],
    active: true,
    displayOrder: 2,
  });
  providers.catalog.createProject({
    slug: 'family-140',
    name: 'Family 140',
    description:
      'Семейный дом с отдельной детской зоной и просторной кухней-гостиной. Удобно жить сразу после сдачи «под ключ».',
    floors: 2,
    area: 140,
    bedrooms: 4,
    bathrooms: 2,
    style: 'family',
    basePrice: 7_200_000,
    constructionDurationMonths: 8,
    image: '/houses/family-140.jpg',
    gallery: ['/houses/family-140.jpg'],
    areaOptions: [140, 160, 180],
    features: ['2 этажа', '4 спальни', 'гардероб', 'кухня-гостиная'],
    active: true,
    displayOrder: 3,
  });
  providers.catalog.createProject({
    slug: 'barn-118',
    name: 'Barn 118',
    description:
      'Современный барнхаус с высоким потолком в общей зоне. Лаконичный объём, тёмное дерево и двор с гравием.',
    floors: 1,
    area: 118,
    bedrooms: 3,
    bathrooms: 2,
    style: 'barn',
    basePrice: 6_050_000,
    constructionDurationMonths: 7,
    image: '/houses/barn-118.jpg',
    gallery: ['/houses/barn-118.jpg'],
    areaOptions: [118, 135, 150],
    features: ['барнхаус', 'второй свет', '3 спальни', 'внутренний двор'],
    active: true,
    displayOrder: 4,
  });
  providers.catalog.createProject({
    slug: 'modern-160',
    name: 'Modern 160',
    description:
      'Кубический объём, консоль второго этажа и широкая терраса. Для тех, кто хочет современную архитектуру без лишнего декора.',
    floors: 2,
    area: 160,
    bedrooms: 4,
    bathrooms: 3,
    style: 'modern',
    basePrice: 8_800_000,
    constructionDurationMonths: 9,
    image: '/houses/modern-160.jpg',
    gallery: ['/houses/modern-160.jpg'],
    areaOptions: [160, 180, 200],
    features: ['2 этажа', 'консоль', '4 спальни', 'терраса'],
    active: true,
    displayOrder: 5,
  });
  providers.catalog.createProject({
    slug: 'classic-185',
    name: 'Classic 185',
    description:
      'Светлый каменный фасад, симметрия и спокойная классика. Дом для постоянного проживания за городом.',
    floors: 2,
    area: 185,
    bedrooms: 5,
    bathrooms: 3,
    style: 'classic',
    basePrice: 9_600_000,
    constructionDurationMonths: 10,
    image: '/houses/classic-185.jpg',
    gallery: ['/houses/classic-185.jpg'],
    areaOptions: [185, 210, 240],
    features: ['2 этажа', '5 спален', 'кабинет', 'парадный вход'],
    active: true,
    displayOrder: 6,
  });

  const gasbeton = providers.catalog.createMaterial({
    name: 'Газобетон',
    slug: 'gasbeton',
    priceModifierType: 'percent',
    priceModifierValue: 0,
    durationDeltaMonths: 0,
    description: 'Тёплые стены, предсказуемые сроки, оптимальное соотношение цены и энергоэффективности.',
    active: true,
    displayOrder: 1,
  });
  const brick = providers.catalog.createMaterial({
    name: 'Кирпич',
    slug: 'brick',
    priceModifierType: 'percent',
    priceModifierValue: 12,
    durationDeltaMonths: 1,
    description: 'Классическая кладка, высокая инерционность и солидный фасад без дополнительной облицовки.',
    active: true,
    displayOrder: 2,
  });
  providers.catalog.createMaterial({
    name: 'Керамический блок',
    slug: 'ceramic',
    priceModifierType: 'percent',
    priceModifierValue: 8,
    durationDeltaMonths: 0,
    description: 'Тёплая керамика: меньше мостиков холода и аккуратная геометрия стен.',
    active: true,
    displayOrder: 3,
  });
  providers.catalog.createMaterial({
    name: 'Каркас',
    slug: 'frame',
    priceModifierType: 'percent',
    priceModifierValue: -8,
    durationDeltaMonths: -1,
    description: 'Быстрее в сборке, легче фундамент, хорошая теплоизоляция при правильном пироге стены.',
    active: true,
    displayOrder: 4,
  });

  const warm = providers.catalog.createPackage({
    name: 'Тёплый контур',
    slug: 'warm-shell',
    description: 'Дом закрыт от улицы: фундамент, стены, кровля, окна и входная дверь.',
    multiplier: 1,
    durationDeltaMonths: 0,
    features: ['Фундамент', 'Стены', 'Кровля', 'Окна', 'Входная дверь'],
    active: true,
    displayOrder: 1,
  });
  const prefinish = providers.catalog.createPackage({
    name: 'Предчистовая',
    slug: 'prefinish',
    description: 'Тёплый контур плюс инженерия и подготовка под чистовую отделку.',
    multiplier: 1.35,
    durationDeltaMonths: 1,
    features: [
      'Всё из тёплого контура',
      'Инженерные коммуникации',
      'Электрика',
      'Штукатурка',
      'Стяжка',
    ],
    active: true,
    displayOrder: 2,
  });
  providers.catalog.createPackage({
    name: 'Под ключ',
    slug: 'turnkey',
    description: 'Можно заезжать: чистовая отделка, сантехника, полы и межкомнатные двери.',
    multiplier: 1.75,
    durationDeltaMonths: 2,
    features: [
      'Всё из предчистовой',
      'Чистовая отделка',
      'Сантехника',
      'Напольные покрытия',
      'Межкомнатные двери',
    ],
    active: true,
    displayOrder: 3,
  });

  const manager = providers.construction.createManager({
    name: 'Анна Соколова',
    role: 'Менеджер проекта',
    phone: '+7 495 120-14-20',
  });

  const demoClient = providers.customers.upsert(
    { id: 999000001, username: 'demo_client', first_name: 'Иван', last_name: 'Петров' },
    { name: 'Иван Петров', phone: '+7 916 555-10-20' },
  );
  const elena = providers.customers.upsert(
    { id: 900000101, username: 'elena_volkova', first_name: 'Елена', last_name: 'Волкова' },
    { name: 'Елена Волкова', phone: '+7 903 441-22-18' },
  );
  const pavel = providers.customers.upsert(
    { id: 900000102, username: 'pavel_orlov', first_name: 'Павел', last_name: 'Орлов' },
    { name: 'Павел Орлов', phone: '+7 926 330-08-41' },
  );
  const marina = providers.customers.upsert(
    { id: 900000103, username: 'marina_k', first_name: 'Марина', last_name: 'Кузнецова' },
    { name: 'Марина Кузнецова', phone: '+7 910 200-77-15' },
  );

  function persistLead(params: {
    customerId: number;
    projectId: number;
    area: number;
    materialId: number;
    packageId: number;
    quoteFrom: number;
    quoteTo: number;
    durationFrom: number;
    durationTo: number;
    hasLand: 'yes' | 'choosing' | 'no';
    region: string;
    start: 'asap' | '1_3' | '3_6' | '6_12' | 'exploring';
    budget: 'under_7' | '7_10' | '10_15' | '15_20' | '20_plus';
    status?: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  }) {
    const scored = scoreLead({
      hasLand: params.hasLand,
      desiredStartPeriod: params.start,
      budgetRange: params.budget,
      quoteFrom: params.quoteFrom,
      quoteTo: params.quoteTo,
      hasProject: true,
      hasMaterial: true,
      hasPackage: true,
    });
    const quote = providers.quotes.insert({
      customerId: params.customerId,
      projectId: params.projectId,
      area: params.area,
      materialId: params.materialId,
      packageId: params.packageId,
      options: [],
      subtotal: Math.round((params.quoteFrom + params.quoteTo) / 2),
      priceFrom: params.quoteFrom,
      priceTo: params.quoteTo,
      durationMonthsFrom: params.durationFrom,
      durationMonthsTo: params.durationTo,
      breakdown: {
        basePrice: 0,
        area: params.area,
        projectArea: params.area,
        areaModifier: 1,
        materialModifier: 1,
        packageMultiplier: 1,
        optionsTotal: 0,
      },
    });
    return providers.leads.createLead({
      customerId: params.customerId,
      projectId: params.projectId,
      requestedArea: params.area,
      materialId: params.materialId,
      packageId: params.packageId,
      quoteId: quote.id,
      quoteFrom: params.quoteFrom,
      quoteTo: params.quoteTo,
      durationMonthsFrom: params.durationFrom,
      durationMonthsTo: params.durationTo,
      hasLand: params.hasLand,
      region: params.region,
      desiredStartPeriod: params.start,
      budgetRange: params.budget,
      score: scored.score,
      temperature: scored.temperature,
      reasons: scored.reasons,
      status: params.status ?? 'new',
      notes: null,
    });
  }

  persistLead({
    customerId: elena.id,
    projectId: nordic125.id,
    area: 142,
    materialId: gasbeton.id,
    packageId: prefinish.id,
    quoteFrom: 9_200_000,
    quoteTo: 10_400_000,
    durationFrom: 7,
    durationTo: 9,
    hasLand: 'yes',
    region: 'Московская область',
    start: '1_3',
    budget: '10_15',
    status: 'new',
  });
  persistLead({
    customerId: pavel.id,
    projectId: nordic96.id,
    area: 110,
    materialId: brick.id,
    packageId: warm.id,
    quoteFrom: 6_800_000,
    quoteTo: 7_700_000,
    durationFrom: 6,
    durationTo: 8,
    hasLand: 'choosing',
    region: 'Москва',
    start: '3_6',
    budget: '7_10',
    status: 'contacted',
  });
  persistLead({
    customerId: marina.id,
    projectId: nordic125.id,
    area: 125,
    materialId: gasbeton.id,
    packageId: prefinish.id,
    quoteFrom: 8_100_000,
    quoteTo: 9_200_000,
    durationFrom: 8,
    durationTo: 10,
    hasLand: 'no',
    region: 'Другой регион',
    start: 'exploring',
    budget: 'under_7',
    status: 'new',
  });

  const instance = providers.construction.createInstance({
    customerId: demoClient.id,
    projectId: nordic125.id,
    leadId: null,
    name: 'Nordic 142',
    region: 'Московская область',
    area: 142,
    floors: 1,
    bedrooms: 3,
    bathrooms: 2,
    materialId: gasbeton.id,
    packageId: prefinish.id,
    contractAmount: 10_460_000,
    progress: 43,
    plannedCompletionDate: '2026-12-05',
    managerId: manager.id,
    status: 'active',
  });

  const stages = STAGE_DEFS.map((stage, index) =>
    providers.construction.createStage({
      projectInstanceId: instance.id,
      name: stage.name,
      description: stage.description,
      status: stage.status,
      progress: stage.progress,
      plannedStartDate: stage.start,
      plannedEndDate: stage.end,
      completedAt: stage.completedAt,
      displayOrder: index + 1,
    }),
  );

  const foundation = stages[2];
  const walls = stages[3];

  providers.construction.createUpdate({
    projectInstanceId: instance.id,
    stageId: foundation.id,
    title: 'Фундамент принят',
    text: 'Утеплённая плита залита, гидроизоляция закрыта, закладные под инженерию на месте.',
    date: '2026-05-18',
    photos: ['/progress/progress-foundation.jpg'],
  });
  providers.construction.createUpdate({
    projectInstanceId: instance.id,
    stageId: walls.id,
    title: 'Завершена кладка первого этажа',
    text: 'Стены первого этажа выведены, проёмы готовы под перемычки. На следующей неделе армопояс.',
    date: '2026-08-15',
    photos: ['/progress/progress-walls.jpg', '/progress/progress-windows.jpg'],
  });
  providers.construction.createUpdate({
    projectInstanceId: instance.id,
    stageId: walls.id,
    title: 'Кровля в подготовке',
    text: 'Пиломатериал для стропильной системы уже на участке. Монтаж начнётся после армопояса.',
    date: '2026-08-10',
    photos: ['/progress/progress-roof.jpg'],
  });

  providers.construction.createDocument({
    projectInstanceId: instance.id,
    title: 'Договор подряда',
    type: 'contract',
    fileUrl: '/docs/contract.pdf',
  });
  providers.construction.createDocument({
    projectInstanceId: instance.id,
    title: 'Проект Nordic 142',
    type: 'project',
    fileUrl: '/docs/project.pdf',
  });
  providers.construction.createDocument({
    projectInstanceId: instance.id,
    title: 'Смета предчистовой отделки',
    type: 'estimate',
    fileUrl: '/docs/estimate.pdf',
  });
  providers.construction.createDocument({
    projectInstanceId: instance.id,
    title: 'Акт выполненных работ — фундамент',
    type: 'act',
    fileUrl: '/docs/act.pdf',
  });

  providers.construction.createPayment({
    projectInstanceId: instance.id,
    title: 'Аванс по договору',
    amount: 2_600_000,
    dueCondition: 'При подписании договора',
    dueDate: '2026-03-01',
    status: 'paid',
    paidAt: '2026-03-01',
    displayOrder: 1,
  });
  providers.construction.createPayment({
    projectInstanceId: instance.id,
    title: 'Фундамент',
    amount: 2_600_000,
    dueCondition: 'После приёмки фундамента',
    dueDate: '2026-05-18',
    status: 'paid',
    paidAt: '2026-05-18',
    displayOrder: 2,
  });
  providers.construction.createPayment({
    projectInstanceId: instance.id,
    title: 'Кровля',
    amount: 1_800_000,
    dueCondition: 'После завершения кровли',
    dueDate: null,
    status: 'due',
    paidAt: null,
    displayOrder: 3,
  });
  providers.construction.createPayment({
    projectInstanceId: instance.id,
    title: 'Инженерия',
    amount: 1_860_000,
    dueCondition: 'После монтажа инженерных систем',
    dueDate: null,
    status: 'planned',
    paidAt: null,
    displayOrder: 4,
  });
  providers.construction.createPayment({
    projectInstanceId: instance.id,
    title: 'Сдача объекта',
    amount: 1_600_000,
    dueCondition: 'При подписании итогового акта',
    dueDate: '2026-12-05',
    status: 'planned',
    paidAt: null,
    displayOrder: 5,
  });
}

export function resetAndSeed(database: Database.Database): void {
  const tables = [
    'payment_schedule_items',
    'project_documents',
    'progress_updates',
    'construction_stages',
    'project_instances',
    'project_managers',
    'leads',
    'quotes',
    'packages',
    'construction_materials',
    'house_projects',
    'outbound_events',
    'customers',
  ];
  database.exec('PRAGMA foreign_keys = OFF');
  for (const table of tables) {
    database.exec(`DELETE FROM ${table}`);
  }
  database.exec('PRAGMA foreign_keys = ON');
  seed(database);
}
