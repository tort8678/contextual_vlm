import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './pages/home/App.tsx'
import Test from "./pages/main/index.tsx";
import Name from "./pages/name/index.tsx";
import './index.css'
import { createBrowserRouter, RouterProvider} from "react-router-dom";
import Waiver from "./pages/Waiver/index.tsx";
import Welcome from './pages/home/Welcome.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Welcome/>
  },
  {
    path: "/enable",
    element: <App />
  },
  {
    path: "/main",
    element: <Test />
  },
  {
    path: "/waiver",
    element: <Waiver />
  },
  {
    path: "/name",
    element: <Name />
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
