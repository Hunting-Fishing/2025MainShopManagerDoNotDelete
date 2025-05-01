
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Container, Header as SemanticHeader, Segment, Breadcrumb, Icon } from 'semantic-ui-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Hammer } from "lucide-react";

// Import the categories data
import { categories } from '@/data/toolCategories';

const sampleProducts = (subcategory: string) => Array.from({ length: 8 }, (_, i) => ({
  id: `${subcategory.toLowerCase().replace(/\s+/g, '-')}-${i + 1}`,
  title: `${subcategory} #${i + 1}`,
  img: `https://via.placeholder.com/300x200?text=${encodeURIComponent(subcategory)}+${i + 1}`,
  price: ((i + 1) * 19.99 + 29.99).toFixed(2),
  rating: (Math.random() * 2 + 3).toFixed(1),
  link: "#",
}));

export default function ToolCategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [categoryTitle, setCategoryTitle] = useState<string>("");
  
  useEffect(() => {
    // Find the matching category and set the subcategories
    const categoryKey = Object.keys(categories).find(
      key => key.toLowerCase().replace(/\s+/g, '-') === category
    );
    
    if (categoryKey) {
      setSubcategories(categories[categoryKey]);
      setCategoryTitle(categoryKey);
    }
  }, [category]);

  if (!subcategories.length) {
    return (
      <Container fluid>
        <Segment placeholder>
          <SemanticHeader icon>
            <Icon name="search" />
            Category not found
          </SemanticHeader>
          <Segment.Inline>
            <Link to="/tools" className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
              Back to All Categories
            </Link>
          </Segment.Inline>
        </Segment>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Segment raised className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 p-6 mb-6 border-l-4 border-blue-500">
        <Breadcrumb size='large'>
          <Breadcrumb.Section link as={Link} to="/tools">Tool Categories</Breadcrumb.Section>
          <Breadcrumb.Divider icon='right angle' />
          <Breadcrumb.Section active>{categoryTitle}</Breadcrumb.Section>
        </Breadcrumb>
        
        <div className="mt-4">
          <SemanticHeader as="h1" className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {categoryTitle} Tools
            <SemanticHeader.Subheader className="text-slate-600 dark:text-slate-300">
              Professional-grade {categoryTitle.toLowerCase()} tools for automotive repair and maintenance
            </SemanticHeader.Subheader>
          </SemanticHeader>
        </div>
      </Segment>

      <ScrollArea className="h-[calc(100vh-15rem)]">
        {subcategories.map((subcategory) => (
          <div key={subcategory} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-slate-800 rounded-lg">
                <Hammer className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold">{subcategory}</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sampleProducts(subcategory).map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow border-t-4 border-blue-500">
                  <Link to={`/tools/${category}/${item.id}`}>
                    <CardContent className="p-0">
                      <img
                        src={item.img}
                        alt={item.title}
                        className="w-full h-[200px] object-cover rounded-t-lg"
                      />
                      <div className="p-4">
                        <p className="font-medium">{item.title}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-blue-600 font-bold">${item.price}</span>
                          <span className="text-sm text-gray-600 flex items-center">
                            <Icon name="star" color="yellow" /> {item.rating}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </ScrollArea>
    </Container>
  );
}
