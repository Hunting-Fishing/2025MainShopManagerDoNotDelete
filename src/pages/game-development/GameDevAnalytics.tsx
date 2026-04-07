import { useGameDevStore } from '@/stores/game-dev-store';
import { GameDevProjectSelector } from '@/components/game-development/GameDevProjectSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, CheckCircle, AlertTriangle, Layers, Swords, BookOpen, Package } from 'lucide-react';

export default function GameDevAnalytics() {
  const {
    activeProjectId, planTasks, milestones, boardNodes, storyBeats,
    characters, gameItems, quests, raids, events, worldZones,
    assetRequirements, playtestSessions, wikiArticles, localeStrings,
  } = useGameDevStore();

  if (!activeProjectId) {
    return (
      <div className="p-6 space-y-4">
        <GameDevProjectSelector />
        <Card><CardContent className="py-12 text-center text-muted-foreground">Select a project to view analytics.</CardContent></Card>
      </div>
    );
  }

  const pf = (arr: any[]) => arr.filter((i: any) => i.projectId === activeProjectId);

  const tasks = pf(planTasks);
  const tasksDone = tasks.filter(t => t.status === 'done').length;
  const tasksTotal = tasks.length;

  const ms = pf(milestones);
  const msDone = ms.filter(m => m.status === 'completed').length;

  const nodes = pf(boardNodes);
  const stories = pf(storyBeats);
  const chars = pf(characters);
  const items = pf(gameItems);
  const questsList = pf(quests);
  const raidsList = pf(raids);
  const eventsList = pf(events);
  const zones = pf(worldZones);
  const assets = pf(assetRequirements);
  const assetsReady = assets.filter(a => a.status === 'approved' || a.status === 'integrated').length;
  const tests = pf(playtestSessions);
  const wiki = pf(wikiArticles);
  const l10n = pf(localeStrings);

  const stats = [
    { label: 'Tasks', value: tasksTotal, sub: `${tasksDone} done`, icon: CheckCircle, color: 'text-green-500' },
    { label: 'Milestones', value: ms.length, sub: `${msDone} completed`, icon: TrendingUp, color: 'text-primary' },
    { label: 'Canvas Nodes', value: nodes.length, sub: '', icon: Layers, color: 'text-blue-500' },
    { label: 'Story Beats', value: stories.length, sub: '', icon: BookOpen, color: 'text-purple-500' },
    { label: 'Characters', value: chars.length, sub: '', icon: Swords, color: 'text-orange-500' },
    { label: 'Items', value: items.length, sub: '', icon: Package, color: 'text-yellow-500' },
    { label: 'Quests', value: questsList.length, sub: '', icon: Swords, color: 'text-red-500' },
    { label: 'Raids / Events', value: raidsList.length + eventsList.length, sub: `${raidsList.length}R / ${eventsList.length}E`, icon: AlertTriangle, color: 'text-pink-500' },
    { label: 'World Zones', value: zones.length, sub: '', icon: Layers, color: 'text-teal-500' },
    { label: 'Assets', value: assets.length, sub: `${assetsReady} ready`, icon: Package, color: 'text-emerald-500' },
    { label: 'Playtests', value: tests.length, sub: '', icon: BarChart3, color: 'text-indigo-500' },
    { label: 'Wiki Articles', value: wiki.length, sub: '', icon: BookOpen, color: 'text-cyan-500' },
    { label: 'Locale Strings', value: l10n.length, sub: '', icon: BookOpen, color: 'text-lime-500' },
  ];

  // Task status breakdown
  const statusBreakdown = ['todo', 'in-progress', 'done', 'blocked'].map(s => ({
    status: s,
    count: tasks.filter(t => t.status === s).length,
  }));
  const maxCount = Math.max(...statusBreakdown.map(s => s.count), 1);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="h-6 w-6 text-primary" /> Project Analytics</h1>
          <p className="text-sm text-muted-foreground">Overview of all game data</p>
        </div>
        <GameDevProjectSelector />
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {stats.map(s => (
          <Card key={s.label}>
            <CardContent className="p-3 flex items-center gap-3">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <div>
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                {s.sub && <p className="text-xs text-muted-foreground">{s.sub}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Task breakdown bar chart */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Task Status Breakdown</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {statusBreakdown.map(s => (
            <div key={s.status} className="flex items-center gap-2">
              <span className="text-xs w-20 capitalize text-muted-foreground">{s.status}</span>
              <div className="flex-1 h-5 bg-muted rounded overflow-hidden">
                <div
                  className="h-full bg-primary rounded transition-all"
                  style={{ width: `${(s.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium w-8 text-right">{s.count}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Completion gauge */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Overall Progress</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>Task Completion</span>
                <span className="font-medium">{tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${tasksTotal > 0 ? (tasksDone / tasksTotal) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>Asset Readiness</span>
                <span className="font-medium">{assets.length > 0 ? Math.round((assetsReady / assets.length) * 100) : 0}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${assets.length > 0 ? (assetsReady / assets.length) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
