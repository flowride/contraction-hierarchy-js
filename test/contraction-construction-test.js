import { Graph } from '../index.js';
import fs from 'fs';

console.log('🏗️ Test de construction du graphe de contraction');

// Test 1: Petit graphe simple
console.log('\n📊 Test 1: Petit graphe simple (10 nœuds)');
const smallGraph = new Graph();

// Créer un graphe simple en ligne
for (let i = 0; i < 9; i++) {
  smallGraph.addEdge(`A${i}`, `A${i + 1}`, { _id: i + 1, _cost: 1 });
}

console.log('   Avant contraction:');
console.log(`   - Nœuds: ${Object.keys(smallGraph._nodeToIndexLookup).length}`);
console.log(`   - Arêtes: ${smallGraph.adjacency_list.reduce((acc, edges) => acc + edges.length, 0)}`);

const smallStart = Date.now();
smallGraph.contractGraph();
const smallTime = Date.now() - smallStart;

console.log('   Après contraction:');
console.log(`   - Temps de contraction: ${smallTime}ms`);
console.log(`   - Nœuds contractés: ${Object.keys(smallGraph.contracted_nodes || {}).length}`);

// Test 2: Graphe moyen
console.log('\n📊 Test 2: Graphe moyen (100 nœuds)');
const mediumGraph = new Graph();

// Créer un graphe en grille 10x10
let edgeId = 1;
for (let row = 0; row < 10; row++) {
  for (let col = 0; col < 10; col++) {
    const nodeId = `${row},${col}`;
    
    // Connexions horizontales
    if (col < 9) {
      mediumGraph.addEdge(nodeId, `${row},${col + 1}`, { _id: edgeId++, _cost: Math.random() * 5 + 1 });
    }
    
    // Connexions verticales
    if (row < 9) {
      mediumGraph.addEdge(nodeId, `${row + 1},${col}`, { _id: edgeId++, _cost: Math.random() * 5 + 1 });
    }
    
    // Quelques diagonales
    if (row < 9 && col < 9 && Math.random() > 0.7) {
      mediumGraph.addEdge(nodeId, `${row + 1},${col + 1}`, { _id: edgeId++, _cost: Math.random() * 8 + 2 });
    }
  }
}

console.log('   Avant contraction:');
console.log(`   - Nœuds: ${Object.keys(mediumGraph._nodeToIndexLookup).length}`);
console.log(`   - Arêtes: ${mediumGraph.adjacency_list.reduce((acc, edges) => acc + edges.length, 0)}`);

const mediumStart = Date.now();
mediumGraph.contractGraph();
const mediumTime = Date.now() - mediumStart;

console.log('   Après contraction:');
console.log(`   - Temps de contraction: ${mediumTime}ms`);
console.log(`   - Nœuds contractés: ${Object.keys(mediumGraph.contracted_nodes || {}).length}`);

// Test 3: Graphe avec GeoJSON
console.log('\n📊 Test 3: Graphe GeoJSON');

// Créer un GeoJSON de test
const testGeoJSON = {
  "type": "FeatureCollection",
  "features": []
};

// Générer un réseau routier simulé
for (let i = 0; i < 50; i++) {
  const startLng = -120 + (i % 10) * 0.1;
  const startLat = 40 + Math.floor(i / 10) * 0.1;
  const endLng = startLng + 0.05;
  const endLat = startLat + 0.05;
  
  testGeoJSON.features.push({
    "type": "Feature",
    "properties": { 
      "_id": i + 1, 
      "_cost": Math.random() * 10 + 1 
    },
    "geometry": {
      "type": "LineString",
      "coordinates": [[startLng, startLat], [endLng, endLat]]
    }
  });
}

console.log('   Chargement du GeoJSON...');
const geoGraphTest = new Graph(testGeoJSON);

console.log('   Avant contraction:');
console.log(`   - Nœuds: ${Object.keys(geoGraphTest._nodeToIndexLookup).length}`);
console.log(`   - Arêtes: ${geoGraphTest.adjacency_list.reduce((acc, edges) => acc + edges.length, 0)}`);

const geoStart = Date.now();
geoGraphTest.contractGraph();
const geoTime = Date.now() - geoStart;

console.log('   Après contraction:');
console.log(`   - Temps de contraction: ${geoTime}ms`);
console.log(`   - Nœuds contractés: ${Object.keys(geoGraphTest.contracted_nodes || {}).length}`);

// Test 4: Analyse détaillée du processus de contraction
console.log('\n📊 Test 4: Analyse détaillée du processus');
const analysisGraph = new Graph();

