
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { formatCurrency } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ServicesPriceReportProps {
  categories: ServiceMainCategory[];
}

const ServicesPriceReport: React.FC<ServicesPriceReportProps> = ({ categories }) => {
  const priceData = useMemo(() => {
    // Get average price per category
    return categories.map(category => {
      let totalPrice = 0;
      let totalJobs = 0;
      
      category.subcategories.forEach(sub => {
        sub.jobs.forEach(job => {
          if (job.price) {
            totalPrice += job.price;
            totalJobs++;
          }
        });
      });
      
      const avgPrice = totalJobs > 0 ? totalPrice / totalJobs : 0;
      
      return {
        name: category.name,
        averagePrice: parseFloat(avgPrice.toFixed(2)),
        totalServices: totalJobs
      };
    }).sort((a, b) => b.averagePrice - a.averagePrice);
  }, [categories]);

  // Find services with highest and lowest prices
  const { highestPriceService, lowestPriceService, servicesWithNoPrice } = useMemo(() => {
    let highest = { name: '', price: 0, category: '', subcategory: '' };
    let lowest = { name: '', price: Number.MAX_VALUE, category: '', subcategory: '' };
    let noPrice = 0;
    
    categories.forEach(category => {
      category.subcategories.forEach(subcategory => {
        subcategory.jobs.forEach(job => {
          if (!job.price) {
            noPrice++;
            return;
          }
          
          if (job.price > highest.price) {
            highest = {
              name: job.name,
              price: job.price,
              category: category.name,
              subcategory: subcategory.name
            };
          }
          
          if (job.price < lowest.price) {
            lowest = {
              name: job.name,
              price: job.price,
              category: category.name,
              subcategory: subcategory.name
            };
          }
        });
      });
    });
    
    // If no services with prices were found
    if (lowest.price === Number.MAX_VALUE) {
      lowest = { name: 'None', price: 0, category: '', subcategory: '' };
    }
    
    return {
      highestPriceService: highest,
      lowestPriceService: lowest,
      servicesWithNoPrice: noPrice
    };
  }, [categories]);

  if (categories.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Price Analysis</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-gray-500">No service data available for price analysis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Service Price Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 mb-6">
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
            <p className="text-sm text-amber-700 mb-1">Highest Priced Service</p>
            <p className="text-xl font-bold">{highestPriceService.name}</p>
            <p className="text-lg font-semibold text-amber-600">{formatCurrency(highestPriceService.price)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {highestPriceService.category} &gt; {highestPriceService.subcategory}
            </p>
          </div>
          
          <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
            <p className="text-sm text-teal-700 mb-1">Lowest Priced Service</p>
            <p className="text-xl font-bold">{lowestPriceService.name}</p>
            <p className="text-lg font-semibold text-teal-600">{formatCurrency(lowestPriceService.price)}</p>
            {lowestPriceService.category && (
              <p className="text-xs text-gray-500 mt-1">
                {lowestPriceService.category} &gt; {lowestPriceService.subcategory}
              </p>
            )}
          </div>
          
          {servicesWithNoPrice > 0 && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <p className="text-sm text-red-700 mb-1">Services Missing Pricing</p>
              <p className="text-xl font-bold">{servicesWithNoPrice}</p>
              <p className="text-xs text-gray-500 mt-1">
                These services have no price set and may need attention
              </p>
            </div>
          )}
        </div>

        {priceData.length > 0 && (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={priceData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
                />
                <YAxis 
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  formatter={(value: any) => [`$${value}`, 'Average Price']}
                  labelFormatter={(label) => `Category: ${label}`}
                />
                <Bar 
                  dataKey="averagePrice" 
                  fill="#8884d8" 
                  name="Average Price"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServicesPriceReport;
