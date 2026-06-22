# Family Sync — Entity Schema Reference

All entities live in `base44/entities/` as `.jsonc` files.
Each entity maps to a database table managed by Base44.
Base44 automatically applies Row-Level Security (RLS) so users only access their own data.

---

## Entity Map

```
Family ─┬─ FamilyMember (children, parents)
        │
Upload ─┴─ ExtractedItem (AI extraction output, review queue)
                │
                ├─▶ ApprovedEvent   (calendar events after parent approval)
                ├─▶ TaskItem        (payments, forms, to-dos after approval)
                └─▶ PackingItem     (gear/packing checklist items after approval)
```

---

## Family

**File:** `base44/entities/family.jsonc`

Represents one family unit. One family per user account (enforced by RLS).

| Field           | Type    | Required | Notes                                         |
|-----------------|---------|----------|-----------------------------------------------|
| `id`            | string  | auto     | UUID, primary key                             |
| `name`          | string  | yes      | e.g. "The Hernandez Family"                  |
| `home_location` | string  | no       | City/state used by AI for drive-time context  |
| `timezone`      | string  | no       | IANA timezone e.g. "America/Chicago"          |
| `created_at`    | string  | auto     | ISO 8601 timestamp                            |

---

## FamilyMember

**File:** `base44/entities/family-member.jsonc`

One record per person in the family. Children are stored here — NOT as user accounts.
This is intentional: children never have login credentials (COPPA-adjacent design).

| Field            | Type     | Required | Notes                                              |
|------------------|----------|----------|----------------------------------------------------|
| `id`             | string   | auto     | UUID                                               |
| `name`           | string   | yes      | First name only is fine — AI matches on this       |
| `role`           | enum     | yes      | `parent` \| `guardian` \| `child`                  |
| `sports`         | string[] | no       | e.g. `["soccer", "hockey"]`                        |
| `team_names`     | string[] | no       | e.g. `["Storm U10", "Northside Jets U12"]`         |
| `birth_year`     | number   | no       | Used to derive age band for AI context             |
| `jersey_number`  | string   | no       |                                                    |
| `school`         | string   | no       |                                                    |
| `coach_contact`  | string   | no       | Name or phone number                               |
| `color`          | string   | no       | Hex color for UI avatar                            |

---

## Upload

**File:** `base44/entities/upload.jsonc`

Tracks every piece of content a parent submits for AI extraction.
One Upload → many ExtractedItems.

| Field                | Type   | Notes                                                         |
|----------------------|--------|---------------------------------------------------------------|
| `id`                 | string | UUID                                                          |
| `source_type`        | enum   | `image` \| `pdf` \| `text` \| `note`                         |
| `status`             | enum   | `pending_extraction` → `extracting` → `review_ready` → `completed` \| `failed` |
| `title`              | string | Display name (file name or first 60 chars of text)            |
| `raw_text`           | string | Text content (extracted from file or typed by parent)         |
| `file_url`           | string | Base44 storage URL (only set for image/pdf types)             |
| `file_name`          | string |                                                               |
| `file_size_bytes`    | number |                                                               |
| `family_id`          | string | FK → Family                                                   |
| `uploaded_by`        | string | FK → User (auth user ID)                                      |
| `items_extracted`    | number | Count of ExtractedItems created                               |
| `extraction_result`  | object | `{ summary, extraction_confidence }` from AI function         |
| `extraction_error`   | string | Error message if status = failed                              |
| `created_at`         | string |                                                               |

---

## ExtractedItem

**File:** `base44/entities/extracted-item.jsonc`

The raw output of the AI extraction. Parents review these before they become
ApprovedEvents or TaskItems. **Nothing moves to the approved layer without
explicit parent action** — this is a core trust principle.

| Field                 | Type     | Notes                                                               |
|-----------------------|----------|---------------------------------------------------------------------|
| `id`                  | string   | UUID                                                                |
| `upload_id`           | string   | FK → Upload                                                         |
| `item_type`           | enum     | `calendar_event` \| `task` \| `payment` \| `form_required` \| `packing_item` \| `travel_note` \| `conflict_warning` \| `general_note` |
| `review_status`       | enum     | `pending` → `approved` \| `edited_approved` \| `rejected`          |
| `title`               | string   |                                                                     |
| `description`         | string   |                                                                     |
| `sport_activity`      | string   | e.g. "Soccer Practice", "Hockey Tournament"                         |
| `confidence_score`    | float    | 0.0–1.0. Items < 0.70 are flagged `low_confidence`                  |
| `event_date`          | string   | ISO date "YYYY-MM-DD"                                               |
| `start_time`          | string   | "HH:MM" 24h                                                         |
| `end_time`            | string   | "HH:MM" 24h                                                         |
| `arrival_time`        | string   | "HH:MM" — when family should arrive at venue                        |
| `leave_by_time`       | string   | "HH:MM" — when family must leave home                               |
| `location_name`       | string   |                                                                     |
| `location_address`    | string   |                                                                     |
| `amount`              | float    | Dollar amount (payment items)                                       |
| `payable_to`          | string   |                                                                     |
| `deadline`            | string   | ISO date                                                            |
| `form_name`           | string   |                                                                     |
| `form_url`            | string   |                                                                     |
| `packing_items`       | string[] | For packing_item type — array of item strings                       |
| `source_text`         | string   | The exact snippet of text this item was extracted from              |
| `flags`               | string[] | `low_confidence` \| `time_sensitive` \| `missing_date` \| `missing_location` \| `conflict` |
| `is_recurring`        | boolean  |                                                                     |
| `recurrence_pattern`  | string   | "weekly", "biweekly", etc.                                          |

