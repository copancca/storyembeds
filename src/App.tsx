import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import GoogleMessages from "./pages/GoogleMessages";
import InstagramDM from "./pages/InstagramDM";
import IPhoneMessages from "./pages/IPhoneMessages";
import Twitter from "./pages/Twitter";
import StoryText from "./pages/StoryText";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/instagram" element={<InstagramDM />} />
        <Route path="/iphone" element={<IPhoneMessages />} />
        <Route path="/google" element={<GoogleMessages />} />
        <Route path="/twitter" element={<Twitter />} />
        <Route path="/story" element={<StoryText />} />
      </Routes>
    </Router>
  );
};

export default App;
