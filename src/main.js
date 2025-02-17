import { OrbitalDiagram } from './renderer/OrbitalDiagram';

class DiagramManager {
  constructor() {
    this.diagrams = new Map();
    this.currentIndex = 0;
    
    // Setup event listeners
    this.setupFileInput();
    this.setupTabClickHandlers();

    // Load all .orbit files from uploads directory
    this.loadOrbitFiles();
  }

  async loadOrbitFiles() {
    try {
      const response = await fetch('/api/orbit-files');
      if (!response.ok) {
        console.error('Failed to fetch orbit files list');
        return;
      }
      const files = await response.json();
      
      // Load each .orbit file
      for (let [index, filename] of files.entries()) {
        try {
          const fileResponse = await fetch(`/uploads/${filename}`);
          if (!fileResponse.ok) {
            console.warn(`Failed to load ${filename}`);
            continue;
          }
          const config = await fileResponse.json();
          const name = filename.replace('.orbit', '');
          this.addDiagram(name, config, index === 0);
        } catch (error) {
          console.warn(`Error loading ${filename}:`, error);
        }
      }
    } catch (error) {
      console.error('Error loading orbit files:', error);
    }
  }

  addDiagram(name, config, isActive = false) {
    const index = this.diagrams.size;
    
    // Create new tab
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.textContent = name;
    tab.dataset.index = index;
    document.getElementById('tabs').appendChild(tab);
    
    // Remove existing content if it exists
    const existingContent = document.getElementById(`diagram-${index}`);
    if (existingContent) {
      existingContent.remove();
    }
    
    // Create new content div with unique wrapper
    const content = document.createElement('div');
    content.id = `diagram-${index}`;
    content.className = 'tab-content';
    content.dataset.index = index;
    
    const wrapper = document.createElement('div');
    wrapper.id = `diagram-wrapper-${index}`;
    wrapper.className = 'diagram-wrapper';
    content.appendChild(wrapper);
    
    document.getElementById('diagrams-container').appendChild(content);
    
    // Store configuration
    this.diagrams.set(index, { name, config });
    
    // Set initial active state
    if (isActive) {
      tab.classList.add('active');
      content.classList.add('active');
      // Create and render diagram
      const diagram = new OrbitalDiagram(`#diagram-wrapper-${index}`, config, `diagram-${index}`);
      diagram.render();
      this.diagrams.set(index, { name, diagram, config });
    } else {
      tab.classList.remove('active');
      content.classList.remove('active');
      this.diagrams.set(index, { name, config });
    }
    
    return index;
  }

  activateTab(index) {
    const targetIndex = parseInt(index);
    
    // Update tabs and content
    document.querySelectorAll('.tab').forEach(tab => {
      const tabIndex = parseInt(tab.dataset.index);
      const isActive = tabIndex === targetIndex;
      tab.classList.toggle('active', isActive);
    });

    // Get all tab content elements
    document.querySelectorAll('.tab-content').forEach(content => {
      const contentIndex = parseInt(content.dataset.index);
      const isActive = contentIndex === targetIndex;
      content.classList.toggle('active', isActive);

      // Get diagram data
      const diagramData = this.diagrams.get(contentIndex);
      if (diagramData) {
        if (isActive) {
          // Clear existing content
          const wrapper = document.getElementById(`diagram-wrapper-${contentIndex}`);
          if (wrapper) {
            wrapper.innerHTML = '';
          }

          // Create new diagram instance for active tab
          const diagram = new OrbitalDiagram(`#diagram-wrapper-${contentIndex}`, diagramData.config, `diagram-${contentIndex}`);
          diagram.render();
          this.diagrams.set(contentIndex, { ...diagramData, diagram });
        } else {
          // Remove diagram instance from inactive tab
          if (diagramData.diagram) {
            delete diagramData.diagram;
            this.diagrams.set(contentIndex, { name: diagramData.name, config: diagramData.config });
          }
        }
      }
    });
  }

  setupTabClickHandlers() {
    document.getElementById('tabs').addEventListener('click', (event) => {
      const tab = event.target.closest('.tab');
      if (tab) {
        this.activateTab(tab.dataset.index);
      }
    });
  }

  setupFileInput() {
    const fileInput = document.getElementById('fileInput');
    fileInput.accept = '.orbit';
    fileInput.addEventListener('change', (event) => {
      const files = Array.from(event.target.files || []);
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const config = JSON.parse(e.target?.result);
            const name = file.name.replace('.orbit', '');
            const index = this.addDiagram(name, config);
            this.activateTab(index);

            // Save the file to the uploads directory
            const formData = new FormData();
            formData.append('file', file);
            fetch('/api/upload', {
              method: 'POST',
              body: formData
            }).catch(error => {
              console.error('Error saving file:', error);
            });
          } catch (error) {
            console.error('Error parsing JSON:', error);
            alert(`Invalid JSON file: ${file.name}`);
          }
        };
        reader.readAsText(file);
      });
      
      // Reset file input
      fileInput.value = '';
    });
  }
}

// Initialize diagram manager after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const manager = new DiagramManager();
});

// Setup SVG download for active diagram
window.downloadSVG = () => {
  const activeContent = document.querySelector('.tab-content.active');
  const svgElement = activeContent?.querySelector('svg');
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
