import App from '@/App.jsx';
import '@/globals.css';
import ErrorPage from '@/pages/ErrorPage.jsx';
import ProfilePage from '@/pages/ProfilePage.jsx';
import { MetaMaskUIProvider } from "@metamask/sdk-react-ui";
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
import ListProperties from './pages/ListProperties';

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
        path: "properties",
        element: <ListProperties />,
      },
    ]
  },

]);

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MetaMaskUIProvider debug={false} sdkOptions={{
      dappMetadata: {
        name: "Real Estate Web3",
      }
    }}>
      <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
      </QueryClientProvider>
    </MetaMaskUIProvider>
  </React.StrictMode>,
)
