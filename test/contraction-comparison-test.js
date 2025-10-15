import { Graph } from '../index.js';

console.log('⚡ Test de comparaison: Avant vs Après contraction');

// Créer un graphe de test
const graph = new Graph();

console.log('📊 Création d\'un graphe de test (100 nœuds)...');

// Créer un graphe en grille 10x10 avec des connexions aléatoires
const gridSize = 10;
let edgeId = 1;

// Connexions de base (grille)
for (let row = 0; row < gridSize; row++) {
  for (let col = 0; col < gridSize; col++) {
    const nodeId = `${row},${col}`;
    
    // Connexions horizontales
    if (col < gridSize - 1) {
      graph.addEdge(nodeId, `${row},${col + 1}`, { _id: edgeId++, _cost: Math.random() * 5 + 1 });
    }
    
    // Connexions verticales
    if (row < gridSize - 1) {
      graph.addEdge(nodeId, `${row + 1},${col}`, { _id: edgeId++, _cost: Math.random() * 5 + 1 });
    }
    
    // Connexions diagonales aléatoires
    if (row < gridSize - 1 && col < gridSize - 1 && Math.random() > 0.7) {
      graph.addEdge(nodeId, `${row + 1},${col + 1}`, { _id: edgeId++, _cost: Math.random() * 8 + 2 });
    }
    
    // Connexions aléatoires longues
    if (Math.random() > 0.9) {
      const randomRow = Math.floor(Math.random() * gridSize);
      const randomCol = Math.floor(Math.random() * gridSize);
      if (randomRow !== row || randomCol !== col) {
        graph.addEdge(nodeId, `${randomRow},${randomCol}`, { _id: edgeId++, _cost: Math.random() * 15 + 5 });
      }
    }
  }
}

const nodeCount = Object.keys(graph._nodeToIndexLookup).length;
const edgeCount = graph.adjacency_list.reduce((acc, edges) => acc + edges.length, 0);

console.log(`   - Nœuds: ${nodeCount}`);
console.log(`   - Arêtes: ${edgeCount}`);

// Test de pathfinding AVANT contraction (simulation naïve)
console.log('\n🐌 Test de pathfinding AVANT contraction (simulation)...');

// Simuler un pathfinding naïf (Dijkstra simple)
function naivePathfinding(start, end) {
  const distances = {};
  const previous = {};
  const unvisited = new Set();
  
  // Initialiser les distances
  Object.keys(graph._nodeToIndexLookup).forEach(node => {
    distances[node] = Infinity;
    unvisited.add(node);
  });
  distances[start] = 0;
  
  while (unvisited.size > 0) {
    // Trouver le nœud non visité avec la distance minimale
    let current = null;
    let minDistance = Infinity;
    for (const node of unvisited) {
      if (distances[node] < minDistance) {
        minDistance = distances[node];
        current = node;
      }
    }
    
    if (current === null || current === end) break;
    unvisited.delete(current);
    
    // Mettre à jour les distances des voisins
    const nodeIndex = graph._nodeToIndexLookup[current];
    if (nodeIndex !== undefined && graph.adjacency_list[nodeIndex]) {
      for (const edge of graph.adjacency_list[nodeIndex]) {
        const neighbor = graph._indexToNodeLookup[edge.end];
        if (neighbor && unvisited.has(neighbor)) {
          const alt = distances[current] + edge.cost;
          if (alt < distances[neighbor]) {
            distances[neighbor] = alt;
            previous[neighbor] = current;
          }
        }
      }
    }
  }
  
  return {
    total_cost: distances[end] === Infinity ? 0 : distances[end],
    path: previous
  };
}

// Tester quelques chemins avec l'algorithme naïf
const testPaths = [
  ['0,0', '9,9'],
  ['0,0', '5,5'],
  ['2,2', '7,7'],
  ['1,1', '8,8']
];

console.log('   Test avec algorithme naïf:');
let naiveTotalTime = 0;
for (const [start, end] of testPaths) {
  const startTime = Date.now();
  const result = naivePathfinding(start, end);
  const time = Date.now() - startTime;
  naiveTotalTime += time;
  console.log(`     ${start} → ${end}: coût=${result.total_cost.toFixed(2)}, temps=${time}ms`);
}

