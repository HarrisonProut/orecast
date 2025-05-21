
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from '@/components/ui/separator';
import CostChart from '@/components/CostChart';

const DrillingCostEstimator: React.FC = () => {
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [depth, setDepth] = useState<string>('');
  const [showEstimation, setShowEstimation] = useState<boolean>(false);

  const handleCalculate = () => {
    // In a real application, this would call an API or use a calculation model
    setShowEstimation(true);
  };

  const costData = [
    {
      name: 'Drilling Costs',
      conservative: 250000,
      average: 180000,
      ambitious: 150000,
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Drilling Cost Estimator</h1>
        <p className="text-gray-600 mt-2">
          Calculation tool that estimates cost ranges for drilling projects, based on ingested NI-43 101 reports and local terrain analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column - Coordinates */}
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Coordinates</h2>
          <p className="text-gray-500 mb-6">Enter the exploration site coordinates</p>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input 
                id="latitude" 
                type="text" 
                placeholder="e.g., 52.8742" 
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input 
                id="longitude" 
                type="text" 
                placeholder="e.g., -128.3421" 
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="depth">Drilling Depth (meters)</Label>
              <Input 
                id="depth" 
                type="text" 
                placeholder="e.g., 250" 
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
              />
            </div>
            
            <Button 
              className="w-full bg-mining-primary hover:bg-mining-secondary"
              onClick={handleCalculate}
            >
              CALCULATE
            </Button>
          </div>
          
          <div className="mt-8">
            <h3 className="font-semibold mb-2">Search History</h3>
            <div className="bg-gray-50 border rounded-md p-4 h-40 flex items-center justify-center">
              <p className="text-gray-500">Your search history will appear here</p>
            </div>
          </div>
        </div>
        
        {/* Right column - Map */}
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Location Map</h2>
          <div className="bg-gray-100 rounded-md h-80 flex items-center justify-center">
            <p className="text-gray-500">Enter coordinates to display map</p>
          </div>
          
          <div className="mt-4 bg-gray-50 border rounded-md p-4">
            <p className="text-gray-500">Enter coordinates to display location details</p>
          </div>
        </div>
      </div>
      
      {/* Drilling Estimation */}
      <div className="mt-8 border rounded-lg p-6 bg-white shadow-sm">
        <h2 className="text-xl font-semibold">Drilling Estimation</h2>
        <p className="text-gray-500 mb-6">Data calculated using ingested NI-43 101 reports and local terrain analysis</p>
        
        {showEstimation ? (
          <>
            <CostChart data={costData} />
            
            <Separator className="my-6" />
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="details">
                <AccordionTrigger>Additional Details</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-sm text-gray-500">Confidence Rating</h4>
                        <p className="font-medium">87% (High)</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-gray-500">Rock Type</h4>
                        <p className="font-medium">Granite/Metamorphic</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-sm text-gray-500">Average Cost Per Meter</h4>
                        <p className="font-medium">$720</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-gray-500">Estimated Timeline</h4>
                        <p className="font-medium">3-4 months</p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        ) : (
          <div className="h-56 flex items-center justify-center">
            <p className="text-gray-500">Enter coordinates and click calculate to see drilling information</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrillingCostEstimator;
