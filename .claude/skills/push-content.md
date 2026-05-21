---
description: Push interview questions to Hack2Fire via the content API. Use when an agent needs to create, update, list, or archive questions programmatically.
---

# Push Content to Hack2Fire

You are interacting with the Hack2Fire content API. All endpoints require `Authorization: Bearer <API_SECRET_KEY>`.

## Base URL

Production: `https://hack2fire.com` (or `https://hack2fire.vercel.app`)

## API Key Setup

If `API_SECRET_KEY` is not yet configured:

1. Generate a key: `openssl rand -base64 32`
2. Add to Vercel: `vercel env add API_SECRET_KEY` (set for Production, Preview, and Development)
3. Redeploy: `vercel --prod`
4. Pull locally: `vercel env pull .env.local && cp .env.local .env`

All requests must include the header: `Authorization: Bearer <API_SECRET_KEY>`

## Endpoints

### List Questions

```
GET /api/questions
```

Query params (all optional):
- `status` — DRAFT, REVIEW, PUBLISHED, ARCHIVED
- `type` — CODING, SYSTEM_DESIGN, BEHAVIORAL, VIDEO, MIXED
- `difficulty` — EASY, MEDIUM, HARD

### Create Question

```
POST /api/questions
Content-Type: application/json
```

Required fields:
```json
{
  "title": "Two Sum",
  "summary": "Find two numbers that add up to target",
  "promptMd": "# Two Sum\n\nGiven an array of integers..."
}
```

Optional fields:
```json
{
  "company": "Google",
  "difficulty": "EASY",
  "type": "CODING",
  "tags": ["array", "hash-map"],
  "solutionMd": "## Approach\n\nUse a hash map...",
  "videoUrl": "https://youtube.com/embed/...",
  "starterCode": "function twoSum(nums, target) {\n  \n}",
  "testCases": [{"input": [[2,7,11,15], 9], "expected": [0,1]}],
  "categoryId": "<category-id>",
  "templateId": "<template-id>"
}
```

Response: `201` with created question JSON. Slug is auto-generated from title.

### Get Question

```
GET /api/questions/:slug
```

Returns question with all versions and category.

### Update Question

```
PUT /api/questions/:slug
Content-Type: application/json
```

Send only the fields you want to change. A new version is automatically created on every update — no need to manage versioning yourself.

```json
{
  "title": "Two Sum (Updated)",
  "solutionMd": "## Better Approach\n\n..."
}
```

### Archive Question (Soft Delete)

```
DELETE /api/questions/:slug
```

Sets status to ARCHIVED. The question is not permanently deleted.

## Data Schema

### Enums

| Enum | Values |
|------|--------|
| Difficulty | EASY, MEDIUM, HARD |
| QuestionType | CODING, SYSTEM_DESIGN, BEHAVIORAL, VIDEO, MIXED |
| QuestionStatus | DRAFT, REVIEW, PUBLISHED, ARCHIVED |

### Question Fields

| Field | Type | Required | Default |
|-------|------|----------|---------|
| title | string | yes | — |
| summary | string | yes | — |
| promptMd | string (markdown) | yes | — |
| company | string | no | null |
| difficulty | Difficulty | no | MEDIUM |
| type | QuestionType | no | CODING |
| tags | string[] | no | [] |
| solutionMd | string (markdown) | no | null |
| videoUrl | string (URL) | no | null |
| starterCode | string | no | null |
| testCases | JSON | no | null |
| categoryId | string (CUID) | no | null |
| templateId | string (CUID) | no | null |

### Versioning

- Every `PUT` automatically snapshots the merged state as a new `QuestionVersion`
- `currentVersion` increments on each update
- `publishedVersion` tracks which version is live (admin controls this via the UI)
- Versions are immutable snapshots — they cannot be edited after creation

## Workflow

1. **Agent creates** a question via `POST /api/questions` → status = PUBLISHED, version = 1
2. **Agent updates** via `PUT /api/questions/:slug` → new version created, currentVersion incremented
3. **Admin reviews** versions at `/admin/questions/:slug/versions/:version` in the web UI
4. **Admin publishes** any version — that version's content becomes the live question

## Example: Bulk Import

```bash
API_KEY="your-api-secret-key"
BASE="https://hack2fire.com"

curl -X POST "$BASE/api/questions" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Merge K Sorted Lists",
    "summary": "Merge k sorted linked lists into one sorted list",
    "difficulty": "HARD",
    "type": "CODING",
    "tags": ["linked-list", "heap", "divide-and-conquer"],
    "company": "Amazon",
    "promptMd": "# Merge K Sorted Lists\n\nYou are given an array of k linked lists...",
    "solutionMd": "## Min-Heap Approach\n\nUse a min-heap to track the smallest element...",
    "starterCode": "class ListNode {\n  val: number;\n  next: ListNode | null;\n}"
  }'
```
