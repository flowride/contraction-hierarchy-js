import { Graph } from '../index.js';

console.log('🔬 Analyse approfondie du processus de contraction');

// Créer un graphe de test avec des caractéristiques spécifiques
const graph = new Graph();

console.log('📊 Création d\'un graphe de test complexe...');

// Créer un graphe en forme de grille avec des connexions diagonales
const gridSize = 5; // 5x5 = 25 nœuds
let edgeId = 1;

// Connexions horizontales
for (let row = 0; row < gridSize; row++) {
  for (let col = 0; col < gridSize - 1; col++) {
    const from = `${row},${col}`;
    const to = `${row},${col + 1}`;
    graph.addEdge(from, to, { 
      _id: edgeId++, 
      _cost: Math.random() * 5 + 1,
      _type: 'horizontal'
    });
  }
}

// Connexions verticales
for (let row = 0; row < gridSize - 1; row++) {
  for (let col = 0; col < gridSize; col++) {
    const from = `${row},${col}`;
    const to = `${row + 1},${col}`;
    graph.addEdge(from, to, { 
      _id: edgeId++, 
      _cost: Math.random() * 5 + 1,
      _type: 'vertical'
    });
  }
}

// Quelques connexions diagonales
for (let row = 0; row < gridSize - 1; row++) {
  for (let col = 0; col < gridSize - 1; col++) {
    if (Math.random() > 0.6) {
      const from = `${row},${col}`;
      const to = `${row + 1},${col + 1}`;
      graph.addEdge(from, to, { 
        _id: edgeId++, 
        _cost: Math.random() * 8 + 2,
        _type: 'diagonal'
      });
    }
  }
}

console.log('   Avant contraction:');
const beforeStats = {
  nodes: Object.keys(graph._nodeToIndexLookup).length,
  edges: graph.adjacency_list.reduce((acc, edges) => acc + edges.length, 0),
  horizontalEdges: graph.adjacency_list.reduce((acc, edges) => 
    acc + edges.filter(edge => graph._edgeProperties[edge.attrs]?._type === 'horizontal').length, 0),
  verticalEdges: graph.adjacency_list.reduce((acc, edges) => 
    acc + edges.filter(edge => graph._edgeProperties[edge.attrs]?._type === 'vertical').length, 0),
  diagonalEdges: graph.adjacency_list.reduce((acc, edges) => 
    acc + edges.filter(edge => graph._edgeProperties[edge.attrs]?._type === 'diagonal').length, 0)
};

console.log(`   - Nœuds: ${beforeStats.nodes}`);
console.log(`   - Arêtes totales: ${beforeStats.edges}`);
console.log(`   - Arêtes horizontales: ${beforeStats.horizontalEdges}`);
console.log(`   - Arêtes verticales: ${beforeStats.verticalEdges}`);
console.log(`   - Arêtes diagonales: ${beforeStats.diagonalEdges}`);

// Analyser la densité du graphe
const maxPossibleEdges = beforeStats.nodes * (beforeStats.nodes - 1);
const density = (beforeStats.edges / maxPossibleEdges) * 100;
console.log(`   - Densité du graphe: ${density.toFixed(2)}%`);

console.log('\n⚡ Début de la contraction...');
const startTime = Date.now();

// Surveiller le processus de contraction
let contractionSteps = 0;
const originalContractGraph = graph.contractGraph;

// Wrapper pour surveiller les étapes
graph.contractGraph = function() {
  console.log('   🔄 Étape de contraction en cours...');
  contractionSteps++;
  return originalContractGraph.call(this);
};

graph.contractGraph();

const contractionTime = Date.now() - startTime;

console.log('\n   Après contraction:');
const afterStats = {
  contractedNodes: Object.keys(graph.contracted_nodes || {}).length,
  totalEdges: graph.adjacency_list.reduce((acc, edges) => acc + edges.length, 0),
  originalEdges: graph.adjacency_list.reduce((acc, edges) => 
    acc + edges.filter(edge => edge.attrs <= graph._maxUncontractedEdgeIndex).length, 0),
  contractedEdges: graph.adjacency_list.reduce((acc, edges) => 
    acc + edges.filter(edge => edge.attrs > graph._maxUncontractedEdgeIndex).length, 0)
};

