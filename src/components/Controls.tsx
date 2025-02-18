import React, { useState } from "react";
import { useConfigStore } from "../store/useConfigStore";
import Nav from "./Nav";

interface ControlsProps {
  instructions?: string | React.ReactNode;
  example?: string;
  buttonText?: string;
  titleText?: string;
  parser: (input: string) => void;
}

const Controls: React.FC<ControlsProps> = ({
  instructions,
  example,
  buttonText,
  titleText,
  parser,
}) => {
  const { output, rawConfig, setRawConfig } = useConfigStore();
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRawConfig(e.target.value);
  };

  const saveConfig = () => {
    try {
      parser(rawConfig);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === "string") {
        setError(err);
      } else {
        setError("An error occurred.");
      }
    }
  };

  return (
    <div id="controls">
      <h2 className="sb-header">{titleText || "load threads"}</h2>
      <Nav />
      <div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <textarea
          placeholder="paste or view JSON"
          value={rawConfig}
          onChange={handleInputChange}
        />
        <button onClick={saveConfig}>{buttonText || "make things"}</button>
      </div>

      {instructions || example ? (
        <h3 className="sb-header">instructions</h3>
      ) : null}
      {typeof instructions === "string" ? <p>{instructions}</p> : instructions}
      {example && (
        <>
          <p>example JSON data is below.</p>
          <pre>{example}</pre>
        </>
      )}
      <hr />
      <label>
        HTML output:
        <textarea readOnly={true} value={output} />
      </label>
    </div>
  );
};

export default Controls;
