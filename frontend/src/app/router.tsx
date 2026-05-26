import { createBrowserRouter, Outlet } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import QuestionnairePage from '../pages/QuestionnairePage';
import PathResultPage from '../pages/PathResultPage/PathResultPage';
import SearchPage from '../pages/SearchPage';
import { SearchProvider } from '../contexts/SearchContext';
import AppShell from '../components/layout/AppShell';
import DetailTemplatePage from '../pages/DetailTemplatePage'
import LearningPathDetailPage from '../pages/LearningPathDetailPage'
import ModuleDetailPage from '../pages/ModuleDetailPage'
import LearningUnitDetailPage from '../pages/LearningUnitDetailPage'
import LoginPage from '../pages/LoginPage'
import HomeRedesignPage from '../pages/HomeRedesign/HomeRedesignPage'


function RootLayout() {
  return (
    <SearchProvider>
      <AppShell>
        <Outlet /> {/* So search can remain available even after navigating to other pages */}
      </AppShell>
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
        path: 'home-redesign',
        element: <HomeRedesignPage />,
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
      {
        path: 'detail-template',
        element: <DetailTemplatePage />,
      },
      {
        path: 'learning-paths/:learningPathId',
        element: <LearningPathDetailPage />,
      },
      {
        path: 'modules/:moduleId',
        element: <ModuleDetailPage />,
      },
      {
        path: 'learning-units/:learningUnitId',
        element: <LearningUnitDetailPage />,
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <LoginPage />,
  },
]);
