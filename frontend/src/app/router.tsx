import { createBrowserRouter, Outlet } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import Assessment from '../pages/Assessment/Assessment';
import PathResultPage from '../pages/PathResultPage';
import { SearchProvider } from '../contexts/SearchContext';

function RootLayout() {
  return (
    <SearchProvider>
      <Outlet /> {/* So search can remain available even after navigating to other pages */}
    </SearchProvider>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'assessment',
        element: <Assessment />,
      },
      {
        path: 'path',
        element: <PathResultPage />,
      },
    ],
  },
]);
