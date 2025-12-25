import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import About from './pages/About';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import Projects from './pages/Projects';
import Topics from './pages/Topics';
import TopicDetail from './pages/TopicDetail';
import Gallery from './pages/Gallery';
import './App.css';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<About />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blogs/:slug" element={<BlogDetail />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/topics" element={<Topics />} />
        <Route path="/topics/:id" element={<TopicDetail />} />
        <Route path="/gallery" element={<Gallery />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors">
        <Header />
        <main className="flex-1 pt-20">
          <AnimatedRoutes />
        </main>
        <Footer />
        <ScrollToTop />
      </div>
    </Router>
  );
}

export default App;
