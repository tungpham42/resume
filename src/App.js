import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { auth } from "./firebase";
import Header from "./components/Header";
import Auth from "./components/Auth";
import ResumeForm from "./components/ResumeForm";
import ResumePreview from "./components/ResumePreview";
import ResumeList from "./components/ResumeList";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Header user={user} />
      <Routes>
        <Route
          path="/"
          element={
            user ? <ResumeList user={user} /> : <Auth setUser={setUser} />
          }
        />
        <Route
          path="/resumes"
          element={
            user ? <ResumeList user={user} /> : <Auth setUser={setUser} />
          }
        />
        <Route
          path="/resume/:resumeId"
          element={
            user ? <ResumeForm user={user} /> : <Auth setUser={setUser} />
          }
        />
        <Route
          path="/preview/:resumeId"
          element={
            user ? <ResumePreview user={user} /> : <Auth setUser={setUser} />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
