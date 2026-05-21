import { createBrowserRouter, Outlet } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import QuestionnairePage from '../pages/QuestionnairePage';
import PathResultPage from '../pages/PathResultPage/PathResultPage';
import SearchPage from '../pages/SearchPage';
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
        element: <HomePage />,
      },
      {
        path: 'search',
        element: <SearchPage />,
      },
      {
        path: 'assessment',
        element: <QuestionnairePage />,
      },
      {
        path: 'path',
        element: <PathResultPage />,
      },
    ],
  },
]);
