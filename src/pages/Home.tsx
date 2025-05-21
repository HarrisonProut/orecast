import React, { useState, useEffect } from 'react';
import ProjectCard, { ProjectData } from '@/components/ProjectCard';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const navigate = useNavigate();
  
  // Load projects from localStorage on initial load
  useEffect(() => {
    const savedProjects = localStorage.getItem('explorationProjects');
    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects);
      setProjects(parsedProjects);
    }
  }, []);

  const handleAddProject = () => {
    // Keep this button empty as requested
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Exploration Projects</h1>
        <Button className="bg-mining-primary hover:bg-mining-secondary" onClick={handleAddProject}>
          <Plus className="mr-2 h-4 w-4" /> Add Project
        </Button>
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No projects yet. Use the Drilling Cost Estimator to create new projects.</p>
        </div>
      )}
    </div>
  );
};

export default Home;
