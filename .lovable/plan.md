

# Fix Add Condition Dialog Scrolling + Enhance Medical Profile for Trainers

## Problems Identified

1. **Scroll issue**: The `ScrollArea` in the Add Condition dialog uses `maxHeight: '40vh'` inline style, but the dialog itself is `max-h-[80vh]`. The flex layout combined with category badges wrapping and tabs overhead leaves insufficient visible scroll area. On smaller screens or when many category badges display, the scrollable list is nearly invisible or cut off.

2. **Trainer experience gaps**: The edit dialog is functional but lacks the ability to add/remove individual exercise restrictions or dietary implications — they're read-only badges. Trainers can't customize safety parameters per client.

## Plan

### 1. Fix scrollbar visibility in Add Condition dialog

- Remove the inline `style={{ maxHeight: '40vh' }}` from both `ScrollArea` components
- Use proper flex layout so the `ScrollArea` fills remaining space naturally: `className="flex-1 overflow-hidden mt-3"` with the inner scroll area taking full height
- Increase dialog height to `max-h-[85vh]` for more room
- Add visible scrollbar styling (override `scrollbar-hide`) so the user can see the scroll indicator

### 2. Enhance the Edit Condition dialog for trainers

- Make **exercise restrictions** editable: add a multi-select or chip input so trainers can add/remove restrictions from a predefined list (e.g., `no_overhead`, `no_heavy_squats`, `no_running`, `no_twisting`, `avoid_impact`, etc.)
- Make **dietary implications** editable similarly
- Add a **"Trainer Notes for AI"** field — a dedicated text area whose content gets injected into AI prompts, letting trainers write specific instructions like "Client has left shoulder impingement — avoid overhead pressing beyond 90°"
- Add a quick-severity color indicator in the edit dialog header
- Show `added_by` provenance (trainer vs client-reported) as a subtle badge

### 3. Improve condition cards on the main list

- Add an expand/collapse for each card to show full details (restrictions, dietary, notes) without opening the edit dialog
- Show the `diagnosed_date` if set
- Add a subtle "Client reported" or "Trainer added" label based on `added_by`

### Files to Edit

| File | Change |
|------|--------|
| `src/components/personal-trainer/ClientMedicalProfile.tsx` | Fix ScrollArea sizing, enhance edit dialog with editable restrictions/dietary, add trainer AI notes field, improve cards |

