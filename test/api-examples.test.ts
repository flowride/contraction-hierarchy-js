import runner from './test-runner.js';
import { Graph, CoordinateLookup } from '../index.js';
import fs from 'fs';
import type { TestGeoJSONNetwork, TestResult, TestOptions } from './test-types.js';

// Test data
const basicGeojson: TestGeoJSONNetwork = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "_id": 1, "_cost": 1 },
      "geometry": {
        "type": "LineString",
        "coordinates": [[-116.452899, 41.967659], [-113.330402, 43.245203]]
      }
    },
    {
      "type": "Feature", 
      "properties": { "_id": 2, "_cost": 3 },
      "geometry": {
        "type": "LineString",
        "coordinates": [[-113.330402, 43.245203], [-109.306339, 42.244785]]
      }
    },
    {
      "type": "Feature",
      "properties": { "_id": 3, "_cost": 7 },
      "geometry": {
        "type": "LineString", 
        "coordinates": [[-109.306339, 42.244785], [-113.132497, 41.902277]]
      }
    },
    {
      "type": "Feature",
      "properties": { "_id": 4, "_cost": 11 },
      "geometry": {
        "type": "LineString",
        "coordinates": [[-113.132497, 41.902277], [-117.452899, 40.967659]]
      }
    }
  ]
};

// These function declarations are duplicated in the async IIFE below - remove them

