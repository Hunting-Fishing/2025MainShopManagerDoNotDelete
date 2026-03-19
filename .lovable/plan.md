

# Add Chef Mode to FitCoach AI

## What We're Building

A dedicated "Chef" persona within FitCoach AI that acts as a friendly cooking coach -- walking clients through meal prep, cooking techniques, ingredient substitutions, and kitchen tips in a warm, conversational tone (like a friend who happens to be a chef).

## Changes

### 1. Add Mode Selector to Chat UI (`PTAIChatPage.tsx`)

- Add a mode toggle at the top of the chat: **Coach** (default) | **Chef**
- When "Chef" is selected, the quick prompts change to cooking-focused ones:
  - "Walk me through prepping chicken & rice for the week"
  - "How do I cook salmon perfectly?"
  - "Batch cook ideas for my meal plan"
  - "Quick 15-min dinner ideas"
  - "Help me season vegetables better"
  - "What kitchen tools do I actually need?"
- The selected mode is sent to the edge function as a `mode` parameter
- Visual identity shifts slightly -- chef hat icon, green/teal accent instead of orange

### 2. Update Edge Function (`supabase/functions/pt-ai-chat/index.ts`)

- Accept a new `mode` field (`"coach"` | `"chef"`)
- When `mode === "chef"`, swap the system prompt to a Chef persona:
  - Friendly, encouraging tone -- like a friend teaching you to cook
  - Focus on practical cooking: techniques, timing, temperatures, seasoning
  - Reference the client's nutrition profile (allergies, dietary style, cooking level, budget)
  - Adapt complexity to the client's `cooking_level` (beginner gets simpler instructions)
  - Include prep tips, storage advice, reheating instructions
  - Use casual language with cooking emojis
- The existing "coach" mode remains unchanged as the default

### 3. Quick Prompt Updates

The chef mode quick prompts will be contextual -- if the client has an active meal plan, one prompt will be "Walk me through cooking today's meals from my plan."

## Technical Details

- **Files modified**: `PTAIChatPage.tsx`, `supabase/functions/pt-ai-chat/index.ts`
- **No new database tables** -- this is purely a prompt/UI change
- The mode state resets when chat is cleared
- Both modes share the same conversation history and client context injection

