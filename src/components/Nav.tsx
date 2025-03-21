import React from "react";
import { NavLink } from "react-router-dom";
import "./Nav.css";

const Nav: React.FC = () => {
  return (
    <nav className="nav">
      <NavLink
        to="/story"
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        doc2html
      </NavLink>{" "}
      |{" "}
      <NavLink
        to="/twitter"
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        twitter
      </NavLink>{" "}
      |{" "}
      <NavLink
        to="/google"
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        android
      </NavLink>{" "}
      |{" "}
      <NavLink
        to="/iphone"
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        iphone
      </NavLink>{" "}
      |{" "}
      <NavLink
        to="/instagram"
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        instagram
      </NavLink>{" "}
      |{" "}
      <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
        top
      </NavLink>
    </nav>
  );
};

export default Nav;
