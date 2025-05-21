
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
import { Edit, Save, MapPin } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import CostChart from '@/components/CostChart';

type SearchHistoryItem = {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
  depth: string;
  timestamp: Date;
  locationDetails: LocationDetails;
  costData: { name: string; cost: number; }[];
  costRange: string;
};

type LocationDetails = {
  name: string;
  country: string;
  rockType: string;
  confidenceRating: number;
};

const randomLocations = [
  { name: 'Nevada', country: 'United States', rockType: 'Igneous', confidenceRating: 8 },
  { name: 'Queensland', country: 'Australia', rockType: 'Sedimentary', confidenceRating: 7 },
  { name: 'British Columbia', country: 'Canada', rockType: 'Metamorphic', confidenceRating: 9 },
  { name: 'Atacama Desert', country: 'Chile', rockType: 'Volcanic', confidenceRating: 6 },
  { name: 'Gauteng', country: 'South Africa', rockType: 'Granite', confidenceRating: 8 },
  { name: 'Siberia', country: 'Russia', rockType: 'Crystalline', confidenceRating: 5 },
  { name: 'Minas Gerais', country: 'Brazil', rockType: 'Schist', confidenceRating: 7 },
  { name: 'Yunnan Province', country: 'China', rockType: 'Limestone', confidenceRating: 6 },
  { name: 'Cornwall', country: 'United Kingdom', rockType: 'Granite', confidenceRating: 9 },
  { name: 'Western Australia', country: 'Australia', rockType: 'Ironstone', confidenceRating: 7 },
  { name: 'London', country: 'United Kingdom', rockType: 'Clay', confidenceRating: 8 },
  { name: 'Alberta', country: 'Canada', rockType: 'Sedimentary', confidenceRating: 7 },
  { name: 'Arizona', country: 'United States', rockType: 'Sandstone', confidenceRating: 9 },
  { name: 'Osaka', country: 'Japan', rockType: 'Basalt', confidenceRating: 6 },
  { name: 'Bavaria', country: 'Germany', rockType: 'Limestone', confidenceRating: 8 },
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
  const [activeSiteId, setActiveSiteId] = useState<string | null>(null);
  const [costData, setCostData] = useState<{ name: string; cost: number; }[]>([]);
  const [costRange, setCostRange] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const generateRandomCoordinates = () => {
    const lat = (Math.random() * 180 - 90).toFixed(4);
    const lng = (Math.random() * 360 - 180).toFixed(4);
    return { lat, lng };
  };

  const getRandomLocation = () => {
    const randomIndex = Math.floor(Math.random() * randomLocations.length);
    return randomLocations[randomIndex];
  };

  const calculateCosts = (baseDepth: number) => {
    // Add some randomness to make costs different each time
    const randomFactor = 0.7 + (Math.random() * 0.6); // between 0.7 and 1.3
    const depthValue = parseFloat(depth) || 250;
      
    const averageCost = Math.round(baseDepth * depthValue * randomFactor);
    const conservativeCost = Math.round(averageCost * (1.2 + Math.random() * 0.2)); // 1.2-1.4x
    const ambitiousCost = Math.round(averageCost * (0.7 + Math.random() * 0.1)); // 0.7-0.8x
    
    return [
      { name: 'Ambitious', cost: ambitiousCost },
      { name: 'Average', cost: averageCost },
      { name: 'Conservative', cost: conservativeCost }
    ];
  };

  const handleCalculate = () => {
    // Generate random location details when calculating
    const randomLocation = getRandomLocation();
    const newLocationDetails = {
      name: randomLocation.name,
      country: randomLocation.country,
      rockType: randomLocation.rockType,
      confidenceRating: randomLocation.confidenceRating
    };
    
    setLocationDetails(newLocationDetails);
    
    // Calculate costs with randomness
    const newCostData = calculateCosts(720);
    setCostData(newCostData);
    
    const minCost = Math.min(...newCostData.map(d => d.cost));
    const maxCost = Math.max(...newCostData.map(d => d.cost));
    const newCostRange = `$${minCost.toLocaleString()} - $${maxCost.toLocaleString()}`;
    setCostRange(newCostRange);

    // Add to search history
    const newItem: SearchHistoryItem = {
      id: Date.now().toString(),
      name: `Site ${searchHistory.length + 1}`,
      latitude,
      longitude,
      depth,
      timestamp: new Date(),
      locationDetails: newLocationDetails,
      costData: newCostData,
      costRange: newCostRange
    };
    
    setSearchHistory([...searchHistory, newItem]);
    setShowEstimation(true);
    setActiveSiteId(newItem.id);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const coords = generateRandomCoordinates();
      setLatitude(coords.lat);
      setLongitude(coords.lng);
      setDepth((Math.random() * 300 + 100).toFixed(0));
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

  const loadSite = (item: SearchHistoryItem) => {
    setLatitude(item.latitude);
    setLongitude(item.longitude);
    setDepth(item.depth);
    setLocationDetails(item.locationDetails);
    setCostData(item.costData);
    setCostRange(item.costRange);
    setActiveSiteId(item.id);
    setShowEstimation(true);
  };

  const saveToProjects = () => {
    if (!activeSiteId || !locationDetails) return;
    
    const activeSite = searchHistory.find(item => item.id === activeSiteId);
    if (!activeSite) return;
    
    // Calculate a realistic NPV based on depth
    const depth = parseFloat(activeSite.depth) || 250;
    const npv = Math.round((depth * 0.8) + Math.random() * 100);
    
    // Determine minerals based on rock type
    let minerals: Array<'Copper' | 'Gold' | 'Silver' | 'Cobalt' | 'Manganese'> = ['Copper'];
    
    switch(locationDetails.rockType) {
      case 'Igneous':
      case 'Volcanic': 
        minerals = ['Copper', 'Gold'];
        break;
      case 'Sedimentary':
        minerals = ['Silver'];
        break;
      case 'Metamorphic':
        minerals = ['Gold'];
        break;
      case 'Granite':
        minerals = ['Copper', 'Silver'];
        break;
      case 'Limestone':
      case 'Sandstone':
        minerals = ['Manganese'];
        break;
      default:
        minerals = ['Cobalt'];
    }
    
    // Create a new project object
    const newProject = {
      id: `proj-${Date.now()}`,
      name: activeSite.name,
      location: locationDetails.name,
      country: locationDetails.country,
      npv,
      minerals,
      createdDate: new Date().toISOString().split('T')[0],
    };
    
    // Save to localStorage
    const existingProjects = localStorage.getItem('explorationProjects');
    let projectsArray = existingProjects ? JSON.parse(existingProjects) : [];
    projectsArray = [...projectsArray, newProject];
    localStorage.setItem('explorationProjects', JSON.stringify(projectsArray));
    
    toast({
      title: "Project Saved",
      description: `${activeSite.name} has been added to your exploration projects.`,
    });
    
    // Navigate to home
    navigate('/');
  };

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
                    <li key={item.id} className={`border-b border-gray-200 pb-2 ${activeSiteId === item.id ? 'bg-blue-50 p-2 rounded' : ''}`}>
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
                          <div className="cursor-pointer" onClick={() => loadSite(item)}>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              {item.latitude}, {item.longitude} ({item.depth}m)
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => startEditing(item)}
                              className="h-6 w-6 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                loadSite(item);
                                saveToProjects();
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                          </div>
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
          {showEstimation ? (
            <>
              <div className="bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/0,0,1,0/800x400?access_token=pk.eyJ1IjoiZXhhbXBsZXVzZXIiLCJhIjoiY2xneng1Mmp4MHRkYzNpcXl5ZDZ6Y2lyNSJ9.3jkU624v1hwRIm46HJbHMw')] rounded-md h-80 flex items-center justify-center bg-cover">
                <div className="flex flex-col items-center justify-center">
                  <MapPin className="h-10 w-10 text-mining-primary mb-2" />
                </div>
              </div>
              
              <div className="mt-4 bg-gray-50 border rounded-md p-4">
                {locationDetails && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-500">Location</h4>
                      <p className="font-medium">{locationDetails.name}, {locationDetails.country}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-500">Coordinates</h4>
                      <p className="font-medium">Lat: {latitude}, Long: {longitude}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-gray-100 rounded-md h-80 flex items-center justify-center">
              <p className="text-gray-500">Enter coordinates and click calculate to display map</p>
            </div>
          )}
        </div>
        
        {/* Drilling Estimation - Bottom right */}
        <div className="border rounded-lg p-6 bg-white shadow-sm lg:col-span-2">
          <h2 className="text-xl font-semibold">Drilling Estimation</h2>
          <p className="text-gray-500 mb-2">Data calculated using ingested NI-43 101 reports and local terrain analysis</p>
          
          {showEstimation ? (
            <>
              <div className="text-center mb-4">
                <p className="text-lg text-gray-500">Estimated Cost Range</p>
                <p className="text-2xl font-bold text-mining-primary">{costRange}</p>
              </div>
              
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
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-mining-primary h-2.5 rounded-full" 
                                style={{ width: `${(locationDetails?.confidenceRating || 7) * 10}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between mt-1 text-xs text-gray-500">
                              <span>Low</span>
                              <span>{locationDetails?.confidenceRating || 7}/10</span>
                              <span>High</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-gray-500">Rock Type</h4>
                          <p className="font-medium">
                            {locationDetails?.rockType || "Granite/Metamorphic"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <h4 className="font-medium text-sm text-gray-500">Estimated Timeline</h4>
                          <p className="font-medium">3-4 months</p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <div className="mt-6 flex justify-end">
                <Button 
                  className="bg-mining-primary hover:bg-mining-secondary"
                  onClick={saveToProjects}
                >
                  <Save className="mr-2 h-4 w-4" /> Save to Projects
                </Button>
              </div>
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
