import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Play, RotateCcw, ZoomIn, ZoomOut, Move } from "lucide-react";

export default function BuffaloFamilyTree() {
  const [units, setUnits] = useState(1);
  const [years, setYears] = useState(10);
  const [startYear, setStartYear] = useState(2026);
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const treeContainerRef = useRef(null);

  // Simulation logic (same as before)
  const runSimulation = () => {
    setLoading(true);
    setTimeout(() => {
      const totalYears = Number(years);
      const herd = [];
      let nextId = 1;

      for (let u = 0; u < units; u++) {
        herd.push({
          id: nextId++,
          age: 3,
          mature: true,
          parentId: null,
          generation: 0,
          birthYear: startYear - 3,
          unit: u + 1,
        });

        herd.push({
          id: nextId++,
          age: 3,
          mature: true,
          parentId: null,
          generation: 0,
          birthYear: startYear - 3,
          unit: u + 1,
        });
      }

      for (let year = 1; year <= totalYears; year++) {
        const currentYear = startYear + (year - 1);
        const moms = herd.filter((b) => b.age >= 3);

        moms.forEach((mom) => {
          herd.push({
            id: nextId++,
            age: 0,
            mature: false,
            parentId: mom.id,
            birthYear: currentYear,
            generation: mom.generation + 1,
            unit: mom.unit,
          });
        });

        herd.forEach((b) => {
          b.age++;
          if (b.age >= 3) b.mature = true;
        });
      }

      setTreeData({
        units,
        years,
        startYear,
        totalBuffaloes: herd.length,
        buffaloes: herd,
      });
      setLoading(false);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }, 300);
  };

  const buildTree = (root, all) => {
    return all.filter((b) => b.parentId === root.id);
  };

  const colors = [
    "bg-gradient-to-br from-amber-400 to-amber-600",
    "bg-gradient-to-br from-indigo-400 to-indigo-600", 
    "bg-gradient-to-br from-teal-400 to-teal-600",
    "bg-gradient-to-br from-pink-400 to-pink-600",
    "bg-gradient-to-br from-red-400 to-red-600",
    "bg-gradient-to-br from-purple-400 to-purple-600",
    "bg-gradient-to-br from-green-400 to-green-600",
  ];

  // Improved Buffalo Node with better visual hierarchy
  const BuffaloNode = ({ data, founder }) => (
    <div className="flex flex-col items-center group relative">
      <div
        className={`${
          colors[data.generation % colors.length]
        } rounded-full w-16 h-16 flex flex-col justify-center items-center text-white shadow-lg transform transition-all duration-200 hover:scale-110 border-2 border-white`}
      >
        <div className="text-sm font-bold">
          {founder ? `B${data.id}` : data.birthYear}
        </div>
        <div className="text-[9px] opacity-90 bg-black bg-opacity-20 px-1 rounded">
          Gen {data.generation}
        </div>
      </div>

      {/* Enhanced info card */}
      <div className="bg-white px-2 py-1 mt-1 rounded-lg shadow text-center border border-gray-200 min-w-[100px]">
        <div className="text-xs font-semibold text-gray-700">
          {founder ? `Founder` : `Born ${data.birthYear}`}
        </div>
        {!founder && (
          <div className="text-[9px] text-gray-500 mt-0.5">
            Parent: B{data.parentId}
          </div>
        )}
      </div>
    </div>
  );

  // Improved Curved Arrow with better styling
  const CurvedArrow = ({ flip, hasSiblings, index }) => {
    const strokeColor = "#4F46E5";
    const strokeWidth = 2;
    
    return (
      <div className={`relative ${hasSiblings ? (index === 0 ? "-mr-3" : "-ml-3") : ""}`}>
        <svg
          width="60"
          height="30"
          viewBox="0 0 60 30"
          className={flip ? "scale-x-[-1]" : ""}
        >
          <path
            d="M10 25 C 30 5, 30 5, 50 25"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={hasSiblings ? "3,3" : "0"}
            markerEnd={hasSiblings ? "url(#arrowhead-dashed)" : "url(#arrowhead)"}
          />
          <defs>
            <marker
              id="arrowhead"
              markerWidth="4"
              markerHeight="4"
              refX="3"
              refY="2"
              orient="auto"
            >
              <polygon points="0 0, 4 2, 0 4" fill={strokeColor} />
            </marker>
            <marker
              id="arrowhead-dashed"
              markerWidth="4"
              markerHeight="4"
              refX="3"
              refY="2"
              orient="auto"
            >
              <polygon points="0 0, 4 2, 0 4" fill={strokeColor} />
            </marker>
          </defs>
        </svg>
      </div>
    );
  };

  // Enhanced Tree Branch with horizontal layout
  const TreeBranch = ({ parent, all, level = 0 }) => {
    const kids = buildTree(parent, all);
    if (kids.length === 0) return null;

    return (
      <div className="flex flex-col items-center mt-4">
        {kids.length === 1 ? (
          // Single child
          <div className="flex flex-col items-center">
            <CurvedArrow flip={false} hasSiblings={false} />
            <div className="mt-1">
              <BuffaloNode data={kids[0]} />
            </div>
            <TreeBranch parent={kids[0]} all={all} level={level + 1} />
          </div>
        ) : (
          // Multiple children
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              {/* Horizontal connector line */}
              <div className="absolute top-0 left-2 right-2 h-0.5 bg-indigo-400 transform -translate-y-full"></div>
            </div>
            <div className="flex gap-4 justify-center">
              {kids.map((child, i) => (
                <div key={child.id} className="flex flex-col items-center">
                  <CurvedArrow 
                    flip={i === kids.length - 1} 
                    hasSiblings={kids.length > 1}
                    index={i}
                  />
                  <div className="mt-1">
                    <BuffaloNode data={child} />
                  </div>
                  <TreeBranch parent={child} all={all} level={level + 1} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Reset function
  const resetSimulation = () => {
    setTreeData(null);
    setUnits(1);
    setYears(10);
    setStartYear(2026);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleResetView = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Drag to pan functionality
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition(prev => ({
      x: prev.x + e.movementX,
      y: prev.y + e.movementY
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
        <div className="text-xl text-gray-700 font-semibold">Simulating Buffalo Herd...</div>
        <div className="text-sm text-gray-500 mt-2">This may take a moment</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col overflow-hidden">
      {/* Enhanced Header */}
     <div className="bg-white/90 backdrop-blur-sm shadow-lg p-5 border-b border-gray-200 flex-shrink-0">
  <div className="max-w-7xl mx-50">
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
        <span className="text-3xl">🐃</span>
        Buffalo Family Tree Simulator
      </h1>
      {treeData && (
        <div className="flex items-center gap-3">
          <button
            onClick={resetSimulation}
            className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-base font-medium"
          >
            <RotateCcw size={18} />
            Reset
          </button>
        </div>
      )}
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 block">
          Starting Units
        </label>
        <input
          type="number"
          min="1"
          max="10"
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base h-12"
          value={units}
          onChange={(e) => setUnits(Number(e.target.value))}
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 block">
          Simulation Years
        </label>
        <input
          type="number"
          min="1"
          max="50"
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base h-12"
          value={years}
          onChange={(e) => setYears(Number(e.target.value))}
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 block">
          Start Year
        </label>
        <input
          type="number"
          min="2024"
          max="2100"
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base h-12"
          value={startYear}
          onChange={(e) => setStartYear(Number(e.target.value))}
        />
      </div>
      <div className="flex items-end">
        <button
          onClick={runSimulation}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg text-base h-12"
        >
          <Play size={20} />
          Run Simulation
        </button>
      </div>
      {treeData && (
        <div className="flex items-end gap-3">
          <button
            onClick={handleZoomOut}
            className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
            title="Zoom Out"
          >
            <ZoomOut size={20} />
          </button>
          <button
            onClick={handleResetView}
            className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium min-w-[70px] h-12 flex items-center justify-center"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
            title="Zoom In"
          >
            <ZoomIn size={20} />
          </button>
        </div>
      )}
    </div>
  </div>
</div>

      {/* Results Section */}
      {treeData ? (
        <div className="flex-1 relative overflow-hidden" ref={containerRef}>
          {/* Controls Info */}
          <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
              <Move size={14} />
              <span>Drag to pan</span>
            </div>
            <div className="text-xs text-gray-600">Scroll or use buttons to zoom</div>
          </div>

          {/* Summary Cards */}
          <div className="absolute top-4 right-4 z-10 flex gap-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200 min-w-[120px]">
              <div className="text-lg font-bold text-blue-600">{treeData.units}</div>
              <div className="text-xs text-gray-600">Starting Units</div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200 min-w-[120px]">
              <div className="text-lg font-bold text-green-600">{treeData.years}</div>
              <div className="text-xs text-gray-600">Simulation Years</div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-4 shadow-lg text-white min-w-[140px]">
              <div className="text-xl font-bold">{treeData.totalBuffaloes}</div>
              <div className="text-xs opacity-90">Total Buffaloes</div>
            </div>
          </div>

          {/* Tree Visualization Container */}
          <div 
            ref={treeContainerRef}
            className={`w-full h-full overflow-auto ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
          >
            <div 
              className="min-w-full min-h-full flex items-start justify-center p-8"
              style={{
                transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
                transition: isDragging ? 'none' : 'transform 0.1s ease'
              }}
            >
              <div className="flex flex-wrap gap-8 justify-center">
                {treeData.buffaloes
                  .filter((b) => b.parentId === null)
                  .map((founder) => (
                    <div
                      key={founder.id}
                      className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-200 flex-shrink-0"
                    >
                      <div className="text-center mb-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-1">
                          Unit {founder.unit} - Founder B{founder.id}
                        </h2>
                        <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full"></div>
                      </div>

                      <div className="flex flex-col items-center">
                        <BuffaloNode data={founder} founder />
                        <TreeBranch parent={founder} all={treeData.buffaloes} />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Welcome/Instruction State
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-gray-200 text-center max-w-2xl">
            <div className="text-6xl mb-6">🐃</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Buffalo Family Tree Simulator
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Simulate the growth of your buffalo herd over time. Watch as your founding buffalos 
              create generations of offspring in this interactive family tree visualization.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4">
                <div className="text-2xl mb-2">📊</div>
                <h3 className="font-semibold mb-2">Configure</h3>
                <p className="text-sm text-gray-600">Set your starting units and simulation period</p>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl mb-2">⚡</div>
                <h3 className="font-semibold mb-2">Simulate</h3>
                <p className="text-sm text-gray-600">Run the simulation to generate your herd</p>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl mb-2">🌳</div>
                <h3 className="font-semibold mb-2">Explore</h3>
                <p className="text-sm text-gray-600">Navigate through the interactive family tree</p>
              </div>
            </div>
            <button
              onClick={runSimulation}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg inline-flex items-center gap-2"
            >
              <Play size={20} />
              Start Your First Simulation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}