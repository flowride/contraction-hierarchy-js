import { Graph } from '../index.js';
import fs from 'fs';
import type { TestResult } from './test-types.js';

console.log('🚀 Test de vitesse TypeScript - Contraction Hierarchy');

// Créer un graphe de test
const graph = new Graph();

console.log('📊 Création d\'un graphe de test avec 500 nœuds et 1500 arêtes...');

// Créer un graphe en grille avec des connexions aléatoires
const nodeCount = 500;
const edgeCount = 1500;
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
const iterations = 500;
console.log(`🏃 Test de performance avec ${iterations} requêtes...`);

const nodeKeys = Object.keys(graph._nodeToIndexLookup);
const nodeLength = nodeKeys.length;

console.time('TypeScript ContractionHierarchy');
for (let i = 0; i < iterations; i++) {
  const rnd1 = Math.floor(Math.random() * nodeLength);
  const rnd2 = Math.floor(Math.random() * nodeLength);
  const result: TestResult = finder.queryContractionHierarchy(nodeKeys[rnd1], nodeKeys[rnd2]);
  
  // Vérification de base
  if (i % 100 === 0) {
    console.log(`   Requête ${i}: coût = ${result.total_cost}`);
  }
}
console.timeEnd('TypeScript ContractionHierarchy');

console.log('\n📈 Résumé des performances TypeScript:');
console.log(`   - Contraction (${nodeCount} nœuds): ${contractTime}ms`);
console.log(`   - ${iterations} requêtes de pathfinding terminées`);
console.log('🎉 Test de vitesse TypeScript terminé avec succès!');
