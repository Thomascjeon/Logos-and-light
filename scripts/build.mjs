/**
 * App.tsx
 * Main application providers and router. Uses React Router v7 data router (createHashRouter + RouterProvider),
 * theme provider, error boundary, and app-wide utilities.
 */

import { useEffect, lazy, Suspense } from 'react'
import { ThemeProvider } from 'next-themes'
import { createHashRouter, RouterProvider } from 'react-router'
import { UIPrefsProvider } from './contexts/UIPrefsContext'
import { initRemoteImages } from './lib/remoteImages'
import ConnectLinkCleanup from './components/ConnectLinkCleanup'
import HeadSEO from './components/HeadSEO'
import WWWEnforcer from './components/WWWEnforcer'
import AdminGate from './components/AdminGate'
import ErrorBoundary from './components/ErrorBoundary'

/**
 * Lazy-loaded pages. Each is code-split to keep initial bundle small.
 */
const HomePage = lazy(() => import('./pages/Home'))
const ArticlesPage = lazy(() => import('./pages/Articles'))
const ArticleDetailPage = lazy(() => import('./pages/ArticleDetail'))
const TopicsPage = lazy(() => import('./pages/Topics'))
const TopicDetailPage = lazy(() => import('./pages/TopicDetail'))
const DailyPage = lazy(() => import('./pages/Daily'))
const MindfulnessPage = lazy(() => import('./pages/Mindfulness'))
const QuestionsPage = lazy(() => import('./pages/Questions'))
const AboutPage = lazy(() => import('./pages/About'))
const ResourcesPage = lazy(() => import('./pages/Resources'))
const ImageryEditorPage = lazy(() => import('./pages/ImageryEditor'))
const ContentEditorPage = lazy(() => import('./pages/ContentEditor'))
const NotFoundPage = lazy(() => import('./pages/NotFound'))

/**
 * LoadingScreen
 * Accessible loading fallback during code-splitting.
 */
function LoadingScreen() {
  return (
    <div className="min-h-[40vh] mx-auto max-w-2xl p-6 text-center flex items-center justify-center">
      <div>
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
      </div>
    </div>
  )
}

/**
 * Router configuration (hash-based).
 * Using the v7 data router API avoids compatibility issues with older Router components.
 */
const router = createHashRouter([
  { path: '/', element: <HomePage /> },
  { path: '/articles', element: <ArticlesPage /> },
  { path: '/articles/:id', element: <ArticleDetailPage /> },
  { path: '/topics', element: <TopicsPage /> },
  { path: '/topics/:topic', element: <TopicDetailPage /> },
  { path: '/daily', element: <DailyPage /> },
  { path: '/mindfulness', element: <MindfulnessPage /> },
  { path: '/questions', element: <QuestionsPage /> },
  { path: '/about', element: <AboutPage /> },
  { path: '/resources', element: <ResourcesPage /> },
  { path: '/imagery', element: <AdminGate><ImageryEditorPage /></AdminGate> },
  { path: '/content', element: <AdminGate><ContentEditorPage /></AdminGate> },
  { path: '*', element: <NotFoundPage /> },
])

/**
 * App
 * Wraps the app with UI/Theme providers, global utilities, and mounts the router.
 */
export default function App() {
  // Initialize remote image loader once on mount (no-op if disabled).
  useEffect(() => {
    initRemoteImages()
  }, [])

  return (
    <UIPrefsProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {/* Global cleanup to remove the undesired "External" connect link */}
        <ConnectLinkCleanup />
        {/* SEO head tags for canonical and og:url using the configured base URL */}
        <HeadSEO />
        {/* Client-side safety net to force apex -> www canonical host */}
        <WWWEnforcer />

        <ErrorBoundary>
          <Suspense fallback={<LoadingScreen />}>
            <RouterProvider router={router} />
          </Suspense>
        </ErrorBoundary>
      </ThemeProvider>
    </UIPrefsProvider>
  )
}
