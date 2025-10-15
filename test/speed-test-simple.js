import { Graph } from '../index.js';
import fs from 'fs';

console.log('🚀 Test de vitesse - Contraction Hierarchy vs approche naïve');

// Créer un graphe de test plus grand
const graph = new Graph();

console.log('📊 Création d\'un graphe de test avec 1000 nœuds et 3000 arêtes...');

// Créer un graphe en grille avec des connexions aléatoires
const nodeCount = 1000;
const edgeCount = 3000;
let edgeId = 1;

// Ajouter des nœuds en grille
for (let i = 0; i < nodeCount - 1; i++) {
  // Connexions séquentielles
  graph.addEdge(`node_${i}`, `node_${i + 1}`, { _id: edgeId++, _cost: Math.random() * 10 + 1 });
  
  // Connexions aléatoires pour la complexité
  if (Math.random() > 0.7) {
    const randomTarget = Math.floor(Math.random() * nodeCount);
    if (randomTarget !== i && edgeId <= edgeCount) {
      graph.addEdge(`node_${i}`, `node_${randomTarget}`, { _id: edgeId++, _cost: Math.random() * 20 + 5 });
    }
  }
}

console.log('⚡ Contraction du graphe...');
const contractStart = Date.now();
graph.contractGraph();
const contractTime = Date.now() - contractStart;
console.log(`✅ Contraction terminée en ${contractTime}ms`);

const finder = graph.createPathfinder({ ids: true });

// Test de performance
const iterations = 1000;
console.log(`🏃 Test de performance avec ${iterations} requêtes...`);

const nodeKeys = Object.keys(graph._nodeToIndexLookup);
const nodeLength = nodeKeys.length;

console.time('ContractionHierarchy');
for (let i = 0; i < iterations; i++) {
  const rnd1 = Math.floor(Math.random() * nodeLength);
  const rnd2 = Math.floor(Math.random() * nodeLength);
  const result = finder.queryContractionHierarchy(nodeKeys[rnd1], nodeKeys[rnd2]);
  
  // Vérification de base
  if (i % 100 === 0) {
    console.log(`   Requête ${i}: coût = ${result.total_cost}`);
  }
}
console.timeEnd('ContractionHierarchy');

// Test avec GeoJSON
console.log('\n🗺️ Test avec données GeoJSON...');
const geojson = JSON.parse(fs.readFileSync('./networks/basic.geojson'));
const geoGraph = new Graph(geojson);

const geoContractStart = Date.now();
geoGraph.contractGraph();
const geoContractTime = Date.now() - geoContractStart;
console.log(`✅ Contraction GeoJSON terminée en ${geoContractTime}ms`);

const geoFinder = geoGraph.createPathfinder({ ids: true });

console.time('GeoJSON Pathfinding');
for (let i = 0; i < 100; i++) {
  const result = geoFinder.queryContractionHierarchy([-116.452899, 41.967659], [-117.452899, 40.967659]);
  if (i % 20 === 0) {
    console.log(`   Requête GeoJSON ${i}: coût = ${result.total_cost}`);
  }
}
console.timeEnd('GeoJSON Pathfinding');

console.log('\n📈 Résumé des performances:');
console.log(`   - Contraction (${nodeCount} nœuds): ${contractTime}ms`);
console.log(`   - Contraction GeoJSON: ${geoContractTime}ms`);
console.log(`   - ${iterations} requêtes de pathfinding terminées`);
console.log('🎉 Test de vitesse terminé avec succès!');
