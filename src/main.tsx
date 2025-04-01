import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './pages/home/App.tsx'
import Test from "./pages/test";
import './index.css'
import { createBrowserRouter, RouterProvider} from "react-router-dom";
import Waiver from "./pages/Waiver";
import Cube3D from './pages/update/index.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
  },
  {
    path: "/test",
    element: <Test />
  },
  {
    path: "/waiver",
    element: <Waiver />
  },
  {
    path: "/cube",
    element: <Cube3D />
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
