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
import { Edit, Save, MapPin, BarChart2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import CostChart from '@/components/CostChart';
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export type MineralType = 'Copper' | 'Gold' | 'Silver' | 'Cobalt' | 'Manganese' | 'Iron';

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
  selectedMinerals: MineralType[];
  costBreakdown: {
    labor: number;
    hardware: number;
  };
  drillingMethod: string;
  terrain: {
    type: string;
    elevation: string;
  };
  timeEstimation: string;
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

const drillingMethods = [
  'Diamond Core Drilling',
  'Reverse Circulation (RC)',
  'Air Core Drilling',
  'Rotary Air Blast (RAB)',
  'Sonic Drilling',
  'Directional Drilling'
];

const terrainTypes = [
  { type: 'Mountainous', elevation: '1500-2800m' },
  { type: 'Plateau', elevation: '800-1200m' },
  { type: 'Valley', elevation: '400-600m' },
  { type: 'Desert', elevation: '200-500m' },
  { type: 'Coastal', elevation: '0-100m' },
  { type: 'Forest', elevation: '300-900m' },
  { type: 'Tundra', elevation: '100-400m' }
];

const minerals: MineralType[] = ['Copper', 'Gold', 'Silver', 'Cobalt', 'Manganese', 'Iron'];

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
  const [selectedMinerals, setSelectedMinerals] = useState<MineralType[]>([]);
  const [costBreakdown, setCostBreakdown] = useState<{labor: number; hardware: number}>({labor: 0, hardware: 0});
  const [drillingMethod, setDrillingMethod] = useState<string>('');
  const [terrain, setTerrain] = useState<{type: string; elevation: string}>({type: '', elevation: ''});
  const [timeEstimation, setTimeEstimation] = useState<string>('');
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

  const getRandomDrillingMethod = () => {
    const randomIndex = Math.floor(Math.random() * drillingMethods.length);
    return drillingMethods[randomIndex];
  };

  const getRandomTerrain = () => {
    const randomIndex = Math.floor(Math.random() * terrainTypes.length);
    return terrainTypes[randomIndex];
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

  const calculateCostBreakdown = (totalCost: number) => {
    // Random but realistic labor/hardware split
    const laborPercentage = 0.4 + Math.random() * 0.2; // 40-60% for labor
    const laborCost = Math.round(totalCost * laborPercentage);
    const hardwareCost = totalCost - laborCost;
    
    return { labor: laborCost, hardware: hardwareCost };
  };

  const calculateTimeEstimation = (depth: number) => {
    // Random but realistic time estimation based on depth
    const baseWeeks = Math.ceil(depth / 100);
    const variability = Math.floor(Math.random() * 3); // 0-2 weeks of variability
    return `${baseWeeks}-${baseWeeks + variability} weeks`;
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

    // Calculate cost breakdown
    const avgCost = newCostData.find(d => d.name === 'Average')?.cost || 0;
    const newCostBreakdown = calculateCostBreakdown(avgCost);
    setCostBreakdown(newCostBreakdown);

    // Set drilling method
    const newDrillingMethod = getRandomDrillingMethod();
    setDrillingMethod(newDrillingMethod);

    // Set terrain
    const newTerrain = getRandomTerrain();
    setTerrain(newTerrain);

    // Set time estimation
    const depthValue = parseFloat(depth) || 250;
    const newTimeEstimation = calculateTimeEstimation(depthValue);
    setTimeEstimation(newTimeEstimation);

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
      costRange: newCostRange,
      selectedMinerals: [...selectedMinerals],
      costBreakdown: newCostBreakdown,
      drillingMethod: newDrillingMethod,
      terrain: newTerrain,
      timeEstimation: newTimeEstimation
    };
    
    const updatedHistory = [...searchHistory, newItem];
    setSearchHistory(updatedHistory);
    localStorage.setItem('drillingSearchHistory', JSON.stringify(updatedHistory));
    
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
    setSelectedMinerals(item.selectedMinerals);
    setCostBreakdown(item.costBreakdown);
    setDrillingMethod(item.drillingMethod);
    setTerrain(item.terrain);
    setTimeEstimation(item.timeEstimation);
    setShowEstimation(true);
  };

  const toggleMineral = (mineral: MineralType) => {
    setSelectedMinerals(current => 
      current.includes(mineral)
        ? current.filter(m => m !== mineral)
        : [...current, mineral]
    );
  };

  const saveToProjects = () => {
    if (!activeSiteId || !locationDetails) return;
    
    const activeSite = searchHistory.find(item => item.id === activeSiteId);
    if (!activeSite) return;
    
    // Calculate a realistic NPV based on depth
    const depth = parseFloat(activeSite.depth) || 250;
    const npv = Math.round((depth * 0.8) + Math.random() * 100);
    
    // Create a new project object with selected minerals
    const newProject = {
      id: `proj-${Date.now()}`,
      name: activeSite.name,
      location: locationDetails.name,
      country: locationDetails.country,
      npv,
      minerals: activeSite.selectedMinerals.length > 0 ? activeSite.selectedMinerals : ['Copper'],
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

  const navigateToCompare = () => {
    navigate('/exploration-comparison');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Drilling Cost Estimator</h1>
        <Button 
          className="bg-mining-primary hover:bg-mining-secondary"
          onClick={navigateToCompare}
        >
          <BarChart2 className="mr-2 h-4 w-4" /> Compare Exploration Sites
        </Button>
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

            <div>
              <Label className="mb-2 block">Mineral Target</Label>
              <div className="grid grid-cols-2 gap-2 border rounded-md p-3 bg-gray-50">
                {minerals.map((mineral) => (
                  <div key={mineral} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`mineral-${mineral}`}
                      checked={selectedMinerals.includes(mineral)} 
                      onCheckedChange={() => toggleMineral(mineral)}
                    />
                    <Label htmlFor={`mineral-${mineral}`} className="cursor-pointer">{mineral}</Label>
                  </div>
                ))}
              </div>
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
              <div className="bg-[url('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/0,0,1,0/800x400?access_token=pk.eyJ1IjoiZXhhbXBsZXVzZXIiLCJhIjoiY2xneng1Mmp4MHRkYzNpcXl5ZDZ6Y2lyNSJ9.3jkU624v1hwRIm46HJbHMw')] rounded-md h-80 flex items-center justify-center bg-cover">
                <div className="flex flex-col items-center justify-center">
                  <MapPin className="h-10 w-10 text-mining-primary" />
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
                    {selectedMinerals.length > 0 && (
                      <div className="col-span-2">
                        <h4 className="font-medium text-sm text-gray-500">Target Minerals</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedMinerals.map(mineral => (
                            <span key={mineral} className="bg-mining-primary/20 text-mining-primary text-sm px-2 py-1 rounded-md">
                              {mineral}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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
              
              <Collapsible>
                <CollapsibleTrigger className="w-full text-left font-medium text-gray-700 flex items-center justify-between py-2">
                  Expand
                  <svg 
                    width="15" 
                    height="15" 
                    viewBox="0 0 15 15" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 transition-transform duration-200 collapsible-closed:rotate-90"
                  >
                    <path 
                      d="M4.18179 6.18181C4.35753 6.00608 4.64245 6.00608 4.81819 6.18181L7.49999 8.86362L10.1818 6.18181C10.3575 6.00608 10.6424 6.00608 10.8182 6.18181C10.9939 6.35755 10.9939 6.64247 10.8182 6.81821L7.81819 9.81821C7.73379 9.9026 7.61934 9.95001 7.49999 9.95001C7.38064 9.95001 7.26618 9.9026 7.18179 9.81821L4.18179 6.81821C4.00605 6.64247 4.00605 6.35755 4.18179 6.18181Z" 
                      fill="currentColor" 
                      fillRule="evenodd" 
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Cost Breakdown</h3>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <div className="flex justify-between mb-2">
                          <span>Labor</span>
                          <span className="font-medium">${costBreakdown.labor.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Hardware & Equipment</span>
                          <span className="font-medium">${costBreakdown.hardware.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Confidence Rating</h3>
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
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Rock Type</h3>
                        <p>{locationDetails?.rockType || "Unknown"}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Terrain</h3>
                        <p>{terrain.type}, {terrain.elevation} elevation</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Recommended Drilling Method</h3>
                        <p>{drillingMethod}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Time Estimation</h3>
                        <p>{timeEstimation}</p>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
              
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
