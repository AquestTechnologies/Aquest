import {randomInteger, randomString} from './randomGenerators';

const MARGIN = 30;
const VERTEX_RADIUS = 30;
const FORCE_CORRECTOR = 1;

// Generates a random graph for test purpose
export function generateWorkingGraph(size) {
  
  const CUT = 0.9;
  const MIN_EDGES = 1;
  const MAX_EDGES = 4;
  const MIN_FORCE = 1;
  const MAX_FORCE = 1;
  const fracDisconnected = 0.00;
  const ng = Math.floor(Math.sqrt(size) - 2);
  const t = Math.floor(size * (1 - fracDisconnected) / ng);
  
  let vertices = [], edges = [], groups = [];
  
  // Vertices creation
  for (let i = 0; i < size; i++) {
    const name = randomString(5);
    vertices.push({
      name, 
      description: `description for ${name}`, 
    });
  }
  
  // Groups creation
  let offset = 0;
  for (let i = 0; i < ng; i++) {
    const group = [];
    for (let j = offset; j < t + offset && j < size -1 ; j++) {
      group.push(vertices[j]);
    }
    groups.push(group);
    offset += t;
  }

  // Randoming group size with vertices tributes 
  const nLuckyGroups = randomInteger(1, Math.floor(ng / 2));
  for (let i = 0; i < nLuckyGroups; i++) {
    const group = groups[i];
    group.splice(0, 0, ...groups[nLuckyGroups + i].splice(0, randomInteger(0, group.length)));
  }
  
  // Edges creation
  groups.forEach((group, index) => {
    const groupL = group.length;
    group.forEach(node => {
      node.group = index; // Sets group attr for coloring
      let parents = []; // Others nodes from group to connect to
      const nIndex = vertices.indexOf(node);
      
      // Number of current edges
      const edgesL = edges.filter(edge => edge.target === nIndex).length;
      let pIndex, pEdgesL; // of parent
      
      // Random parent selection
      for (let i = 0, j = randomInteger(Math.max(0, MIN_EDGES - edgesL), MAX_EDGES - edgesL); i < j; i++) {
        let k = 0; do {
          k++; // Sometimes the while conditions are too strict for the configuration
          pIndex = vertices.indexOf(group[randomInteger(0, groupL - 1)]);
          pEdgesL = edges.filter(edge => edge.source === pIndex || edge.target === pIndex).length;
        } while ((pIndex === index || parents.indexOf(pIndex) !== -1) && k < groupL) // So we limit
        if (pEdgesL < MAX_EDGES) parents.push(pIndex);
      }
      
      parents.forEach(pIndex => {
        edges.push({
          source: nIndex,
          target: pIndex,
          value: randomInteger(MIN_FORCE, MAX_FORCE)
        });
      });
    });
  });
  
  // Special treat for newborn edges
  for (let i = edges.length - 1; i > -1; i-- ) {
    if (Math.random() > CUT) edges.splice(i, 1);
  }
  
  return({vertices, edges});
}

// Generates a random graph for test purpose
export function generateGraph(size) {
  
  const MIN_EDGES = 1;
  const MAX_EDGES = 1;
  const MIN_FORCE = 1;
  const MAX_FORCE = 5;
  
  let vertices = {}, edges = [];
  let name, description, verticesNames, parents, nextParent;
  
  vertices['0'] = {
    name: '0',
    description: 'This is the first vertex ever'
  };
  
  for (let i = 1; i < size; i++) {
    
    // Vertex definition
    name = (Math.random() + 1).toString(36).substring(2, 7);
    description = `description for ${name}`;
    
    // Parents selection
    parents = [];
    verticesNames = Object.keys(vertices);
    for (let i = 0, j = randomInteger(MIN_EDGES, MAX_EDGES); i < j; i++) {
      nextParent = verticesNames[randomInteger(0, verticesNames.length - 1)];
      if (parents.indexOf(nextParent) === -1) parents.push(nextParent);
    }
    
    parents.forEach(parent => {
      edges.push({
        parent,
        child: name,
        force: randomInteger(MIN_FORCE, MAX_FORCE)
      });
    });
    
    // Vertex creation
    vertices[name] = ({name, description});
  }
  
  return({vertices, edges});
}

