
import React, { useState } from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Plus } from "lucide-react";
import { LoyaltyTabHeader } from './loyalty/LoyaltyTabHeader';
import { ProgramSettingsCard } from './loyalty/ProgramSettingsCard';
import { useLoyaltySettings } from './loyalty/useLoyaltySettings';
import { useLoyaltyTiers } from './loyalty/useLoyaltyTiers';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoyaltyTierCard } from "./loyalty/LoyaltyTierCard";
import { LoyaltyTierForm } from "./loyalty/LoyaltyTierForm";

export function LoyaltyTab() {
  const [activeTab, setActiveTab] = useState("settings");
  const {
    settings,
    isLoading: isLoadingSettings,
    isSaving: isSavingSettings,
    handleSettingsChange,
    handleSaveSettings,
    handleToggleLoyalty
  } = useLoyaltySettings();

  const {
    tiers,
    isLoading: isLoadingTiers,
    isAddingTier,
    editingTier,
    setIsAddingTier,
    setEditingTier,
    handleAddTier,
    handleUpdateTier,
    handleDeleteTier,
    handleEditTier,
    handleCancelEdit
  } = useLoyaltyTiers();

  // Render loading state
  if (isLoadingSettings) {
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
          isSaving={isSavingSettings}
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
          {isLoadingTiers ? (
            <Card>
              <CardContent className="py-6 text-center">
                <div className="h-24 flex items-center justify-center">
                  <div className="h-8 w-8 border-4 border-t-esm-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                </div>
              </CardContent>
            </Card>
          ) : tiers.length === 0 ? (
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
