
import React, { useState, KeyboardEvent } from 'react';
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
import { Edit } from 'lucide-react';
import CostChart from '@/components/CostChart';

type SearchHistoryItem = {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
  depth: string;
  timestamp: Date;
};

type LocationDetails = {
  name: string;
  country: string;
  terrain: string;
  rockType: string;
};

const randomLocations = [
  { name: 'Nevada', country: 'United States', terrain: 'Desert', rockType: 'Igneous' },
  { name: 'Queensland', country: 'Australia', terrain: 'Outback', rockType: 'Sedimentary' },
  { name: 'British Columbia', country: 'Canada', terrain: 'Mountain', rockType: 'Metamorphic' },
  { name: 'Atacama Desert', country: 'Chile', terrain: 'Desert', rockType: 'Volcanic' },
  { name: 'Gauteng', country: 'South Africa', terrain: 'Plateau', rockType: 'Granite' },
  { name: 'Siberia', country: 'Russia', terrain: 'Tundra', rockType: 'Crystalline' },
  { name: 'Minas Gerais', country: 'Brazil', terrain: 'Highland', rockType: 'Schist' },
  { name: 'Yunnan Province', country: 'China', terrain: 'Mountain', rockType: 'Limestone' },
  { name: 'Cornwall', country: 'United Kingdom', terrain: 'Coastal', rockType: 'Granite' },
  { name: 'Western Australia', country: 'Australia', terrain: 'Arid', rockType: 'Ironstone' },
];

const DrillingCostEstimator: React.FC = () => {
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [depth, setDepth] = useState<string>('');
  const [showEstimation, setShowEstimation] = useState<boolean>(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [locationDetails, setLocationDetails] = useState<LocationDetails | null>(null);

  const generateRandomCoordinates = () => {
    const lat = (Math.random() * 180 - 90).toFixed(4);
    const lng = (Math.random() * 360 - 180).toFixed(4);
    return { lat, lng };
  };

  const getRandomLocation = () => {
    const randomIndex = Math.floor(Math.random() * randomLocations.length);
    return randomLocations[randomIndex];
  };

  const handleCalculate = () => {
    // Generate random location details when calculating
    const randomLocation = getRandomLocation();
    setLocationDetails(randomLocation);

    // Add to search history
    const newItem: SearchHistoryItem = {
      id: Date.now().toString(),
      name: `Site ${searchHistory.length + 1}`,
      latitude,
      longitude,
      depth,
      timestamp: new Date(),
    };
    
    setSearchHistory([...searchHistory, newItem]);
    setShowEstimation(true);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const coords = generateRandomCoordinates();
      setLatitude(coords.lat);
      setLongitude(coords.lng);
      handleCalculate();
    }
  };

  const startEditing = (item: SearchHistoryItem) => {
    setEditingItemId(item.id);
    setEditingName(item.name);
  };

  const saveEditing = () => {
    if (editingItemId) {
      setSearchHistory(searchHistory.map(item => 
        item.id === editingItemId ? { ...item, name: editingName } : item
      ));
      setEditingItemId(null);
      setEditingName('');
    }
  };

  const costData = [
    {
      name: 'Drilling Costs',
      cost: 180000,
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Coordinates - Full height, 1/3 width */}
        <div className="border rounded-lg p-6 bg-white shadow-sm lg:col-span-1 lg:row-span-2">
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
                onKeyDown={handleKeyPress}
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
                onKeyDown={handleKeyPress}
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
                onKeyDown={handleKeyPress}
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
            <div className="bg-gray-50 border rounded-md p-4 h-80 overflow-y-auto">
              {searchHistory.length > 0 ? (
                <ul className="space-y-3">
                  {searchHistory.map((item) => (
                    <li key={item.id} className="border-b border-gray-200 pb-2">
                      {editingItemId === item.id ? (
                        <div className="flex items-center">
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="mr-2 text-sm"
                            autoFocus
                            onBlur={saveEditing}
                            onKeyDown={(e) => e.key === 'Enter' && saveEditing()}
                          />
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              {item.latitude}, {item.longitude} ({item.depth}m)
                            </p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => startEditing(item)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center">Your search history will appear here</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Right top column - Map */}
        <div className="border rounded-lg p-6 bg-white shadow-sm lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Location Map</h2>
          <div className="bg-gray-100 rounded-md h-80 flex items-center justify-center">
            <p className="text-gray-500">Enter coordinates to display map</p>
          </div>
          
          <div className="mt-4 bg-gray-50 border rounded-md p-4">
            {locationDetails ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-500">Location</h4>
                  <p className="font-medium">{locationDetails.name}, {locationDetails.country}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-500">Terrain</h4>
                  <p className="font-medium">{locationDetails.terrain}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Enter coordinates to display location details</p>
            )}
          </div>
        </div>
        
        {/* Drilling Estimation - Bottom right */}
        <div className="border rounded-lg p-6 bg-white shadow-sm lg:col-span-2">
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
                          <p className="font-medium">
                            {locationDetails?.rockType || "Granite/Metamorphic"}
                          </p>
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
    </div>
  );
};

export default DrillingCostEstimator;
