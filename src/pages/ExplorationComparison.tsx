import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Search, MapPin, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

// Define the SearchHistoryItem type to match drilling cost estimator
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
  selectedMinerals: string[];
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
  const navigate = useNavigate();
  const [drillingProjects, setDrillingProjects] = useState<SearchHistoryItem[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Load drilling projects from localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem('drillingSearchHistory');
    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects);
      setDrillingProjects(parsedProjects);
    }
  }, []);

  // Filter projects based on search term
  const filteredProjects = drillingProjects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.locationDetails.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.locationDetails.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle project selection (no limit)
  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjects(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId);
      } else {
        return [...prev, projectId];
      }
    });
  };

  // Get selected project data
  const selectedProjectData = selectedProjects.map(id => 
    drillingProjects.find(p => p.id === id)
  ).filter(Boolean) as SearchHistoryItem[];

  // Render project card component
  const ProjectCard = ({ project }: { project: SearchHistoryItem }) => (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2">{project.name}</h3>
          <div className="flex items-center gap-1 text-gray-600 mb-2">
            <MapPin className="h-4 w-4" />
            <span>{project.locationDetails.name}, {project.locationDetails.country}</span>
          </div>
          {/* Prominent cost per meter */}
          <div className="text-right mb-2">
            <span className="text-2xl font-bold text-mining-primary">
              {project.costPerMeterRange}/m
            </span>
            <p className="text-sm text-gray-500">Cost per meter</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Total cost:</span>
          <span className="font-semibold text-gray-800">{project.costRange}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Drilling depth:</span>
          <span className="font-semibold text-gray-800">{project.depth}m</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Budget:</span>
          <span className="font-semibold text-gray-800">${parseInt(project.budget || '0').toLocaleString()}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Method:</span>
          <span className="font-semibold text-green-600">{project.drillingMethod}</span>
        </div>
        
        <div>
          <span className="text-gray-600 text-sm mb-2 block">Mineral targets:</span>
          <div className="flex flex-wrap gap-1">
            {project.selectedMinerals.map((mineral) => (
              <span key={mineral} className="inline-block bg-mining-primary/20 text-mining-primary text-xs px-2 py-1 rounded-md">
                {mineral}
              </span>
            ))}
          </div>
        </div>
        
        <div className="pt-2 border-t border-gray-100">
          <span className="text-sm text-gray-500">
            Created: {new Date(project.timestamp).toLocaleDateString('en-GB')}
          </span>
        </div>
      </div>
    </div>
  );

  // Render selected projects with unlimited support
  const renderSelectedProjects = () => {
    if (selectedProjectData.length === 0) {
      return (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">Select drilling sites from the search history to compare them</p>
        </div>
      );
    }

    // Group projects in rows of 3
    const projectRows = [];
    for (let i = 0; i < selectedProjectData.length; i += 3) {
      projectRows.push(selectedProjectData.slice(i, i + 3));
    }

    return (
      <div className="space-y-6">
        {projectRows.map((rowProjects, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rowProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2">Compare Drilling Sites</h1>
            <p className="text-gray-600">Select drilling sites to compare their key metrics and details</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar - Search History */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Drilling History</h2>
            
            {/* Search input */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search drilling sites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Project list */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredProjects.map((project) => (
                <div 
                  key={project.id}
                  className={`p-3 rounded-md border cursor-pointer transition-colors ${
                    selectedProjects.includes(project.id)
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => toggleProjectSelection(project.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{project.name}</h3>
                      <p className="text-xs text-gray-600 truncate">{project.locationDetails.name}, {project.locationDetails.country}</p>
                      <p className="text-xs text-mining-primary font-semibold">
                        {project.costPerMeterRange}/m
                      </p>
                    </div>
                    <div className="ml-2">
                      <input
                        type="checkbox"
                        checked={selectedProjects.includes(project.id)}
                        onChange={() => toggleProjectSelection(project.id)}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredProjects.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No drilling sites found matching your search.
                </p>
              )}
            </div>
            
            {selectedProjects.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">
                  Selected: {selectedProjects.length} sites
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProjects([])}
                  className="w-full"
                >
                  Clear Selection
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right content - Comparison */}
        <div className="lg:col-span-3">
          {renderSelectedProjects()}
        </div>
      </div>
    </div>
  );
};

export default ExplorationComparison;
