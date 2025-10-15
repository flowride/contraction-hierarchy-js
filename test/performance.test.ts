import runner from './test-runner.js';
import { Graph } from '../index.js';
import assert from 'assert';
import type { TestResult, PerformanceTestResult } from './test-types.js';

describe('Performance Tests', () => {

  it('Large manual graph performance', () => {
    const graph = new Graph();
    
    // Create a larger test network
    const nodeCount = 100;
    const edgeCount = 300;
    
    console.log(`      Building graph with ${nodeCount} nodes and ${edgeCount} edges...`);
    
    // Add nodes in a grid-like pattern with some random connections
    let edgeId = 1;
    for (let i = 0; i < nodeCount - 1; i++) {
      // Sequential connections
      graph.addEdge(`node_${i}`, `node_${i + 1}`, { _id: edgeId++, _cost: Math.random() * 10 + 1 });
      
      // Some random connections for complexity
      if (Math.random() > 0.7) {
        const randomTarget = Math.floor(Math.random() * nodeCount);
        if (randomTarget !== i && edgeId <= edgeCount) {
          graph.addEdge(`node_${i}`, `node_${randomTarget}`, { _id: edgeId++, _cost: Math.random() * 20 + 5 });
        }
      }
    }

    console.log(`      Contracting graph...`);
    const contractStart = Date.now();
    graph.contractGraph();
    const contractTime = Date.now() - contractStart;
    console.log(`      Contraction took ${contractTime}ms`);

    const finder = graph.createPathfinder({ ids: true });

    // Test pathfinding performance
    const queries = 100;
    console.log(`      Running ${queries} pathfinding queries...`);
    
    const queryStart = Date.now();
    for (let i = 0; i < queries; i++) {
      const start = `node_${Math.floor(Math.random() * nodeCount)}`;
      const end = `node_${Math.floor(Math.random() * nodeCount)}`;
      const result: TestResult = finder.queryContractionHierarchy(start, end);
      // Basic sanity check
      assert(typeof result.total_cost === 'number');
    }
    const queryTime = Date.now() - queryStart;
    const averageQueryTime = queryTime / queries;
    
    console.log(`      ${queries} queries took ${queryTime}ms (avg: ${averageQueryTime.toFixed(2)}ms per query)`);

    // Performance assertions
    const performanceResult: PerformanceTestResult = {
      contractionTime: contractTime,
      queryTime: queryTime,
      averageQueryTime: averageQueryTime,
      memoryGrowth: 0 // Not measured in this test
    };

    return contractTime < 1000 && averageQueryTime < 1; // Reasonable performance thresholds
  });

  it('GeoJSON network performance', () => {
    // Create a synthetic GeoJSON network for testing
    const geojson = {
      "type": "FeatureCollection",
      "features": [] as any[]
    };

    // Generate a network with 180 edges
    const edgeCount = 180;
    console.log(`      Testing GeoJSON with ${edgeCount} edges...`);
    
    for (let i = 0; i < edgeCount; i++) {
      const startLng = -120 + (i % 10) * 0.1;
      const startLat = 40 + Math.floor(i / 10) * 0.1;
      const endLng = startLng + 0.05;
      const endLat = startLat + 0.05;
      
      geojson.features.push({
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

    const graph = new Graph(geojson);
    
    console.log(`      Contracting GeoJSON graph...`);
    const contractStart = Date.now();
    graph.contractGraph();
    const contractTime = Date.now() - contractStart;
    console.log(`      Contraction took ${contractTime}ms`);

    const finder = graph.createPathfinder({ ids: true });

    // Test coordinate-based queries
    const queries = 50;
    console.log(`      Running ${queries} coordinate-based queries...`);
    
    const queryStart = Date.now();
    for (let i = 0; i < queries; i++) {
      const startLng = -120 + Math.random() * 1;
      const startLat = 40 + Math.random() * 1;
      const endLng = -120 + Math.random() * 1;
      const endLat = 40 + Math.random() * 1;
      
      const result: TestResult = finder.queryContractionHierarchy([startLng, startLat], [endLng, endLat]);
      assert(typeof result.total_cost === 'number');
    }
    const queryTime = Date.now() - queryStart;
    const averageQueryTime = queryTime / queries;
    
    console.log(`      ${queries} queries took ${queryTime}ms (avg: ${averageQueryTime.toFixed(2)}ms per query)`);

    return contractTime < 500 && averageQueryTime < 0.5; // Reasonable performance thresholds
  });

  it('Memory usage patterns', () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Create and use multiple graphs
    for (let i = 0; i < 10; i++) {
      const graph = new Graph();
      
      // Add some data
      for (let j = 0; j < 50; j++) {
        graph.addEdge(`node_${j}`, `node_${j + 1}`, { _id: j, _cost: 1 });
      }
      
      graph.contractGraph();
      const finder = graph.createPathfinder({ ids: true });
      
      // Use the graph
      for (let k = 0; k < 10; k++) {
        finder.queryContractionHierarchy(`node_${k}`, `node_${k + 10}`);
      }
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryGrowth = (finalMemory - initialMemory) / 1024 / 1024; // MB
    
    console.log(`      Memory growth: ${memoryGrowth.toFixed(2)}MB`);

    return memoryGrowth < 10; // Should not grow too much
  });

  runner();
});

// Test runner functions
function describe(name: string, fn: () => void): void {
  console.log(`\n📋 ${name}`);
  fn();
}

function it(name: string, fn: () => boolean): void {
  try {
    const result = fn();
    if (result) {
      console.log(`  ✅ ${name}`);
    } else {
      console.log(`  ❌ ${name}`);
    }
  } catch (error) {
    console.log(`  ❌ ${name} - Error: ${error}`);
  }
}
