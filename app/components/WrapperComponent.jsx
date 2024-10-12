"use client"
import React, { useEffect } from 'react';

function WrapperComponent({ svgString }) {
  useEffect(() => {
    const container = document.getElementById('svg-container');
    if (container) {
      container.innerHTML = svgString;
    }
  }, [svgString]);

  return <div id="svg-container" />;
}

export default WrapperComponent;
