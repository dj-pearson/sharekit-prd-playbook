import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, TrendingUp, Users, Eye, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">Here's what's happening with your shares</p>
        </div>
        <Button 
          asChild
          className="bg-gradient-ocean hover:opacity-90 transition-opacity"
        >
          <Link to="/dashboard/pages/create">
            <Plus className="w-4 h-4 mr-2" />
            New Page
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Views</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Eye className="w-4 h-4 mr-1" />
              Last 30 days
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Signups</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="w-4 h-4 mr-1" />
              Last 30 days
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Signup Rate</CardDescription>
            <CardTitle className="text-3xl">0%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4 mr-1" />
              Last 30 days
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      <Card>
        <CardContent className="py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-ocean/10 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Create your first page</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Build a landing page, add resources, and start collecting emails
          </p>
          <Button 
            asChild
            className="bg-gradient-ocean hover:opacity-90 transition-opacity"
          >
            <Link to="/dashboard/pages/create">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Page
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Quick steps to start sharing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-semibold">
                1
              </div>
              <div>
                <div className="font-medium mb-1">Create a landing page</div>
                <p className="text-sm text-muted-foreground">
                  Choose a template and customize it to match your brand
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-semibold">
                2
              </div>
              <div>
                <div className="font-medium mb-1">Add your resources</div>
                <p className="text-sm text-muted-foreground">
                  Upload PDFs, guides, or any files you want to share
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-semibold">
                3
              </div>
              <div>
                <div className="font-medium mb-1">Publish and share</div>
                <p className="text-sm text-muted-foreground">
                  Get your unique link and start collecting email signups
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Dashboard;
