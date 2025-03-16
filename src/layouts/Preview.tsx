import React from "react";
import { useConfigStore } from "../store/useConfigStore";
import "./Preview.css";

interface PreviewLayoutProps {
  controls: React.ReactNode;
  viewer: React.ReactNode;
}

const PreviewLayout: React.FC<PreviewLayoutProps> = ({ controls, viewer }) => {
  const { workskin } = useConfigStore();
  return (
    <div className="container">
      <link
        rel="stylesheet"
        href={import.meta.env.BASE_URL + `styles/AO3.css`}
      />
      <main className="controls">{controls}</main>
      <aside className="preview">
        <div id={workskin ? "workskin" : "noworkskin"}>{viewer}</div>
      </aside>
    </div>
  );
};

export default PreviewLayout;
