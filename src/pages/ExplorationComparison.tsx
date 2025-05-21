
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MineralType } from './DrillingCostEstimator';

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

const ExplorationComparison: React.FC = () => {
  const [siteHistory, setSiteHistory] = useState<ComparisonSiteItem[]>([]);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const navigate = useNavigate();

  // Load site history from localStorage for this demo
  // In a real app, you would likely have a more persistent storage
  useEffect(() => {
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
  }, []);

  const toggleSiteSelection = (siteId: string) => {
    if (selectedSites.includes(siteId)) {
      setSelectedSites(selectedSites.filter(id => id !== siteId));
    } else {
      setSelectedSites([...selectedSites, siteId]);
    }
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
                  className={`border p-4 rounded-md cursor-pointer transition-colors ${
                    selectedSites.includes(site.id) 
                      ? 'border-mining-primary bg-mining-primary/10' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleSiteSelection(site.id)}
                >
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
                    <td className="p-3 font-medium">Target Minerals</td>
                    {selectedSites.map(siteId => {
                      const site = siteHistory.find(s => s.id === siteId);
                      return site ? (
                        <td key={site.id} className="p-3">
                          {site.selectedMinerals.length > 0 
                            ? site.selectedMinerals.join(', ')
                            : 'None specified'}
                        </td>
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
                <p className="text-sm text-gray-400 mt-2">You can select multiple sites to view side by side</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExplorationComparison;
