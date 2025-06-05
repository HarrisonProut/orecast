
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Layers } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-mining-primary p-3 rounded-full">
              <Layers className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-mining-primary mb-2">OreCast</div>
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
  );
};

export default Login;
