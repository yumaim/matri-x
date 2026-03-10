# xai-org/x-algorithm Integration — Phase 1 Walkthrough

## Summary

Integrated the new `xai-org/x-algorithm` (Rust 62.9% + Python 37.1%) into the Matri-X platform. Legacy `twitter/the-algorithm` content is preserved with era labels for comparison.

## Changes Made

### Knowledge Base

#### [MODIFY] [x-algorithm.ts](file:///C:/Users/retim/Desktop/OpenClaw/01_開発/matri-x/lib/knowledge/x-algorithm.ts)
- **18 entries** (was 10): 8 new xai-org entries + 10 legacy entries updated with era context
- New entries: Pipeline (2026), Phoenix, Thunder, Home Mixer, Candidate Pipeline, Engagement Predictions (15 types), Filtering (Pre/Post), Algorithm Comparison
- Legacy entries annotated with ⚠️ warnings and cross-references to new equivalents
- Added `era` field (`"legacy" | "current" | "both"`) to `KnowledgeEntry` interface

---

### Navigation

#### [MODIFY] [layout.tsx](file:///C:/Users/retim/Desktop/OpenClaw/01_開発/matri-x/app/dashboard/layout.tsx)
- Added 3 sidebar items: **Phoenix (Grok ML)**, **Thunder (In-Network)**, **新旧比較**
- Icons: `Flame`, `Cpu`, `GitCompareArrows`

---

### Landing Page

#### [MODIFY] [page.tsx](file:///C:/Users/retim/Desktop/OpenClaw/01_開発/matri-x/app/page.tsx)
- **Stats**: 15 predictions · Grok Transformer · Rust stack · <1ms latency
- **Features**: Phoenix, Thunder, 新旧比較 replace SimClusters/リアルタイム更新
- **Pipeline diagram**: 5-step (Thunder → Phoenix Retrieval → Phoenix Scoring → Filtering → Delivery)
- **Engagement section**: 15-action prediction grid replacing fixed-weight bar charts
- **Hero badge**: `xai-org/x-algorithm 対応`

---

### New Pages

#### [NEW] [phoenix/page.tsx](file:///C:/Users/retim/Desktop/OpenClaw/01_開発/matri-x/app/dashboard/phoenix/page.tsx)
- **Interactive Attention Mask**: Adjustable candidate count (2–7), visualizes Candidate Isolation
- **Two-Tower Architecture**: Tabbed view (Retrieval / Ranking) with architecture cards
- **15-Action Grid**: Grouped by category (Positive / Interest / Consumption / Social / Negative)
- **Key Insight**: Why Candidate Isolation matters (caching, consistency, scalability)

#### [NEW] [thunder/page.tsx](file:///C:/Users/retim/Desktop/OpenClaw/01_開発/matri-x/app/dashboard/thunder/page.tsx)
- **Kafka Stream Simulator**: Live auto-generating create/delete events with animated progress bars
- **3 Post Types**: Original, Replies+Reposts, Video with cards and metrics
- **Architecture Flow**: Kafka → Thunder → Home Mixer diagram
- **Earlybird Comparison Table**: 6-row comparison (language, storage, latency, etc.)

#### [NEW] [comparison/page.tsx](file:///C:/Users/retim/Desktop/OpenClaw/01_開発/matri-x/app/dashboard/comparison/page.tsx)
- **Version Cards**: Side-by-side old (2023) vs new (2026) with language badges
- **Technology Table**: 6-row comparison
- **Component Mapping**: 5 rows with old → new arrows
- **5 Design Philosophy Changes**: Each with old/new cards and impact notes
- **Engagement Evolution**: Fixed weights (10 types) vs dynamic predictions (15 types)

## Remaining (Phase 5)

- [ ] Update explore page pipeline diagram
- [ ] Simulator v3 with 15-action support
- [ ] DeepWiki source → `xai-org/x-algorithm`
- [ ] Forum categories for Rust/Phoenix/comparison
- [ ] Updates page entry for xai-org release
