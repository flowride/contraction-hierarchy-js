import kdbush from 'kdbush';
import * as geokdbush from 'geokdbush';
import type { GraphInterface, CoordinateLookupOptions } from './types.js';

export class CoordinateLookup {
  coordinate_list: number[][];
  index: any;

  constructor(graph: GraphInterface) {
    if (!graph._geoJsonFlag) {
      throw new Error('Cannot use Coordinate Lookup on a non-GeoJson network.');
    }

    const points_set = new Set<string>();

    Object.keys(graph._nodeToIndexLookup).forEach(key => {
      points_set.add(key);
    });

    const coordinate_list: number[][] = [];

    points_set.forEach(pt_str => {
      coordinate_list.push(pt_str.split(',').map(d => Number(d)));
    });

    this.coordinate_list = coordinate_list; // Store for lookup
    this.index = new kdbush(coordinate_list.length);
    for (const coord of coordinate_list) {
      this.index.add(coord[0], coord[1]);
    }
    this.index.finish();
  }

  getClosestNetworkPt(lng: number, lat: number): number[] {
    const closestIndex = geokdbush.around(this.index, lng, lat, 1)[0];
    return this.coordinate_list[closestIndex];
  }
}

export const __geoindex = geokdbush;
export const __kdindex = kdbush;
