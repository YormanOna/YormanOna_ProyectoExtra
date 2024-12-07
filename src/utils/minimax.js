// minimax.js
export const runMinimax = async ({ nodes, edges, treeDepth, setNodes, updateNodeValue }) => {
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
  
    const minimax = (node, depth, isMaximizingPlayer) => {
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
  
      for (const child of childNodes) {
        const childValue = minimax(child, depth + 1, !isMaximizingPlayer);
        if (isMaximizingPlayer) value = Math.max(value, childValue);
        else value = Math.min(value, childValue);
      }
  
      node.data.label = value.toString();
      updateNodeValue(node, value); // Actualizamos la interfaz
  
      return value;
    };
  
    const rootNode = newNodes.find((n) => n.id === 'node-root');
    const rootValue = minimax(rootNode, 0, true);
  
    rootNode.data.label = rootValue.toString();
    await updateNodeValue(rootNode, rootValue);
  
    setNodes(newNodes);
  };
  