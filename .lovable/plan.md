

# Internal Social Feed — TikTok-Style Fitness Community

## Overview

Build an internal social network within the PT module where trainers and clients can share posts, progress photos, and short video reels. This lives alongside the existing Community Groups page and becomes the primary engagement hub.

## Database — New Tables

### `pt_social_posts`
The core content table supporting three post types:

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| shop_id | uuid FK → shops | Multi-tenant scoping |
| author_client_id | uuid FK → pt_clients, nullable | Client author |
| author_profile_id | uuid FK → profiles, nullable | Trainer/staff author |
| post_type | text | `photo`, `reel`, `text` |
| caption | text | Post text/caption |
| media_urls | text[] | Array of image/video URLs |
| thumbnail_url | text, nullable | Auto-generated for reels |
| tags | text[] | Hashtags: `#GoalReached`, `#NewPR`, `#OneLbAtATime` |
| milestone_id | uuid FK → pt_client_milestones, nullable | Link to auto-milestone |
| visibility | text | `everyone`, `trainers_only`, `private` |
| is_pinned | boolean | Trainer can pin posts |
| created_at | timestamptz | |

### `pt_social_reactions`
Emoji reactions (fire, clap, heart, muscle, star):

| Column | Type |
|--------|------|
| id | uuid PK |
| post_id | uuid FK → pt_social_posts |
| reactor_profile_id | uuid FK → profiles |
| reaction_type | text |
| created_at | timestamptz |
| UNIQUE(post_id, reactor_profile_id, reaction_type) |

### `pt_social_comments`
Threaded comments on posts:

| Column | Type |
|--------|------|
| id | uuid PK |
| post_id | uuid FK → pt_social_posts |
| author_profile_id | uuid FK → profiles |
| content | text |
| parent_comment_id | uuid FK self-ref, nullable |
| created_at | timestamptz |

RLS: All three tables scoped by `shop_id = get_current_user_shop_id()`.

## New Pages & Components

### 1. Social Feed Page (`/personal-trainer/social-feed`)
- **Vertical scrolling feed** with card-based layout (TikTok-inspired but web-friendly)
- Three view modes via tabs: **All**, **Photos**, **Reels**
- Each post card shows: author avatar + name, media (image grid or video player), caption, tags as badges, reaction bar, comment count, timestamp
- Infinite scroll with cursor-based pagination
- "Create Post" floating action button

### 2. Create Post Dialog
- Post type selector (Photo / Reel / Text)
- Media upload zone (drag-and-drop, multi-file for photos, single video for reels)
- Caption textarea with hashtag suggestions (`#BrokeMyRecord`, `#OneLbAtATime`, `#WellDoneJob`, `#MeetingMyGoals`)
- Visibility selector (Everyone / Trainers Only / Private)
- Optional: link to an existing milestone card
- Upload to existing `pt-progress-photos` storage bucket

### 3. Post Detail View (expandable or modal)
- Full media display (photo carousel or video player)
- Reaction bar with emoji toggles (🔥 💪 ❤️ 👏 ⭐)
- Comments thread with reply support
- Share internally (to community groups)

### 4. Reels Viewer Component
- Vertical swipe-style card layout for reels
- HTML5 `<video>` with autoplay on scroll-into-view
- Play/pause on tap
- Caption overlay at bottom

## Components to Create

| Component | Purpose |
|-----------|---------|
| `SocialFeed.tsx` | Main feed page with tabs, infinite scroll, FAB |
| `SocialPostCard.tsx` | Individual post card (media, caption, reactions, comments) |
| `CreatePostDialog.tsx` | Post creation with media upload and hashtags |
| `ReactionBar.tsx` | Emoji reaction toggles with counts |
| `CommentsSection.tsx` | Expandable comment thread with reply |
| `ReelsViewer.tsx` | Vertical scroll video viewer |
| `HashtagBadges.tsx` | Styled tag display and suggested tags |

## Files to Edit

| File | Change |
|------|--------|
| `PersonalTrainerSidebar.tsx` | Add "Social Feed" nav item under Engagement section |
| Route config | Add `/personal-trainer/social-feed` route |
| Migration SQL | Create 3 new tables with RLS policies |

## Navigation

Add to the **Engagement** section in the sidebar with a `Clapperboard` or `Play` icon, positioned before Community.

## Storage

Reuse existing `pt-progress-photos` bucket for all media uploads (photos and short video clips).

