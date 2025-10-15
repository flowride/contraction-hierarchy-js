import type { NodeState, NodePool } from './types.js';

class Node {
  id: number;
  dist: number;
  prev?: number;
  visited?: boolean;
  opened: boolean;
  heapIndex: number;

  constructor(node: Partial<NodeState>) {
    this.id = node.id!;
    this.dist = node.dist !== undefined ? node.dist : Infinity;
    this.prev = undefined;
    this.visited = undefined;
    this.opened = false; // whether has been put in queue
    this.heapIndex = -1;
  }
}

export function createNodePool(): NodePool {
  let currentInCache = 0;
  const nodeCache: NodeState[] = [];

  return {
    createNewState: createNewState,
    reset: reset
  };

  function reset(): void {
    currentInCache = 0;
  }

  function createNewState(node: Partial<NodeState>): NodeState {
    let cached = nodeCache[currentInCache];
    if (cached) {
      cached.id = node.id!;
      cached.dist = node.dist !== undefined ? node.dist : Infinity;
      cached.prev = undefined;
      cached.visited = undefined;
      cached.opened = false;
      cached.heapIndex = -1;
    }
    else {
      cached = new Node(node);
      nodeCache[currentInCache] = cached;
    }
    currentInCache++;
    return cached;
  }
}
