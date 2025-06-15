import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import Catalog from "@/pages/catalog";
import Login from "@/pages/login";
import Register from "@/pages/register";
import AnimalDetail from "@/pages/animal-detail";
import CreateListing from "@/pages/create-listing";
import Dashboard from "@/pages/dashboard";
import Favorites from "@/pages/favorites";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Support from "@/pages/support";
import ProfileSettings from "@/pages/profile-settings";
import NotFound from "@/pages/not-found";
import ChatPage from '@/pages/chat';
import { ProtectedRoute } from '@/components/protected-route';

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Catalog} />
      <Route path="/pets" component={Catalog} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/support" component={Support} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/animals/:id">
        {(params) => <AnimalDetail id={parseInt(params.id)} />}
      </Route>
      {user && <Route path="/create-listing" component={CreateListing} />}
      {user && <Route path="/dashboard" component={Dashboard} />}
      {user && <Route path="/favorites" component={Favorites} />}
      {user && <Route path="/profile/settings" component={ProfileSettings} />}
      <Route path="/chat">
        <ProtectedRoute>
          <ChatPage />
        </ProtectedRoute>
      </Route>
      <Route path="/chat/:userId">
        {(params) => (
          <ProtectedRoute>
            <ChatPage userId={params.userId} />
          </ProtectedRoute>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
