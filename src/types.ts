// Types for Contraction Hierarchy Graph

export interface GraphOptions {
  debugMode?: boolean;
}

export interface EdgeProperties {
  _cost: number;
  _start_index?: number;
  _end_index?: number;
  _id?: number | number[];
  _ordered?: number[];
  [key: string]: any;
}

export type EdgeGeometry = number[][];

export interface Edge {
  end: number;
  cost: number;
  attrs: number;
}

export interface AdjacencyList extends Array<Edge[]> {}

export interface NodeToIndexLookup {
  [nodeId: string]: number;
}

export interface IndexToNodeLookup {
  [index: number]: string;
}

export interface EdgePropertiesArray {
  [edgeIndex: number]: EdgeProperties;
}

export interface EdgeGeometryArray {
  [edgeIndex: number]: EdgeGeometry;
}

export interface NodeState {
  id: number;
  dist: number;
  prev?: number;
  visited?: boolean;
  opened: boolean;
  heapIndex: number;
  attrs?: number;
}

export interface NodePool {
  createNewState(node: Partial<NodeState>): NodeState;
  reset(): void;
}

export interface NodeHeapOptions {
  compare: (a: any, b: any) => number;
  setNodeId?: boolean;
}

export interface NodeHeap {
  data: any[];
  length: number;
  compare: (a: any, b: any) => number;
  setNodeId: (nodeSearchState: any, heapIndex: number) => void;
  push(item: any): void;
  pop(): any;
  peek(): any;
  updateItem(pos: number): void;
}

export interface PathfinderOptions {
  ids?: boolean;
  path?: boolean;
  nodes?: boolean;
  properties?: boolean;
}

export interface PathfinderResult {
  total_cost: number;
  ids?: number[];
  path?: any;
  properties?: any[];
  nodes?: any[];
}


export interface ContractionHierarchyData {
  _locked: boolean;
  _geoJsonFlag: boolean;
  adjacency_list: AdjacencyList;
  reverse_adjacency_list: AdjacencyList;
  _nodeToIndexLookup: NodeToIndexLookup;
  _edgeProperties: EdgePropertiesArray;
  _edgeGeometry: EdgeGeometryArray;
}

export interface GeoJSONFeature {
  type: 'Feature';
  properties: any;
  geometry: {
    type: 'LineString' | 'MultiLineString';
    coordinates: number[][] | number[][][];
  };
}

export interface GeoJSONNetwork {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface CoordinateLookupOptions {
  [key: string]: any;
}

export interface CoordinateLookup {
  [key: string]: any;
}

// Protobuf types (generated from structure.proto)
export interface ContractionHierarchy {
  read(pbf: any, end: number): ContractionHierarchyData;
  write(obj: ContractionHierarchyData, pbf: any): void;
  AdjList: {
    read(pbf: any, end: number): { edges: Edge[] };
    write(obj: { edges: Edge[] }, pbf: any): void;
  };
  EdgeAttrs: {
    read(pbf: any, end: number): Edge;
    write(obj: Edge, pbf: any): void;
  };
  GeometryArray: {
    read(pbf: any, end: number): { linestrings: any[] };
    write(obj: { linestrings: any[] }, pbf: any): void;
  };
  LineStringAray: {
    read(pbf: any, end: number): { coords: number[] };
    write(obj: { coords: number[] }, pbf: any): void;
  };
  _FieldEntry5: {
    read(pbf: any, end: number): { key: string; value: number };
    write(obj: { key: string; value: number }, pbf: any): void;
  };
}

// Main Graph class interface
export interface GraphInterface {
  debugMode: boolean;
  adjacency_list: AdjacencyList;
  reverse_adjacency_list: AdjacencyList;
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

  _createNodePool(): NodePool;
  createPathfinder(options?: PathfinderOptions): {
    queryContractionHierarchy(start: string | number, end: string | number): PathfinderResult;
  };
  addEdge(start: string | number, end: string | number, edge_properties: EdgeProperties, edge_geometry?: EdgeGeometry, is_undirected?: boolean): void;
  _addEdge(start: string | number, end: string | number, edge_properties: EdgeProperties, edge_geometry?: EdgeGeometry, is_undirected?: boolean): void;
  _addContractedEdge(start_index: number, end_index: number, properties: EdgeProperties): void;
  contractGraph(): void;
  _arrangeContractedPaths(adj_list: AdjacencyList): void;
  _cleanAdjList(adj_list: AdjacencyList): void;
  _contract(v: number, get_count_only: boolean, finder: any): number;
  _createChShortcutter(): any;
  _loadFromGeoJson(filedata: GeoJSONNetwork): void;
  _cleanseGeoJsonNetwork(file: GeoJSONNetwork): GeoJSONFeature[];
  loadCH(data: any): void;
  saveCH(): any;
  loadPbfCH(data: any): void;
  savePbfCH(path: string): Promise<void>;
}