console.log(`   - Temps de contraction: ${contractionTime}ms`);
console.log(`   - Étapes de contraction: ${contractionSteps}`);
console.log(`   - Nœuds contractés: ${afterStats.contractedNodes}`);
console.log(`   - Arêtes totales: ${afterStats.totalEdges}`);
console.log(`   - Arêtes originales: ${afterStats.originalEdges}`);
console.log(`   - Arêtes de contraction: ${afterStats.contractedEdges}`);

// Analyser l'efficacité de la contraction
const contractionRatio = afterStats.contractedEdges / afterStats.originalEdges;
console.log(`   - Ratio de contraction: ${contractionRatio.toFixed(2)}`);

// Test de pathfinding après contraction
console.log('\n🧭 Test de pathfinding après contraction:');
const finder = graph.createPathfinder({ ids: true });

// Tester plusieurs chemins
const testPaths = [
  ['0,0', '4,4'], // Diagonal
  ['0,0', '0,4'], // Horizontal
  ['0,0', '4,0'], // Vertical
  ['1,1', '3,3'], // Central
];

let totalPathfindingTime = 0;
for (const [start, end] of testPaths) {
  const pathStart = Date.now();
  const result = finder.queryContractionHierarchy(start, end);
  const pathTime = Date.now() - pathStart;
  totalPathfindingTime += pathTime;
  
  console.log(`   ${start} → ${end}: coût=${result.total_cost}, temps=${pathTime}ms, IDs=[${result.ids}]`);
}

console.log(`   - Temps moyen de pathfinding: ${(totalPathfindingTime / testPaths.length).toFixed(2)}ms`);

// Analyse de la hiérarchie de contraction
console.log('\n📊 Analyse de la hiérarchie de contraction:');
if (graph.contracted_nodes) {
  const ranks = Object.values(graph.contracted_nodes);
  const minRank = Math.min(...ranks);
  const maxRank = Math.max(...ranks);
  const avgRank = ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length;
  
  console.log(`   - Rang minimum: ${minRank}`);
  console.log(`   - Rang maximum: ${maxRank}`);
  console.log(`   - Rang moyen: ${avgRank.toFixed(2)}`);
  
  // Analyser la distribution des rangs
  const rankDistribution = {};
  ranks.forEach(rank => {
    rankDistribution[rank] = (rankDistribution[rank] || 0) + 1;
  });
  
  console.log('   - Distribution des rangs:');
  Object.entries(rankDistribution)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .forEach(([rank, count]) => {
      console.log(`     Rang ${rank}: ${count} nœuds`);
    });
}

// Test de performance avec différents types de requêtes
console.log('\n⚡ Test de performance avec différents types de requêtes:');
const performanceTests = [
  { name: 'Requêtes courtes', count: 100, maxDistance: 2 },
  { name: 'Requêtes moyennes', count: 50, maxDistance: 4 },
  { name: 'Requêtes longues', count: 20, maxDistance: 6 }
];

for (const test of performanceTests) {
  const testStart = Date.now();
  
  for (let i = 0; i < test.count; i++) {
    const start = `${Math.floor(Math.random() * gridSize)},${Math.floor(Math.random() * gridSize)}`;
    const end = `${Math.floor(Math.random() * gridSize)},${Math.floor(Math.random() * gridSize)}`;
    
    const result = finder.queryContractionHierarchy(start, end);
    // Filtrer les résultats par distance
    if (result.total_cost > test.maxDistance * 10) continue;
  }
  
  const testTime = Date.now() - testStart;
  const avgTime = testTime / test.count;
  
  console.log(`   ${test.name}: ${testTime}ms pour ${test.count} requêtes (${avgTime.toFixed(3)}ms/requête)`);
}

console.log('\n🎉 Analyse approfondie terminée!');
console.log('\n📈 Résumé:');
console.log(`   - Contraction: ${contractionTime}ms pour ${beforeStats.nodes} nœuds`);
console.log(`   - Efficacité: ${contractionRatio.toFixed(2)} arêtes de contraction par arête originale`);
console.log(`   - Pathfinding: ${(totalPathfindingTime / testPaths.length).toFixed(2)}ms en moyenne`);
console.log(`   - Performance: Excellent pour les requêtes répétées`);
