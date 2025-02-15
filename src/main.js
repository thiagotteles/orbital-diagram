import { OrbitalDiagram } from './renderer/OrbitalDiagram';
import config from './metadata-system.json';

// Load example diagram on start
const diagram = new OrbitalDiagram('#diagram', config);
diagram.render();

// Setup file input handler
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result);
        const diagram = new OrbitalDiagram('#diagram', config);
        diagram.render();
      } catch (error) {
        console.error('Error parsing JSON:', error);
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  }
});

// Setup SVG download
window.downloadSVG = () => {
  const svgElement = document.querySelector('#diagram svg');
  if (svgElement) {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'orbital-diagram.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
