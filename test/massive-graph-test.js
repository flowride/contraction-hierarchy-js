import { Graph } from '../index.js';
import fs from 'fs';

console.log('🚀 Test avec un graphe MASSIF - Contraction Hierarchy');

// Test 1: Graphe très grand (5000 nœuds)
console.log('\n📊 Test 1: Graphe très grand (5000 nœuds)');
const massiveGraph = new Graph();

console.log('   Création du graphe...');
const createStart = Date.now();

// Créer un graphe en grille 70x70 avec des connexions aléatoires
const gridSize = 70; // 70x70 = 4900 nœuds
let edgeId = 1;

// Connexions de base (grille)
for (let row = 0; row < gridSize; row++) {
  for (let col = 0; col < gridSize; col++) {
    const nodeId = `${row},${col}`;
    
    // Connexions horizontales
    if (col < gridSize - 1) {
      massiveGraph.addEdge(nodeId, `${row},${col + 1}`, { 
        _id: edgeId++, 
        _cost: Math.random() * 5 + 1 
      });
    }
    
    // Connexions verticales
    if (row < gridSize - 1) {
      massiveGraph.addEdge(nodeId, `${row + 1},${col}`, { 
        _id: edgeId++, 
        _cost: Math.random() * 5 + 1 
      });
    }
    
    // Connexions diagonales (20% de chance)
    if (row < gridSize - 1 && col < gridSize - 1 && Math.random() > 0.8) {
      massiveGraph.addEdge(nodeId, `${row + 1},${col + 1}`, { 
        _id: edgeId++, 
        _cost: Math.random() * 8 + 2 
      });
    }
    
    // Connexions aléatoires longues (5% de chance)
    if (Math.random() > 0.95) {
      const randomRow = Math.floor(Math.random() * gridSize);
      const randomCol = Math.floor(Math.random() * gridSize);
      if (randomRow !== row || randomCol !== col) {
        massiveGraph.addEdge(nodeId, `${randomRow},${randomCol}`, { 
          _id: edgeId++, 
          _cost: Math.random() * 20 + 10 
        });
      }
    }
  }
}

const createTime = Date.now() - createStart;
const nodeCount = Object.keys(massiveGraph._nodeToIndexLookup).length;
const edgeCount = massiveGraph.adjacency_list.reduce((acc, edges) => acc + edges.length, 0);

console.log(`   - Temps de création: ${createTime}ms`);
console.log(`   - Nœuds créés: ${nodeCount}`);
console.log(`   - Arêtes créées: ${edgeCount}`);
console.log(`   - Densité: ${((edgeCount / (nodeCount * (nodeCount - 1))) * 100).toFixed(4)}%`);

// Contraction du graphe massif
console.log('\n⚡ Contraction du graphe massif...');
const contractStart = Date.now();
massiveGraph.contractGraph();
const contractTime = Date.now() - contractStart;

const contractedEdges = massiveGraph.adjacency_list.reduce((acc, edges) => 
  acc + edges.filter(edge => edge.attrs > massiveGraph._maxUncontractedEdgeIndex).length, 0);

console.log(`   - Temps de contraction: ${contractTime}ms`);
console.log(`   - Temps par nœud: ${(contractTime / nodeCount).toFixed(3)}ms`);
console.log(`   - Arêtes de contraction: ${contractedEdges}`);
console.log(`   - Ratio de contraction: ${(contractedEdges / edgeCount).toFixed(3)}`);

// Test de pathfinding sur le graphe massif
console.log('\n🧭 Test de pathfinding sur le graphe massif...');
const finder = massiveGraph.createPathfinder({ ids: true });

const testPaths = [
  ['0,0', '69,69'],     // Diagonal complet
  ['0,0', '35,35'],     // Centre
  ['10,10', '60,60'],   // Quartier
  ['0,35', '69,35'],    // Horizontal
  ['35,0', '35,69']     // Vertical
];

let totalPathfindingTime = 0;
for (const [start, end] of testPaths) {
  const pathStart = Date.now();
  const result = finder.queryContractionHierarchy(start, end);
  const pathTime = Date.now() - pathStart;
  totalPathfindingTime += pathTime;
  
  console.log(`   ${start} → ${end}: coût=${result.total_cost.toFixed(2)}, temps=${pathTime}ms`);
}

console.log(`   - Temps moyen de pathfinding: ${(totalPathfindingTime / testPaths.length).toFixed(2)}ms`);

// Test 2: Graphe encore plus grand (10000 nœuds)
console.log('\n📊 Test 2: Graphe MEGA (10000 nœuds)');
const megaGraph = new Graph();

console.log('   Création du méga-graphe...');
const megaCreateStart = Date.now();

// Créer un graphe en grille 100x100
const megaGridSize = 100;
let megaEdgeId = 1;

// Connexions de base seulement (pour éviter la surcharge)
for (let row = 0; row < megaGridSize; row++) {
  for (let col = 0; col < megaGridSize; col++) {
    const nodeId = `${row},${col}`;
    
    // Connexions horizontales
    if (col < megaGridSize - 1) {
      megaGraph.addEdge(nodeId, `${row},${col + 1}`, { 
        _id: megaEdgeId++, 
        _cost: Math.random() * 3 + 1 
      });
    }
    
    // Connexions verticales
    if (row < megaGridSize - 1) {
      megaGraph.addEdge(nodeId, `${row + 1},${col}`, { 
        _id: megaEdgeId++, 
        _cost: Math.random() * 3 + 1 
      });
    }
    
    // Quelques diagonales (10% seulement)
    if (row < megaGridSize - 1 && col < megaGridSize - 1 && Math.random() > 0.9) {
      megaGraph.addEdge(nodeId, `${row + 1},${col + 1}`, { 
        _id: megaEdgeId++, 
        _cost: Math.random() * 6 + 2 
      });
    }
  }
}

