
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import MineralTag from '@/components/ui/MineralTag';
import { MineralType } from './DrillingCostEstimator';
import { Checkbox } from '@/components/ui/checkbox';

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

const ExplorationComparison: React.FC = () => {
  const [allSites, setAllSites] = useState<SearchHistoryItem[]>([]);
  const [selectedSiteIds, setSelectedSiteIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const savedHistory = localStorage.getItem('drillingSearchHistory');
    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory);
      setAllSites(parsedHistory);
      // Select all sites by default
      setSelectedSiteIds(new Set(parsedHistory.map((site: SearchHistoryItem) => site.id)));
    }
  }, []);

  const handleToggleSite = (siteId: string) => {
    setSelectedSiteIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(siteId)) {
        newSet.delete(siteId);
      } else {
        newSet.add(siteId);
      }
      return newSet;
    });
  };

  const selectedSites = allSites.filter(site => selectedSiteIds.has(site.id));

  const formatDate = (timestamp: Date): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-GB');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline"
          onClick={() => navigate('/drilling-cost-estimator')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Estimator
        </Button>
        <h1 className="text-3xl font-bold">Compare Exploration Sites</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Search History Column */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Search History</h2>
            <div className="space-y-3">
              {allSites.map((site) => (
                <div key={site.id} className="flex items-start gap-3 p-3 border rounded-md hover:bg-gray-50">
                  <Checkbox
                    checked={selectedSiteIds.has(site.id)}
                    onCheckedChange={() => handleToggleSite(site.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{site.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{site.locationDetails.name}</p>
                    <p className="text-xs text-gray-400">{formatDate(site.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison Sites */}
        <div className="lg:col-span-3">
          {selectedSites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedSites.map((site) => (
                <div key={site.id} className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold">{site.name}</h3>
                      <div className="text-right">
                        <span className="text-lg font-bold text-mining-primary">{site.costPerMeterRange}/m</span>
                        <p className="text-xs text-gray-500">Cost per meter</p>
                      </div>
                    </div>
                    <p className="text-gray-600">{site.locationDetails.name}, {site.locationDetails.country}</p>
                    <p className="text-sm text-gray-500">
                      {site.latitude}, {site.longitude} • {site.depth}m depth
                    </p>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total cost:</span>
                      <span className="font-semibold text-gray-800">{site.costRange}</span>
                    </div>

                    {site.budgetAnalysis && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Max meters:</span>
                          <span className="font-semibold text-blue-600">{site.budgetAnalysis.maxMeters.toLocaleString()}m</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Max holes:</span>
                          <span className="font-semibold text-blue-600">{site.budgetAnalysis.maxHoles} holes</span>
                        </div>
                      </>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Confidence:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-mining-primary h-2 rounded-full" 
                            style={{ width: `${(site.locationDetails.confidenceRating / 10) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{site.locationDetails.confidenceRating}/10</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Rock type:</span>
                      <span className="text-sm font-medium">{site.locationDetails.rockType}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Method:</span>
                      <span className="text-sm font-medium">{site.drillingMethod}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Time estimate:</span>
                      <span className="text-sm font-medium">{site.timeEstimation}</span>
                    </div>

                    <div>
                      <span className="text-gray-600 text-sm mb-2 block">Minerals:</span>
                      <div className="flex flex-wrap gap-1">
                        {site.selectedMinerals.map((mineral) => (
                          <MineralTag key={mineral} type={mineral} />
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-sm text-gray-500">Created: {formatDate(site.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No exploration sites selected for comparison.</p>
              <p className="text-gray-400 mt-2">Select sites from the search history to compare them!</p>
            </div>
          )}
        </div>
      </div>

      {allSites.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No exploration sites to compare yet.</p>
          <p className="text-gray-400 mt-2">Create some drilling cost estimates first!</p>
        </div>
      )}
    </div>
  );
};

export default ExplorationComparison;
