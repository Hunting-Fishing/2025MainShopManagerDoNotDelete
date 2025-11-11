import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ExternalLink, 
  Globe, 
  FileText, 
  Youtube, 
  HardDrive, 
  Package, 
  ShoppingCart,
  Image as ImageIcon,
  MessageSquare,
  PlayCircle,
  BookOpen,
  Shield,
  Wrench,
  Link as LinkIcon
} from 'lucide-react';

interface WebLink {
  id?: string;
  url: string;
  label: string;
  type: string;
}

interface WebLinksDisplayProps {
  webLinks: WebLink[] | string | null | undefined;
}

const getLinkIcon = (type: string) => {
  switch (type) {
    case 'Manufacturer Website':
      return <Globe className="h-4 w-4" />;
    case 'Product Datasheet':
      return <FileText className="h-4 w-4" />;
    case 'Installation Guide':
      return <BookOpen className="h-4 w-4" />;
    case 'YouTube Tutorial':
    case 'YouTube Video':
      return <Youtube className="h-4 w-4" />;
    case 'OneDrive Document':
    case 'OneDrive Link':
      return <HardDrive className="h-4 w-4" />;
    case 'Supplier Portal':
      return <ShoppingCart className="h-4 w-4" />;
    case 'Product Image':
    case 'Product Images':
      return <ImageIcon className="h-4 w-4" />;
    case 'Support Forum':
      return <MessageSquare className="h-4 w-4" />;
    case 'Training Video':
      return <PlayCircle className="h-4 w-4" />;
    case 'Warranty Info':
      return <Shield className="h-4 w-4" />;
    case 'Maintenance Manual':
      return <Wrench className="h-4 w-4" />;
    case 'Purchase Link':
      return <Package className="h-4 w-4" />;
    default:
      return <LinkIcon className="h-4 w-4" />;
  }
};

export function WebLinksDisplay({ webLinks }: WebLinksDisplayProps) {
  // Parse webLinks if it's a string
  let parsedLinks: WebLink[] = [];
  
  if (!webLinks) {
    return null;
  }

  if (typeof webLinks === 'string') {
    try {
      parsedLinks = JSON.parse(webLinks);
    } catch (e) {
      console.error('Failed to parse webLinks:', e);
      return null;
    }
  } else if (Array.isArray(webLinks)) {
    parsedLinks = webLinks;
  }

  // Don't render if no links
  if (!parsedLinks || parsedLinks.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          Web Links
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {parsedLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent hover:border-accent-foreground/20 transition-colors group"
            >
              <div className="flex-shrink-0 text-muted-foreground group-hover:text-accent-foreground transition-colors">
                {getLinkIcon(link.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground group-hover:text-accent-foreground transition-colors">
                  {link.label}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {link.type}
                </p>
              </div>
              <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
