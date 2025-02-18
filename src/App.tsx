import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import InstagramDM from "./pages/InstagramDM";
import IPhoneMessages from "./pages/IPhoneMessages";
import Twitter from "./pages/Twitter";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/instagram" element={<InstagramDM />} />
        <Route path="/iphone" element={<IPhoneMessages />} />
        <Route path="/twitter" element={<Twitter />} />
      </Routes>
    </Router>
  );
};

export default App;
