import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Login } from "@/pages/Login";
import { ReportIssue } from "@/pages/ReportIssue";
import { CitizenDashboard } from "@/pages/CitizenDashboard";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { mockReports } from "@/services/mockData";
import { Report } from "@/types";

interface User {
  id: string;
  name: string;
  role: "citizen" | "staff";
}

const Index = () => {
  const [currentPage, setCurrentPage] = useState<string>("home");
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>(mockReports);
  const { toast } = useToast();


  const handleLogin = (userData: User) => {
    setUser(userData);
    if (userData.role === "citizen") {
      setCurrentPage("dashboard");
    } else {
      setCurrentPage("admin");
    }
    toast({
      title: "Welcome back!",
      description: `Signed in as ${userData.name}`,
    });
  };

  const handleNavigate = (page: string) => {
    if (page === "home") {
      setUser(null);
      setCurrentPage("home");
    } else if ((page === "report" || page === "dashboard") && !user) {
      setCurrentPage("login");
    } else if (page === "admin" && user?.role !== "staff") {
      setCurrentPage("login");
    } else {
      setCurrentPage(page);
    }
  };

  const handleReportSubmitted = (newReport: Report) => {
    setReports(prev => [newReport, ...prev]);
    setCurrentPage("dashboard");
    toast({
      title: "Report Submitted Successfully!",
      description: `Your report #${newReport.id} has been submitted and will be reviewed by government staff.`,
    });
  };

  const handleUpdateReport = (reportId: string, updates: Partial<Report>) => {
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, ...updates }
        : report
    ));
    toast({
      title: "Report Updated",
      description: `Report #${reportId} has been updated successfully.`,
    });
  };

  const renderPage = () => {
    switch (currentPage) {
      case "login":
        return <Login onLogin={handleLogin} />;
      
      case "report":
        return user ? (
          <ReportIssue 
            userId={user.id} 
            onReportSubmitted={handleReportSubmitted}
          />
        ) : null;
      
      case "dashboard":
        return user && user.role === "citizen" ? (
          <CitizenDashboard 
            reports={reports} 
            userId={user.id}
            onNavigate={handleNavigate}
          />
        ) : null;
      
      case "admin":
        return user && user.role === "staff" ? (
          <AdminDashboard 
            reports={reports}
            onUpdateReport={handleUpdateReport}
          />
        ) : null;
      
      default:
        return <Hero onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        userRole={user?.role || null} 
        onNavigate={handleNavigate}
        currentPage={currentPage}
      />
      <main className="pb-8">
        {renderPage()}
      </main>
      <Toaster />
    </div>
  );
};

export default Index;