// Créer un graphe avec des propriétés spécifiques pour l'analyse
for (let i = 0; i < 20; i++) {
  analysisGraph.addEdge(`node_${i}`, `node_${i + 1}`, { 
    _id: i + 1, 
    _cost: Math.random() * 10 + 1,
    _original: true 
  });
  
  // Ajouter quelques connexions croisées
  if (i % 3 === 0 && i + 5 < 20) {
    analysisGraph.addEdge(`node_${i}`, `node_${i + 5}`, { 
      _id: 100 + i, 
      _cost: Math.random() * 15 + 5,
      _shortcut: true 
    });
  }
}

console.log('   Analyse avant contraction:');
const beforeStats = {
  nodes: Object.keys(analysisGraph._nodeToIndexLookup).length,
  edges: analysisGraph.adjacency_list.reduce((acc, edges) => acc + edges.length, 0),
  originalEdges: analysisGraph.adjacency_list.reduce((acc, edges) => 
    acc + edges.filter(edge => analysisGraph._edgeProperties[edge.attrs]?._original).length, 0),
  shortcutEdges: analysisGraph.adjacency_list.reduce((acc, edges) => 
    acc + edges.filter(edge => analysisGraph._edgeProperties[edge.attrs]?._shortcut).length, 0)
};

console.log(`   - Nœuds: ${beforeStats.nodes}`);
console.log(`   - Arêtes totales: ${beforeStats.edges}`);
console.log(`   - Arêtes originales: ${beforeStats.originalEdges}`);
console.log(`   - Arêtes de raccourci: ${beforeStats.shortcutEdges}`);

const analysisStart = Date.now();
analysisGraph.contractGraph();
const analysisTime = Date.now() - analysisStart;

console.log('   Analyse après contraction:');
const afterStats = {
  contractedNodes: Object.keys(analysisGraph.contracted_nodes || {}).length,
  totalEdges: analysisGraph.adjacency_list.reduce((acc, edges) => acc + edges.length, 0),
  contractedEdges: analysisGraph.adjacency_list.reduce((acc, edges) => 
    acc + edges.filter(edge => edge.attrs > analysisGraph._maxUncontractedEdgeIndex).length, 0)
};

console.log(`   - Temps de contraction: ${analysisTime}ms`);
console.log(`   - Nœuds contractés: ${afterStats.contractedNodes}`);
console.log(`   - Arêtes totales: ${afterStats.totalEdges}`);
console.log(`   - Arêtes de contraction: ${afterStats.contractedEdges}`);

// Test 5: Performance de contraction avec différents tailles
console.log('\n📊 Test 5: Performance selon la taille du graphe');
const sizes = [50, 100, 200, 500];
const results = [];

for (const size of sizes) {
  const perfGraph = new Graph();
  
  // Créer un graphe de la taille spécifiée
  for (let i = 0; i < size - 1; i++) {
    perfGraph.addEdge(`n${i}`, `n${i + 1}`, { _id: i + 1, _cost: 1 });
    
    // Ajouter des connexions aléatoires
    if (Math.random() > 0.8) {
      const randomTarget = Math.floor(Math.random() * size);
      if (randomTarget !== i) {
        perfGraph.addEdge(`n${i}`, `n${randomTarget}`, { _id: 1000 + i, _cost: Math.random() * 5 + 1 });
      }
    }
  }
  
  const start = Date.now();
  perfGraph.contractGraph();
  const time = Date.now() - start;
  
  const nodeCount = Object.keys(perfGraph._nodeToIndexLookup).length;
  const edgeCount = perfGraph.adjacency_list.reduce((acc, edges) => acc + edges.length, 0);
  
  results.push({
    size,
    nodes: nodeCount,
    edges: edgeCount,
    time,
    timePerNode: time / nodeCount
  });
  
  console.log(`   ${size} nœuds: ${time}ms (${(time/nodeCount).toFixed(2)}ms/nœud)`);
}

// Résumé final
console.log('\n📈 Résumé des tests de construction:');
console.log('   - Petit graphe (10 nœuds):', smallTime, 'ms');
console.log('   - Graphe moyen (100 nœuds):', mediumTime, 'ms');
console.log('   - Graphe GeoJSON (50 arêtes):', geoTime, 'ms');
console.log('   - Analyse détaillée (20 nœuds):', analysisTime, 'ms');

console.log('\n📊 Performance par taille:');
results.forEach(r => {
  console.log(`   ${r.size} nœuds: ${r.time}ms (${r.timePerNode.toFixed(2)}ms/nœud, ${r.edges} arêtes)`);
});

console.log('\n🎉 Tests de construction du graphe de contraction terminés!');