console.log(`   - Temps total naïf: ${naiveTotalTime}ms`);
console.log(`   - Temps moyen naïf: ${(naiveTotalTime / testPaths.length).toFixed(2)}ms`);

// Maintenant contracter le graphe
console.log('\n⚡ Contraction du graphe...');
const contractStart = Date.now();
graph.contractGraph();
const contractTime = Date.now() - contractStart;
console.log(`   - Temps de contraction: ${contractTime}ms`);

// Test de pathfinding APRÈS contraction
console.log('\n🚀 Test de pathfinding APRÈS contraction...');
const finder = graph.createPathfinder({ ids: true });

console.log('   Test avec Contraction Hierarchy:');
let chTotalTime = 0;
for (const [start, end] of testPaths) {
  const startTime = Date.now();
  const result = finder.queryContractionHierarchy(start, end);
  const time = Date.now() - startTime;
  chTotalTime += time;
  console.log(`     ${start} → ${end}: coût=${result.total_cost.toFixed(2)}, temps=${time}ms`);
}

console.log(`   - Temps total CH: ${chTotalTime}ms`);
console.log(`   - Temps moyen CH: ${(chTotalTime / testPaths.length).toFixed(2)}ms`);

// Test de performance avec beaucoup de requêtes
console.log('\n📊 Test de performance avec 1000 requêtes...');

// Test naïf (échantillon plus petit)
console.log('   Test naïf (100 requêtes):');
const naivePerfStart = Date.now();
for (let i = 0; i < 100; i++) {
  const start = `${Math.floor(Math.random() * gridSize)},${Math.floor(Math.random() * gridSize)}`;
  const end = `${Math.floor(Math.random() * gridSize)},${Math.floor(Math.random() * gridSize)}`;
  naivePathfinding(start, end);
}
const naivePerfTime = Date.now() - naivePerfStart;
console.log(`   - Temps naïf: ${naivePerfTime}ms (${(naivePerfTime/100).toFixed(2)}ms/requête)`);

// Test Contraction Hierarchy
console.log('   Test Contraction Hierarchy (1000 requêtes):');
const chPerfStart = Date.now();
for (let i = 0; i < 1000; i++) {
  const start = `${Math.floor(Math.random() * gridSize)},${Math.floor(Math.random() * gridSize)}`;
  const end = `${Math.floor(Math.random() * gridSize)},${Math.floor(Math.random() * gridSize)}`;
  finder.queryContractionHierarchy(start, end);
}
const chPerfTime = Date.now() - chPerfStart;
console.log(`   - Temps CH: ${chPerfTime}ms (${(chPerfTime/1000).toFixed(3)}ms/requête)`);

// Calculer l'amélioration
const naiveAvgTime = naivePerfTime / 100;
const chAvgTime = chPerfTime / 1000;
const speedup = naiveAvgTime / chAvgTime;

console.log('\n📈 Résumé de la comparaison:');
console.log(`   - Temps de contraction: ${contractTime}ms (coût unique)`);
console.log(`   - Temps moyen naïf: ${naiveAvgTime.toFixed(2)}ms/requête`);
console.log(`   - Temps moyen CH: ${chAvgTime.toFixed(3)}ms/requête`);
console.log(`   - Amélioration: ${speedup.toFixed(1)}x plus rapide`);
console.log(`   - Seuil de rentabilité: ${Math.ceil(contractTime / (naiveAvgTime - chAvgTime))} requêtes`);

if (speedup > 10) {
  console.log('🎉 Contraction Hierarchy est TRÈS efficace!');
} else if (speedup > 5) {
  console.log('✅ Contraction Hierarchy est efficace!');
} else if (speedup > 2) {
  console.log('👍 Contraction Hierarchy apporte une amélioration notable');
} else {
  console.log('⚠️ Contraction Hierarchy apporte une amélioration modeste');
}

console.log('\n🏆 Conclusion:');
console.log('   - La contraction est un investissement initial coûteux');
console.log('   - Mais elle paie très rapidement avec les requêtes répétées');
console.log('   - Idéal pour les applications avec beaucoup de pathfinding');
console.log('   - TypeScript maintient toutes les performances!');
