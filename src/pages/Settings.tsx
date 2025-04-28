import { useState } from "react";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { SettingsCard } from "@/components/settings/SettingsCard";
import { useTranslation } from "react-i18next";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import {
  Building,
  User,
  Shield,
  Bell,
  Palette,
  Database,
  Globe2,
  Gift,
  Package,
  Users,
  MailPlus,
  Wrench,
  CircleDollarSign,
  FileText,
  AlertTriangle,
  ShieldCheck,
  Brush,
  Link,
  Cog
} from "lucide-react";

const SettingsPage = () => {
  const { t } = useTranslation();
  
  // Define settings cards
  const settingsCards = [
    {
      id: "account",
      title: t('settings.cards.account', 'Account'),
      description: t('settings.cards.account_desc', 'Manage your personal account settings, profile, and preferences.'),
      icon: User,
      href: "/settings?tab=account"
    },
    {
      id: "company",
      title: t('settings.cards.company', 'Company'),
      description: t('settings.cards.company_desc', 'Customize the information you would like to appear at the top of your estimates & invoices, including your full color logo.'),
      icon: Building,
      href: "/settings?tab=company"
    },
    {
      id: "pricing",
      title: t('settings.cards.pricing', 'Pricing'),
      description: t('settings.cards.pricing_desc', 'Set your labor rates & your sales tax rate. Also, define how the tax rates are calculated & how they are presented to you.'),
      icon: CircleDollarSign,
      href: "/settings?tab=pricing"
    },
    {
      id: "ticket",
      title: t('settings.cards.ticket', 'Ticket'),
      description: t('settings.cards.ticket_desc', 'Customize the look of your estimates & invoices. Also, create default settings to help speed up the creation of your tickets.'),
      icon: FileText,
      href: "/settings?tab=ticket"
    },
    {
      id: "disclaimers",
      title: t('settings.cards.disclaimers', 'Disclaimers'),
      description: t('settings.cards.disclaimers_desc', 'Customize disclaimers for your estimates & invoices.'),
      icon: AlertTriangle,
      href: "/settings?tab=disclaimers"
    },
    {
      id: "workflow",
      title: t('settings.cards.workflow', 'Workflow'),
      description: t('settings.cards.workflow_desc', 'Customize the way the application works for your business, including how to select your vehicle.'),
      icon: Workflow,
      href: "/settings?tab=workflow"
    },
    {
      id: "technicians",
      title: t('settings.cards.technicians', 'Technicians'),
      description: t('settings.cards.technicians_desc', 'Add your technicians and enable tech tracking for your invoices.'),
      icon: Wrench,
      href: "/settings?tab=technicians"
    },
    {
      id: "markup",
      title: t('settings.cards.markup', 'Vendor & Parts Markup'),
      description: t('settings.cards.markup_desc', 'Create your default part markup, add vendors and enable the part markup / vendor tracking feature.'),
      icon: Package,
      href: "/settings?tab=markup"
    },
    {
      id: "charges",
      title: t('settings.cards.charges', 'Miscellaneous Charges'),
      description: t('settings.cards.charges_desc', 'Set up your shop fees and how you want them applied to your tickets.'),
      icon: CircleDollarSign,
      href: "/settings?tab=charges"
    },
    {
      id: "security",
      title: t('settings.cards.security', 'Security'),
      description: t('settings.cards.security_desc', 'Manage your account security and authentication settings.'),
      icon: Shield,
      href: "/settings?tab=security"
    },
    {
      id: "security-advanced",
      title: t('settings.cards.security_advanced', 'Advanced Security'),
      description: t('settings.cards.security_advanced_desc', 'Configure advanced security options like two-factor authentication.'),
      icon: ShieldCheck,
      href: "/settings?tab=security-advanced"
    },
    {
      id: "appearance",
      title: t('settings.cards.appearance', 'Appearance'),
      description: t('settings.cards.appearance_desc', 'Customize the look and feel of your application.'),
      icon: Brush,
      href: "/settings?tab=appearance"
    },
    {
      id: "branding",
      title: t('settings.cards.branding', 'Branding'),
      description: t('settings.cards.branding_desc', 'Manage your company branding and visual identity.'),
      icon: Palette,
      href: "/settings?tab=branding"
    },
    {
      id: "notifications",
      title: t('settings.cards.notifications', 'Notifications'),
      description: t('settings.cards.notifications_desc', 'Configure how and when you receive notifications.'),
      icon: Bell,
      href: "/settings?tab=notifications"
    },
    {
      id: "integrations",
      title: t('settings.cards.integrations', 'Integrations'),
      description: t('settings.cards.integrations_desc', 'Connect with third-party services and tools.'),
      icon: Link,
      href: "/settings?tab=integrations"
    },
    {
      id: "loyalty",
      title: t('settings.cards.loyalty', 'Loyalty'),
      description: t('settings.cards.loyalty_desc', 'Set up your customer loyalty and rewards program.'),
      icon: Gift,
      href: "/settings?tab=loyalty"
    },
    {
      id: "team",
      title: t('settings.cards.team', 'Team History'),
      description: t('settings.cards.team_desc', 'View and manage team member activity and history.'),
      icon: Users,
      href: "/settings?tab=team"
    },
    {
      id: "email-scheduling",
      title: t('settings.cards.email_scheduling', 'Email Scheduling'),
      description: t('settings.cards.email_scheduling_desc', 'Configure automated email communications.'),
      icon: MailPlus,
      href: "/settings?tab=email-scheduling"
    },
    {
      id: "advanced",
      title: t('settings.cards.advanced', 'Advanced'),
      description: t('settings.cards.advanced_desc', 'Learn about and set up advanced options for your shop.'),
      icon: Cog,
      href: "/settings?tab=advanced"
    },
    {
      id: "export",
      title: t('settings.cards.export', 'Data Export'),
      description: t('settings.cards.export_desc', 'Export your business data for backup or analysis.'),
      icon: Database,
      href: "/settings?tab=export"
    },
    {
      id: "language",
      title: t('settings.cards.language', 'Language'),
      description: t('settings.cards.language_desc', 'Change the language settings for your application.'),
      icon: Globe2,
      href: "/settings?tab=language"
    }
  ];

  // Get active tab from URL or default to "company"
  const [activeTab, setActiveTab] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get("tab");
    return tab || "company";
  });
  
  const handleCardClick = (cardId: string) => {
    setActiveTab(cardId);
    // Update URL to reflect the selected tab
    const url = new URL(window.location.href);
    url.searchParams.set("tab", cardId);
    window.history.pushState({}, "", url);
  };
  
  return (
    <ResponsiveContainer maxWidth="2xl" className="py-6">
      <div className="flex flex-col items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t('settings.title', 'Settings')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('settings.subtitle', 'Manage your account preferences and application settings')}
          </p>
        </div>
      </div>

      <div className="grid-view mb-8">
        <ResponsiveGrid 
          cols={{ default: 1, sm: 1, md: 2, lg: 3 }} 
          gap="lg" 
          className="mb-8"
        >
          {settingsCards.map(card => (
            <SettingsCard
              key={card.id}
              title={card.title}
              description={card.description}
              icon={card.icon}
              onClick={() => handleCardClick(card.id)}
              isActive={activeTab === card.id}
            />
          ))}
        </ResponsiveGrid>
      </div>

      <div className="settings-content mt-8 border-t pt-8">
        {activeTab && <SettingsTabContent tab={activeTab} />}
      </div>
    </ResponsiveContainer>
  );
};

// Component to render the content based on active tab
const SettingsTabContent = ({ tab }: { tab: string }) => {
  // Use a proper import instead of require
  return <SettingsLayout defaultTab={tab} />;
};

export default SettingsPage;
