import { createBrowserRouter } from 'react-router-dom'

import HomePage from '../pages/HomePage'
import QuestionnairePage from '../pages/QuestionnairePage'
import PathResultPage from '../pages/PathResultPage/PathResultPage'
import SearchPage from '../pages/SearchPage'
import DetailTemplatePage from '../pages/DetailTemplatePage'
import LearningPathDetailPage from '../pages/LearningPathDetailPage'
import ModuleDetailPage from '../pages/ModuleDetailPage'
import LearningUnitDetailPage from '../pages/LearningUnitDetailPage'
import LoginPage from '../pages/LoginPage'
import HomePageBackup from '../pages/HomePageBackup'
import DashboardPage from '../pages/DashboardPage'
import AboutPage from '../pages/AboutPage'
import UpdatePasswordPage from '../pages/UpdatePasswordPage'
import { RootLayout } from './RootLayout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'home-backup', element: <HomePageBackup /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'assessment', element: <QuestionnairePage /> },
      { path: 'path', element: <PathResultPage /> },
      { path: 'detail-template', element: <DetailTemplatePage /> },
      { path: 'learning-paths/:learningPathId', element: <LearningPathDetailPage /> },
      { path: 'modules/:moduleId', element: <ModuleDetailPage /> },
      { path: 'learning-units/:learningUnitId', element: <LearningUnitDetailPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <LoginPage /> },
  { path: '/update-password', element: <UpdatePasswordPage /> },
])

