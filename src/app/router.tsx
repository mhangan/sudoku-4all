import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from './shell'
import { GamePage } from '../features/game/GamePage'
import { BestGamesPage } from '../features/best-games/BestGamesPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <GamePage /> },
      { path: 'best-games', element: <BestGamesPage /> },
    ],
  },
])
