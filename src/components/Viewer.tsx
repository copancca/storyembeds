import React from "react";
import { useConfigStore } from "../store/useConfigStore";

interface ViewerProps {
  render: () => React.ReactNode;
}

const Viewer: React.FC<ViewerProps> = ({ render }) => {
  const { workskin, toggleWorkSkin } = useConfigStore();

  return (
    <>
      <h2 className="sb-header">preview</h2>
      <p className="workskin-status">
        work skin is <b>{workskin ? "on" : "off"}</b>
      </p>
      <button onClick={() => toggleWorkSkin()}>toggle work skin</button>
      {render()}
    </>
  );
};

export default Viewer;
