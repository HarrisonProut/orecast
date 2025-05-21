
import React from 'react';
import ProjectCard, { ProjectData } from '@/components/ProjectCard';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Home: React.FC = () => {
  // Sample project data
  const projects: ProjectData[] = [
    {
      id: '1',
      name: 'Copper Mountain Exploration',
      location: 'British Columbia',
      country: 'Canada',
      npv: 245.5,
      minerals: ['Copper'],
      createdDate: '2023-12-04',
    },
    {
      id: '2',
      name: 'Golden Valley Project',
      location: 'Nevada',
      country: 'United States',
      npv: 156.8,
      minerals: ['Gold'],
      createdDate: '2023-08-28',
    },
    {
      id: '3',
      name: 'Silver Peak Development',
      location: 'Western Australia',
      country: 'Australia',
      npv: 387.2,
      minerals: ['Silver', 'Gold'],
      createdDate: '2023-05-02',
    },
    {
      id: '4',
      name: 'Atacama Lithium Project',
      location: 'Antofagasta',
      country: 'Chile',
      npv: 423.6,
      minerals: ['Cobalt', 'Manganese'],
      createdDate: '2023-04-19',
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Exploration Projects</h1>
        <Button className="bg-mining-primary hover:bg-mining-secondary">
          <Plus className="mr-2 h-4 w-4" /> Add Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};

export default Home;
