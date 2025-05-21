
import React from 'react';
import MineralTag from './ui/MineralTag';

export interface ProjectData {
  id: string;
  name: string;
  location: string;
  country: string;
  npv: number;
  minerals: Array<'Copper' | 'Gold' | 'Silver' | 'Cobalt' | 'Manganese'>;
  createdDate: string;
}

interface ProjectCardProps {
  project: ProjectData;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const formatCurrency = (value: number): string => {
    return `$${value.toFixed(1)}M`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-xl font-bold mb-2">{project.name}</h3>
      <p className="text-gray-600 mb-4">{project.location}, {project.country}</p>
      
      <div className="flex items-center mb-4">
        <span className="text-gray-500 mr-2">Net Present Value:</span>
        <span className="font-semibold text-lg text-mining-primary">{formatCurrency(project.npv)}</span>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {project.minerals.map((mineral) => (
          <MineralTag key={mineral} type={mineral} />
        ))}
      </div>
      
      <div className="flex justify-between items-center mt-6">
        <span className="text-sm text-gray-500">Created: {formatDate(project.createdDate)}</span>
        <button className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded transition-colors">
          Open
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
