/**
 * App.tsx
 * Main application router and providers. Sets up theming, lazy routing, error boundary, and route structure.
 */

import { HashRouter, Route, Routes } from 'react-router'
import { ThemeProvider } from 'next-themes'
import { useEffect, lazy, Suspense } from 'react'
import { UIPrefsProvider } from './contexts/UIPrefsContext'
import { initRemoteImages } from './lib/remoteImages'
import ConnectLinkCleanup from './components/ConnectLinkCleanup'
import HeadSEO from './components/HeadSEO'
import WWWEnforcer from './components/WWWEnforcer'
import AdminGate from './components/AdminGate'
import ErrorBoundary from './components/ErrorBoundary'

/**
 * Lazy-loaded pages
 * Using React.lazy ensures a single page failure doesn't take down the whole app;
 * users see a loader until the specific page is ready.
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
 * Minimal, accessible loading fallback visible during code-splitting.
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
 * App
 * Wraps the app with ThemeProvider and defines the primary routes.
 */
export default function App() {
  /**
   * Initialize remote image loader once on mount.
   * It is no-op if the feature is disabled in config.
   */
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

        <HashRouter>
          <ErrorBoundary>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/articles" element={<ArticlesPage />} />
                <Route path="/articles/:id" element={<ArticleDetailPage />} />
                <Route path="/topics" element={<TopicsPage />} />
                <Route path="/topics/:topic" element={<TopicDetailPage />} />
                <Route path="/daily" element={<DailyPage />} />
                <Route path="/mindfulness" element={<MindfulnessPage />} />
                <Route path="/questions" element={<QuestionsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/resources" element={<ResourcesPage />} />
                {/* Admin/editor pages require a key via AdminGate */}
                <Route path="/imagery" element={<AdminGate><ImageryEditorPage /></AdminGate>} />
                <Route path="/content" element={<AdminGate><ContentEditorPage /></AdminGate>} />
                {/* 404 fallback */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </HashRouter>
      </ThemeProvider>
    </UIPrefsProvider>
  )
}