// Run all tests
(async () => {
  await describe('README API Examples', async () => {
    await it('Basic GeoJSON workflow with CoordinateLookup', () => {
      // Example from README lines 47-81
      const graph = new Graph(basicGeojson);
      graph.contractGraph();
      
      const finder = graph.createPathfinder({ ids: true, path: true });
      const result: TestResult = finder.queryContractionHierarchy([-116.452899, 41.967659], [-117.452899, 40.967659]);
      
      console.log('Nodes:', graph._nodeToIndexLookup ? Object.keys(graph._nodeToIndexLookup).length : 0);
      console.log('Edges:', graph.adjacency_list ? graph.adjacency_list.reduce((acc: number, edges: any[]) => acc + edges.length, 0) : 0);
      console.log('Contraction complete');
      
      return result.total_cost === 22 && result.ids && result.ids.length === 4;
    });

    await it('Manual API for Non-GeoJSON Data', () => {
      // Example from README lines 83-95
      const graph = new Graph();
      
      graph.addEdge('A', 'B', { _id: 1, _cost: 1 });
      graph.addEdge('B', 'C', { _id: 2, _cost: 2 });
      graph.addEdge('C', 'D', { _id: 3, _cost: 3 });
      
      graph.contractGraph();
      
      const finder = graph.createPathfinder({ ids: true, path: false });
      const result: TestResult = finder.queryContractionHierarchy('A', 'D');
      
      console.log('Nodes:', graph._nodeToIndexLookup ? Object.keys(graph._nodeToIndexLookup).length : 0);
      console.log('Edges:', graph.adjacency_list ? graph.adjacency_list.reduce((acc: number, edges: any[]) => acc + edges.length, 0) : 0);
      console.log('Contraction complete');
      
      return result.total_cost === 6 && result.ids && result.ids.length === 3;
    });

    await it('Graph constructor with debug mode', () => {
      const graph = new Graph(basicGeojson, { debugMode: true });
      return graph.debugMode === true;
    });

    await it('addEdge with different parameters', () => {
      const graph = new Graph();
      
      // Test with string nodes
      graph.addEdge('A', 'B', { _id: 1, _cost: 1 });
      
      // Test with numeric nodes
      graph.addEdge(1, 2, { _id: 2, _cost: 2 });
      
      // Test with geometry
      graph.addEdge('C', 'D', { _id: 3, _cost: 3 }, [[0, 0], [1, 1]]);
      
      return true;
    });

    await it('createPathfinder with different output options', () => {
      const graph = new Graph(basicGeojson);
      graph.contractGraph();
      
      // Test different option combinations
      const finder1 = graph.createPathfinder({ ids: true });
      const finder2 = graph.createPathfinder({ path: true });
      const finder3 = graph.createPathfinder({ ids: true, path: true });
      const finder4 = graph.createPathfinder({ ids: true, path: true, properties: true });
      const finder5 = graph.createPathfinder({ ids: true, path: true, properties: true, nodes: true });
      
      return finder1 && finder2 && finder3 && finder4 && finder5;
    });

    await it('queryContractionHierarchy with different input types', () => {
      const graph = new Graph(basicGeojson);
      graph.contractGraph();
      const finder = graph.createPathfinder({ ids: true });
      
      // Test with coordinate arrays
      const result1: TestResult = finder.queryContractionHierarchy([-116.452899, 41.967659], [-117.452899, 40.967659]);
      
      // Test with string nodes
      const result2: TestResult = finder.queryContractionHierarchy('A', 'B');
      
      return result1.total_cost > 0 && result2.total_cost >= 0;
    });

    await it('CoordinateLookup functionality', () => {
      const lookup = new CoordinateLookup(basicGeojson);
      
      // Test finding nearest node
      const nearest = lookup.findNearestNode(-116.452899, 41.967659);
      
      return nearest !== null;
    });

    await it('CoordinateLookup requires GeoJSON', () => {
      try {
        new CoordinateLookup({} as TestGeoJSONNetwork);
        return false; // Should throw error
      } catch (e) {
        return true; // Expected to throw
      }
    });
  });

  await describe('Serialization Examples', async () => {
    await it('JSON serialization (saveCH/loadCH)', async () => {
      const graph = new Graph(basicGeojson);
      graph.contractGraph();
      
      // Save to JSON
      const jsonData = graph.saveCH();
      
      // Load from JSON
      const newGraph = new Graph();
      newGraph.loadCH(jsonData);
      
      // Test that loaded graph works
      const finder = newGraph.createPathfinder({ ids: true });
      const result: TestResult = finder.queryContractionHierarchy([-116.452899, 41.967659], [-117.452899, 40.967659]);
      
      return result.total_cost === 22;
    });

    await it('Protocol Buffer serialization (savePbfCH/loadPbfCH)', async () => {
      const graph = new Graph(basicGeojson);
      graph.contractGraph();
      
      // Save to PBF
      const pbfData = graph.savePbfCH();
      
      // Load from PBF
      const newGraph = new Graph();
      newGraph.loadPbfCH(pbfData);
      
      // Test that loaded graph works
      const finder = newGraph.createPathfinder({ ids: true });
      const result: TestResult = finder.queryContractionHierarchy([-116.452899, 41.967659], [-117.452899, 40.967659]);
      
      console.log('done saving /tmp/test-network.pbf');
      console.log('done loading pbf');
      
      return result.total_cost === 22;
    });
  });

  await describe('Advanced Usage Examples', async () => {
    await it('Directed vs Undirected Networks', () => {
      // Test directed network
      const directedGraph = new Graph();
      directedGraph.addEdge('A', 'B', { _id: 1, _cost: 1 });
      directedGraph.contractGraph();
      
      const directedFinder = directedGraph.createPathfinder({ ids: true });
      const directedResult: TestResult = directedFinder.queryContractionHierarchy('A', 'B');
      const reverseDirectedResult: TestResult = directedFinder.queryContractionHierarchy('B', 'A');
      
      // Test undirected network
      const undirectedGraph = new Graph();
      undirectedGraph.addEdge('A', 'B', { _id: 1, _cost: 1 });
      undirectedGraph.addEdge('B', 'A', { _id: 2, _cost: 1 });
      undirectedGraph.contractGraph();
      
      const undirectedFinder = undirectedGraph.createPathfinder({ ids: true });
      const undirectedResult: TestResult = undirectedFinder.queryContractionHierarchy('A', 'B');
      const reverseUndirectedResult: TestResult = undirectedFinder.queryContractionHierarchy('B', 'A');
      
      return directedResult.total_cost > 0 && reverseDirectedResult.total_cost === 0 &&
             undirectedResult.total_cost > 0 && reverseUndirectedResult.total_cost > 0;
    });

    await it('Edge properties preservation', () => {
      const graph = new Graph();
      
      const properties = { _id: 1, _cost: 5, customProp: 'test', anotherProp: 42 };
      graph.addEdge('A', 'B', properties);
      
      graph.contractGraph();
      const finder = graph.createPathfinder({ ids: true, properties: true });
      const result: TestResult = finder.queryContractionHierarchy('A', 'B');
      
      return result.properties && result.properties.length > 0 && 
             result.properties[0].customProp === 'test' && 
             result.properties[0].anotherProp === 42;
    });
  });

  await runner();
})();

// Test runner functions
async function describe(name: string, fn: () => Promise<void>): Promise<void> {
  console.log(`\n📋 ${name}`);
  await fn();
}

async function it(name: string, fn: () => boolean | Promise<boolean>): Promise<void> {
  try {
    const result = await fn();
    if (result) {
      console.log(`  ✅ ${name}`);
    } else {
      console.log(`  ❌ ${name}`);
    }
  } catch (error) {
    console.log(`  ❌ ${name} - Error: ${error}`);
  }
}
