import { ContractionHierarchy as CH } from './structure.js';
import Pbf from 'pbf';
import type { GraphInterface, ContractionHierarchyData } from './types.js';

export const loadCH = function(this: GraphInterface, ch: string | ContractionHierarchyData): void {
  const parsed = (typeof ch === 'object') ? ch : JSON.parse(ch);
  this._locked = parsed._locked;
  this._geoJsonFlag = parsed._geoJsonFlag;
  this.adjacency_list = parsed.adjacency_list;
  this.reverse_adjacency_list = parsed.reverse_adjacency_list;
  this._nodeToIndexLookup = parsed._nodeToIndexLookup;
  this._edgeProperties = parsed._edgeProperties;
  this._edgeGeometry = parsed._edgeGeometry;
};

export const saveCH = function(this: GraphInterface): string {

  if (!this._locked) {
    throw new Error('No sense in saving network before it is contracted.');
  }

  return JSON.stringify({
    _locked: this._locked,
    _geoJsonFlag: this._geoJsonFlag,
    adjacency_list: this.adjacency_list,
    reverse_adjacency_list: this.reverse_adjacency_list,
    _nodeToIndexLookup: this._nodeToIndexLookup,
    _edgeProperties: this._edgeProperties,
    _edgeGeometry: this._edgeGeometry
  });
};


export const loadPbfCH = function(this: GraphInterface, buffer: ArrayBuffer): void {

  const readpbf = new Pbf(buffer);
  const obj = CH.read(readpbf);

  // back to graph compatible structure
  obj.adjacency_list = obj.adjacency_list.map((list: any) => {
    return list.edges;
  });

  obj.reverse_adjacency_list = obj.reverse_adjacency_list.map((list: any) => {
    return list.edges;
  });

  obj._edgeGeometry = obj._edgeGeometry.map((l: any) => {
    return l.linestrings.map((c: any) => {
      return c.coords;
    });
  });

  obj._edgeProperties = obj._edgeProperties.map((props: string) => {
    return JSON.parse(props);
  });


  this._locked = obj._locked;
  this._geoJsonFlag = obj._geoJsonFlag;
  this.adjacency_list = obj.adjacency_list;
  this.reverse_adjacency_list = obj.reverse_adjacency_list;
  this._nodeToIndexLookup = obj._nodeToIndexLookup;
  this._edgeProperties = obj._edgeProperties; // TODO... misc user properties
  this._edgeGeometry = obj._edgeGeometry;

  // Rebuild _indexToNodeLookup from _nodeToIndexLookup since it's not serialized in PBF
  this._indexToNodeLookup = {};
  for (const [node, index] of Object.entries(this._nodeToIndexLookup)) {
    this._indexToNodeLookup[index] = node;
  }

  console.log(`done loading pbf`);

};

export const savePbfCH = async function(this: GraphInterface, path: string): Promise<void> {

  if (!this._locked) {
    throw new Error('No sense in saving network before it is contracted.');
  }

  // Check if we're in Node.js environment
  let fs: any;
  try {
    // Use dynamic import for ES modules
    fs = await import('fs');
  } catch (e) {
    console.log('saving as PBF only works in NodeJS');
    return;
  }

  const data: any = {
    _locked: this._locked,
    _geoJsonFlag: this._geoJsonFlag,
    adjacency_list: this.adjacency_list,
    reverse_adjacency_list: this.reverse_adjacency_list,
    _nodeToIndexLookup: this._nodeToIndexLookup,
    _edgeProperties: this._edgeProperties,
    _edgeGeometry: this._edgeGeometry
  };

  // convert to protobuf compatible

  data.adjacency_list = data.adjacency_list.map((list: any) => {
    return {
      edges: list.map((edge: any) => {
        return edge;
      })
    };
  });

  data.reverse_adjacency_list = data.reverse_adjacency_list.map((list: any) => {
    return {
      edges: list.map((edge: any) => {
        return edge;
      })
    };
  });

  data._edgeGeometry = data._edgeGeometry.map((linestring: any) => {
    return {
      linestrings: linestring.map((coords: any) => {
        return { coords };
      })
    };
  });

  // a poor solution.  seek a better way to serialize arbitrary properties
  data._edgeProperties = data._edgeProperties.map((props: any) => {
    return JSON.stringify(props);
  });

  // write
  const pbf = new Pbf();
  CH.write(data, pbf);

  const buffer = pbf.finish();

  fs.writeFileSync(path, buffer);

  console.log(`done saving ${path}`);

};
