import React, { useState } from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { LoyaltyTabHeader } from './loyalty/LoyaltyTabHeader';
import { ProgramSettingsCard } from './loyalty/ProgramSettingsCard';
import { useLoyaltySettings } from './loyalty/useLoyaltySettings';

export function LoyaltyTab() {
  const [activeTab, setActiveTab] = useState("settings");
  const {
    settings,
    isLoading,
    isSaving,
    handleSettingsChange,
    handleSaveSettings,
    handleToggleLoyalty
  } = useLoyaltySettings();

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-32 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  // No settings found
  if (!settings) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load loyalty program settings. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <LoyaltyTabHeader 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      <TabsContent value="settings" className="space-y-4 mt-6">
        <ProgramSettingsCard
          settings={settings}
          isSaving={isSaving}
          onSettingsChange={handleSettingsChange}
          onToggleLoyalty={handleToggleLoyalty}
          onSaveSettings={handleSaveSettings}
        />
      </TabsContent>

      <TabsContent value="tiers" className="space-y-4 mt-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Loyalty Tiers</h3>
          <Button 
            onClick={() => { setIsAddingTier(true); setEditingTier(null); }}
            disabled={isAddingTier || !!editingTier}
            className="bg-esm-blue-600 hover:bg-esm-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Tier
          </Button>
        </div>
        
        {/* Add Tier Form */}
        {isAddingTier && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Tier</CardTitle>
            </CardHeader>
            <CardContent>
              <LoyaltyTierForm 
                onSave={handleAddTier}
                onCancel={handleCancelEdit}
              />
            </CardContent>
          </Card>
        )}
        
        {/* Edit Tier Form */}
        {editingTier && (
          <Card>
            <CardHeader>
              <CardTitle>Edit {editingTier.name} Tier</CardTitle>
            </CardHeader>
            <CardContent>
              <LoyaltyTierForm 
                tier={editingTier}
                onSave={handleUpdateTier}
                onCancel={handleCancelEdit}
              />
            </CardContent>
          </Card>
        )}
        
        {/* List of Tiers */}
        <div className="space-y-3">
          {tiers.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-center text-muted-foreground">
                No loyalty tiers defined yet. Create your first tier to get started.
              </CardContent>
            </Card>
          ) : (
            tiers
              .sort((a, b) => a.threshold - b.threshold)
              .map(tier => (
                <LoyaltyTierCard
                  key={tier.id}
                  tier={tier}
                  onEdit={() => handleEditTier(tier)}
                  onDelete={() => handleDeleteTier(tier)}
                />
              ))
          )}
        </div>
      </TabsContent>
    </div>
  );
}
