/**
 * App.tsx
 * Main application router and providers. Sets up theming and route structure.
 */

import { HashRouter, Route, Routes } from 'react-router'
import { ThemeProvider } from 'next-themes'
import HomePage from './pages/Home'
import ArticlesPage from './pages/Articles'
import TopicsPage from './pages/Topics'
import AboutPage from './pages/About'
import DailyPage from './pages/Daily'
import MindfulnessPage from './pages/Mindfulness'
import QuestionsPage from './pages/Questions'
import ArticleDetailPage from './pages/ArticleDetail'
import TopicDetailPage from './pages/TopicDetail'
import { UIPrefsProvider } from './contexts/UIPrefsContext'
import ResourcesPage from './pages/Resources'
import { useEffect } from 'react'
import { initRemoteImages } from './lib/remoteImages'
import ImageryEditorPage from './pages/ImageryEditor'
import ContentEditorPage from './pages/ContentEditor'
import ConnectLinkCleanup from './components/ConnectLinkCleanup'
import HeadSEO from './components/HeadSEO'
import WWWEnforcer from './components/WWWEnforcer'

/**
 * App
 * Wraps the app with ThemeProvider and defines the primary routes.
 * The Imagery Settings route has been removed per request.
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
            {/* Admin/editor page for imagery (no navbar link). Use ?key=... if adminEditKey is set. */}
            <Route path="/imagery" element={<ImageryEditorPage />} />
            {/* Local content editor for article text */}
            <Route path="/content" element={<ContentEditorPage />} />
          </Routes>
        </HashRouter>
      </ThemeProvider>
    </UIPrefsProvider>
  )
}
