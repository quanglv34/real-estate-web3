import App from '@/App.jsx';
import '@/globals.css';
import ErrorPage from '@/pages/ErrorPage.jsx';
import ProfilePage from '@/pages/ProfilePage.jsx';
import {
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import Layout from './Layout';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout></Layout>,
    errorElement: <ErrorPage />,
    children: [ 
      {
        path: "",
        element: <App />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "properties/{id}",
        element: <App />,
      },
    ]
  },

]);

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
)
