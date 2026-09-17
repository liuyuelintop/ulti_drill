import React from "react";
import { PlaybookProvider } from "../data/playbookStore";
import { useHashRoute } from "../lib/useHashRoute";
import { LibraryScreen } from "../screens/LibraryScreen";
import { ViewerScreen } from "../screens/ViewerScreen";
import { EditorScreen } from "../screens/EditorScreen";

const Routes: React.FC = () => {
  const route = useHashRoute();

  switch (route.name) {
    case "view":
      return <ViewerScreen key={route.id} id={route.id} />;
    case "edit":
      return <EditorScreen key={route.id} id={route.id} />;
    case "new":
      return <EditorScreen key="new" id={null} />;
    default:
      return <LibraryScreen />;
  }
};

const App: React.FC = () => (
  <PlaybookProvider>
    <Routes />
  </PlaybookProvider>
);

export default App;
