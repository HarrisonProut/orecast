
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
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
        <Link to="/" className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/c290c526-3753-49a8-85f5-11913f94f53c.png" 
            alt="Geognosis OreCast" 
            className="h-8"
          />
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
