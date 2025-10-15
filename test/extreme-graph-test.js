import { Graph } from '../index.js';

console.log('🔥 Test EXTRÊME - Poussons les limites de Contraction Hierarchy');

// Test avec un graphe de 20000 nœuds
console.log('\n📊 Test EXTRÊME: Graphe de 20000 nœuds');
const extremeGraph = new Graph();

console.log('   Création du graphe extrême...');
const extremeCreateStart = Date.now();

// Créer un graphe en grille 141x141 (≈20000 nœuds)
const extremeGridSize = 141;
let extremeEdgeId = 1;

// Connexions minimales pour éviter la surcharge
for (let row = 0; row < extremeGridSize; row++) {
  for (let col = 0; col < extremeGridSize; col++) {
    const nodeId = `${row},${col}`;
    
    // Connexions horizontales seulement
    if (col < extremeGridSize - 1) {
      extremeGraph.addEdge(nodeId, `${row},${col + 1}`, { 
        _id: extremeEdgeId++, 
        _cost: Math.random() * 2 + 1 
      });
    }
    
    // Connexions verticales seulement
    if (row < extremeGridSize - 1) {
      extremeGraph.addEdge(nodeId, `${row + 1},${col}`, { 
        _id: extremeEdgeId++, 
        _cost: Math.random() * 2 + 1 
      });
    }
  }
}

const extremeCreateTime = Date.now() - extremeCreateStart;
const extremeNodeCount = Object.keys(extremeGraph._nodeToIndexLookup).length;
const extremeEdgeCount = extremeGraph.adjacency_list.reduce((acc, edges) => acc + edges.length, 0);

console.log(`   - Temps de création: ${extremeCreateTime}ms`);
console.log(`   - Nœuds créés: ${extremeNodeCount}`);
console.log(`   - Arêtes créées: ${extremeEdgeCount}`);

// Contraction du graphe extrême
console.log('\n⚡ Contraction du graphe extrême...');
const extremeContractStart = Date.now();
extremeGraph.contractGraph();
const extremeContractTime = Date.now() - extremeContractStart;

console.log(`   - Temps de contraction: ${extremeContractTime}ms`);
console.log(`   - Temps par nœud: ${(extremeContractTime / extremeNodeCount).toFixed(3)}ms`);

// Test de pathfinding sur le graphe extrême
console.log('\n🧭 Test de pathfinding sur le graphe extrême...');
const extremeFinder = extremeGraph.createPathfinder({ ids: true });

const extremeTestPaths = [
  ['0,0', '140,140'],    // Diagonal complet
  ['0,0', '70,70'],      // Centre
  ['35,35', '105,105']   // Quartier
];

let extremeTotalTime = 0;
for (const [start, end] of extremeTestPaths) {
  const pathStart = Date.now();
  const result = extremeFinder.queryContractionHierarchy(start, end);
  const pathTime = Date.now() - pathStart;
  extremeTotalTime += pathTime;
  
  console.log(`   ${start} → ${end}: coût=${result.total_cost.toFixed(2)}, temps=${pathTime}ms`);
}

console.log(`   - Temps moyen de pathfinding: ${(extremeTotalTime / extremeTestPaths.length).toFixed(2)}ms`);

// Test de performance avec le graphe extrême
console.log('\n📊 Test de performance extrême (10000 requêtes)');
const extremePerfStart = Date.now();
for (let i = 0; i < 10000; i++) {
  const start = `${Math.floor(Math.random() * extremeGridSize)},${Math.floor(Math.random() * extremeGridSize)}`;
  const end = `${Math.floor(Math.random() * extremeGridSize)},${Math.floor(Math.random() * extremeGridSize)}`;
  
  const result = extremeFinder.queryContractionHierarchy(start, end);
  
  if (i % 2000 === 0) {
    console.log(`   Requête ${i}: coût=${result.total_cost.toFixed(2)}`);
  }
}
const extremePerfTime = Date.now() - extremePerfStart;

console.log(`   - Temps total: ${extremePerfTime}ms`);
console.log(`   - Temps moyen: ${(extremePerfTime / 10000).toFixed(3)}ms/requête`);
console.log(`   - Requêtes par seconde: ${Math.round(10000 / (extremePerfTime / 1000))}`);

// Test de comparaison avec différents algorithmes
console.log('\n📊 Test de comparaison: Contraction Hierarchy vs Simulation naïve');
console.log('   Test sur un graphe plus petit pour la comparaison...');

const comparisonGraph = new Graph();
const compGridSize = 50; // 2500 nœuds
let compEdgeId = 1;

