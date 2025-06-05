import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import MineralTag from '@/components/ui/MineralTag';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export type MineralType = "Copper" | "Gold" | "Silver" | "Cobalt" | "Manganese" | "Iron";

type SearchHistoryItem = {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
  depth: string;
  budget?: string;
  timestamp: Date;
  locationDetails: {
    name: string;
    country: string;
    rockType: string;
    confidenceRating: number;
  };
  costData: { name: string; cost: number; }[];
  costPerMeterData: { name: string; cost: number; }[];
  costRange: string;
  costPerMeterRange: string;
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
  budgetAnalysis?: {
    maxMeters: number;
    maxHoles: number;
  };
};

interface LocationData {
  name: string;
  country: string;
  rockType: string;
  confidenceRating: number;
}

interface CostItem {
  name: string;
  cost: number;
}

interface ResultsType {
  totalCost: number;
  costPerMeter: number;
  confidence: number;
  budgetAnalysis: {
    maxMeters: number;
    maxHoles: number;
    avgDepthPerHole: number;
  };
}

const mockLocationData: LocationData = {
  name: "Fictional Location",
  country: "Australia",
  rockType: "Sedimentary",
  confidenceRating: 7
};

const mockCostData: CostItem[] = [
  { name: "Labor", cost: 1500 },
  { name: "Equipment", cost: 800 },
  { name: "Fuel", cost: 300 },
];

const mockCostPerMeterData: CostItem[] = [
  { name: "Driller", cost: 30 },
  { name: "Assistant", cost: 20 },
  { name: "Maintenance", cost: 5 },
];

