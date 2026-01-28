import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { Header } from "./components/Header";
import { LoginPage } from "./components/LoginPage";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Process from "./pages/Process";
import Organigrame from "./pages/Organigrame";
import DTOrga from "./pages/DTOrga";
import MatrixAPN from "./pages/MatrixAPN";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/process"} component={Process} />
      <Route path={"/matrix-apn"} component={MatrixAPN} />
      <Route path={"/organigrame"} component={Organigrame} />
      <Route path={"/dt-orga"} component={DTOrga} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const authStatus = sessionStorage.getItem('amos-authenticated');
    setIsAuthenticated(authStatus === 'true');
  }, []);

  // Show nothing while checking auth status
  if (isAuthenticated === null) {
    return null;
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <LoginPage onLogin={() => setIsAuthenticated(true)} />
      </ErrorBoundary>
    );
  }

  // Show main app if authenticated
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
            <Header />
            <main className="flex-1 overflow-hidden">
              <Router />
            </main>
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
