import React from "react";
import "../../styles/cinematic.css";

/*
 * Standard cinematic page scaffold: fixed gradient/glow backdrop,
 * optional giant watermark word, and a width-capped content column.
 */
function PageShell({ ghost, accent, maxWidth = 1240, children }) {
  return (
    <div className="cin-page" style={accent ? { "--cin-accent": accent } : undefined}>
      <div className="cin-bgfx" aria-hidden="true" />
      {ghost && (
        <div className="cin-page-ghost" aria-hidden="true">
          {ghost}
        </div>
      )}
      <div className="cin-page-inner" style={{ maxWidth }}>
        {children}
      </div>
    </div>
  );
}

export default PageShell;