const DrillingCostEstimator: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    depth: '',
    budget: '',
    selectedMinerals: [] as MineralType[]
  });
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [results, setResults] = useState<ResultsType | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedMineral, setSelectedMineral] = useState<MineralType | ''>('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const savedHistory = localStorage.getItem('drillingSearchHistory');
    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory);
      setSearchHistory(parsedHistory);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMineral = () => {
    if (selectedMineral && !formData.selectedMinerals.includes(selectedMineral as MineralType)) {
      setFormData({
        ...formData,
        selectedMinerals: [...formData.selectedMinerals, selectedMineral as MineralType]
      });
      setSelectedMineral('');
    }
  };

  const handleRemoveMineral = (mineral: MineralType) => {
    setFormData({
      ...formData,
      selectedMinerals: formData.selectedMinerals.filter(m => m !== mineral)
    });
  };

  const calculateCostRange = (cost: number): string => {
    const lower = cost - (cost * 0.1);
    const upper = cost + (cost * 0.1);
    return `$${lower.toLocaleString()} - $${upper.toLocaleString()}`;
  };

  const calculateBudgetAnalysis = (totalCost: number, costPerMeter: number, budget: number, depth: number) => {
    const maxMeters = Math.floor(budget / costPerMeter);
    const avgDepthPerHole = 60; // Average depth for reverse circulation drilling
    const maxHoles = Math.floor(maxMeters / avgDepthPerHole);
    
    return {
      maxMeters,
      maxHoles,
      avgDepthPerHole
    };
  };

  const handleCalculate = () => {
    if (!formData.name || !formData.latitude || !formData.longitude || !formData.depth || !formData.budget) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsCalculating(true);

    // Simulate calculation delay
    setTimeout(() => {
      const depthValue = parseInt(formData.depth, 10);
      const baseCostPerMeter = 50;
      const geologicalComplexityFactor = 1.2;
      const mineralFactor = formData.selectedMinerals.length > 0 ? 1.1 : 1;
      const costPerMeterEstimate = baseCostPerMeter * geologicalComplexityFactor * mineralFactor;
      const totalCostEstimate = depthValue * costPerMeterEstimate;

      const costRange = calculateCostRange(totalCostEstimate);
      const costPerMeterRange = calculateCostRange(costPerMeterEstimate);

      const budgetAnalysis = calculateBudgetAnalysis(totalCostEstimate, costPerMeterEstimate, parseFloat(formData.budget), parseInt(formData.depth));

      const newSearchItem: SearchHistoryItem = {
        id: Date.now().toString(),
        name: formData.name,
        latitude: formData.latitude,
        longitude: formData.longitude,
        depth: formData.depth,
        budget: formData.budget,
        timestamp: new Date(),
        locationDetails: mockLocationData,
        costData: mockCostData,
        costPerMeterData: mockCostPerMeterData,
        costRange,
        costPerMeterRange,
        selectedMinerals: formData.selectedMinerals,
        costBreakdown: {
          labor: Math.round(totalCostEstimate * 0.6),
          hardware: Math.round(totalCostEstimate * 0.4),
        },
        drillingMethod: "Reverse Circulation",
        terrain: {
          type: "Rocky",
          elevation: `${Math.floor(Math.random() * 2000) + 500}m`
        },
        timeEstimation: `${Math.floor(Math.random() * 4) + 2}-${Math.floor(Math.random() * 3) + 4} weeks`,
        budgetAnalysis: {
          maxMeters: budgetAnalysis.maxMeters,
          maxHoles: budgetAnalysis.maxHoles
        }
      };

      const updatedHistory = [newSearchItem, ...searchHistory];
      setSearchHistory(updatedHistory);
      localStorage.setItem('drillingSearchHistory', JSON.stringify(updatedHistory));

      setResults({
        totalCost: totalCostEstimate,
        costPerMeter: costPerMeterEstimate,
        confidence: mockLocationData.confidenceRating,
        budgetAnalysis: {
          maxMeters: budgetAnalysis.maxMeters,
          maxHoles: budgetAnalysis.maxHoles,
          avgDepthPerHole: budgetAnalysis.avgDepthPerHole
        }
      });

      setIsCalculating(false);

      toast({
        title: "Calculation complete",
        description: "Drilling cost estimation has been calculated",
      });
    }, 1500);
  };

  const handleAddToProject = () => {
    // Retrieve existing projects from localStorage
    const savedProjects = localStorage.getItem('explorationProjects');
    const existingProjects = savedProjects ? JSON.parse(savedProjects) : [];

    // Create a new project object from the form data and results
    const newProject = {
      id: Date.now().toString(),
      name: formData.name,
      location: mockLocationData.name,
      country: mockLocationData.country,
      cost: results ? `$${results.totalCost.toLocaleString()}` : 'Not calculated',
      costRange: results ? calculateCostRange(results.totalCost) : 'Not calculated',
      npvRange: '$50M - $100M', // Example NPV range
      minerals: formData.selectedMinerals,
      createdDate: new Date().toISOString(),
      status: 'planning' // Default status
    };

    // Add the new project to the existing projects array
    const updatedProjects = [...existingProjects, newProject];

    // Save the updated projects array back to localStorage
    localStorage.setItem('explorationProjects', JSON.stringify(updatedProjects));

    toast({
      title: "Project added",
      description: "The drilling cost estimation has been added to your projects",
    });
  };

  const handleCompareSites = () => {
    navigate('/exploration-comparison');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline"
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
        <h1 className="text-3xl font-bold">Drilling Cost Estimator</h1>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h2 className="text-xl font-semibold mb-4">Exploration Site Details</h2>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Site Name</Label>
              <Input 
                type="text" 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                placeholder="Enter site name" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input 
                  type="number" 
                  id="latitude" 
                  name="latitude" 
                  value={formData.latitude} 
                  onChange={handleInputChange} 
                  placeholder="e.g. 45.1786" 
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input 
                  type="number" 
                  id="longitude" 
                  name="longitude" 
                  value={formData.longitude} 
                  onChange={handleInputChange} 
                  placeholder="e.g. -123.121" 
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="depth">Depth (meters)</Label>
              <Input 
                type="number" 
                id="depth" 
                name="depth" 
                value={formData.depth} 
                onChange={handleInputChange} 
                placeholder="Enter depth in meters" 
              />
            </div>
            
            <div>
              <Label htmlFor="budget">Budget (USD)</Label>
              <Input 
                type="number" 
                id="budget" 
                name="budget" 
                value={formData.budget} 
                onChange={handleInputChange} 
                placeholder="Enter budget in USD" 
              />
            </div>

            <div>
              <Label>Target Minerals</Label>
              <div className="flex gap-2">
                <Select value={selectedMineral} onValueChange={(value: string) => setSelectedMineral(value as MineralType | '')}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select mineral" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Copper">Copper</SelectItem>
                    <SelectItem value="Gold">Gold</SelectItem>
                    <SelectItem value="Silver">Silver</SelectItem>
                    <SelectItem value="Cobalt">Cobalt</SelectItem>
                    <SelectItem value="Manganese">Manganese</SelectItem>
                    <SelectItem value="Iron">Iron</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddMineral} type="button" disabled={!selectedMineral}>Add</Button>
              </div>
              
              {formData.selectedMinerals.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.selectedMinerals.map((mineral) => (
                    <div 
                      key={mineral} 
                      className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1"
                    >
                      <span>{mineral}</span>
                      <button 
                        onClick={() => handleRemoveMineral(mineral)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <Button 
              onClick={handleCalculate} 
              disabled={isCalculating}
              className="bg-mining-primary hover:bg-mining-secondary"
            >
              {isCalculating ? 'Calculating...' : 'Calculate Estimation'}
            </Button>
          </div>
        </div>

        {/* Location Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h2 className="text-xl font-semibold mb-4">Location Details</h2>
          <div className="grid gap-4">
            <div>
              <Label>Location Name</Label>
              <div className="px-4 py-2 rounded-md bg-gray-100 text-gray-700">{mockLocationData.name}</div>
            </div>
            <div>
              <Label>Country</Label>
              <div className="px-4 py-2 rounded-md bg-gray-100 text-gray-700">{mockLocationData.country}</div>
            </div>
            <div>
              <Label>Rock Type</Label>
              <div className="px-4 py-2 rounded-md bg-gray-100 text-gray-700">{mockLocationData.rockType}</div>
            </div>
            <div>
              <Label>Geological Confidence</Label>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-mining-primary h-2 rounded-full" 
                    style={{ width: `${(mockLocationData.confidenceRating / 10) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{mockLocationData.confidenceRating}/10</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="border rounded-lg p-6 bg-white shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Drilling Cost Estimation</h2>
            <div className="grid gap-4">
              <div>
                <Label>Total Cost</Label>
                <div className="text-2xl font-bold text-mining-primary">
                  ${results.totalCost.toLocaleString()}
                </div>
              </div>
              <div>
                <Label>Cost per Meter</Label>
                <div className="text-xl font-semibold text-gray-800">
                  ${results.costPerMeter.toLocaleString()}/m
                </div>
              </div>
              <div>
                <Label>Geological Confidence</Label>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-mining-primary h-2 rounded-full" 
                      style={{ width: `${(results.confidence / 10) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{results.confidence}/10</span>
                </div>
              </div>
            </div>
            
            {/* Budget Analysis */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-medium text-blue-800 mb-3">Budget Analysis</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-blue-700">Maximum meters:</span>
                  <span className="font-semibold text-blue-800">{results.budgetAnalysis.maxMeters.toLocaleString()}m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-700">Maximum holes:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-blue-800">{results.budgetAnalysis.maxHoles} holes</span>
                    <span className="text-xs text-blue-600 italic">
                      (based on reverse circulation drilling having an average depth of {results.budgetAnalysis.avgDepthPerHole}m)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Breakdown Chart */}
          <div className="border rounded-lg p-6 bg-white shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Cost Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={[
                  { name: 'Labor', value: Math.round(results.totalCost * 0.6) },
                  { name: 'Hardware', value: Math.round(results.totalCost * 0.4) },
                ]}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {results && (
        <div className="flex justify-between mt-6">
          <Button onClick={handleAddToProject} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Add to Project
          </Button>
          <Button onClick={handleCompareSites} variant="secondary">
            Compare Sites
          </Button>
        </div>
      )}

      {/* Search History */}
      {searchHistory.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Search History</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchHistory.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 border">
                <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                <p className="text-gray-600">{item.locationDetails.name}, {item.locationDetails.country}</p>
                <p className="text-sm text-gray-500">
                  {item.latitude}, {item.longitude} • {item.depth}m depth
                </p>
                <div className="mt-2">
                  <Badge variant="outline">
                    ${item.costRange}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-600 text-sm mb-2 block">Minerals:</span>
                  <div className="flex flex-wrap gap-1">
                    {item.selectedMinerals.map((mineral) => (
                      <MineralTag key={mineral} type={mineral} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DrillingCostEstimator;
