
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { usePageTitle } from '@/hooks/usePageTitle';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RecentWorkOrders } from '@/components/dashboard/RecentWorkOrders';
import { UpcomingAppointments } from '@/components/dashboard/UpcomingAppointments';
import { TodaySchedule } from '@/components/dashboard/TodaySchedule';
import { DashboardTour } from '@/components/onboarding/DashboardTour';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  usePageTitle('Dashboard');

  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : '/dashboard';
  const metaDescription = "Dashboard: live KPIs, recent work orders, and today's schedule for your shop.";

  return (
    <main className="space-y-6" role="main">
      <Helmet>
        <title>Dashboard | ServicePro</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index,follow" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Dashboard",
          url: canonicalUrl,
          description: metaDescription,
        })}</script>
      </Helmet>

<DashboardHeader />

<div className="flex justify-end">
  <Button
    variant="secondary"
    aria-label="Start dashboard tour"
    onClick={() => window.dispatchEvent(new CustomEvent('start-dashboard-tour'))}
  >
    Start quick tour
  </Button>
</div>

      <section aria-labelledby="kpi-heading" data-tour="dashboard-stats">
        <h2 id="kpi-heading" className="sr-only">Key performance indicators</h2>
        <DashboardStats />
      </section>

      <DashboardTour />

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-label="Overview">
        <article className="lg:col-span-2" data-tour="dashboard-recent-work-orders" aria-labelledby="recent-heading">
          <h2 id="recent-heading" className="sr-only">Recent work orders</h2>
          <RecentWorkOrders />
        </article>
        <aside className="space-y-6">
          <article data-tour="dashboard-upcoming-appointments" aria-labelledby="upcoming-heading">
            <h2 id="upcoming-heading" className="sr-only">Upcoming appointments</h2>
            <UpcomingAppointments />
          </article>
          <article data-tour="dashboard-today-schedule" aria-labelledby="today-heading">
            <h2 id="today-heading" className="sr-only">Today's schedule</h2>
            <TodaySchedule />
          </article>
        </aside>
      </section>
    </main>
  );
}
