

# Fix "Encourage" Button — Use Internal Social Feed Instead of Mailto

## Problem
The "Encourage" button on the client detail page opens a `mailto:` link, which triggers the OS email picker. It should instead create an encouragement post on the internal social feed.

## Change

### File: `src/pages/personal-trainer/PersonalTrainerClientDetail.tsx`

Replace the `mailto` onClick handler with one that opens a pre-filled `CreatePostDialog` targeting this client as an encouragement post.

Specifically:
1. **Add state** for an encouragement dialog: `const [encourageOpen, setEncourageOpen] = useState(false)`
2. **Change the button** onClick to `() => setEncourageOpen(true)`
3. **Add a dedicated encouragement dialog** below the button that:
   - Creates a `pt_social_posts` entry of type `text`
   - Pre-fills the caption with an encouraging message mentioning the client's first name
   - Pre-selects hashtags like `#KeepItUp`, `#WellDoneJob`
   - Uses a simple `Dialog` with a `Textarea` for the trainer to customize the message, plus a "Post Encouragement" submit button
   - On submit, inserts the post into `pt_social_posts` with `visibility: 'everyone'` and the client linked contextually via the caption
4. **Show a toast** on success confirming the encouragement was posted to the social feed

This keeps all engagement internal to the app's social platform rather than relying on external email clients.

