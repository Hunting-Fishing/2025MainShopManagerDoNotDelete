import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BucketItem {
  name: string;
  size: number;
  createdAt: string;
}

export function LiveBucketViewer() {
  const [bucketItems, setBucketItems] = useState<BucketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBucketItems = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase.storage.from('avatars').list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });

        if (error) {
          throw new Error(error.message);
        }

        const items = data?.map(item => ({
          name: item.name,
          size: item.metadata?.size || 0,
          createdAt: item.createdAt,
        })) || [];

        setBucketItems(items);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBucketItems();
  }, []);

  const handleDelete = async (itemName: string) => {
    if (!confirm(`Are you sure you want to delete ${itemName}?`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.storage.from('avatars').remove([itemName]);

      if (error) {
        throw new Error(error.message);
      }

      setBucketItems(prevItems => prevItems.filter(item => item.name !== itemName));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (itemName: string) => {
    const publicURL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${itemName}`;
    window.open(publicURL, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Bucket Viewer</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && !error && bucketItems.length === 0 && <p>No items in bucket.</p>}

        {!loading && !error && bucketItems.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bucketItems.map(item => (
                  <tr key={item.name}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {item.size ? (
                          <Badge variant="secondary">{item.size} bytes</Badge>
                        ) : (
                          'N/A'
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{item.createdAt}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDownload(item.name)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.name)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
