
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
  cost: string; // Changed from npv to cost
  minerals: MineralType[];
  createdDate: string;
  status?: 'in progress' | 'completed'; // Added status
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
    navigate('/drilling-cost-estimator'); // Navigate to estimator when opening a project
  };

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-bold">{project.name}</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-gray-500 hover:text-red-500" 
          onClick={handleDelete}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
      <p className="text-gray-600 mb-4">{project.location}, {project.country}</p>
      
      <div className="flex items-center mb-4">
        <span className="text-gray-500 mr-2">Estimated Cost:</span>
        <span className="font-semibold text-lg text-mining-primary">{project.cost}</span>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {project.minerals.map((mineral) => (
          <MineralTag key={mineral} type={mineral} />
        ))}
      </div>
      
      <div className="flex justify-between items-center mt-6">
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">Created: {formatDate(project.createdDate)}</span>
          {project.status && (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
              {project.status}
            </span>
          )}
        </div>
        <button 
          className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded transition-colors"
          onClick={handleOpen}
        >
          Open
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
