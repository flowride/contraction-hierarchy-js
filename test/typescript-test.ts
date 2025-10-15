import { Graph } from '../index.js';
import type { TestResult } from './test-types.js';

console.log('🧪 Testing TypeScript conversion...');

// Test simple de création de graphe
const graph = new Graph();
console.log('✅ Graph created successfully');

// Test d'ajout d'arêtes
graph.addEdge('A', 'B', { _id: 1, _cost: 5 });
graph.addEdge('B', 'C', { _id: 2, _cost: 3 });
console.log('✅ Edges added successfully');

// Test de contraction
graph.contractGraph();
console.log('✅ Graph contracted successfully');

// Test de pathfinding
const finder = graph.createPathfinder({ ids: true });
const result: TestResult = finder.queryContractionHierarchy('A', 'C');

console.log('✅ Pathfinding completed');
console.log(`   Total cost: ${result.total_cost}`);
console.log(`   Path IDs: ${result.ids}`);

// Vérification des résultats
if (result.total_cost === 8 && result.ids && result.ids.length === 2) {
  console.log('🎉 TypeScript conversion test PASSED!');
} else {
  console.log('❌ TypeScript conversion test FAILED!');
  process.exit(1);
}
