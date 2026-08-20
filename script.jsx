"use client";
import { useState, useEffect } from "react";
import { Plus, Trash2, RotateCcw, Calculator, TrendingUp, TrendingDown } from "lucide-react";

// Custom rounding to 2 decimal places
function round2Custom(value) {
  const s = value.toFixed(3);
  const main = s.slice(0, -1);
  const last = parseInt(s.slice(-1));
  if (last >= 5) {
    return parseFloat((parseFloat(main) + 0.01).toFixed(2));
  } else {
    return parseFloat(parseFloat(main).toFixed(2));
  }
}

// Function to safely evaluate mathematical expressions with % support
function evaluateExpression(expression) {
  try {
    // Remove any whitespace
    let cleaned = expression.replace(/\s+/g, "");

    // Handle percentage operator by converting X% to (X/100)
    cleaned = cleaned.replace(/(\d+\.?\d*)%/g, "($1/100)");

    // Only allow numbers, +, -, *, /, (, ), and decimal points
    if (!/^[0-9+\-*/().]+$/.test(cleaned)) {
      return null;
    }

    // Use Function constructor to safely evaluate the expression
    const result = new Function("return " + cleaned)();
    if (typeof result === "number" && !isNaN(result)) {
      return result;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export default function HomePage() {
  const [groups, setGroups] = useState([]);
  const [results, setResults] = useState(null);

  const addGroup = () => {
    setGroups([
      ...groups,
      {
        id: Date.now(),
        P: { expression: "", divisor: "3", percentage: 100 },
        S: { expression: "", divisor: "3", percentage: 100 },
        A: { expression: "", divisor: "3", percentage: 100 },
      },
    ]);
  };

  const removeGroup = (groupId) => {
    setGroups(groups.filter((g) => g.id !== groupId));
  };

  const updateSection = (groupId, section, field, value) => {
    setGroups(
      groups.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            [section]: { ...g[section], [field]: value },
          };
        }
        return g;
      }),
    );
  };

  const processSection = (sectionData) => {
    const { expression, divisor, percentage = 100 } = sectionData;

    // Return empty result if expression is empty
    if (!expression || expression.trim() === "") {
      return { TTL: 0, AVG: 0, count: 0, originalValue: 0, adjustedValue: 0, divisorUsed: 0 };
    }

    // Evaluate the expression
    const evaluated = evaluateExpression(expression);
    if (evaluated === null) {
      return { TTL: 0, AVG: 0, count: 0, originalValue: 0, adjustedValue: 0, divisorUsed: 0 };
    }

    // Parse divisor (default to 3 if not provided or invalid)
    const divisorValue = parseFloat(divisor);
    const finalDivisor =
      !isNaN(divisorValue) && divisorValue !== 0 ? divisorValue : 3;

    // Calculate TTL: evaluated / 100
    const TTL = round2Custom(evaluated / 100);
    
    // Calculate AVG: TTL / divisor
    const AVG = round2Custom(TTL / finalDivisor);
    
    // Apply percentage to AVG
    const adjustedAVG = round2Custom((AVG * percentage) / 100);

    return { 
      TTL, 
      AVG, 
      count: 1, 
      originalValue: AVG,  // Original AVG without percentage
      adjustedValue: adjustedAVG,  // AVG with percentage applied
      divisorUsed: finalDivisor
    };
  };

  const calculate = () => {
    const P_list = [];
    const S_list = [];
    const A_list = [];

    const groupResults = groups.map((group, index) => {
      const P = processSection(group.P);
      const S = processSection(group.S);
      const A = processSection(group.A);

      // Use adjusted AVG for final calculations
      P_list.push(P.adjustedValue);
      S_list.push(S.adjustedValue);
      A_list.push(A.adjustedValue);

      return {
        groupNumber: index + 1,
        P,
        S,
        A,
      };
    });

    const VA = round2Custom(S_list.reduce((a, b) => a + b, 0));
    const NVA = round2Custom(
      P_list.reduce((a, b) => a + b, 0) + A_list.reduce((a, b) => a + b, 0),
    );
    const T = round2Custom(
      P_list.reduce((a, b) => a + b, 0) +
        S_list.reduce((a, b) => a + b, 0) +
        A_list.reduce((a, b) => a + b, 0),
    );
    const C = T !== 0 ? round2Custom(60 / T) : 0;

    setResults({
      groupResults,
      VA,
      NVA,
      T,
      C,
    });
  };

  const reset = () => {
    setGroups([]);
    setResults(null);
  };

  // Auto-calculate when groups change
  useEffect(() => {
    if (groups.length > 0) {
      calculate();
    }
  }, [groups]);

  // Helper to get expression preview with all calculations
  const getExpressionPreview = (sectionData) => {
    const { expression, divisor, percentage = 100 } = sectionData;
    if (!expression || expression.trim() === "") return null;
    
    const evaluated = evaluateExpression(expression);
    if (evaluated === null) return null;
    
    const divisorValue = parseFloat(divisor);
    const finalDivisor = !isNaN(divisorValue) && divisorValue !== 0 ? divisorValue : 3;
    
    const TTL = round2Custom(evaluated / 100);
    const AVG = round2Custom(TTL / finalDivisor);
    const adjustedAVG = round2Custom((AVG * percentage) / 100);
    
    return { 
      TTL, 
      AVG, 
      adjustedAVG, 
      divisor: finalDivisor,
      percentage 
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-[#121212] dark:via-[#1A1A2E] dark:to-[#16213E]">
      <div
        className="absolute inset-0 opacity-[0.15] dark:opacity-[0.08]"
        style={{
          backgroundImage: `
            radial-gradient(circle at center, rgba(99, 102, 241, 0.1) 0%, transparent 70%),
            linear-gradient(rgba(99, 102, 241, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "cover, 80px 80px, 80px 80px",
        }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-8 md:py-12">
        <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-2xl border border-white/20 dark:border-[#333333] overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-[#2979FF] dark:to-[#6366F1] p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white dark:bg-[#2A2A2A] rounded-2xl flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-indigo-600 dark:text-[#4A82FF]" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                    Time Study Calculator
                  </h1>
                  <p className="text-indigo-100 dark:text-white/70 text-sm md:text-base">
                    Calculate efficiency metrics with mathematical expressions
                  </p>
                </div>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={addGroup}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white dark:bg-[#2A2A2A] text-indigo-600 dark:text-[#4A82FF] px-6 py-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-[#333333] transition-all duration-200 font-semibold shadow-lg"
                >
                  <Plus size={20} />
                  Add Group
                </button>
                <button
                  onClick={reset}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/10 dark:bg-white/5 text-white px-6 py-3 rounded-xl hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-200 font-semibold border border-white/20"
                >
                  <RotateCcw size={20} />
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 md:p-8">
            {groups.length === 0 && (
              <div className="text-center py-24">
                <div className="w-20 h-20 bg-indigo-100 dark:bg-[#2A2A3A] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Plus className="w-10 h-10 text-indigo-600 dark:text-[#4A82FF]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-white mb-2">
                  No Groups Added Yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Click "Add Group" to start creating your time study analysis
                </p>
                <button
                  onClick={addGroup}
                  className="bg-indigo-600 dark:bg-[#2979FF] text-white px-8 py-3 rounded-xl hover:bg-indigo-700 dark:hover:bg-[#1E60FF] transition-colors font-semibold"
                >
                  Get Started
                </button>
              </div>
            )}

            <div className="space-y-8">
              {groups.map((group, groupIndex) => (
                <div
                  key={group.id}
                  className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-[#2A2A3A] dark:to-[#2A2A40] border-2 border-indigo-200 dark:border-[#4A4A6A] rounded-2xl p-6 relative"
                >
                  {/* Group Header */}
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-600 dark:bg-[#2979FF] text-white rounded-xl flex items-center justify-center font-bold text-lg">
                        {groupIndex + 1}
                      </div>
                      <h2 className="text-2xl font-bold text-indigo-900 dark:text-white">
                        Group {groupIndex + 1}
                      </h2>
                    </div>
                    <button
                      onClick={() => removeGroup(group.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20 p-3 rounded-xl transition-all duration-200"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  {/* Sections Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {["P", "S", "A"].map((section) => {
                      const preview = getExpressionPreview(group[section]);
                      return (
                        <div
                          key={section}
                          className="bg-white dark:bg-[#1E1E1E] rounded-xl p-6 shadow-lg border border-gray-100 dark:border-[#333333]"
                        >
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                              {section} Section
                            </h3>
                            <div className="w-8 h-8 bg-indigo-100 dark:bg-[#2A2A3A] rounded-lg flex items-center justify-center">
                              <span className="text-sm font-bold text-indigo-600 dark:text-[#4A82FF]">
                                {section}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {/* Expression Input */}
                            <div>
                              <label className="block font-semibold text-gray-700 dark:text-gray-300 text-sm mb-2">
                                Expression
                              </label>
                              <input
                                type="text"
                                value={group[section].expression}
                                onChange={(e) =>
                                  updateSection(
                                    group.id,
                                    section,
                                    "expression",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-4 py-3 border border-gray-300 dark:border-[#4A4A4A] dark:bg-[#2A2A2A] dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-[#4A82FF] focus:border-transparent transition-all duration-200"
                                placeholder="e.g., 5*50%, 10+5, 25"
                              />
                            </div>

                            {/* Divisor Input */}
                            <div>
                              <label className="block font-semibold text-gray-700 dark:text-gray-300 text-sm mb-2">
                                Divisor
                              </label>
                              <input
                                type="text"
                                value={group[section].divisor}
                                onChange={(e) =>
                                  updateSection(
                                    group.id,
                                    section,
                                    "divisor",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-4 py-3 border border-gray-300 dark:border-[#4A4A4A] dark:bg-[#2A2A2A] dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-[#4A82FF] focus:border-transparent transition-all duration-200"
                                placeholder="e.g., 100"
                              />
                            </div>

                            {/* Percentage Slider */}
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <label className="block font-semibold text-gray-700 dark:text-gray-300 text-sm">
                                  Percentage
                                </label>
                                <span className="text-lg font-bold text-indigo-600 dark:text-[#4A82FF]">
                                  {group[section].percentage || 100}%
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="200"
                                value={group[section].percentage || 100}
                                onChange={(e) =>
                                  updateSection(
                                    group.id,
                                    section,
                                    "percentage",
                                    parseInt(e.target.value),
                                  )
                                }
                                className="w-full h-2 bg-gray-200 dark:bg-[#4A4A4A] rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-[#4A82FF]"
                              />
                              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span>0%</span>
                                <span>100%</span>
                                <span>200%</span>
                              </div>
                            </div>

                            {/* Live Preview with Full Calculation */}
                            {preview && (
                              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-[#2A2A3A] dark:to-[#2A2A40] rounded-lg p-4 border border-indigo-200 dark:border-[#4A4A6A]">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Expression → TTL:</span>
                                    <span className="font-mono font-bold text-gray-800 dark:text-white">
                                      {group[section].expression} → {preview.TTL}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">TTL / {preview.divisor} = AVG:</span>
                                    <span className="font-mono font-bold text-gray-800 dark:text-white">
                                      {preview.TTL} / {preview.divisor} = {preview.AVG}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm pt-2 border-t border-indigo-200 dark:border-[#4A4A6A]">
                                    <span className="text-gray-600 dark:text-gray-400">AVG × {preview.percentage}%:</span>
                                    <span className="font-mono font-bold text-indigo-600 dark:text-[#4A82FF]">
                                      {preview.AVG} × {preview.percentage}% = {preview.adjustedAVG}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Info Text */}
                            <div className="bg-indigo-50 dark:bg-[#2A2A3A] rounded-lg p-3">
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                <span className="font-semibold">Formula:</span>{" "}
                                TTL = Expression/100, AVG = TTL/Divisor, Final = AVG × Percentage%
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                <span className="font-semibold">Example:</span>{" "}
                                5*50% with divisor 3 = 2.5/3 = 0.83
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Live Calculation Status */}
            {groups.length > 0 && (
              <div className="mt-12 text-center">
                <div className="inline-flex items-center gap-3 bg-green-100 dark:bg-emerald-900/30 text-green-700 dark:text-emerald-300 px-6 py-3 rounded-xl font-semibold">
                  <span className="w-2 h-2 bg-green-500 dark:bg-emerald-400 rounded-full animate-pulse"></span>
                  Live Calculation Active
                </div>
              </div>
            )}

            {/* Results Section */}
            {results && (
              <div className="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl p-8 border-2 border-green-300 dark:border-emerald-600">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-green-600 dark:bg-emerald-600 rounded-2xl flex items-center justify-center">
                    <Calculator className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-green-900 dark:text-emerald-200">
                    Calculation Results
                  </h2>
                </div>

                {/* Group Results with Detailed Breakdown */}
                <div className="space-y-6 mb-8">
                  {results.groupResults.map((gr, idx) => {
                    const groupData = groups[idx];
                    return (
                      <div
                        key={idx}
                        className="bg-white dark:bg-[#1E1E1E] rounded-xl p-6 shadow-lg border border-green-200 dark:border-emerald-700"
                      >
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                          Group {gr.groupNumber} - Detailed Breakdown
                        </h3>
                        
                        {/* Individual Section Results */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          {["P", "S", "A"].map((sectionName) => {
                            const section = gr[sectionName];
                            const percentage = groupData?.[sectionName]?.percentage || 100;
                            const isChanged = percentage !== 100;
                            const divisor = groupData?.[sectionName]?.divisor || 3;
                            
                            return (
                              <div
                                key={sectionName}
                                className={`bg-gray-50 dark:bg-[#2A2A2A] rounded-lg p-4 border-2 ${
                                  isChanged 
                                    ? 'border-indigo-300 dark:border-indigo-600' 
                                    : 'border-gray-200 dark:border-gray-700'
                                }`}
                              >
                                <div className="flex justify-between items-center mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-800 dark:text-white text-lg">
                                      {sectionName}
                                    </span>
                                    <span className="text-xs font-medium text-indigo-600 dark:text-[#4A82FF] bg-indigo-100 dark:bg-[#2A2A3A] px-2 py-1 rounded">
                                      {percentage}%
                                    </span>
                                  </div>
                                  {isChanged && (
                                    <div className="flex items-center gap-1">
                                      {percentage > 100 ? (
                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                      ) : percentage < 100 && percentage > 0 ? (
                                        <TrendingDown className="w-4 h-4 text-red-500" />
                                      ) : null}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="space-y-2">
                                  {/* Step 1: Expression to TTL */}
                                  <div className="flex justify-between items-center bg-white dark:bg-[#1E1E1E] p-2 rounded">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      Expression → TTL:
                                    </span>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      {groupData?.[sectionName]?.expression || '0'} → {section.TTL}
                                    </span>
                                  </div>
                                  
                                  {/* Step 2: TTL / Divisor = AVG */}
                                  <div className="flex justify-between items-center bg-white dark:bg-[#1E1E1E] p-2 rounded">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      TTL / {section.divisorUsed} = AVG:
                                    </span>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      {section.TTL} / {section.divisorUsed} = {section.AVG}
                                    </span>
                                  </div>
                                  
                                  {/* Step 3: Final Adjusted AVG with Percentage */}
                                  <div className="flex justify-between items-center bg-indigo-50 dark:bg-[#2A2A3A] p-2 rounded border border-indigo-200 dark:border-[#4A4A6A]">
                                    <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                                      Final Adjusted AVG ({percentage}%):
                                    </span>
                                    <span className="text-sm font-bold text-indigo-600 dark:text-[#4A82FF]">
                                      {section.adjustedValue}
                                    </span>
                                  </div>
                                  
                                  {/* Complete Formula */}
                                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-center font-mono">
                                    ({groupData?.[sectionName]?.expression || '0'})/100/{section.divisorUsed}×{percentage}% = {section.adjustedValue}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Group Summary */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-[#2A2A3A] dark:to-[#2A2A40] rounded-lg p-4 border border-indigo-200 dark:border-[#4A4A6A]">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <p className="text-xs text-gray-500 dark:text-gray-400">Total AVG</p>
                              <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
                                {round2Custom(gr.P.adjustedValue + gr.S.adjustedValue + gr.A.adjustedValue)}
                              </p>
                            </div>
                            <div className="text-center border-x border-indigo-200 dark:border-[#4A4A6A]">
                              <p className="text-xs text-gray-500 dark:text-gray-400">VA</p>
                              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                {gr.S.adjustedValue}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500 dark:text-gray-400">NVA</p>
                              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                                {round2Custom(gr.P.adjustedValue + gr.A.adjustedValue)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Final Metrics */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-emerald-600 dark:to-green-600 text-white rounded-xl p-8">
                  <h3 className="text-2xl font-bold mb-6">
                    Final Output Metrics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { label: "VA (Value Added)", value: results.VA },
                      { label: "N.VA (Non-Value Added)", value: results.NVA },
                      { label: "T (Total Time)", value: results.T },
                      { label: "C (Capacity)", value: results.C },
                    ].map((metric, idx) => (
                      <div key={idx} className="text-center">
                        <p className="font-semibold text-green-100 mb-2 text-sm">
                          {metric.label}
                        </p>
                        <p className="text-3xl md:text-4xl font-bold">
                          {metric.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}