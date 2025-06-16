
import React, { useState, useEffect } from 'react';
import { ProjectData } from '@/components/ProjectCard';
import MineralTag from '@/components/ui/MineralTag';
import { Button } from '@/components/ui/button';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';

const ExplorationComparison: React.FC = () => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Load projects from localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem('explorationProjects');
    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects);
      setProjects(parsedProjects);
    }
  }, []);

  // Filter projects based on search term
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle project selection (max 3)
  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjects(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId);
      } else if (prev.length < 3) {
        return [...prev, projectId];
      }
      return prev; // Don't add if already at max
    });
  };

  // Get selected project data
  const selectedProjectData = selectedProjects.map(id => 
    projects.find(p => p.id === id)
  ).filter(Boolean) as ProjectData[];

  // Format currency
  const formatCurrency = (value: string): string => {
    return value;
  };

  // Get updated NPV from localStorage if it exists
  const getUpdatedNPV = (project: ProjectData) => {
    const savedMetrics = localStorage.getItem(`projectMetrics_${project.id}`);
    if (savedMetrics) {
      const metrics = JSON.parse(savedMetrics);
      const formatCurrency = (value: number): string => {
        if (value >= 1000000) {
          return `$${(value / 1000000).toFixed(1)}M`;
        }
        return `$${value.toLocaleString()}`;
      };
      return formatCurrency(metrics.npv);
    }
    return project.npvRange || 'Not calculated';
  };

  // Render first 3 selected projects side by side, rest below
  const renderSelectedProjects = () => {
    if (selectedProjectData.length === 0) {
      return (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">Select up to 3 sites from the search history to compare them</p>
        </div>
      );
    }

    const topRowProjects = selectedProjectData.slice(0, 3);
    const bottomRowProjects = selectedProjectData.slice(3);

    return (
      <div className="space-y-6">
        {/* Top row - up to 3 projects side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topRowProjects.map((project) => (
            <div key={project.id} className="border rounded-lg p-6 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{project.name}</h3>
                  <div className="flex items-center gap-1 text-gray-600 mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>{project.location}, {project.country}</span>
                  </div>
                  {/* Prominent cost per meter */}
                  <div className="text-right mb-2">
                    <span className="text-2xl font-bold text-mining-primary">
                      {project.costPerMeter || '$245/m'}
                    </span>
                    <p className="text-sm text-gray-500">Cost per meter</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Project NPV:</span>
                  <span className="font-semibold text-gray-800">{getUpdatedNPV(project)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Drilling cost:</span>
                  <span className="font-semibold text-gray-800">{project.cost}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold text-green-600">
                    {project.fromDrillingEstimator ? 'In progress' : 'Planned'}
                  </span>
                </div>
                
                <div>
                  <span className="text-gray-600 text-sm mb-2 block">Mineral targets:</span>
                  <div className="flex flex-wrap gap-1">
                    {project.minerals.map((mineral) => (
                      <MineralTag key={mineral} type={mineral} />
                    ))}
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-sm text-gray-500">
                    Created: {new Date(project.createdDate).toLocaleDateString('en-GB')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom row - additional projects if more than 3 selected */}
        {bottomRowProjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bottomRowProjects.map((project) => (
              <div key={project.id} className="border rounded-lg p-6 bg-white shadow-sm">
                {/* Same content as above */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{project.name}</h3>
                    <div className="flex items-center gap-1 text-gray-600 mb-2">
                      <MapPin className="h-4 w-4" />
                      <span>{project.location}, {project.country}</span>
                    </div>
                    <div className="text-right mb-2">
                      <span className="text-2xl font-bold text-mining-primary">
                        {project.costPerMeter || '$245/m'}
                      </span>
                      <p className="text-sm text-gray-500">Cost per meter</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Project NPV:</span>
                    <span className="font-semibold text-gray-800">{getUpdatedNPV(project)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Drilling cost:</span>
                    <span className="font-semibold text-gray-800">{project.cost}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-semibold text-green-600">
                      {project.fromDrillingEstimator ? 'In progress' : 'Planned'}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 text-sm mb-2 block">Mineral targets:</span>
                    <div className="flex flex-wrap gap-1">
                      {project.minerals.map((mineral) => (
                        <MineralTag key={mineral} type={mineral} />
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-sm text-gray-500">
                      Created: {new Date(project.createdDate).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Compare Exploration Sites</h1>
        <p className="text-gray-600">Select up to 3 sites to compare their key metrics and details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar - Search History */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Search History</h2>
            
            {/* Search input */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search sites..."
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
                      <p className="text-xs text-gray-600 truncate">{project.location}, {project.country}</p>
                      <p className="text-xs text-mining-primary font-semibold">
                        {project.costPerMeter || '$245/m'}
                      </p>
                    </div>
                    <div className="ml-2">
                      <input
                        type="checkbox"
                        checked={selectedProjects.includes(project.id)}
                        onChange={() => toggleProjectSelection(project.id)}
                        disabled={!selectedProjects.includes(project.id) && selectedProjects.length >= 3}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredProjects.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No sites found matching your search.
                </p>
              )}
            </div>
            
            {selectedProjects.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">
                  Selected: {selectedProjects.length}/3 sites
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
