# CRM integration contract

Mini App не является CRM. Application layer зависит от provider interfaces. Когда появится CRM строительной компании, реализуется набор CRM providers. UI и use cases не переписываются.

Сейчас `DATA_MODE=crm` включает typed stub: любой вызов возвращает HTTP `501` с кодом `CRM_NOT_CONFIGURED`. Тихого fallback на SQLite нет.

## Source of truth

**LOCAL (`DATA_MODE=local`)**

```text
Mini App → Application → Local Providers → SQLite
```

**CRM-backed (контракт)**

```text
Mini App → Application → CRM Providers → Partner CRM
```

CRM authoritative для Customer, Lead, Quote, HouseProject, ConstructionMaterial, Package, ProjectInstance, ConstructionStage, ProgressUpdate, ProjectDocument, PaymentScheduleItem.

Local SQLite в CRM-режиме может остаться только для technical state, ID mapping и optional cache. Mini App не должен стать второй правдой.

## Entities and field mapping

### Customer

| Mini App | CRM |
| --- | --- |
| id | internal / mapping table |
| telegramUserId | telegram_id / UF_TELEGRAM_ID |
| name | NAME + LAST_NAME |
| phone | PHONE |
| username | UF_TELEGRAM_USERNAME |

### Lead

| Mini App | CRM |
| --- | --- |
| projectId / requestedArea / materialId / packageId | product / deal custom fields |
| quoteFrom / quoteTo | OPPORTUNITY range or UF_QUOTE_FROM / UF_QUOTE_TO |
| hasLand | UF_HAS_LAND |
| region | UF_REGION |
| desiredStartPeriod | UF_START_PERIOD |
| budgetRange | UF_BUDGET_RANGE |
| score / temperature / reasons | UF_LEAD_SCORE / UF_TEMPERATURE / UF_SCORE_REASONS |
| status | STATUS_ID / STAGE_ID |

Lead statuses: `new → contacted → qualified → proposal → won | lost`.

### Quote

Расчет всегда выполняется application layer / pricing engine. CRM хранит snapshot, но не принимает клиентскую цену как истину.

### HouseProject / Material / Package

Каталог может жить в Mini App на этапе пилота. В production catalog либо синхронизируется из CRM, либо CRM читает catalog API Mini App. Не дублировать цены в двух системах без mapping.

### ProjectInstance

После `won` CRM создает объект строительства. Mini App читает ProjectInstance через ConstructionProvider.

| Mini App | CRM |
| --- | --- |
| name / area / region | deal title + custom fields |
| progress | UF_PROGRESS |
| plannedCompletionDate | CLOSEDATE / UF_DEADLINE |
| manager | ASSIGNED_BY_ID |

### ConstructionStage / ProgressUpdate / Document / Payment

Inbound из CRM или строительного контура:

- статус этапа
- фотоотчет
- ссылка на документ
- статус платежа (`planned` / `due` / `paid`)

Mini App не проводит оплату и не подписывает документы.

## Outbound events

`OutboundEventPublisher` отделён от persistence.

```text
lead.created
lead.updated
lead.qualified
project.customer_created
```

Для demo: `EVENT_ADAPTER=local` пишет в SQLite. `webhook` делает POST на `EVENT_WEBHOOK_URL`. `mock` только логирует.

Пример payload `lead.created`:

```json
{
  "leadId": 12,
  "customerId": 4,
  "score": 87,
  "temperature": "hot",
  "quoteFrom": 9200000,
  "quoteTo": 10400000
}
```

## CRM → application

На будущее inbound:

- project status
- construction progress
- documents
- payment state

Рекомендуемый контракт:

```http
POST /api/integrations/crm/project-instances/:id/progress
POST /api/integrations/crm/project-instances/:id/stages
POST /api/integrations/crm/project-instances/:id/documents
POST /api/integrations/crm/project-instances/:id/payments
```

Эти endpoints не реализованы в MVP. Их нужно защитить отдельным integration token, не ADMIN_TOKEN клиентской админки.

## Vendor adapters

### Bitrix24

- Lead / Deal + smart process для объекта строительства
- custom fields для конфигурации, quote range, score
- timeline comments для reasons
- SPA or CRM item для ConstructionStage

### amoCRM

- Lead + custom fields
- pipeline stages = lead statuses
- catalog products ≈ house projects
- tasks для менеджера при `lead.qualified`

### Custom API

Реализовать `LeadProvider`, `CatalogProvider`, `ConstructionProvider`, `CustomerProvider` один-в-один с `backend/src/providers/types.ts`. Подключить только в `container.ts`.

## How to connect a real adapter

1. Создать `backend/src/providers/crm/bitrix.ts` (или amo/custom).
2. Реализовать ports, не меняя routes и frontend.
3. В `container.ts` выбрать factory по `DATA_MODE` / `CRM_ADAPTER`.
4. Хранить mapping `miniapp_id ↔ crm_id`.
5. Не ветвить use cases через `if (crmMode)`.

## What Mini App will not become

Не реализовывать здесь: сметную систему, BIM/CAD, ипотеку, эквайринг, ЭЦП, геодезию, склад, закупки, бригады, бухгалтерию, ERP, AI, multi-company SaaS.
