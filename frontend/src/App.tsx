import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BlogPostList from './components/BlogPostList';
import BlogPostDetail from './components/BlogPostDetail';
import BlogPostForm from './components/BlogPostForm';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>Blog Application</h1>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<BlogPostList />} />
            <Route path="/posts/create" element={<BlogPostForm />} />
            <Route path="/posts/:id" element={<BlogPostDetail />} />
            <Route path="/posts/:id/edit" element={<BlogPostForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
