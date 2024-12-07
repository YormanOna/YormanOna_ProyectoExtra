import React, { useState, useMemo, useCallback } from "react";
import ReactFlow, {
  ReactFlowProvider,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionLineType,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import "./App.css";


const CustomNode = React.memo(({ data, isConnectable }) => {
  return (
    <div
      className={`custom-node ${
        data.type === "max" ? "node-max" : "node-min"
      } ${data.pruned ? "node-pruned" : ""}`}
    >
      {data.label}
      {data.alpha !== undefined && (
        <div className="node-alpha">α: {data.alpha}</div>
      )}
      {data.beta !== undefined && (
        <div className="node-beta">β: {data.beta}</div>
      )}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="handle-top"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="handle-bottom"
      />
    </div>
  );
});

const MiniMaxTreeVisualizer = () => {
  const [treeDepth, setTreeDepth] = useState(2);
  const [nodesPerLevel, setNodesPerLevel] = useState([2, 1]); 
  const [leafValues, setLeafValues] = useState("");
  const [algorithmType, setAlgorithmType] = useState("minimax");


  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  const nodeTypes = useMemo(
    () => ({
      custom: CustomNode,
    }),
    []
  );

  
  const resetearArbol = () => {
    setNodes([]);
    setEdges([]);
  };

  
  const limpiarNombreValores = () => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          label: "?",
          alpha: undefined,
          beta: undefined,
          pruned: false,
        },
      }))
    );
  };

  
  const handleNodesPerLevelChange = (index, value) => {
    const updatedNodesPerLevel = [...nodesPerLevel];
    updatedNodesPerLevel[index] = Number(value);
    setNodesPerLevel(updatedNodesPerLevel);
  };

  
  const generateTree = () => {
    const generatedNodes = [];
    const leafValuesArray = leafValues.trim()
      ? leafValues.split(",").map((val) => parseFloat(val.trim()))
      : [];

    
    if (leafValuesArray.some(isNaN)) {
      alert("Todos los valores de las hojas deben ser números válidos.");
      return;
    }

    const totalLeafNodes = leafValuesArray.length;
    let nodeId = 0;

    // Generar nodos internos hasta el último nivel
    for (let level = 0; level < treeDepth - 1; level++) {
      const nodesInThisLevel = nodesPerLevel[level] || 2; 

      for (let i = 0; i < nodesInThisLevel; i++) {
        generatedNodes.push({
          id: `node-${nodeId}`,
          type: "custom",
          position: {
            x: i * 200 - (nodesInThisLevel * 100) / 2,
            y: level * 100,
          },
          data: {
            label: "?",
            type: level % 2 === 0 ? "max" : "min",
            alpha: undefined,
            beta: undefined,
            pruned: false,
          },
        });
        nodeId++;
      }
    }

    // Generar el nodo raíz
    const rootNode = {
      id: `node-root`,
      type: "custom",
      position: { x: 0, y: -100 },
      data: {
        label: "?",
        type: "max",
        alpha: undefined,
        beta: undefined,
        pruned: false,
      },
    };
    generatedNodes.unshift(rootNode);

    // Generar los nodos hoja
    const lastLevelY = (treeDepth - 1) * 100;
    for (let i = 0; i < totalLeafNodes; i++) {
      const leafValue = leafValuesArray[i];
      generatedNodes.push({
        id: `node-${nodeId}`,
        type: "custom",
        position: {
          x: i * 200 - (totalLeafNodes * 100) / 2,
          y: lastLevelY,
        },
        data: {
          label: leafValue !== undefined ? leafValue.toString() : "?",
          type: "leaf",
          alpha: undefined,
          beta: undefined,
          pruned: false,
        },
      });
      nodeId++;
    }

    setNodes(generatedNodes);
    setEdges([]);
  };

  const onConnect = useCallback((params) => {
    setEdges((eds) =>
      addEdge(
        {
          ...params,
          type: ConnectionLineType.Straight,
          animated: true,
        },
        eds
      )
    );
  }, []);

  
  const updateNodeValue = async (node, value) => {
    const updatedNode = {
      ...node,
      data: { ...node.data, label: value.toString() },
    };

    setNodes((nds) => nds.map((n) => (n.id === node.id ? updatedNode : n)));
    
  };

  const updateAlphaBetaValues = async (node, alpha, beta) => {
    node.data.alpha = alpha !== undefined ? alpha.toString() : "-∞";
    node.data.beta = beta !== undefined ? beta.toString() : "∞";
    await updateNodeValue(node, node.data.label);

    // Mostramos los valores de alfa y beta en el nodo
    const nodeElement = document.getElementById(node.id); 
    if (nodeElement) {
      const alphaBetaDisplay = nodeElement.querySelector(".alpha-beta");
      if (alphaBetaDisplay) {
        alphaBetaDisplay.innerText = `α: ${node.data.alpha}, β: ${node.data.beta}`;
      }
    }
  };

  const updateEdgeColor = (source, target, color) => {
    setEdges((eds) =>
      eds.map((edge) =>
        edge.source === source && edge.target === target
          ? { ...edge, style: { stroke: color, strokeWidth: 2 } }
          : edge
      )
    );
  };

  const runMinimax = async () => {
    limpiarNombreValores(); // Limpiar valores previos
    const newNodes = [...nodes]; // Copiamos los nodos para modificar

    // Función recursiva de Minimax
    const minimax = (node, depth, isMaximizingPlayer) => {

      
      // Si es un nodo hoja, devolver su valor
      if (depth === treeDepth) {
        const leafValue = parseFloat(node.data.label);
        return !isNaN(leafValue) ? leafValue : 0; // Valor de la hoja, si no tiene valor, asignamos 0
      }

      // Obtener los hijos del nodo actual
      const childEdges = edges.filter((edge) => edge.source === node.id);
      const childNodes = childEdges.map((edge) =>
        newNodes.find((n) => n.id === edge.target)
      );

      // Si no tiene hijos, devolver 0
      if (childNodes.length === 0) {
        return 0;
      }

      // Inicializar el valor según sea Max o Min
      let value = isMaximizingPlayer ? -Infinity : Infinity;

      // Explorar cada hijo
      for (const child of childNodes) {
        // Valor recursivo del hijo
        const childValue = minimax(child, depth + 1, !isMaximizingPlayer);

        // Actualizar el valor según sea Max o Min
        if (isMaximizingPlayer) {
          value = Math.max(value, childValue); // Maximizar en niveles de Max
        } else {
          value = Math.min(value, childValue); // Minimizar en niveles de Min
        }
      }

      // Actualizar valor del nodo actual
      node.data.label = value.toString();
      updateNodeValue(node, value); // Actualizamos la interfaz

      return value;
    };

    // Obtener el nodo raíz
    const rootNode = newNodes.find((n) => n.id === "node-root");

    // Ejecutar Minimax desde la raíz
    const rootValue = minimax(rootNode, 0, true); 

    // Actualizar valor de la raíz
    rootNode.data.label = rootValue.toString();
    await updateNodeValue(rootNode, rootValue);

    // Actualizar nodos
    setNodes(newNodes);
  };

  const runAlphaBeta = async () => {
    limpiarNombreValores(); 
    const newNodes = [...nodes]; 

    // Función recursiva de exploración Alfa-Beta
    const alphaBetaPruning = (node, depth, isMaximizingPlayer, alpha, beta) => {
      // Si es un nodo hoja, devolver su valor
      if (depth === treeDepth) {
        const leafValue = parseFloat(node.data.label);
        return !isNaN(leafValue) ? leafValue : 0;
      }

      // Obtener los hijos del nodo actual
      const childEdges = edges.filter((edge) => edge.source === node.id);
      const childNodes = childEdges.map((edge) =>
        newNodes.find((n) => n.id === edge.target)
      );
      
      // Si no tiene hijos, devolver 0
      if (childNodes.length === 0) {
        return 0;
      }

      // Inicializar valor según sea Max o Min
      let value = isMaximizingPlayer ? -Infinity : Infinity;
      let bestNode = null;

      // Explorar cada hijo
      for (const child of childNodes) {
        // Valor recursivo del hijo
        const childValue = alphaBetaPruning(
          child,
          depth + 1,
          !isMaximizingPlayer,
          alpha,
          beta
        );

        // Actualizar valor y nodo según sea Max o Min
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

        // Poda Alfa-Beta
        if (beta <= alpha) {
          // Marcar nodos podados
          childNodes.forEach((n) => {
            if (n !== bestNode) {
              n.data.pruned = true;
              n.data.label = "Podado";
            }
          });
          break;
        }
      }

      // Actualizar valor del nodo actual
      if (bestNode) {
        node.data.label = value.toString();
        // Actualizar valores de alfa y beta en la interfaz
        updateAlphaBetaValues(node, alpha, beta);
        updateNodeValue(node, value);
      }

      return value;
    };

    // Obtener el nodo raíz
    const rootNode = newNodes.find((n) => n.id === "node-root");

    // Ejecutar Alfa-Beta desde la raíz
    const rootValue = alphaBetaPruning(
      rootNode,
      0, // Profundidad inicial
      true, // El nodo raíz es maximizador
      -Infinity, // Alpha inicial
      Infinity // Beta inicial
    );

    // Actualizar valor de la raíz
    rootNode.data.label = rootValue.toString();
    await updateNodeValue(rootNode, rootValue);

    // Actualizar nodos
    setNodes(newNodes);
  };

  const runAlgorithm = () => {
    algorithmType === "minimax" ? runMinimax() : runAlphaBeta();
  };

  return (
    <div className="visualizer-container">
      <div className="controls-container">
        <label>Produndidad del Arbol: </label>
        <input
          type="number"
          placeholder="Tree Depth"
          value={treeDepth}
          onChange={(e) => setTreeDepth(Number(e.target.value))}
          className="input-control"
        />
        <label>Nodos por Nivel:</label>
        {Array.from({ length: treeDepth - 1 }).map((_, index) => (
          <input
            key={index}
            type="number"
            placeholder={`Nodos del nivel ${index + 1}`}
            value={nodesPerLevel[index] || ""}
            onChange={(e) => handleNodesPerLevelChange(index, e.target.value)}
            className="input-control"
          />
        ))}
        <label>Valores de Hojas del ultimo nivel:</label>
        <input
          type="text"
          placeholder="Ingrese valores (coma con separacion 1, 2, ., .,)"
          value={leafValues}
          onChange={(e) => setLeafValues(e.target.value)}
          className="input-control"
        />
        <button onClick={generateTree} className="btn-control">
          Generar Arbol
        </button>
        <button onClick={resetearArbol} className="btn-control">
          Resetear Arbol
        </button>
        <select
          onChange={(e) => setAlgorithmType(e.target.value)}
          value={algorithmType}
          className="select-control"
        >
          <option value="minimax">Minimax</option>
          <option value="alphabeta">Alpha-Beta Pruning</option>
        </select>
        

        <button onClick={runAlgorithm} className="btn-control">
          Ejecutar Algoritmo
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        className="react-flow-container"
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

export default MiniMaxTreeVisualizer;
