//
import { promises as fs } from 'fs';
import type { TestGeoJSONNetwork, TestGeoJSONFeature, NGraph, NGraphNode, NGraphEdge } from './test-types.js';

export { readyNetwork, getNGraphDist, populateNGraph, cleanseNetwork };

async function readyNetwork(): Promise<TestGeoJSONNetwork> {

  const geojson_raw = await fs.readFile('../networks/faf_simple_40.geojson'); // full_network
  const geojson: TestGeoJSONNetwork = JSON.parse(geojson_raw.toString());
  //set up cost field
  geojson.features.forEach((feat: TestGeoJSONFeature) => {
    delete feat.properties.LENGTH;
    delete feat.properties.DIR;
    delete feat.properties.RECTYPE;
    delete feat.properties.VERSION;
    delete feat.properties.STATE;
    delete feat.properties.SIGN1;
    delete feat.properties.SIGNT1;
    delete feat.properties.SIGNN1;
    delete feat.properties.SIGNQ1;
    delete feat.properties.SIGN2;
    delete feat.properties.SIGNT2;
    delete feat.properties.SIGNN2;
    delete feat.properties.SIGNQ2;
    delete feat.properties.SIGN3;
    delete feat.properties.SIGNT3;
    delete feat.properties.SIGNN3;
    delete feat.properties.SIGNQ3;
    delete feat.properties.LNAME;
    delete feat.properties.KM;
    delete feat.properties.FCLASS;
    delete feat.properties.RUCODE;
    delete feat.properties.STATUS;
    delete feat.properties.NN;
    delete feat.properties.LCV_TYPE;

    const mph = getMPH(feat.properties.NHS);
    feat.properties._cost = (feat.properties.MILES / mph) * 60;
    feat.properties._id = feat.properties.ID;
    delete feat.properties.ID;
    delete feat.properties.NHS;
  });

  // clean network
  geojson.features = geojson.features.filter((feat: TestGeoJSONFeature) => {


    if (feat.geometry && feat.properties._cost && feat.geometry.coordinates && feat.properties.STFIPS && feat.properties.STFIPS !== 2 && feat.properties.STFIPS !== 15 &&
      (
        feat.properties.STFIPS === 6 || feat.properties.STFIPS === 41 ||
        feat.properties.STFIPS === 53
      )

    ) {
      return true;
    }
  });

  return geojson;
}

function getMPH(nhs: number): number {
  switch (nhs) {
    case 1:
      return 70;
    case 2:
      return 60;
    case 3:
      return 50;
    case 4:
      return 40;
    case 7:
      return 30;
    case 8:
      return 20;
    default:
      return 10;
  }
}


function populateNGraph(ngraph: NGraph, geojson: TestGeoJSONNetwork): void {

  geojson.features.forEach((feature: TestGeoJSONFeature) => {
    const start = feature.geometry.coordinates[0];
    const end = feature.geometry.coordinates[feature.geometry.coordinates.length - 1];

    ngraph.addNode(String(start), { lng: start[0], lat: start[1] });
    ngraph.addNode(String(end), { lng: end[0], lat: end[1] });

    const properties = Object.assign({}, feature.properties, { _geometry: feature.geometry.coordinates });

    ngraph.addLink(String(start), String(end), properties);

    if (properties._direction !== 'f') {
      ngraph.addLink(String(end), String(start), properties);
    }

  });

}

function getNGraphDist(path: NGraphNode[]): { distance: number } {

  //const edge_ids = [];
  let distance = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const start_node = path[i].id;
    const end_node = path[i + 1].id;

    (path[i] as any)['links'].forEach((link: NGraphEdge) => {
      if ((link.toId === start_node && link.fromId === end_node)) {
        // edge_ids.push(link.data._id);
        distance += link.data._cost;
      }

    });

  }

  return { distance };
}


function cleanseNetwork(geojson: TestGeoJSONNetwork): TestGeoJSONNetwork {

  // KEEP THIS AROUND:  problems were happening when CH network was cleaned via this._cleanseGeoJsonNetwork, and the version used for validating ngraph was not.

  // get rid of duplicate edges (same origin to dest)
  const inventory: { [key: string]: TestGeoJSONFeature } = {};

  geojson.features.forEach((feature: TestGeoJSONFeature) => {
    const start = feature.geometry.coordinates[0].join(',');
    const end = feature.geometry.coordinates[feature.geometry.coordinates.length - 1].join(',');
    const id = `${start}|${end}`;

    const reverse_id = `${end}|${start}`;


    if (!inventory[id]) {
      // new segment
      inventory[id] = feature;
    }
    else {
      // a segment with the same origin/dest exists.  choose shortest.
      const old_cost = inventory[id].properties._cost;
      const new_cost = feature.properties._cost;
      if (new_cost < old_cost) {
        // mark old segment for deletion
        inventory[id].properties.__markDelete = true;
        // rewrite old segment because this one is shorter
        inventory[id] = feature;
      }
      else {
        // instead mark new feature for deletion
        feature.properties.__markDelete = true;
      }
    }

    // now reverse
    if (!inventory[reverse_id]) {
      // new segment
      inventory[reverse_id] = feature;
    }
    else {
      // a segment with the same origin/dest exists.  choose shortest.
      const old_cost = inventory[reverse_id].properties._cost;
      const new_cost = feature.properties._cost;
      if (new_cost < old_cost) {
        // mark old segment for deletion
        inventory[reverse_id].properties.__markDelete = true;
        // rewrite old segment because this one is shorter
        inventory[reverse_id] = feature;
      }
      else {
        // instead mark new feature for deletion
        feature.properties.__markDelete = true;
      }
    }
  });


  // filter out marked items
  geojson.features = geojson.features.filter((feature: TestGeoJSONFeature) => {
    return !feature.properties.__markDelete;
  });

  return geojson;
}
