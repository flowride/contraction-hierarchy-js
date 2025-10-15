import { CoordinateLookup as CL, __geoindex as GI, __kdindex as KD } from './src/coordinateLookup.js';
import { createPathfinder } from './src/pathfinding.js';
import { _loadFromGeoJson, _cleanseGeoJsonNetwork } from './src/geojson.js';
import { addEdge, _addEdge, _addContractedEdge } from './src/addEdge.js';
import { loadCH, saveCH, loadPbfCH, savePbfCH } from './src/serialize.js';
import { createNodePool } from './src/nodePool.js';
import { contractGraph, _arrangeContractedPaths, _cleanAdjList, _contract, _createChShortcutter } from './src/contract.js';
import type { 
  GraphOptions, 
  GeoJSONNetwork, 
  GraphInterface, 
  AdjacencyList, 
  NodeToIndexLookup, 
  IndexToNodeLookup, 
  EdgePropertiesArray, 
  EdgeGeometryArray,
  NodePool,
  PathfinderOptions,
  PathfinderResult,
  EdgeProperties,
  EdgeGeometry
} from './src/types.js';

export const CoordinateLookup = CL;

// backdoor to export spatial indexing for custom solutions
export const __geoindex = GI;
export const __kdindex = KD;

export class Graph implements GraphInterface {
  debugMode: boolean;
  adjacency_list: AdjacencyList;
  reverse_adjacency_list: AdjacencyList;
  _createNodePool: () => NodePool;
  _currentNodeIndex: number;
  _nodeToIndexLookup: NodeToIndexLookup;
  _indexToNodeLookup: IndexToNodeLookup;
  _currentEdgeIndex: number;
  _edgeProperties: EdgePropertiesArray;
  _edgeGeometry: EdgeGeometryArray;
  _maxUncontractedEdgeIndex: number;
  _locked: boolean;
  _geoJsonFlag: boolean;
  _manualAdd: boolean;
  contracted_nodes?: number[];

  constructor(geojson?: GeoJSONNetwork, opt?: GraphOptions) {
    const options = opt || {};
    this.debugMode = options.debugMode || false;

    this.adjacency_list = [];
    this.reverse_adjacency_list = [];

    this._createNodePool = createNodePool;

    this._currentNodeIndex = -1;
    this._nodeToIndexLookup = {};
    this._indexToNodeLookup = {};

    this._currentEdgeIndex = -1;
    this._edgeProperties = [];
    this._edgeGeometry = [];
    this._maxUncontractedEdgeIndex = 0;

    this._locked = false; // locked if contraction has already been run
    this._geoJsonFlag = false; // if data was loaded as geoJson
    this._manualAdd = false; // if the API was used directly to add edges

    if (geojson) {
      this._loadFromGeoJson(geojson);

      if (this.debugMode) {
        console.log('Nodes: ', this._currentNodeIndex);
        console.log('Edges: ', this._currentEdgeIndex);
      }
    }
  }

  createPathfinder = createPathfinder;
  _loadFromGeoJson = _loadFromGeoJson;
  _cleanseGeoJsonNetwork = _cleanseGeoJsonNetwork;
  _addContractedEdge = _addContractedEdge;
  addEdge = addEdge;
  _addEdge = _addEdge;
  loadCH = loadCH;
  saveCH = saveCH;
  loadPbfCH = loadPbfCH;
  savePbfCH = savePbfCH;
  contractGraph = contractGraph;
  _arrangeContractedPaths = _arrangeContractedPaths;
  _cleanAdjList = _cleanAdjList;
  _contract = _contract;
  _createChShortcutter = _createChShortcutter;
}
