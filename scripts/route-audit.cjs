const fs = require('fs');
const path = require('path');

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function matchAll(content, regex) {
  const matches = [];
  let m;
  while ((m = regex.exec(content)) !== null) {
    matches.push(m[1]);
  }
  return matches;
}

function unique(items) {
  return Array.from(new Set(items));
}

function normalizePath(value) {
  return value.replace(/\/+$/, '') || '/';
}

const root = process.cwd();
const navFile = path.join(root, 'src', 'components', 'navigation', 'appNavigation.ts');
const appFile = path.join(root, 'src', 'App.tsx');

const navContent = readFile(navFile);
const appContent = readFile(appFile);

const navPaths = matchAll(navContent, /href:\s*['"]([^'"]+)['"]/g).map(normalizePath);
const appPathsRaw = matchAll(appContent, /path=['"]([^'"]+)['"]/g).map(normalizePath);

const appPaths = unique(appPathsRaw);
const appBasePaths = unique(appPaths.map((p) => p.replace(/\/\*$/, '')));

const navDuplicates = Object.entries(
  navPaths.reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {})
).filter(([, count]) => count > 1);

const missingNavRoutes = unique(
  navPaths.filter((p) => !appPaths.includes(p) && !appBasePaths.includes(p))
);

const appDuplicates = Object.entries(
  appPathsRaw.reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {})
).filter(([, count]) => count > 1);

const idRoutes = appPaths.filter((p) => /\/:[^/]+$/.test(p));
const idRouteAllowList = new Set([
  '/shopping',
  '/projects',
  '/repair-plans',
  '/help/article',
  '/help/path',
  '/equipment',
  '/customer-service-history',
  '/email-sequences',
  '/team/member',
  '/vehicles',
  '/vehicle-inspection',
]);

const idRouteWarnings = idRoutes
  .map((p) => p.replace(/\/:[^/]+$/, ''))
  .filter((base) => base && !idRouteAllowList.has(base))
  .filter((base) => !appPaths.includes(`${base}/new`) && !appPaths.includes(`${base}/create`))
  .map((base) => `${base}/:id without explicit /new or /create route`);

console.log('Route audit');
console.log('===========');

if (navDuplicates.length) {
  console.log('\nNavigation duplicate hrefs:');
  navDuplicates.forEach(([href, count]) => {
    console.log(`- ${href} (x${count})`);
  });
} else {
  console.log('\nNavigation duplicate hrefs: none');
}

if (missingNavRoutes.length) {
  console.log('\nNavigation paths missing routes:');
  missingNavRoutes.forEach((href) => {
    console.log(`- ${href}`);
  });
} else {
  console.log('\nNavigation paths missing routes: none');
}

if (appDuplicates.length) {
  console.log('\nApp route duplicates:');
  appDuplicates.forEach(([pathValue, count]) => {
    console.log(`- ${pathValue} (x${count})`);
  });
} else {
  console.log('\nApp route duplicates: none');
}

if (idRouteWarnings.length) {
  console.log('\nPotential /:id conflicts:');
  idRouteWarnings.forEach((warning) => {
    console.log(`- ${warning}`);
  });
} else {
  console.log('\nPotential /:id conflicts: none');
}
