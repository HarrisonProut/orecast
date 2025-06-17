
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing credentials",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }

    // Simple validation - in a real app this would connect to authentication
    if (email && password) {
      localStorage.setItem('isLoggedIn', 'true');
      navigate('/');
      toast({
        title: "Login successful",
        description: "Welcome to the exploration platform",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src="/lovable-uploads/c290c526-3753-49a8-85f5-11913f94f53c.png" 
                alt="Geognosis OreCast" 
                className="h-10"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600 mt-2">Sign in to your ROI facilitator</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="mt-1"
              />
            </div>
            
            <Button type="submit" className="w-full bg-mining-primary hover:bg-mining-secondary">
              Sign In
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            Demo: Use any email and password to login
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-4 bg-white border-t border-gray-200">
        <div className="container mx-auto flex justify-center">
          <img 
            src="/lovable-uploads/6f649b14-e4cc-4507-8e7c-f01855797ce5.png" 
            alt="Footer Logo" 
            className="h-10"
          />
        </div>
      </footer>
    </div>
  );
};

export default Login;