// Créer un graphe de comparaison
for (let row = 0; row < compGridSize; row++) {
  for (let col = 0; col < compGridSize; col++) {
    const nodeId = `${row},${col}`;
    
    if (col < compGridSize - 1) {
      comparisonGraph.addEdge(nodeId, `${row},${col + 1}`, { 
        _id: compEdgeId++, 
        _cost: Math.random() * 3 + 1 
      });
    }
    
    if (row < compGridSize - 1) {
      comparisonGraph.addEdge(nodeId, `${row + 1},${col}`, { 
        _id: compEdgeId++, 
        _cost: Math.random() * 3 + 1 
      });
    }
  }
}

const compNodeCount = Object.keys(comparisonGraph._nodeToIndexLookup).length;
console.log(`   - Graphe de comparaison: ${compNodeCount} nœuds`);

// Contraction
const compContractStart = Date.now();
comparisonGraph.contractGraph();
const compContractTime = Date.now() - compContractStart;

// Test CH
const compFinder = comparisonGraph.createPathfinder({ ids: true });
const compTestPaths = [
  ['0,0', '49,49'],
  ['0,0', '25,25'],
  ['10,10', '40,40']
];

let compCHTime = 0;
for (const [start, end] of compTestPaths) {
  const startTime = Date.now();
  compFinder.queryContractionHierarchy(start, end);
  compCHTime += Date.now() - startTime;
}

console.log(`   - Temps de contraction: ${compContractTime}ms`);
console.log(`   - Temps CH moyen: ${(compCHTime / compTestPaths.length).toFixed(2)}ms`);

// Simulation naïve (simplifiée)
function naivePathfinding(graph, start, end) {
  const distances = {};
  const visited = new Set();
  const queue = [{ node: start, cost: 0 }];
  
  distances[start] = 0;
  
  while (queue.length > 0) {
    queue.sort((a, b) => a.cost - b.cost);
    const { node, cost } = queue.shift();
    
    if (visited.has(node)) continue;
    visited.add(node);
    
    if (node === end) break;
    
    const nodeIndex = graph._nodeToIndexLookup[node];
    if (nodeIndex !== undefined && graph.adjacency_list[nodeIndex]) {
      for (const edge of graph.adjacency_list[nodeIndex]) {
        const neighbor = graph._indexToNodeLookup[edge.end];
        if (!visited.has(neighbor)) {
          const newCost = cost + edge.cost;
          if (distances[neighbor] === undefined || newCost < distances[neighbor]) {
            distances[neighbor] = newCost;
            queue.push({ node: neighbor, cost: newCost });
          }
        }
      }
    }
  }
  
  return distances[end] || 0;
}

let compNaiveTime = 0;
for (const [start, end] of compTestPaths) {
  const startTime = Date.now();
  naivePathfinding(comparisonGraph, start, end);
  compNaiveTime += Date.now() - startTime;
}

console.log(`   - Temps naïf moyen: ${(compNaiveTime / compTestPaths.length).toFixed(2)}ms`);
console.log(`   - Amélioration CH: ${(compNaiveTime / compCHTime).toFixed(1)}x plus rapide`);

// Test de mémoire avec le graphe extrême
console.log('\n📊 Test de mémoire avec le graphe extrême');
const memBefore = process.memoryUsage();
console.log(`   - Mémoire avant: ${(memBefore.heapUsed / 1024 / 1024).toFixed(2)}MB`);

// Créer un graphe supplémentaire pour tester la mémoire
const memTestGraph = new Graph();
for (let i = 0; i < 5000; i++) {
  memTestGraph.addEdge(`x${i}`, `y${i}`, { _id: i + 1, _cost: 1 });
}
memTestGraph.contractGraph();

const memAfter = process.memoryUsage();
console.log(`   - Mémoire après: ${(memAfter.heapUsed / 1024 / 1024).toFixed(2)}MB`);
console.log(`   - Croissance: ${((memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024).toFixed(2)}MB`);

// Résumé final
console.log('\n📈 Résumé des tests EXTRÊMES:');
console.log(`   - Graphe 20000 nœuds:`);
console.log(`     * Création: ${extremeCreateTime}ms`);
console.log(`     * Contraction: ${extremeContractTime}ms (${(extremeContractTime/extremeNodeCount).toFixed(3)}ms/nœud)`);
console.log(`     * Pathfinding: ${(extremeTotalTime / extremeTestPaths.length).toFixed(2)}ms/requête`);
console.log(`   - Performance extrême:`);
console.log(`     * 10000 requêtes: ${extremePerfTime}ms`);
console.log(`     * Débit: ${Math.round(10000 / (extremePerfTime / 1000))} requêtes/seconde`);
console.log(`   - Comparaison:`);
console.log(`     * CH vs Naïf: ${(compNaiveTime / compCHTime).toFixed(1)}x plus rapide`);

console.log('\n🎉 Tests EXTRÊMES terminés!');
console.log('🏆 Conclusion: Contraction Hierarchy gère même les graphes MASSIFS!');
console.log('🚀 TypeScript maintient toutes les performances même à cette échelle!');
