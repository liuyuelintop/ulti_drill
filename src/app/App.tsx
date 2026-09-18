import React, { Suspense } from "react";
import { PlaybookProvider } from "../data/playbookStore";
import { useHashRoute } from "../lib/useHashRoute";
import { LibraryScreen } from "../screens/LibraryScreen";

// Konva is most of the bundle and the library screen never needs it, so the
// canvas screens load on the first tap into a play instead.
const ViewerScreen = React.lazy(() => import("../screens/ViewerScreen"));
const EditorScreen = React.lazy(() => import("../screens/EditorScreen"));

const Loading: React.FC = () => (
  <div className="flex min-h-dvh items-center justify-center bg-slate-950 text-slate-500">
    Loading…
  </div>
);

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
    <Suspense fallback={<Loading />}>
      <Routes />
    </Suspense>
  </PlaybookProvider>
);

export default App;
