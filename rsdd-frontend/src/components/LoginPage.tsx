import { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface LoginPageProps {
  onLogin: (username: string, password: string, userType: 'admin' | 'dean' | 'director') => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'admin' | 'dean' | 'director'>('admin');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      onLogin(username, password, userType);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1a2332] rounded-lg p-8 border border-[#2a3544]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#2463eb] rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-white text-center mb-2">RSDD System</h1>
          <p className="text-[#8b94a8] text-center">Reminder System for Dean & Director</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="userType" className="text-white mb-2 block">
              User Type
            </Label>
            <select
              id="userType"
              value={userType}
              onChange={(e) => setUserType(e.target.value as 'admin' | 'dean' | 'director')}
              className="w-full bg-[#0f1621] border border-[#2a3544] text-white rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-[#2463eb] focus:border-transparent"
            >
              <option value="admin">Admin</option>
              <option value="dean">Dean</option>
              <option value="director">Director</option>
            </select>
          </div>

          <div>
            <Label htmlFor="username" className="text-white mb-2 block">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-[#0f1621] border-[#2a3544] text-white placeholder:text-[#4a5568]"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-white mb-2 block">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#0f1621] border-[#2a3544] text-white placeholder:text-[#4a5568]"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#2463eb] hover:bg-[#1d4ed8] text-white"
          >
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}