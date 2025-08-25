import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import BlogPostList from './components/BlogPostList';
import BlogPostDetail from './components/BlogPostDetail';
import BlogPostForm from './components/BlogPostForm';
import Echo from './components/Echo';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h1>Blog Application</h1>
            </Link>
            <nav>
              <Link to="/echo" style={{ color: 'inherit', textDecoration: 'none', padding: '10px' }}>
                Echo Chat
              </Link>
            </nav>
          </div>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<BlogPostList />} />
            <Route path="/posts/create" element={<BlogPostForm />} />
            <Route path="/posts/:id" element={<BlogPostDetail />} />
            <Route path="/posts/:id/edit" element={<BlogPostForm />} />
            <Route path="/echo" element={<Echo />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
