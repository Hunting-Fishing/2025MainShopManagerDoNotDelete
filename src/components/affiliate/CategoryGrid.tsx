
import React from "react";
import { Card } from "@/components/ui/card";
import { Segment, Header, Grid } from "semantic-ui-react";
import { ToolCategory } from "@/types/affiliate";
import { Wrench } from "lucide-react";
import { Link } from "react-router-dom";

interface CategoryGridProps {
  categories: ToolCategory[];
}

const CategoryGrid = ({ categories }: CategoryGridProps) => {
  return (
    <Segment raised className="bg-white">
      <Header as="h2" className="text-2xl font-semibold mb-6">Shop by Category</Header>
      <Grid columns={3} stackable doubling>
        {categories.map((category) => (
          <Grid.Column key={category.id}>
            <Card className="h-full transition-all hover:shadow-lg">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-slate-800 rounded-lg">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-medium">{category.name}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{category.description}</p>
                <div className="mt-auto pt-4">
                  <Link 
                    to={`/tools/${category.slug}`} 
                    className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    Browse {category.name}
                  </Link>
                </div>
              </div>
            </Card>
          </Grid.Column>
        ))}
      </Grid>
    </Segment>
  );
};

export default CategoryGrid;
