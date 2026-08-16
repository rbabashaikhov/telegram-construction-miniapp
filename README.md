# Nordhaus — Telegram Mini App для строительной компании

Telegram Mini App, который превращает трафик из Telegram, рекламы и сайта в квалифицированные лиды на строительство дома, а после договора работает как кабинет объекта.

Это пятый продукт линейки Mini Apps. Demo-компания **Nordhaus** вымышленная: современная архитектура, Москва и область.

## Product

Обычная форма «имя + телефон» не показывает, какой дом нужен клиенту и готов ли он строить. Nordhaus проводит человека через подбор проекта, предварительный расчет и короткую квалификацию. Менеджер получает не сырой контакт, а конфигурацию, диапазон стоимости и score.

После заключения договора тот же Mini App становится клиентским кабинетом: прогресс, этапы, фотоотчеты, документы и график платежей.

## Customer flow

```text
Project
→ configuration
→ quote
→ qualification
→ lead
```

Клиент выбирает проект, площадь, материал и комплектацию. Backend считает ориентировочную стоимость «от / до». Затем несколько вопросов: участок, регион, срок, бюджет, контакты.

## Sales flow

```text
Lead
→ scoring
→ CRM
→ manager
```

Score и temperature считает backend. В админке видны reasons: участок уже есть, старт в ближайшие 3 месяца, бюджет соответствует конфигурации, выбран конкретный проект.

## Existing customer flow

```text
My House
→ progress
→ photos
→ documents
→ payments
```

Demo-клиент Иван Петров: Nordic 142, Московская область, строительство 43%, текущий этап — стены.

## Architecture

Application layer работает только через ports. Выбор SQLite или CRM происходит в composition layer, не внутри use cases.

```text
Frontend
   ↓
REST API
   ↓
Application Layer
   ↓
Domain Ports
   ↓
Providers
   ├── Local SQLite
   ├── CRM stub
   └── future Bitrix24 / amoCRM / custom CRM
```

`DATA_MODE=local` — полноценное demo на SQLite.  
`DATA_MODE=crm` — CRM providers. Сейчас stub явно возвращает `501 CRM_NOT_CONFIGURED`, без тихого fallback на local.

События отделены от persistence: `EVENT_ADAPTER=local|webhook|mock`.

## CRM readiness

Для production нужен adapter, который реализует те же ports:

- Customer, Lead, Quote, HouseProject, ProjectInstance, ConstructionStage
- outbound `lead.created`, `lead.updated`, `lead.qualified`
- inbound обновления прогресса, документов и платежей

Контракт: [`docs/CRM.md`](docs/CRM.md).

## Local development

```bash
cp .env.example .env
npm install
npm run dev
```

Frontend: http://localhost:5173  
API: http://localhost:3000

```bash
npm test
npm run typecheck
npm run build
```

## Docker

```bash
docker compose up --build
```

Один процесс Express: `/api/*` и собранный frontend. SQLite: `DATABASE_PATH=/data/construction.db`, volume `/data`.

## Demo

Browser demo (`ALLOW_DEMO_MODE=true`): пользователь Иван Петров, guided sales tour по живому интерфейсу.

- `/` — подбор дома
- `/configure` — конфигуратор и живой расчет
- `/admin` — рабочая админка (в production нужен `ADMIN_TOKEN`)
- `/demo/admin` — read-only sales view, write запрещены
- `/house` — кабинет существующего клиента

Telegram production: HMAC-проверка `initData` на backend. Frontend Telegram user object без подписи не является источником истины.

## Security

- Telegram `initData` валидируется HMAC SHA-256
- Admin fail closed: без `ADMIN_TOKEN` в production write API недоступен
- `/api/demo-admin` только GET
- Quote, score и temperature пересчитывает backend; цены с клиента игнорируются
