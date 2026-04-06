

# Merge 138 Cosmos (GameForge) into Game Development Module

## Scope Assessment

The **138 Cosmos** project ("GameForge") is a full-featured game development planning platform with:
- **33 pages** (Dashboard, Canvas Planner, Story Tracker, Character Development, Items & Loot, Dialogue Trees, Economy Simulation, Level Editor, Quests, Raids & Events, Wiki, GDD Builder, Roadmap, and more)
- **50+ components** (economy simulators, planning views, AI generators, entity graphs, etc.)
- **30+ database tables** (projects, boards, board_nodes, characters, game_items, loot_tables, dialogue_trees, quests, raids, events, economy_curves, world_zones, etc.)
- **14 Edge Functions** (AI chat, asset generator, balance advisor, story analyzer, entity generator, etc.)
- **1,572-line Zustand store** with cloud sync, undo/redo, and real-time presence
- **807-line type definitions** with comprehensive game design types

## Why This Cannot Be Done in a Single Step

This is the largest merge request possible -- essentially embedding an entire standalone application as a module. It must be broken into **multiple implementation phases** to avoid breaking the existing project. Each phase should be its own conversation turn.

## Phased Plan

### Phase 1: Database Migration (~30 tables)
Create all GameForge tables in the current Supabase project, prefixed with `gd_` (game dev) to avoid naming conflicts with existing tables (e.g., `projects`, `events`, `comments` already exist in this project). Tables include:
- `gd_projects`, `gd_boards`, `gd_board_nodes`, `gd_board_edges`
- `gd_milestones`, `gd_roadmap_boards`, `gd_plan_tasks`, `gd_planning_records`
- `gd_asset_requirements`, `gd_design_docs`
- `gd_characters`, `gd_character_relations`, `gd_character_arcs`, `gd_factions`
- `gd_story_beats`, `gd_story_connections`
- `gd_wiki_articles`
- `gd_game_items`, `gd_loot_tables`, `gd_item_sets`, `gd_crafting_recipes`
- `gd_dialogue_trees`, `gd_dialogue_nodes`, `gd_dialogue_edges`, `gd_dialogue_variables`
- `gd_raids`, `gd_events`, `gd_quests`
- `gd_economy_curves`, `gd_world_zones`, `gd_playtest_sessions`
- `gd_cross_canvas_links`, `gd_custom_db_fields`, `gd_entity_snapshots`
- `gd_locale_strings`, `gd_comments`, `gd_api_keys`, `gd_webhooks`, `gd_webhook_logs`
- `gd_chat_conversations`, `gd_chat_messages`, `gd_media_files`
- `gd_generated_assets`, `gd_character_assemblies`, `gd_chat_import_files`

RLS policies will use `shop_id`-based isolation (matching this project's multi-tenant pattern) instead of the original `user_id`-based pattern.

### Phase 2: Module Registration & Navigation
- Add `game-development` to `landingModules.ts` with description, features, pricing
- Add `game-development` to `moduleRoutes.ts` with all ~25 sub-pages
- Register in `navigation.ts`, `routeGuards.ts`, `Navbar.tsx`, `MobileNavigation.tsx`, `getPostLoginDestination.ts`, `SidebarContent.tsx`
- Add to `business_modules` database seed
- Add Stripe products via `moduleSubscriptions.ts`

### Phase 3: Core Types, Store & Cloud DB Layer
- Copy and adapt `game-planner.ts` types to `src/types/game-development.ts`
- Create `src/stores/game-dev-store.ts` (adapted from the 1,572-line Zustand store)
- Create `src/lib/game-dev-cloud-db.ts` (adapted cloud sync layer pointing to `gd_` prefixed tables)

### Phase 4: Copy & Adapt Pages (Batch 1 - Core)
Under `src/pages/game-development/`:
- `GameDevDashboard.tsx` (main dashboard)
- `GameDevProjects.tsx` (project management)
- `GameDevCanvas.tsx` and `GameDevCanvasOverview.tsx` (visual planning boards)
- `GameDevDatabase.tsx` (planning database)
- `GameDevGDD.tsx` (game design document builder)
- `GameDevRoadmap.tsx` (roadmap planning)

### Phase 5: Copy & Adapt Pages (Batch 2 - Narrative & Design)
- `GameDevStory.tsx` (story tracker)
- `GameDevCharacters.tsx` (character development)
- `GameDevDialogue.tsx` (dialogue tree editor)
- `GameDevWiki.tsx` (wiki/lore)
- `GameDevQuests.tsx` (quest designer)
- `GameDevRaids.tsx` (raids & events)

### Phase 6: Copy & Adapt Pages (Batch 3 - Systems & Tools)
- `GameDevItems.tsx` (items & loot database)
- `GameDevEconomy.tsx` (economy simulation)
- `GameDevLevels.tsx` (level editor)
- `GameDevPlaytest.tsx` (playtest journal)
- `GameDevAssets.tsx` (asset requirements)
- `GameDevAssetGenerator.tsx` (AI asset generation)
- `GameDevActivity.tsx` (activity feed)
- `GameDevRelationships.tsx` (entity graph)

### Phase 7: Copy & Adapt Edge Functions
Deploy adapted versions of the 14 edge functions:
- `gd-ai-chat`, `gd-ai-entity-generator`, `gd-ai-item-editor`
- `gd-ai-balance-advisor`, `gd-ai-story-analyzer`
- `gd-ai-asset-generator`, `gd-ai-asset-generator-leonardo`
- `gd-ai-chat-import`, `gd-excel-column-mapper`
- `gd-project-api`, `gd-webhook-deliver`

### Phase 8: Landing Page & Screenshots
- Take screenshots of the module dashboard
- Add to the module card gallery
- Create the module's "Learn More" content

## Key Technical Decisions

1. **Table prefix `gd_`**: Prevents conflicts with existing `projects`, `events`, `comments` tables
2. **Shop-scoped RLS**: All tables get `shop_id` column with standard `get_current_user_shop_id()` RLS instead of `user_id`-only
3. **Route prefix `/game-development/*`**: All pages nested under this path
4. **Zustand store**: Isolated store for game dev module state only
5. **Edge function prefix `gd-`**: Avoids naming conflicts with existing functions

## Important Notes

- This is approximately **8 implementation phases**, each requiring a separate conversation turn
- The total code to copy and adapt is roughly **15,000+ lines** across 80+ files
- Each phase should be approved and verified before proceeding to the next
- The demo/seed data from the original project will NOT be included (per project rules: no mock data)

Shall I begin with **Phase 1: Database Migration**?

