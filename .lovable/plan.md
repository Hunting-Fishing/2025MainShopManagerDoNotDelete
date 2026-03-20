

# Add Client Avatar, Progress Photo Gallery & Social Celebration Features

## What Exists Already
- `pt_clients` table has a `profile_photo_url` column (unused in admin UI)
- `pt_progress_photos` table exists with columns: `client_id`, `shop_id`, `photo_url`, `photo_date`, `category`, `notes`
- The client portal (`PTPortalDashboard`) already has a working `uploadProgressPhoto` function using `pt-progress-photos` storage bucket
- No avatar is shown on the admin client detail page — just text name

## What Changes

### 1. Client Avatar in Header
- Add an `Avatar` component to the client detail header showing `profile_photo_url` or initials fallback
- Add a camera/upload overlay on hover to let trainers upload a profile photo
- Upload to `pt-progress-photos` bucket (reuse existing), save URL to `pt_clients.profile_photo_url`

### 2. New "Photos" Tab on Client Detail
Add a 10th tab to the client detail page with:
- **Upload area**: Drag-and-drop or click-to-upload for progress photos with category selector (Front, Back, Side, Flexing, Progress)
- **Photo grid**: Display all `pt_progress_photos` for this client in a responsive grid with date labels
- **Before/After comparison**: Side-by-side view selecting two dates to compare
- **Notes per photo**: Optional caption/notes field on upload

### 3. Milestone & Celebration Cards (Social Foundation)
Add a celebratory section within the Photos tab or as a banner system:
- **Achievement badges** that auto-detect milestones: "First Photo!", "1 Month Progress", "10 lbs Down!", "New PR!", "Goal Reached!"
- **Shareable cards**: Generate a styled card with the client's achievement that could later become social posts
- **Encouragement from trainer**: Quick reaction buttons (fire, clap, heart, star) trainers can tap on photos
- **Motivational quotes**: Random rotating encouragement displayed alongside the photo gallery

### 4. Warm Connection Touches
- Add a "Send Encouragement" quick-action button in the header that opens a pre-filled message
- Show a motivational streak counter: "X days strong!" based on check-in data
- Display celebration confetti animation when a milestone is hit

## Files to Create/Edit

| File | Change |
|------|--------|
| `src/components/personal-trainer/ClientAvatar.tsx` | **New** — Avatar component with upload overlay, handles profile photo upload to storage and saves URL to `pt_clients` |
| `src/components/personal-trainer/ClientProgressPhotos.tsx` | **New** — Full progress photo gallery tab with upload, grid view, category filter, before/after comparison, and trainer reactions |
| `src/components/personal-trainer/MilestoneCards.tsx` | **New** — Achievement badge system that detects and displays milestones (weight loss, consistency streaks, PRs) with shareable styled cards |
| `src/pages/personal-trainer/PersonalTrainerClientDetail.tsx` | Add Avatar to header, add "Photos" tab embedding `ClientProgressPhotos`, add milestone banner, add "Send Encouragement" button |

## Database
- **No new tables needed** — `pt_clients.profile_photo_url` and `pt_progress_photos` already exist
- **New migration**: Add `trainer_reaction` column (text, nullable) to `pt_progress_photos` for trainer emoji reactions
- **New migration**: Create `pt_client_milestones` table to track achievements (id, client_id, shop_id, milestone_type, milestone_value, achieved_at, shared, card_image_url)

## Storage
- Reuse existing `pt-progress-photos` bucket for both avatar uploads and progress photos

