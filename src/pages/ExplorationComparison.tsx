
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MineralType } from './DrillingCostEstimator';
import MineralTag from '@/components/ui/MineralTag';
import { useToast } from '@/hooks/use-toast';

type ComparisonSiteItem = {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
  depth: string;
  locationDetails: {
    name: string;
    country: string;
    rockType: string;
    confidenceRating: number;
  };
  costRange: string;
  selectedMinerals: MineralType[];
  drillingMethod: string;
  terrain: {
    type: string;
    elevation: string;
  };
  timeEstimation: string;
  selected: boolean;
};

const MAX_SIDE_BY_SIDE_COMPARISON = 4;

const ExplorationComparison: React.FC = () => {
  const [siteHistory, setSiteHistory] = useState<ComparisonSiteItem[]>([]);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load site history from localStorage for this demo
  // In a real app, you would likely have a more persistent storage
  useEffect(() => {
    const loadSites = () => {
      const savedHistory = localStorage.getItem('drillingSearchHistory');
      if (savedHistory) {
        try {
          const parsedHistory = JSON.parse(savedHistory);
          const formattedHistory = parsedHistory.map((site: any) => ({
            ...site,
            selected: false,
          }));
          setSiteHistory(formattedHistory);
        } catch (error) {
          console.error("Error parsing drilling history:", error);
        }
      }
    };
    
    loadSites();
    
    // Set up listener to refresh data when localStorage changes
    const handleStorageChange = () => {
      loadSites();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // This is a workaround to detect localStorage changes in the same tab
    // We'll check for updates every 2 seconds
    const interval = setInterval(loadSites, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const toggleSiteSelection = (siteId: string) => {
    if (selectedSites.includes(siteId)) {
      setSelectedSites(selectedSites.filter(id => id !== siteId));
    } else {
      if (selectedSites.length < MAX_SIDE_BY_SIDE_COMPARISON) {
        setSelectedSites([...selectedSites, siteId]);
      } else {
        toast({
          title: "Maximum sites selected",
          description: `You can only compare up to ${MAX_SIDE_BY_SIDE_COMPARISON} sites side by side.`,
          variant: "destructive"
        });
      }
    }
  };

  const handleDeleteSite = (siteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Remove from selected sites if it's selected
    if (selectedSites.includes(siteId)) {
      setSelectedSites(selectedSites.filter(id => id !== siteId));
    }
    
    // Remove from history
    const updatedHistory = siteHistory.filter(site => site.id !== siteId);
    setSiteHistory(updatedHistory);
    
    // Update localStorage
    localStorage.setItem('drillingSearchHistory', JSON.stringify(updatedHistory));
    
    toast({
      title: "Site removed",
      description: "The site has been removed from your search history",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-center">
        <Button 
          variant="ghost" 
          className="mr-4"
          onClick={() => navigate('/drilling-cost-estimator')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h1 className="text-3xl font-bold">Exploration Site Comparison</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel - Site list */}
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Available Sites</h2>
          
          <div className="space-y-2 h-[calc(100vh-220px)] overflow-y-auto">
            {siteHistory.length > 0 ? (
              siteHistory.map((site) => (
                <div 
                  key={site.id}
                  className={`border p-4 rounded-md cursor-pointer transition-colors relative ${
                    selectedSites.includes(site.id) 
                      ? 'border-mining-primary bg-mining-primary/10' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleSiteSelection(site.id)}
                >
                  <div className="absolute top-2 right-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-gray-400 hover:text-red-500" 
                      onClick={(e) => handleDeleteSite(site.id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <h3 className="font-medium">{site.name}</h3>
                  <p className="text-sm text-gray-600">{site.locationDetails.name}, {site.locationDetails.country}</p>
                  <div className="mt-2 text-xs text-gray-500 flex justify-between">
                    <span>Depth: {site.depth}m</span>
                    <span>Cost: {site.costRange}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">No exploration sites available</p>
                <p className="text-sm text-gray-400 mt-2">
                  Create sites using the Drilling Cost Estimator
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right panel - Comparison view */}
        <div className="border rounded-lg p-6 bg-white shadow-sm lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Comparison View</h2>
          
          {selectedSites.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left">Metrics</th>
                    {selectedSites.map(siteId => {
                      const site = siteHistory.find(s => s.id === siteId);
                      return site ? (
                        <th key={site.id} className="p-3 text-left">{site.name}</th>
                      ) : null;
                    })}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Location</td>
                    {selectedSites.map(siteId => {
                      const site = siteHistory.find(s => s.id === siteId);
                      return site ? (
                        <td key={site.id} className="p-3">
                          {site.locationDetails.name}, {site.locationDetails.country}
                        </td>
                      ) : null;
                    })}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Coordinates</td>
                    {selectedSites.map(siteId => {
                      const site = siteHistory.find(s => s.id === siteId);
                      return site ? (
                        <td key={site.id} className="p-3">
                          {site.latitude}, {site.longitude}
                        </td>
                      ) : null;
                    })}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Target Minerals</td>
                    {selectedSites.map(siteId => {
                      const site = siteHistory.find(s => s.id === siteId);
                      return site ? (
                        <td key={site.id} className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {site.selectedMinerals.length > 0 ? 
                              site.selectedMinerals.map(mineral => (
                                <MineralTag key={mineral} type={mineral} />
                              ))
                            : 'None specified'}
                          </div>
                        </td>
                      ) : null;
                    })}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Depth</td>
                    {selectedSites.map(siteId => {
                      const site = siteHistory.find(s => s.id === siteId);
                      return site ? (
                        <td key={site.id} className="p-3">{site.depth}m</td>
                      ) : null;
                    })}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Cost Range</td>
                    {selectedSites.map(siteId => {
                      const site = siteHistory.find(s => s.id === siteId);
                      return site ? (
                        <td key={site.id} className="p-3 font-medium text-mining-primary">{site.costRange}</td>
                      ) : null;
                    })}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Rock Type</td>
                    {selectedSites.map(siteId => {
                      const site = siteHistory.find(s => s.id === siteId);
                      return site ? (
                        <td key={site.id} className="p-3">{site.locationDetails.rockType}</td>
                      ) : null;
                    })}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Confidence Rating</td>
                    {selectedSites.map(siteId => {
                      const site = siteHistory.find(s => s.id === siteId);
                      return site ? (
                        <td key={site.id} className="p-3">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-mining-primary h-2.5 rounded-full" 
                              style={{ width: `${(site.locationDetails?.confidenceRating || 7) * 10}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {site.locationDetails?.confidenceRating || 7}/10
                          </span>
                        </td>
                      ) : null;
                    })}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Terrain</td>
                    {selectedSites.map(siteId => {
                      const site = siteHistory.find(s => s.id === siteId);
                      return site ? (
                        <td key={site.id} className="p-3">
                          {site.terrain?.type}, {site.terrain?.elevation}
                        </td>
                      ) : null;
                    })}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Drilling Method</td>
                    {selectedSites.map(siteId => {
                      const site = siteHistory.find(s => s.id === siteId);
                      return site ? (
                        <td key={site.id} className="p-3">{site.drillingMethod}</td>
                      ) : null;
                    })}
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Time Estimation</td>
                    {selectedSites.map(siteId => {
                      const site = siteHistory.find(s => s.id === siteId);
                      return site ? (
                        <td key={site.id} className="p-3">{site.timeEstimation}</td>
                      ) : null;
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-60 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500">Select sites from the left panel to compare</p>
                <p className="text-sm text-gray-400 mt-2">You can select up to {MAX_SIDE_BY_SIDE_COMPARISON} sites to view side by side</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExplorationComparison;
