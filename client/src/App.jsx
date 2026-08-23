import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { Providers } from '@/app/providers'
import { routes } from '@/app/router'

const router = createBrowserRouter(routes)

export default function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  )
}
