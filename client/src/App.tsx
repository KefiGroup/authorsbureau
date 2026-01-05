import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ChooseTrack from "./pages/ChooseTrack";
import IndependentAuthor from "./pages/IndependentAuthor";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Books from "./pages/Books";
import WritingStudio from "./pages/WritingStudio";
import WritingStudioDay1 from "./pages/WritingStudioDay1";
import WritingStudioDay2 from "./pages/WritingStudioDay2";
import DiscoverYourStory from "./pages/DiscoverYourStory";
import FeaturedAuthors from "./pages/FeaturedAuthors";
import AmazonPublishing from "@/pages/AmazonPublishing";
import CoverGenerator from "@/pages/CoverGenerator";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/choose-track" component={ChooseTrack} />
      <Route path="/writing-studio/independent" component={IndependentAuthor} />

      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/books"} component={Books} />
      <Route path={"/writing-studio"} component={WritingStudio} />
      <Route path={"/writing-studio/day-1"} component={WritingStudioDay1} />
      <Route path={"/writing-studio/day-2"} component={WritingStudioDay2} />
      <Route path={"/discover-your-story"} component={DiscoverYourStory} />
      <Route path={"/featured-authors"} component={FeaturedAuthors} />
      <Route path="/amazon-publishing" component={AmazonPublishing} />
      <Route path="/cover-generator" component={CoverGenerator} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
