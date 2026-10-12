import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import ErrorBoundary from '../components/ErrorBoundary';
import Home from '../pages/Home';
import NotFound from '../pages/NotFound';
import { tools } from '../data/tools';

// Every route comes from the registry, so adding a tool is one entry there.
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Home />, errorElement: <ErrorBoundary /> },
      ...tools.map((tool) => {
        const Page = lazy(tool.load);
        return { path: tool.id, element: <Page />, errorElement: <ErrorBoundary /> };
      }),
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default router;
