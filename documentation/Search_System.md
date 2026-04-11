---
tags: [search, fulltext, filters, autocomplete]
related: ["[[Project_Overview]]", "[[Frontend]]", "[[API_Reference]]", "[[Microservices]]"]
created: 2026-04-11
---

# Search System

## Overview

The platform provides full-text search over projects and users via a single `GET /api/v1/search` endpoint. The frontend delivers a polished search experience with **debounced autocomplete suggestions**, **advanced filters** (tech stack, status), and quick-search preset chips.

---

## Backend Search

The search endpoint in the gateway calls two gRPC methods in parallel:
1. `ProjectService.SearchProjects(query, limit)` — searches projects
2. `ProjectService.SearchUsers(query, limit)` — searches users by name/email

Results from both are merged and returned as a unified `results[]` array where each entry has a `type: "project" | "user"` discriminator.

### Search Logic (Project Service)

The project-level search filters across:
- `title` (case-insensitive substring)
- `description` (substring)
- `techStack[]` (any element match)
- `ownerName`

This is implemented as **in-memory Firestore filtering** — all projects are fetched and filtered server-side in JS. This works at small scale (< 10K projects) but would need a true search engine (Algolia, Typesense, Elasticsearch) at larger scale.

```js
// Simplified from project-service/index.js
async function searchProjects(call, callback) {
  const { query, limit } = call.request;
  const snapshot = await db.collection("projects").get();
  const q = query.toLowerCase();
  const results = [];
  snapshot.forEach(doc => {
    const p = doc.data();
    if (
      p.title?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.techStack?.some(t => t.toLowerCase().includes(q)) ||
      p.ownerName?.toLowerCase().includes(q)
    ) {
      results.push(p);
    }
  });
  callback(null, { projects: results.slice(0, limit || 20), total: results.length });
}
```

---

## API Endpoint

```
GET /api/v1/search
Auth: Bearer token required
```

| Query Param | Default | Description |
|---|---|---|
| `q` | — | Required. Search string (min 2 chars for suggestions) |
| `limit` | 20 | Max results |
| `techStack` | — | Optional tech filter applied client-side |
| `status` | — | Optional status filter (`approved`, `pending`) |

**Success Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": "projectId",
      "type": "project",
      "title": "AI SDN Controller",
      "description": "...",
      "techStack": ["Python"],
      "status": "approved",
      "domain": "AI/ML"
    },
    {
      "id": "uid123",
      "type": "user",
      "name": "Alice",
      "email": "alice@example.com"
    }
  ],
  "total": 2
}
```

---

## Frontend Search UX (`SearchPage.jsx`)

### Debounced Autocomplete

```js
const debouncedInput = useDebounce(searchInput, 300); // 300ms delay

const { data: suggestionsData } = useQuery(
  ['search-suggestions', debouncedInput],
  () => searchAPI.search({ q: debouncedInput, limit: 6 }),
  { enabled: debouncedInput.length >= 2 && showSuggestions, staleTime: 30000 }
);
```

Suggestions appear in a dropdown overlay beneath the search input and are dismissed on outside click.

### Advanced Filters

A filter panel slides in when the Filter icon is clicked:
- **Technology** — free text input (e.g., "React", "Python")
- **Visibility Status** — Select: All / Approved / Pending

When active filters exist, they are passed in the URL query string (`?q=...&tech=...&status=...`) and applied to the results query.

### Quick Search Chips

Displayed when no query is active:
- "Machine Learning", "Next.js", "Firebase", "Data Visualization", "Security"

Clicking one sets the search and executes immediately.

### Page-Level Search vs Suggestions

Two separate `useQuery` calls run simultaneously:
1. **Suggestions query** — triggered on debounced input, shows dropdown overlay (results immediately visible)
2. **Main results query** — triggered on form submit or URL param `q`, shows full results grid

This avoids premature full-page updates while still providing live suggestions.

---

## URL-Driven State

Search state is fully URL-driven — navigating to `/search?q=blockchain&tech=Solidity&status=approved` immediately fires the results query. Back/forward browser navigation works naturally.

```js
const [searchParams, setSearchParams] = useSearchParams();
const query = searchParams.get("q") || "";
```

---

## Related

- [[Project_Overview]]
- [[Frontend]]
- [[API_Reference]]
- [[Microservices]]
