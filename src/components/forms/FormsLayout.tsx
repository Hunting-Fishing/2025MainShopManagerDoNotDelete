
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormTemplatesList } from "./FormTemplatesList";
import { FormUploads } from "./FormUploads";
import { FormCategories } from "./FormCategories";
import { useTranslation } from 'react-i18next';

export const FormsLayout = () => {
  const [activeTab, setActiveTab] = useState("templates");
  const { t } = useTranslation();

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
        <TabsTrigger value="templates">Templates</TabsTrigger>
        <TabsTrigger value="uploads">Uploads</TabsTrigger>
        <TabsTrigger value="categories">Categories</TabsTrigger>
      </TabsList>
      <div>
        <TabsContent value="templates">
          <FormTemplatesList />
        </TabsContent>
        <TabsContent value="uploads">
          <FormUploads />
        </TabsContent>
        <TabsContent value="categories">
          <FormCategories />
        </TabsContent>
      </div>
    </Tabs>
  );
};
