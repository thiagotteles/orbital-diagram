import * as d3 from 'd3';

export class OrbitalDiagram {
  constructor(container, config, namespace = 'default') {
    this.config = config;
    this.width = 1800;
    this.height = 1800;
    this.namespace = namespace;

    // Initialize default styles
    this.defaultStyles = {
      product: {
        color: '#007bff',
        borderColor: '#FFFFFF',
        textColor: '#FFFFFF',
        fontSize: '14px'
      },
      core: {
        color: '#333333',
        borderColor: '#FFFFFF',
        textColor: '#FFFFFF',
        fontSize: '12px'
      },
      frontend: {
        color: '#333333',
        borderColor: '#FFFFFF',
        textColor: '#FFFFFF',
        fontSize: '12px'
      },
      entity: {
        color: '#444444',
        borderColor: '#FFFFFF',
        textColor: '#FFFFFF',
        fontSize: '12px'
      },
      acl: {
        color: '#CCCCCC',
        borderColor: '#FFFFFF',
        textColor: '#000000',
        fontSize: '12px'
      },
      external: {
        color: '#FFB900',
        borderColor: '#FFFFFF',
        textColor: '#000000',
        fontSize: '12px'
      },
      feature: {
        color: '#4FB3D9',
        borderColor: '#FFFFFF',
        textColor: '#FFFFFF',
        fontSize: '10px'
      }
    };

    // Get container and set background
    const containerSelector = container.startsWith('#') ? container : `#${container}`;
    this.containerElement = document.querySelector(containerSelector);
    if (!this.containerElement) {
      console.error(`Container not found: ${containerSelector}`);
      return;
    }
    this.containerElement.style.background = '#f8f9fa';
    this.containerElement.innerHTML = ''; // Clear any existing content

    // Create zoom behavior
    this.zoom = d3.zoom()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        this.svg.attr('transform', event.transform);
      });

    // Create SVG container with unique class
    const existingSvg = d3.select(containerSelector).select('svg');
    if (!existingSvg.empty()) {
      existingSvg.remove();
    }

    this.svgContainer = d3.select(containerSelector)
      .append('svg')
      .attr('class', `diagram-svg-${this.namespace}`)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .style('font-family', 'Segoe UI, system-ui, sans-serif')
      .style('background', 'white')
      .style('border-radius', '8px')
      .call(this.zoom);

    // Remove any existing defs
    d3.select(containerSelector).selectAll('defs').remove();

    // Add defs for gradients and shadows
    const defs = this.svgContainer.append('defs');
    
    // Add drop shadow filter with unique ID
    const filter = defs.append('filter')
      .attr('id', `drop-shadow-${this.namespace}`)
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    filter.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 2)
      .attr('result', 'blur');

    filter.append('feOffset')
      .attr('in', 'blur')
      .attr('dx', 1)
      .attr('dy', 1)
      .attr('result', 'offsetBlur');

    filter.append('feComponentTransfer')
      .append('feFuncA')
      .attr('type', 'linear')
      .attr('slope', 0.5);

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode')
      .attr('in', 'offsetBlur');
    feMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic');

    // Create main group with translation and unique class
    this.svg = this.svgContainer
      .append('g')
      .attr('class', `diagram-group-${this.namespace}`)
      .attr('transform', `translate(${this.width / 2},${this.height / 2})`);

    // Add legend in bottom-right corner
    const legend = this.svgContainer.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${this.width - 150}, ${this.height - 220})`);

    const types = ['product', 'core', 'frontend', 'entity', 'acl', 'external', 'feature'];
    const labels = ['Product', 'Core', 'Frontend', 'Entity', 'ACL', 'External', 'Feature'];

    // Add background for legend
    legend.append('rect')
      .attr('x', -15)
      .attr('y', -15)
      .attr('width', 140)
      .attr('height', 210)
      .attr('fill', '#ffffff')
      .attr('rx', 8)
      .attr('ry', 8)
      .style('filter', `url(#drop-shadow-${this.namespace})`)
      .style('opacity', 0.95);

    types.forEach((type, i) => {
      const style = this.getNodeStyle(type);
      const g = legend.append('g')
        .attr('transform', `translate(10, ${i * 26 + 10})`);

      if (type === 'entity') {
        g.append('rect')
          .attr('width', 20)
          .attr('height', 20)
          .attr('rx', 4)
          .attr('ry', 4)
          .style('fill', style.color)
          .style('stroke', style.borderColor)
          .style('stroke-width', 1.5);
      } else {
        g.append('circle')
          .attr('cx', 10)
          .attr('cy', 10)
          .attr('r', 10)
          .style('fill', style.color)
          .style('stroke', style.borderColor)
          .style('stroke-width', 1.5);
      }

      g.append('text')
        .attr('x', 35)
        .attr('y', 10)
        .attr('dy', '.35em')
        .style('font-size', '12px')
        .style('font-weight', '500')
        .text(labels[i]);
    });

    // Apply initial zoom after SVG and group are created
    const initialScale = 0.8;
    const initialTransform = d3.zoomIdentity
      .translate(this.width/2, this.height/2)
      .scale(initialScale)
      .translate(-this.width/2, -this.height/2);
    
    this.svgContainer.call(this.zoom.transform, initialTransform);

    // Remove any existing tooltips
    d3.select(containerSelector).selectAll('.tooltip').remove();

    // Add tooltip
    this.tooltip = d3.select(containerSelector)
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'rgba(0, 0, 0, 0.9)')
      .style('color', 'white')
      .style('padding', '12px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('max-width', '300px')
      .style('box-shadow', '0 4px 8px rgba(0, 0, 0, 0.2)');
  }

  getNodeStyle(type) {
    return {
      ...this.defaultStyles[type],
      ...(this.config.styles?.[type] || {})
    };
  }

  getNodeDimensions(node) {
    switch (node.type) {
      case 'entity':
        return { width: 200, height: 60, radius: 8 };
      case 'product':
        return { radius: 80 };
      case 'core':
      case 'external':
        return { radius: 60 };
      case 'frontend':
      case 'acl':
        return { radius: 45 };
      case 'feature':
        return { radius: 12 };
      default:
        return { radius: 35 };
    }
  }

  drawNode(node, x, y) {
    const dimensions = this.getNodeDimensions(node);
    const style = this.getNodeStyle(node.type);

    const group = this.svg.append('g')
      .attr('transform', `translate(${x},${y})`)
      .style('cursor', 'pointer')
      .style('transition', 'transform 0.3s')
      .on('mouseover', (event) => {
        // Find incoming connections
        const incomingConnections = [];
        ['core', 'frontend', 'entity', 'acl', 'external'].forEach(type => {
          const nodes = this.config[type] || [];
          nodes.forEach(n => {
            if (n.connections?.includes(node.id)) {
              incomingConnections.push(n.name);
            }
          });
        });
        if (this.config.external) {
          this.config.external.forEach(system => {
            system.entities?.forEach(entity => {
              if (entity.connections?.includes(node.id)) {
                incomingConnections.push(entity.name);
              }
            });
          });
        }

        // Find outgoing connections
        const outgoingConnections = [];
        if (node.connections) {
          node.connections.forEach(targetId => {
            const targetNode = this.findNodeById(targetId);
            if (targetNode) {
              outgoingConnections.push(targetNode.name);
            }
          });
        }

        // Show tooltip with connections
        let tooltipContent = `
          <div style="margin-bottom: 8px;">
            <div style="font-size: 14px; font-weight: bold; margin-bottom: 4px;">${node.name}</div>
            <div style="color: #ccc; font-size: 11px;">Type: ${node.type}</div>
          </div>
        `;
        
        if (outgoingConnections.length > 0) {
          tooltipContent += `
            <div style="margin-top: 10px;">
              <div style="color: #88ccff; font-weight: 500; margin-bottom: 4px;">Connects to:</div>
              <div style="padding-left: 8px; color: #eee;">• ${outgoingConnections.join('<br/>• ')}</div>
            </div>
          `;
        }
        
        if (incomingConnections.length > 0) {
          tooltipContent += `
            <div style="margin-top: 10px;">
              <div style="color: #88ccff; font-weight: 500; margin-bottom: 4px;">Connected from:</div>
              <div style="padding-left: 8px; color: #eee;">• ${incomingConnections.join('<br/>• ')}</div>
            </div>
          `;
        }

        if (node.features) {
          tooltipContent += `
            <div style="margin-top: 10px;">
              <div style="color: #88ccff; font-weight: 500; margin-bottom: 4px;">Features:</div>
              <div style="padding-left: 8px; color: #eee;">• ${node.features.map(f => f.name).join('<br/>• ')}</div>
            </div>
          `;
        }

        // Add click hint for external systems
        if (node.type === 'external') {
          tooltipContent += `
            <div style="margin-top: 10px; color: #ffd700;">
              Click to view system details
            </div>
          `;
        }

        this.tooltip
          .style('visibility', 'visible')
          .html(tooltipContent);
        
        // Highlight connections
        this.svg.selectAll('path')
          .filter(function() {
            return this.getAttribute('data-from') === node.id ||
                   this.getAttribute('data-to') === node.id;
          })
          .style('opacity', 1)
          .style('stroke-width', 2);

        // Scale up node
        group.transition()
          .duration(300)
          .attr('transform', `translate(${x},${y}) scale(1.1)`);
      })
      .on('mousemove', (event) => {
        this.tooltip
          .style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', () => {
        this.tooltip.style('visibility', 'hidden');
        
        // Reset connections
        this.svg.selectAll('path')
          .style('opacity', 0.6)
          .style('stroke-width', 1.5);

        // Reset node scale
        group.transition()
          .duration(300)
          .attr('transform', `translate(${x},${y}) scale(1)`);
      })
      .on('click', () => {
        // Handle click for external systems
        if (node.type === 'external') {
          const systemId = node.id;
          console.log('Clicking external system:', systemId);
          
          // Get all tabs
          const tabs = document.querySelectorAll('.tab');
          console.log('Available tabs:', Array.from(tabs).map(t => t.getAttribute('data-id')));
          
          // First try to find tab by id
          for (let i = 0; i < tabs.length; i++) {
            const tab = tabs[i];
            if (tab.getAttribute('data-id') === systemId) {
              console.log('Found matching tab by id, clicking...');
              tab.click();
              break;
            }
          }
          
          // If no tab found, try to open the corresponding .orbit file
          const orbitFile = `${systemId}.orbit`;
          console.log('Looking for orbit file:', orbitFile);
          
          // Dispatch custom event to notify parent about orbit file click
          const event = new CustomEvent('orbitFileClick', {
            detail: { filename: orbitFile }
          });
          document.dispatchEvent(event);
        }
      });

    if (node.type === 'entity') {
      group.append('rect')
        .attr('x', -dimensions.width / 2)
        .attr('y', -dimensions.height / 2)
        .attr('width', dimensions.width)
        .attr('height', dimensions.height)
        .attr('rx', dimensions.radius)
        .attr('ry', dimensions.radius)
        .style('fill', style.color)
        .style('stroke', style.borderColor)
        .style('stroke-width', 1.5)
        .style('filter', `url(#drop-shadow-${this.namespace})`);
    } else {
      group.append('circle')
        .attr('r', dimensions.radius)
        .style('fill', style.color)
        .style('stroke', style.borderColor)
        .style('stroke-width', 1.5)
        .style('filter', `url(#drop-shadow-${this.namespace})`);
    }

    group.append('text')
      .attr('text-anchor', 'middle')
      .style('font-size', style.fontSize)
      .style('font-weight', 'bold')
      .style('fill', style.textColor)
      .selectAll('tspan')
      .data(node.name.split('\n'))
      .enter()
      .append('tspan')
      .attr('x', 0)
      .attr('dy', (d, i) => i === 0 ? '-0.5em' : '1.2em')
      .text(d => d);

    if (node.features) {
      const featureCount = node.features.length;
      const baseRadius = dimensions.radius + 35;
      const angleStep = (2 * Math.PI) / featureCount;

      const featuresContainer = group.append('g')
        .attr('class', 'features-container')
        .attr('transform', 'translate(0, 0) scale(1.1)');

      node.features.forEach((feature, i) => {
        const angle = i * angleStep;
        const x = Math.cos(angle) * baseRadius;
        const y = Math.sin(angle) * baseRadius;

        const featureGroup = featuresContainer.append('g')
          .attr('class', `feature-${i}`)
          .attr('transform', `translate(${x},${y})`);

        const featureStyle = this.getNodeStyle(feature.type);
        featureGroup.append('circle')
          .attr('r', this.getNodeDimensions(feature).radius)
          .style('fill', featureStyle.color)
          .style('stroke', featureStyle.borderColor)
          .style('stroke-width', 1)
          .style('filter', `url(#drop-shadow-${this.namespace})`);

        featureGroup.append('text')
          .attr('text-anchor', 'middle')
          .style('font-size', featureStyle.fontSize)
          .style('fill', featureStyle.textColor)
          .text(feature.name)
          .attr('dy', '2.8em');
      });
    }

    return group;
  }

  drawConnection(from, to, fromNode, toNode) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    const targetDimensions = this.getNodeDimensions(toNode);
    const isTargetEntity = toNode.type === 'entity';
    const targetRadius = targetDimensions.radius || targetDimensions.width / 2;
    
    const directAngle = Math.atan2(dy, dx);
    
    const arrowOffset = isTargetEntity ? 12 : 8;
    const endX = to.x - Math.cos(directAngle) * (targetRadius + arrowOffset);
    const endY = to.y - Math.sin(directAngle) * (targetRadius + arrowOffset);
    
    const midX = (from.x + endX) / 2;
    const midY = (from.y + endY) / 2;
    
    const curvature = Math.min(0.2, 100 / dist);
    const perpX = Math.cos(directAngle + Math.PI/2);
    const perpY = Math.sin(directAngle + Math.PI/2);
    const curveOffset = dist * curvature;
    
    const cp1x = midX + perpX * curveOffset;
    const cp1y = midY + perpY * curveOffset;

    const path = d3.path();
    path.moveTo(from.x, from.y);
    path.quadraticCurveTo(cp1x, cp1y, endX, endY);

    const gradientId = `gradient-${this.namespace}-${from.x}-${from.y}-${to.x}-${to.y}`;
    const gradient = this.svg.append('defs')
      .append('linearGradient')
      .attr('id', gradientId)
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', from.x)
      .attr('y1', from.y)
      .attr('x2', endX)
      .attr('y2', endY);

    const fromStyle = this.getNodeStyle(fromNode.type);
    const toStyle = this.getNodeStyle(toNode.type);

    gradient.append('stop')
      .attr('offset', '0%')
      .style('stop-color', fromStyle.borderColor);

    gradient.append('stop')
      .attr('offset', '100%')
      .style('stop-color', toStyle.borderColor);

    const connectionPath = this.svg.append('path')
      .attr('d', path)
      .attr('data-from', fromNode.id)
      .attr('data-to', toNode.id)
      .style('fill', 'none')
      .style('stroke', `url(#${gradientId})`)
      .style('stroke-width', 1.5)
      .style('opacity', 0.6)
      .style('transition', 'opacity 0.3s, stroke-width 0.3s');

    const markerId = `arrow-${this.namespace}-${from.x}-${from.y}-${to.x}-${to.y}`;
    
    this.svg.append('defs')
      .append('marker')
      .attr('id', markerId)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', isTargetEntity ? 12 : 8)
      .attr('refY', 0)
      .attr('markerWidth', 12)
      .attr('markerHeight', 12)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .style('fill', toStyle.borderColor);

    connectionPath.attr('marker-end', `url(#${markerId})`);
  }

  findNodeById(id) {
    for (const type of ['core', 'frontend', 'entity', 'acl', 'external']) {
      const nodes = this.config[type] || [];
      const node = nodes.find(n => n.id === id);
      if (node) return node;
    }
    return null;
  }

  render() {
    // Clear container and remove any existing elements
    if (!this.containerElement) {
      console.error(`Container not found for namespace: ${this.namespace}`);
      return;
    }
    
    // Remove all existing content
    this.containerElement.innerHTML = '';
    
    // Add new tooltip
    this.tooltip = d3.select(this.containerElement)
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'rgba(0, 0, 0, 0.9)')
      .style('color', 'white')
      .style('padding', '12px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('max-width', '300px')
      .style('box-shadow', '0 4px 8px rgba(0, 0, 0, 0.2)');

    // Recreate SVG container with zoom
    this.svgContainer = d3.select(this.containerElement)
      .append('svg')
      .attr('class', `diagram-svg-${this.namespace}`)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .style('font-family', 'Segoe UI, system-ui, sans-serif')
      .style('background', 'white')
      .style('border-radius', '8px')
      .call(this.zoom);
    
    // Create main group
    this.svg = this.svgContainer
      .append('g')
      .attr('class', `diagram-group-${this.namespace}`)
      .attr('transform', `translate(${this.width / 2},${this.height / 2})`);

    // Add defs for gradients and shadows
    const defs = this.svgContainer.append('defs');
    const filter = defs.append('filter')
      .attr('id', `drop-shadow-${this.namespace}`)
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    filter.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 2)
      .attr('result', 'blur');

    filter.append('feOffset')
      .attr('in', 'blur')
      .attr('dx', 1)
      .attr('dy', 1)
      .attr('result', 'offsetBlur');

    filter.append('feComponentTransfer')
      .append('feFuncA')
      .attr('type', 'linear')
      .attr('slope', 0.5);

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode')
      .attr('in', 'offsetBlur');
    feMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic');

    // Add legend in bottom-right corner
    const legend = this.svgContainer.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${this.width - 150}, ${this.height - 220})`);

    const types = ['product', 'core', 'frontend', 'entity', 'acl', 'external', 'feature'];
    const labels = ['Product', 'Core', 'Frontend', 'Entity', 'ACL', 'External', 'Feature'];

    // Add background for legend
    legend.append('rect')
      .attr('x', -15)
      .attr('y', -15)
      .attr('width', 140)
      .attr('height', 210)
      .attr('fill', '#ffffff')
      .attr('rx', 8)
      .attr('ry', 8)
      .style('filter', `url(#drop-shadow-${this.namespace})`)
      .style('opacity', 0.95);

    types.forEach((type, i) => {
      const style = this.getNodeStyle(type);
      const g = legend.append('g')
        .attr('transform', `translate(10, ${i * 26 + 10})`);

      if (type === 'entity') {
        g.append('rect')
          .attr('width', 20)
          .attr('height', 20)
          .attr('rx', 4)
          .attr('ry', 4)
          .style('fill', style.color)
          .style('stroke', style.borderColor)
          .style('stroke-width', 1.5);
      } else {
        g.append('circle')
          .attr('cx', 10)
          .attr('cy', 10)
          .attr('r', 10)
          .style('fill', style.color)
          .style('stroke', style.borderColor)
          .style('stroke-width', 1.5);
      }

      g.append('text')
        .attr('x', 35)
        .attr('y', 10)
        .attr('dy', '.35em')
        .style('font-size', '12px')
        .style('font-weight', '500')
        .text(labels[i]);
    });

    // Apply initial zoom
    const initialScale = 0.8;
    const initialTransform = d3.zoomIdentity
      .translate(this.width/2, this.height/2)
      .scale(initialScale)
      .translate(-this.width/2, -this.height/2);
    this.svgContainer.call(this.zoom.transform, initialTransform);

    const orbits = [
      { radius: 200, type: 'core' },
      { radius: 380, type: 'frontend' },
      { radius: 560, type: 'entity' },
      { radius: 740, type: 'acl' }
    ];

    orbits.forEach(orbit => {
      const nodes = this.config[orbit.type] || [];
      nodes.forEach((node, i) => {
        const angle = (i * 2 * Math.PI) / nodes.length;
        const x = Math.cos(angle) * orbit.radius;
        const y = Math.sin(angle) * orbit.radius;
        node.position = { x, y };
      });
    });

    const baseExternalRadius = 1100;
    if (this.config.external) {
      this.config.external.forEach((system, i) => {
        const angle = (i * 2 * Math.PI) / this.config.external.length;
        const x = Math.cos(angle) * baseExternalRadius;
        const y = Math.sin(angle) * baseExternalRadius;
        system.position = { x, y };

        if (system.entities) {
          const entityCount = system.entities.length;
          system.entities.forEach((entity, j) => {
            const entityAngle = angle + ((j * 2 * Math.PI) / entityCount);
            const entityRadius = 160;
            const entityX = x + Math.cos(entityAngle) * entityRadius;
            const entityY = y + Math.sin(entityAngle) * entityRadius;
            entity.position = { x: entityX, y: entityY };
          });
        }
      });
    }

    orbits.forEach(orbit => {
      const style = this.getNodeStyle(orbit.type);
      this.svg.append('circle')
        .attr('r', orbit.radius)
        .attr('fill', 'none')
        .attr('stroke', style.borderColor)
        .attr('stroke-dasharray', '4,4')
        .style('opacity', 0.4);
    });

    if (this.config.external) {
      const externalStyle = this.getNodeStyle('external');
      this.svg.append('circle')
        .attr('r', baseExternalRadius)
        .attr('fill', 'none')
        .attr('stroke', externalStyle.borderColor)
        .attr('stroke-dasharray', '4,4')
        .style('opacity', 0.4);

      this.config.external.forEach(system => {
        this.svg.append('circle')
          .attr('cx', system.position.x)
          .attr('cy', system.position.y)
          .attr('r', 160)
          .attr('fill', 'none')
          .attr('stroke', externalStyle.borderColor)
          .attr('stroke-dasharray', '4,4')
          .style('opacity', 0.4);
      });
    }

    if (this.config.external) {
      this.config.external.forEach(system => {
        if (system.entities) {
          system.entities.forEach(entity => {
            this.drawConnection(
              system.position,
              entity.position,
              system,
              entity
            );
          });
        }
      });
    }

    const processConnections = (node) => {
      if (node.connections) {
        node.connections.forEach(targetId => {
          const targetNode = this.findNodeById(targetId);
          if (targetNode) {
            this.drawConnection(node.position, targetNode.position, node, targetNode);
          }
        });
      }
    };

    ['core', 'frontend', 'entity', 'acl'].forEach(type => {
      const nodes = this.config[type] || [];
      nodes.forEach(processConnections);
    });

    if (this.config.external) {
      this.config.external.forEach(system => {
        system.entities?.forEach(entity => {
          if (entity.connections) {
            entity.connections.forEach(targetId => {
              const targetNode = this.findNodeById(targetId);
              if (targetNode) {
                this.drawConnection(entity.position, targetNode.position, entity, targetNode);
              }
            });
          }
        });
      });
    }

    orbits.forEach(orbit => {
      const nodes = this.config[orbit.type] || [];
      nodes.forEach(node => {
        node.group = this.drawNode(node, node.position.x, node.position.y);
      });
    });

    if (this.config.center) {
      this.drawNode(this.config.center, 0, 0);
    }

    if (this.config.external) {
      this.config.external.forEach(system => {
        system.group = this.drawNode(system, system.position.x, system.position.y);
        if (system.entities) {
          system.entities.forEach(entity => {
            const entityNode = this.drawNode(entity, entity.position.x, entity.position.y);
          });
        }
      });
    }
  }
}
