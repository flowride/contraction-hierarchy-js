import { buildIdList } from './buildOutputs.js';
import { NodeHeap } from './queue.js';
import type { 
  GraphInterface, 
  PathfinderOptions, 
  PathfinderResult, 
  NodeState, 
  AdjacencyList, 
  EdgePropertiesArray, 
  EdgeGeometryArray,
  NodeToIndexLookup,
  IndexToNodeLookup,
  NodePool,
  Edge
} from './types.js';

export const createPathfinder = function(this: GraphInterface, options?: PathfinderOptions) {

  const adjacency_list: AdjacencyList = this.adjacency_list;
  const reverse_adjacency_list: AdjacencyList = this.reverse_adjacency_list;
  const edgeProperties: EdgePropertiesArray = this._edgeProperties;
  const edgeGeometry: EdgeGeometryArray = this._edgeGeometry;
  const pool: NodePool = this._createNodePool();
  const nodeToIndexLookup: NodeToIndexLookup = this._nodeToIndexLookup;
  const indexToNodeLookup: IndexToNodeLookup = this._indexToNodeLookup;

  if (!options) {
    options = {};
  }

  return {
    queryContractionHierarchy
  };

  function queryContractionHierarchy(
    start: string | number,
    end: string | number
  ): PathfinderResult {

    pool.reset();

    const start_index = nodeToIndexLookup[String(start)];
    const end_index = nodeToIndexLookup[String(end)];

    const forward_nodeState: NodeState[] = [];
    const backward_nodeState: NodeState[] = [];

    const forward_distances: { [key: number]: number } = {};
    const backward_distances: { [key: number]: number } = {};


    let current_start = pool.createNewState({ id: start_index, dist: 0 });
    forward_nodeState[start_index] = current_start;
    current_start.opened = true;
    forward_distances[current_start.id] = 0;

    let current_end = pool.createNewState({ id: end_index, dist: 0 });
    backward_nodeState[end_index] = current_end;
    current_end.opened = true;
    backward_distances[current_end.id] = 0;

    const searchForward = doDijkstra(
      adjacency_list,
      current_start,
      forward_nodeState,
      forward_distances,
      backward_nodeState,
      backward_distances
    );
    const searchBackward = doDijkstra(
      reverse_adjacency_list,
      current_end,
      backward_nodeState,
      backward_distances,
      forward_nodeState,
      forward_distances
    );

    let forward_done = false;
    let backward_done = false;
    let sf: IteratorResult<NodeState>;
    let sb: IteratorResult<NodeState>;

    let tentative_shortest_path = Infinity;
    let tentative_shortest_node: number | null = null;

    if (start_index !== end_index) {
      do {
        if (!forward_done) {
          sf = searchForward.next();
          if (sf.done) {
            forward_done = true;
          }
        }
        if (!backward_done) {
          sb = searchBackward.next();
          if (sb.done) {
            backward_done = true;
          }
        }

      } while (
        (!sf!.done && forward_distances[sf!.value.id] < tentative_shortest_path) ||
        (!sb!.done && backward_distances[sb!.value.id] < tentative_shortest_path)
      );
    }
    else {
      tentative_shortest_path = 0;
    }

    let result: PathfinderResult = { total_cost: tentative_shortest_path !== Infinity ? tentative_shortest_path : 0 };


    let extra_attrs: any;

    if (options && (options.ids || options.path || options.nodes || options.properties)) {
      if (tentative_shortest_node != null) {
        // tentative_shortest_path as falsy indicates no path found.
        extra_attrs = buildIdList(options, edgeProperties, edgeGeometry, forward_nodeState, backward_nodeState, tentative_shortest_node, indexToNodeLookup, start_index);
      }
      else {

        let ids: number[] | undefined, path: any, properties: any[] | undefined, nodes: any[] | undefined;

        // fill in object to prevent errors in the case of no path found
        if (options.ids) {
          ids = [];
        }
        if (options.path) {
          path = {};
        }
        if (options.properties) {
          properties = [];
        }
        if (options.nodes) {
          nodes = [];
        }

        extra_attrs = { ids, path, properties, nodes };
      }

    }

    // the end.  results sent to user
    return Object.assign(result, { ...extra_attrs });


    //

    function* doDijkstra(
      adj: AdjacencyList,
      current: NodeState,
      nodeState: NodeState[],
      distances: { [key: number]: number },
      reverse_nodeState: NodeState[],
      reverse_distances: { [key: number]: number }
    ): Generator<NodeState, void, unknown> {

      const openSet = new (NodeHeap as any)({
        compare(a: NodeState, b: NodeState) {
          return a.dist - b.dist;
        }
      });

      do {
        (adj[current.id] || []).forEach((edge: Edge) => {

          let node = nodeState[edge.end];
          if (node === undefined) {
            node = pool.createNewState({ id: edge.end });
            node.attrs = edge.attrs;
            nodeState[edge.end] = node;
          }

          if (node.visited === true) {
            return;
          }

          if (!node.opened) {
            openSet.push(node);
            node.opened = true;
          }

          const proposed_distance = current.dist + edge.cost;
          if (proposed_distance >= node.dist) {
            return;
          }

          node.dist = proposed_distance;
          distances[node.id] = proposed_distance;
          node.attrs = edge.attrs;
          node.prev = current.id;

          openSet.updateItem(node.heapIndex);

          const reverse_dist = reverse_distances[edge.end];
          if (reverse_dist >= 0) {
            const path_len = proposed_distance + reverse_dist;
            if (tentative_shortest_path > path_len) {
              tentative_shortest_path = path_len;
              tentative_shortest_node = edge.end;
            }
          }

        });
        current.visited = true;

        // get lowest value from heap
        current = openSet.pop();

        if (!current) {
          return;
        }

        yield current;

      } while (true);

    }

  }

};
