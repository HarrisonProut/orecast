
import React from 'react';
import MineralTag from './ui/MineralTag';
import { MineralType } from '@/pages/DrillingCostEstimator';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export interface ProjectData {
  id: string;
  name: string;
  location: string;
  country: string;
  cost: string; // Drilling cost
  costPerMeter?: string; // Cost per meter for drilling estimator projects
  costRange?: string; // Added costRange
  npvRange?: string; // Added npvRange
  minerals: MineralType[];
  createdDate: string;
  status?: 'in progress' | 'completed' | 'planning' | 'N/A'; // Extended status options
  fromDrillingEstimator?: boolean; // Track if created from drilling cost estimator
}

interface ProjectCardProps {
  project: ProjectData;
  onDelete: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(project.id);
  };

  const handleOpen = () => {
    // Navigate to the project details page with the project id
    navigate(`/project/${project.id}`);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'in progress':
        return 'text-green-600';
      case 'completed':
        return 'text-blue-600';
      case 'planning':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  // Get updated NPV from localStorage if it exists
  const getUpdatedNPV = () => {
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

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2">{project.name}</h3>
          <p className="text-gray-600">{project.location}, {project.country}</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-gray-500 hover:text-red-500" 
          onClick={handleDelete}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="space-y-3 mb-4">
        {/* Project NPV */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Project NPV:</span>
          <span className="font-semibold text-gray-800">{getUpdatedNPV()}</span>
        </div>
        
        {/* Drilling Cost */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Drilling cost:</span>
          <div className="text-right">
            <span className="font-semibold text-gray-800">{project.cost}</span>
            {project.fromDrillingEstimator && project.costPerMeter && (
              <div className="text-sm text-gray-600">{project.costPerMeter}/m</div>
            )}
          </div>
        </div>
        
        {/* Drilling Operations Status */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Drilling operations:</span>
          {project.fromDrillingEstimator ? (
            <span className={`font-semibold ${getStatusColor('in progress')}`}>
              In progress
            </span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
        
        {/* Minerals */}
        <div>
          <span className="text-gray-600 text-sm mb-2 block">Mineral targets:</span>
          <div className="flex flex-wrap gap-1">
            {project.minerals.map((mineral) => (
              <MineralTag key={mineral} type={mineral} />
            ))}
          </div>
        </div>
        
        {/* Created Date */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-sm text-gray-500">Created: {formatDate(project.createdDate)}</span>
          <button 
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded transition-colors text-sm"
            onClick={handleOpen}
          >
            Open
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
