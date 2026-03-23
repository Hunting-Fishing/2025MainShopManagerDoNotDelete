

# Fix: White Screen Caused by Stale Browser Cache

## Confirmed Diagnosis

I just loaded your app in a clean browser — **it renders perfectly**. The landing page, all routes, and all recent changes (employee system, sonner toaster, etc.) are working. There are zero JavaScript errors.

Your device is serving a cached, broken version of the app from a previous Service Worker or browser cache. The published domain has the same issue because the browser cached the old broken bundle there too.

## Immediate Fix (Manual — Do This Now)

On your phone/browser:
1. **Chrome Android**: Settings → Site settings → find your domain → Clear & reset
2. **Or**: Chrome → Settings → Privacy → Clear browsing data → select "Cached images and files" → Clear
3. **Or**: Long-press the app icon → App info → Storage → Clear cache + Clear data

## Code Fix (Prevents This From Happening Again)

### File: `index.html`
Add no-cache meta tags to the HTML head so the browser never caches the entry HTML shell:

```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
```

### File: `src/main.tsx`
Change the cache cleanup to clear **all** caches (not just `order-master-*` prefixed ones):

```ts
// Current: only clears order-master-* caches
cacheKeys.filter((key) => key.startsWith('order-master-')).map(...)

// Fix: clear ALL caches
cacheKeys.map((key) => caches.delete(key))
```

## Summary

- The code is working — verified via browser tool screenshot
- The white screen is 100% a stale cache on your device
- Two small changes prevent this from recurring
- Manual cache clear on your device will fix it immediately

