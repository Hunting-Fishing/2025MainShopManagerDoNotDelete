
// Component to render the content based on active tab
const SettingsTabContent = ({ tab }: { tab: string }) => {
  // Now we can pass the defaultTab prop since we've added it to SettingsLayout
  return <SettingsLayout defaultTab={tab} />;
};
