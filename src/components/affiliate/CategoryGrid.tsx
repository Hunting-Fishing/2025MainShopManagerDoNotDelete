
import React from "react";
import { Card as SemanticCard, Icon, Button, Grid, Header, Segment } from "semantic-ui-react";
import { ToolCategory } from "@/types/affiliate";
import { FolderTree } from "lucide-react";

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
            <SemanticCard fluid raised className="transition-all hover:shadow-lg">
              <SemanticCard.Content>
                <SemanticCard.Header>
                  <div className="flex items-center gap-2">
                    <FolderTree className="h-5 w-5" />
                    {category.name}
                  </div>
                </SemanticCard.Header>
                <SemanticCard.Description>
                  {category.description}
                </SemanticCard.Description>
              </SemanticCard.Content>
              <SemanticCard.Content extra>
                <Button fluid primary>
                  Browse {category.name}
                </Button>
              </SemanticCard.Content>
            </SemanticCard>
          </Grid.Column>
        ))}
      </Grid>
    </Segment>
  );
};

export default CategoryGrid;
