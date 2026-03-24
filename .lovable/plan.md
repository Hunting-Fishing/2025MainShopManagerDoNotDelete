

# Add Company Logo to All Required Pages

## What We're Doing

Replace the placeholder Wrench icon and shadcn avatar with the actual All Business 365 logo across all pages where branding appears.

## Steps

### 1. Copy the uploaded logo into the project

Copy `user-uploads://All_Business_365_Logo.png` to `public/images/ab365-logo.png` (public folder for broad access including HTML, manifest, and components) and also to `src/assets/ab365-logo.png` for ES module imports in React components.

### 2. Update `PublicLayout.tsx` — Header and Footer

Replace the Wrench icon in both the header logo area and footer with an `<img>` tag using the logo. Remove the `Wrench` import if no longer needed.

### 3. Update `Login.tsx` — Two logo instances

Replace the Wrench icon (lines 126 and 191) with the logo image in both the "Already Signed In" card and the main login form.

### 4. Update `Signup.tsx` — Two logo instances

Replace the Wrench icon (lines 160 and 215) with the logo image in both the "Already Signed In" card and the main signup form.

### 5. Update `ResetPassword.tsx` — One instance

Replace the Wrench icon (line 172) with the logo image.

### 6. Update `About.tsx` — One instance

Replace the Wrench icon (line 14) with the logo image.

### 7. Update `SidebarLogo.tsx` — Default fallback

Replace the shadcn.png fallback (`https://github.com/shadcn.png`) with the AB365 logo as the default when no custom company logo is set.

### 8. Update `HeroSection.tsx` — Remove Wrench import if unused

Clean up unused Wrench import after logo replacement (Wrench is imported but may not be used as a logo here — will verify).

### 9. Update `index.html` — Boot fallback branding

Replace any text-only branding in the boot fallback div with the logo image (`/images/ab365-logo.png`).

### 10. Update `manifest.json` icons (optional)

Note: The manifest references `icon-192.png` and `icon-512.png` which should ideally be updated to match the new logo, but that requires properly sized/masked versions of the logo.

## Files to Modify

| File | Change |
|---|---|
| `public/images/ab365-logo.png` | Copy logo asset |
| `src/assets/ab365-logo.png` | Copy logo asset for imports |
| `src/components/layout/PublicLayout.tsx` | Replace Wrench with logo img |
| `src/pages/Login.tsx` | Replace 2x Wrench with logo |
| `src/pages/Signup.tsx` | Replace 2x Wrench with logo |
| `src/pages/ResetPassword.tsx` | Replace Wrench with logo |
| `src/pages/About.tsx` | Replace Wrench with logo |
| `src/components/layout/sidebar/SidebarLogo.tsx` | Replace shadcn fallback |
| `index.html` | Add logo to boot fallback |

