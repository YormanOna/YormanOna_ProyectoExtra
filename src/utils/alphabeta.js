// alphabeta.js
export const runAlphaBeta = async ({ nodes, edges, treeDepth, setNodes, updateNodeValue, updateAlphaBetaValues }) => {
    const clearCalculatedValues = () => {
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: {
            ...node.data,
            label: '?',
            alpha: undefined,
            beta: undefined,
            pruned: false,
          },
        }))
      );
    };
  
    clearCalculatedValues(); // Limpiar valores previos
    const newNodes = [...nodes]; // Copiamos los nodos para modificar
  
    const alphaBetaPruning = (node, depth, isMaximizingPlayer, alpha, beta) => {
      if (depth === treeDepth) {
        const leafValue = parseFloat(node.data.label);
        return !isNaN(leafValue) ? leafValue : 0;
      }
  
      const childEdges = edges.filter((edge) => edge.source === node.id);
      const childNodes = childEdges.map((edge) =>
        newNodes.find((n) => n.id === edge.target)
      );
  
      if (childNodes.length === 0) return 0;
  
      let value = isMaximizingPlayer ? -Infinity : Infinity;
      let bestNode = null;
  
      for (const child of childNodes) {
        const childValue = alphaBetaPruning(
          child,
          depth + 1,
          !isMaximizingPlayer,
          alpha,
          beta
        );
  
        if (isMaximizingPlayer) {
          if (childValue > value) {
            value = childValue;
            bestNode = child;
          }
          alpha = Math.max(alpha, value);
        } else {
          if (childValue < value) {
            value = childValue;
            bestNode = child;
          }
          beta = Math.min(beta, value);
        }
  
        if (beta <= alpha) {
          childNodes.forEach((n) => {
            if (n !== bestNode) {
              n.data.pruned = true;
              n.data.label = 'Podado';
            }
          });
          break;
        }
      }
  
      if (bestNode) {
        node.data.label = value.toString();
        updateAlphaBetaValues(node, alpha, beta);
        updateNodeValue(node, value);
      }
  
      return value;
    };
  
    const rootNode = newNodes.find((n) => n.id === 'node-root');
    const rootValue = alphaBetaPruning(
      rootNode,
      0,
      true,
      -Infinity,
      Infinity
    );
  
    rootNode.data.label = rootValue.toString();
    await updateNodeValue(rootNode, rootValue);
  
    setNodes(newNodes);
  };
  