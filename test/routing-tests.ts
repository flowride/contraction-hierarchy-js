import assert from 'assert';
import { Graph } from '../index.js';
import fs from 'fs';
import type { TestResult, TestOptions } from './test-types.js';

// simple directed graph, start to end
(function() {
  const graph = new Graph();

  // start_node, end_node, edge_properties, edge_geometry
  graph.addEdge('A', 'B', { _id: 100, _cost: 1 });
  graph.addEdge('B', 'C', { _id: 101, _cost: 2 });
  graph.contractGraph();
  const finder = graph.createPathfinder({ ids: true, path: false });
  const result: TestResult = finder.queryContractionHierarchy('A', 'C');

  assert(result.total_cost === 3);
  assert.deepEqual(result.ids, [100, 101]);
}());

// simple directed graph, end to start: No Path
(function() {
  const graph = new Graph();

  // start_node, end_node, edge_properties, edge_geometry
  graph.addEdge('A', 'B', { _id: 100, _cost: 1 });
  graph.addEdge('B', 'C', { _id: 101, _cost: 2 });
  graph.contractGraph();
  const finder = graph.createPathfinder({ ids: true, path: false });
  const result: TestResult = finder.queryContractionHierarchy('C', 'A');

  assert(result.total_cost === 0);
  assert.deepEqual(result.ids, []);
}());


// undirected graph, forward path
(function() {
  const graph = new Graph();

  // start_node, end_node, edge_properties, edge_geometry
  graph.addEdge('A', 'B', { _id: 100, _cost: 1 });
  graph.addEdge('B', 'A', { _id: 200, _cost: 1 });

  graph.addEdge('B', 'C', { _id: 101, _cost: 2 });
  graph.addEdge('C', 'B', { _id: 201, _cost: 2 });

  graph.addEdge('C', 'D', { _id: 102, _cost: 5 });
  graph.addEdge('D', 'C', { _id: 202, _cost: 5 });

  graph.contractGraph();
  const finder = graph.createPathfinder({ ids: true, path: false });
  const result: TestResult = finder.queryContractionHierarchy('A', 'D');

  assert(result.total_cost === 8);
  assert.deepEqual(result.ids, [100, 101, 102]);
}());

// undirected graph, reverse path
(function() {
  const graph = new Graph();

  // start_node, end_node, edge_properties, edge_geometry
  graph.addEdge('A', 'B', { _id: 100, _cost: 1 });
  graph.addEdge('B', 'A', { _id: 200, _cost: 1 });

  graph.addEdge('B', 'C', { _id: 101, _cost: 2 });
  graph.addEdge('C', 'B', { _id: 201, _cost: 2 });

  graph.addEdge('C', 'D', { _id: 102, _cost: 5 });
  graph.addEdge('D', 'C', { _id: 202, _cost: 5 });

  graph.contractGraph();
  const finder = graph.createPathfinder({ ids: true, path: false });
  const result: TestResult = finder.queryContractionHierarchy('D', 'A');

  assert(result.total_cost === 8);
  assert.deepEqual(result.ids, [202, 201, 200]);
}());

// undirected graph, forward path, geojson
(function() {
  const geojson = JSON.parse(fs.readFileSync('../networks/basic.geojson'));
  const graph = new Graph(geojson);

  graph.contractGraph();
  const finder = graph.createPathfinder({ ids: true, path: true });
  const result: TestResult = finder.queryContractionHierarchy([-116.452899, 41.967659], [-117.452899, 40.967659]);

  assert(result.total_cost === 22);
  assert.deepEqual(result.ids, [1, 2, 3, 4]);
  assert.deepEqual(result.path, {
    "type": "FeatureCollection",
    "features": [{
      "type": "Feature",
      "properties": { "_id": 1, "_cost": 1 },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [-116.452899, 41.967659],
          [-113.330402, 43.245203]
        ]
      }
    }, {
      "type": "Feature",
      "properties": { "_id": 2, "_cost": 3 },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [-113.330402, 43.245203],
          [-110.207905, 44.522747]
        ]
      }
    }, {
      "type": "Feature",
      "properties": { "_id": 3, "_cost": 7 },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [-110.207905, 44.522747],
          [-107.085408, 45.800291]
        ]
      }
    }, {
      "type": "Feature",
      "properties": { "_id": 4, "_cost": 11 },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [-107.085408, 45.800291],
          [-117.452899, 40.967659]
        ]
      }
    }]
  });
}());

// undirected graph, reverse path, geojson
(function() {
  const geojson = JSON.parse(fs.readFileSync('../networks/basic.geojson'));
  const graph = new Graph(geojson);

  graph.contractGraph();
  const finder = graph.createPathfinder({ ids: true, path: true });
  const result: TestResult = finder.queryContractionHierarchy([-117.452899, 40.967659], [-116.452899, 41.967659]);

  assert(result.total_cost === 22);
  assert.deepEqual(result.ids, [4, 3, 2, 1]);
  assert.deepEqual(result.path, {
    "type": "FeatureCollection",
    "features": [{
      "type": "Feature",
      "properties": { "_id": 4, "_cost": 11 },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [-117.452899, 40.967659],
          [-107.085408, 45.800291]
        ]
      }
    }, {
      "type": "Feature",
      "properties": { "_id": 3, "_cost": 7 },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [-107.085408, 45.800291],
          [-110.207905, 44.522747]
        ]
      }
    }, {
      "type": "Feature",
      "properties": { "_id": 2, "_cost": 3 },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [-110.207905, 44.522747],
          [-113.330402, 43.245203]
        ]
      }
    }, {
      "type": "Feature",
      "properties": { "_id": 1, "_cost": 1 },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [-113.330402, 43.245203],
          [-116.452899, 41.967659]
        ]
      }
    }]
  });
}());

// empty graph
(function() {
  const graph = new Graph();

  graph.contractGraph();
  const finder = graph.createPathfinder({ ids: true, path: false });
  const result: TestResult = finder.queryContractionHierarchy('A', 'B');

  assert(result.total_cost === 0);
  assert.deepEqual(result.ids, []);
}());

// single node query
(function() {
  const graph = new Graph();

  graph.addEdge('A', 'B', { _id: 100, _cost: 1 });
  graph.contractGraph();
  const finder = graph.createPathfinder({ ids: true, path: false });
  const result: TestResult = finder.queryContractionHierarchy('A', 'A');

  assert(result.total_cost === 0);
  assert.deepEqual(result.ids, []);
}());

console.log('Done.');
