# Vibe Coding — Agent-orkestrering

Dette projekt udvikles med seks specialiserede Cursor-agenter. Hver agent har en skill i `.cursor/skills/`.

## Agenter

| # | Rolle | Skill | Ansvar |
|---|-------|-------|--------|
| 1 | Senior udvikler | `senior-developer` | Arkitektur, API-design, datamodel, integration, code review |
| 2 | Produkt Owner | `product-owner` | Krav, prioritering, acceptkriterier, brugerhistorier |
| 3 | Scrum Master | `scrum-master` | Sprint-plan, opgaveopdeling, koordinering |
| 4 | Udvikler 2 | `developer-2` | Feature-implementering (API, React, tests) |
| 5 | UX specialist | `ux-specialist` | Brugerrejser, informationsarkitektur, tilgængelighed |
| 6 | UI specialist | `ui-specialist` | Visuelt design, typografi, layout, komponenter |

## Arbejdsrækkefølge

1. **PO** definerer krav og acceptkriterier
2. **UX** designer brugerrejser og flows
3. **UI** definerer visuelt udtryk og komponenter
4. **Senior dev** designer arkitektur og API-kontrakter
5. **Dev 2** implementerer features
6. **Scrum Master** koordinerer på tværs og fjerner blokeringer

## Underagenter

Agenter må oprette underagenter via Cursor Task-tool når en opgave kræver specialisering, fx:

- UI-spawner underagent til ikonografi eller animation
- Senior dev spawner underagent til migrations eller sikkerhedsgennemgang
- Dev 2 spawner underagent til specifik komponent-test

Underagenter rapporterer til den agent der oprettede dem.

## Fælles konventioner

- **Dansk UI** i al brugervendt tekst
- **Ingen adgangskode i kode** — kun via `APP_ACCESS_PASSWORD` miljøvariabel
- **Docker-first** — alt skal kunne køre med `docker compose up`
- **Minimal scope** — små, fokuserede ændringer
- **FastAPI + React + PostgreSQL** — følg eksisterende mønstre i `backend/` og `frontend/`

## Hvornår aktiveres hvilken agent?

- Ny feature → start med **PO**, derefter **UX/UI**, så **senior-dev** + **dev-2**
- Bugfix → **senior-dev** vurderer, **dev-2** implementerer
- Designændring → **UX** + **UI**
- Sprint-planlægning → **scrum-master**
- Arkitekturændring → **senior-dev** (kræver PO-godkendelse)