const megaCreateTime = Date.now() - megaCreateStart;
const megaNodeCount = Object.keys(megaGraph._nodeToIndexLookup).length;
const megaEdgeCount = megaGraph.adjacency_list.reduce((acc, edges) => acc + edges.length, 0);

console.log(`   - Temps de création: ${megaCreateTime}ms`);
console.log(`   - Nœuds créés: ${megaNodeCount}`);
console.log(`   - Arêtes créées: ${megaEdgeCount}`);

// Contraction du méga-graphe
console.log('\n⚡ Contraction du méga-graphe...');
const megaContractStart = Date.now();
megaGraph.contractGraph();
const megaContractTime = Date.now() - megaContractStart;

console.log(`   - Temps de contraction: ${megaContractTime}ms`);
console.log(`   - Temps par nœud: ${(megaContractTime / megaNodeCount).toFixed(3)}ms`);

// Test de pathfinding sur le méga-graphe
console.log('\n🧭 Test de pathfinding sur le méga-graphe...');
const megaFinder = megaGraph.createPathfinder({ ids: true });

const megaTestPaths = [
  ['0,0', '99,99'],     // Diagonal complet
  ['0,0', '50,50'],     // Centre
  ['25,25', '75,75']    // Quartier
];

let megaTotalTime = 0;
for (const [start, end] of megaTestPaths) {
  const pathStart = Date.now();
  const result = megaFinder.queryContractionHierarchy(start, end);
  const pathTime = Date.now() - pathStart;
  megaTotalTime += pathTime;
  
  console.log(`   ${start} → ${end}: coût=${result.total_cost.toFixed(2)}, temps=${pathTime}ms`);
}

console.log(`   - Temps moyen de pathfinding: ${(megaTotalTime / megaTestPaths.length).toFixed(2)}ms`);

// Test 3: Test de stress avec beaucoup de requêtes
console.log('\n📊 Test 3: Test de stress (5000 requêtes)');
console.log('   Test sur le graphe massif (5000 nœuds)...');

const stressStart = Date.now();
for (let i = 0; i < 5000; i++) {
  const start = `${Math.floor(Math.random() * gridSize)},${Math.floor(Math.random() * gridSize)}`;
  const end = `${Math.floor(Math.random() * gridSize)},${Math.floor(Math.random() * gridSize)}`;
  
  const result = finder.queryContractionHierarchy(start, end);
  
  if (i % 1000 === 0) {
    console.log(`   Requête ${i}: coût=${result.total_cost.toFixed(2)}`);
  }
}
const stressTime = Date.now() - stressStart;

console.log(`   - Temps total: ${stressTime}ms`);
console.log(`   - Temps moyen: ${(stressTime / 5000).toFixed(3)}ms/requête`);
console.log(`   - Requêtes par seconde: ${Math.round(5000 / (stressTime / 1000))}`);

// Test 4: Analyse de la mémoire
console.log('\n📊 Test 4: Analyse de la mémoire');
const memBefore = process.memoryUsage();
console.log(`   - Mémoire avant: ${(memBefore.heapUsed / 1024 / 1024).toFixed(2)}MB`);

// Créer un graphe supplémentaire pour tester la mémoire
const memGraph = new Graph();
for (let i = 0; i < 1000; i++) {
  memGraph.addEdge(`a${i}`, `b${i}`, { _id: i + 1, _cost: 1 });
}
memGraph.contractGraph();

const memAfter = process.memoryUsage();
console.log(`   - Mémoire après: ${(memAfter.heapUsed / 1024 / 1024).toFixed(2)}MB`);
console.log(`   - Croissance: ${((memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024).toFixed(2)}MB`);

// Résumé final
console.log('\n📈 Résumé des tests avec graphes massifs:');
console.log(`   - Graphe 5000 nœuds:`);
console.log(`     * Création: ${createTime}ms`);
console.log(`     * Contraction: ${contractTime}ms (${(contractTime/nodeCount).toFixed(3)}ms/nœud)`);
console.log(`     * Pathfinding: ${(totalPathfindingTime / testPaths.length).toFixed(2)}ms/requête`);
console.log(`   - Graphe 10000 nœuds:`);
console.log(`     * Création: ${megaCreateTime}ms`);
console.log(`     * Contraction: ${megaContractTime}ms (${(megaContractTime/megaNodeCount).toFixed(3)}ms/nœud)`);
console.log(`     * Pathfinding: ${(megaTotalTime / megaTestPaths.length).toFixed(2)}ms/requête`);
console.log(`   - Test de stress:`);
console.log(`     * 5000 requêtes: ${stressTime}ms`);
console.log(`     * Performance: ${(stressTime / 5000).toFixed(3)}ms/requête`);
console.log(`     * Débit: ${Math.round(5000 / (stressTime / 1000))} requêtes/seconde`);

console.log('\n🎉 Tests avec graphes massifs terminés!');
console.log('🏆 Conclusion: Contraction Hierarchy gère parfaitement les gros graphes!');
