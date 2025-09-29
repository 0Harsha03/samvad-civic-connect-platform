import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, User, Shield } from "lucide-react";
import { mockUsers } from "@/services/mockData";

interface LoginProps {
  onLogin: (user: { id: string; name: string; role: "citizen" | "staff" }) => void;
}

export const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (role: "citizen" | "staff") => {
    setIsLoading(true);
    
    // Simulate authentication
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockUser = mockUsers.find(user => user.role === role);
    if (mockUser) {
      onLogin({
        id: mockUser.id,
        name: mockUser.name,
        role: mockUser.role
      });
    }
    
    setIsLoading(false);
  };

  const quickLogin = (role: "citizen" | "staff") => {
    const mockUser = mockUsers.find(user => user.role === role);
    if (mockUser) {
      onLogin({
        id: mockUser.id,
        name: mockUser.name,
        role: mockUser.role
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">Samvad</span>
          </div>
          <p className="text-muted-foreground">Sign in to report civic issues</p>
        </div>

        <Tabs defaultValue="citizen" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="citizen" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Citizen
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Government Staff
            </TabsTrigger>
          </TabsList>

          <TabsContent value="citizen">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Citizen Login
                </CardTitle>
                <CardDescription>
                  Access your civic reporting dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="citizen-email">Email</Label>
                  <Input
                    id="citizen-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="citizen-password">Password</Label>
                  <Input
                    id="citizen-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full" 
                  variant="civic"
                  onClick={() => handleLogin("citizen")}
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In as Citizen"}
                </Button>
                
                {/* Quick Demo Login */}
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-2 text-center">Demo Access:</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={() => quickLogin("citizen")}
                  >
                    Quick Demo as Priya Sharma
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-secondary" />
                  Government Staff Login
                </CardTitle>
                <CardDescription>
                  Access the administrative dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="staff-email">Official Email</Label>
                  <Input
                    id="staff-email"
                    type="email"
                    placeholder="staff@gov.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-password">Password</Label>
                  <Input
                    id="staff-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full" 
                  variant="secondary"
                  onClick={() => handleLogin("staff")}
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In as Staff"}
                </Button>

                {/* Quick Demo Login */}
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-2 text-center">Demo Access:</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={() => quickLogin("staff")}
                  >
                    Quick Demo as Rajesh Kumar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Sign up link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button className="text-primary hover:underline">
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};