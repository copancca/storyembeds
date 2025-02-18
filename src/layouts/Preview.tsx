import React from "react";
import { useConfigStore } from "../store/useConfigStore";
import "./AO3.css";
import "./Preview.css";

interface PreviewLayoutProps {
  controls: React.ReactNode;
  viewer: React.ReactNode;
}

const PreviewLayout: React.FC<PreviewLayoutProps> = ({ controls, viewer }) => {
  const { workskin } = useConfigStore();
  return (
    <div className="container">
      <main className="controls">{controls}</main>
      <aside className="preview" id={workskin ? "workskin" : "noworkskin"}>
        {viewer}
      </aside>
    </div>
  );
};

export default PreviewLayout;