### Confidence Score Bands

| Score     | Meaning                           | UI treatment            |
|-----------|-----------------------------------|-------------------------|
| 0.90–1.00 | High — AI is very confident       | Green dot, no warning   |
| 0.70–0.89 | Medium — review recommended       | Yellow dot              |
| 0.50–0.69 | Low — flag for parent review      | Red dot + ⚠️ banner     |
| < 0.50    | Very low — might be wrong         | Red dot + strong warning |

---

## ApprovedEvent

**File:** `base44/entities/approved-event.jsonc`

Created when a parent approves an ExtractedItem of type `calendar_event`.
This is the source of truth for the weekly GamePlan and ICS export.

| Field                | Type    | Notes                                                |
|----------------------|---------|------------------------------------------------------|
| `id`                 | string  |                                                      |
| `extracted_item_id`  | string  | FK → ExtractedItem (for audit trail)                 |
| `upload_id`          | string  | FK → Upload                                          |
| `title`              | string  |                                                      |
| `sport_activity`     | string  | e.g. "Soccer Game"                                   |
| `event_date`         | string  | ISO date                                             |
| `start_time`         | string  | HH:MM                                                |
| `end_time`           | string  | HH:MM                                                |
| `arrival_time`       | string  | HH:MM                                                |
| `leave_by_time`      | string  | HH:MM — surfaced prominently in GamePlan             |
| `location_name`      | string  |                                                      |
| `location_address`   | string  |                                                      |
| `notes`              | string  |                                                      |
| `is_recurring`       | boolean |                                                      |
| `recurrence_pattern` | string  |                                                      |
| `ics_uid`            | string  | Stable UID for ICS export — never changes after creation |

---

## TaskItem

**File:** `base44/entities/task-item.jsonc`

Created when a parent approves an ExtractedItem of type `task`, `payment`, or `form_required`.

| Field               | Type    | Notes                                          |
|---------------------|---------|------------------------------------------------|
| `id`                | string  |                                                |
| `extracted_item_id` | string  | FK → ExtractedItem                             |
| `upload_id`         | string  |                                                |
| `task_type`         | enum    | `general_task` \| `payment` \| `form_required` |
| `title`             | string  |                                                |
| `description`       | string  |                                                |
| `status`            | enum    | `pending` \| `done` \| `snoozed`               |
| `deadline`          | string  | ISO date                                       |
| `amount`            | float   | Dollar amount (payment tasks only)             |
| `payable_to`        | string  |                                                |
| `form_name`         | string  |                                                |
| `form_url`          | string  |                                                |
| `is_urgent`         | boolean | True if `time_sensitive` flag is set           |
| `completed_at`      | string  | ISO timestamp                                  |

---

## PackingItem

**File:** `base44/entities/packing-item.jsonc`

One item in the family packing checklist. Parents check items off before events.

| Field              | Type    | Notes                                              |
|--------------------|---------|----------------------------------------------------|
| `id`               | string  |                                                    |
| `item_name`        | string  | e.g. "Hockey bag + skates"                         |
| `category`         | enum    | `gear` \| `food` \| `documents` \| `other`         |
| `is_packed`        | boolean | Default false                                      |
| `source_upload_id` | string  | FK → Upload (which upload triggered this item)     |

---

## Migration Notes

If you migrate away from Base44, the entity schema maps naturally to SQL:

```sql
-- Every field with a string[] type becomes a JSONB column in Postgres
-- or a separate junction table depending on query patterns.

-- Example: FamilyMember in Postgres
CREATE TABLE family_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id   UUID REFERENCES families(id),
  name        TEXT NOT NULL,
  role        TEXT CHECK (role IN ('parent', 'guardian', 'child')),
  sports      JSONB DEFAULT '[]',
  team_names  JSONB DEFAULT '[]',
  birth_year  INT,
  color       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

The service layer in `src/services/` abstracts all entity access, so the React
components never know about the underlying database.