// Draws the graph on a provided SVG element
// Does not work
export function drawGraph(svg, vertices, edges) {
  
  const K_CORRECTOR = 10;
  const ITERATIONS = 50;
  
  const svgVertices = initializeGraph(svg, vertices, edges);
  const keys = Object.keys(svgVertices);
  
  const svgWidth = svg.node.clientWidth;
  const svgHeight = svg.node.clientHeight;
  
  const K = Math.sqrt(svgWidth * svgHeight / keys.length) / K_CORRECTOR;
  const fr = x => (K * K / x) * FORCE_CORRECTOR;
  const fa = x => (x * x / K) * FORCE_CORRECTOR;
  const originalTemperature = svgWidth / 10;
  let temperature = originalTemperature;
  
  // Main algorithm
  // http://arxiv.org/pdf/1201.3011v1.pdf
  // http://arxiv.org/pdf/1209.0748v1.pdf
  // http://www.cs.arizona.edu/~kobourov/fdl.pdf
  for (let i = 0; i < ITERATIONS; i++) {
    
    keys.forEach(key => {
      const v = svgVertices[key];
      // Displacement vector
      v.displacement = {
        x: 0,
        y: 0
      };
      
      keys.forEach(key2 => {
        if (key2 !== key) {
          const u = svgVertices[key2];
          // The distance between the two vertices
          const delta = {
            x: u.x - v.x,
            y: u.y - v.y
          };
          let distance = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
          distance = distance ? distance : 0.1;
          const frResult = fr(distance, K) / distance;
          v.displacement.x += frResult * delta.x;
          v.displacement.y += frResult * delta.y;
        }
      });
    });
    
    edges.forEach(edge => {
      const v = svgVertices[edge.parent];
      const u = svgVertices[edge.child];
      const delta = {
        x: u.x - v.x,
        y: u.y - v.y
      };
      let distance = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
      distance = distance ? distance : 0.1;
      const faResult = fa(distance, K) / distance;
      v.displacement.x -= faResult * delta.x;
      v.displacement.y -= faResult * delta.y;
      u.displacement.x -= faResult * delta.x;
      u.displacement.y -= faResult * delta.y;
    });
    
    keys.forEach(key => {
      const v = svgVertices[key];
      const delta = v.displacement;
      let distance = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
      distance = distance ? distance : 0.1;
      v.x += delta.x * Math.min(delta.x, temperature) / distance;
      v.y += delta.y * Math.min(delta.y, temperature) / distance;
      v.x = Math.min(svgWidth - VERTEX_RADIUS - MARGIN, Math.max(0 + VERTEX_RADIUS + MARGIN, v.x));
      v.y = Math.min(svgHeight - VERTEX_RADIUS - MARGIN, Math.max(0 + VERTEX_RADIUS + MARGIN, v.y));
    });
    
    correctPosition(svgVertices, svgWidth, svgHeight);
    
    temperature = temperature - originalTemperature / ITERATIONS;
  }
  
  // Draws graph
  edges.forEach(edge => drawEdge(svg, svgVertices[edge.parent], svgVertices[edge.child]));
  keys.forEach(key => drawVertex(svg, svgVertices[key]));
}

// Not part of the original algorithm
function correctPosition(svgVertices, svgWidth, svgHeight) {
  const keys = Object.keys(svgVertices);
  const {x, y} = svgVertices[keys[0]]; // Strong assomption that the first vertex is the graph center
  const delta = {
    x: svgWidth / 2 - x,
    y: svgHeight / 2 - y
  };
  keys.forEach(key => {
    const v = svgVertices[key];
    v.x += delta.x;
    v.y += delta.y;
      v.x = Math.min(svgWidth - VERTEX_RADIUS - MARGIN, Math.max(0 + VERTEX_RADIUS + MARGIN, v.x));
      v.y = Math.min(svgHeight - VERTEX_RADIUS - MARGIN, Math.max(0 + VERTEX_RADIUS + MARGIN, v.y));
  });
}

// Places vertices at random
function initializeGraph(svg, vertices, edges) {
  console.log('initializeGraph');
  
  const svgWidth = svg.node.clientWidth;
  const svgHeight = svg.node.clientHeight;
  let x, y;
  let svgVertices = {};
  
  Object.keys(vertices).forEach(key => {
    svgVertices[key] = {};
    svgVertices[key].data = vertices[key];
    svgVertices[key].x = randomInteger(VERTEX_RADIUS, svgWidth - VERTEX_RADIUS);
    svgVertices[key].y = randomInteger(VERTEX_RADIUS, svgHeight - VERTEX_RADIUS);
  });
  // edges.forEach(edge => drawEdge(svg, svgVertices[edge.parent], svgVertices[edge.child]));
  // Object.keys(svgVertices).forEach(key => drawVertex(svg, svgVertices[key]));
  
  return svgVertices;
}

// Draws a given vertex at a given position
function drawVertex(svg, svgVertex) {
  console.log('drawVertex');
  const {x, y} = svgVertex;
  const circle = svg.circle(x, y, VERTEX_RADIUS);
  const text = svg.text();
  circle.attr({
    fill: '#2FD359'
  });
  text.attr({
    text: svgVertex.data.name,
    style: 'font-size: 1.5rem; fill: #fff',
  });
  const {width, height} = text.getBBox();
  text.attr({
    x: x - width / 2,
    y: y + height / 4
  });
  
  svgVertex.element = svg.group(circle, text);
}

function drawEdge(svg, parent, child) {
  console.log('drawEdge');
  const line = svg.line(parent.x, parent.y, child.x, child.y);
  
  line.attr({
    stroke: '#bbb',
    'stroke-width': 2
  });
}
