
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <nav className="border-b border-gray-200 bg-white py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-mining-primary p-2 rounded-full">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-mining-primary">OreCast</span>
        </Link>
        
        <div className="flex gap-6 items-center">
          <Link 
            to="/" 
            className="text-gray-700 hover:text-mining-primary font-medium transition-colors"
          >
            Home Page
          </Link>
          <Link 
            to="/drilling-cost-estimator" 
            className="text-gray-700 hover:text-mining-primary font-medium transition-colors"
          >
            Drilling Cost Estimator
          </Link>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSignOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

