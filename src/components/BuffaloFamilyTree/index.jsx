import React, { useState, useRef, useEffect } from "react";
import TreeVisualization from './TreeVisualization';

export default function BuffaloFamilyTree() {
  const [units, setUnits] = useState(1);
  const [years, setYears] = useState(10);
  const [startYear, setStartYear] = useState(2026);
  const [startMonth, setStartMonth] = useState(0); // 0 = January
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const runSimulationFromFlutter = (unitsVal, yearsVal, startYearVal, startMonthVal) => {
    console.log('runSimulationFromFlutter called with:', { unitsVal, yearsVal, startYearVal, startMonthVal });
    setUnits(unitsVal);
    setYears(yearsVal);
    setStartYear(startYearVal);
    setStartMonth(startMonthVal);
    
    // Call runSimulation directly with the parameters
    runSimulation(unitsVal, yearsVal, startYearVal, startMonthVal);
  };

  const containerRef = useRef(null);
  const treeContainerRef = useRef(null);

  // Staggered revenue configuration
  const revenueConfig = {
    landingPeriod: 2,
    highRevenuePhase: { months: 5, revenue: 9000 },
    mediumRevenuePhase: { months: 3, revenue: 6000 },
    restPeriod: { months: 4, revenue: 0 }
  };

  // Calculate monthly revenue for EACH buffalo based on its individual cycle
  const calculateMonthlyRevenueForBuffalo = (buffaloId, acquisitionMonth, currentYear, currentMonth, startYearVal) => {
    const monthsSinceAcquisition = (currentYear - startYearVal) * 12 + (currentMonth - acquisitionMonth);
    
    if (monthsSinceAcquisition < revenueConfig.landingPeriod) {
      return 0;
    }
    
    const productionMonths = monthsSinceAcquisition - revenueConfig.landingPeriod;
    const cyclePosition = productionMonths % 12;
    
    if (cyclePosition < revenueConfig.highRevenuePhase.months) {
      return revenueConfig.highRevenuePhase.revenue;
    } else if (cyclePosition < revenueConfig.highRevenuePhase.months + revenueConfig.mediumRevenuePhase.months) {
      return revenueConfig.mediumRevenuePhase.revenue;
    } else {
      return revenueConfig.restPeriod.revenue;
    }
  };

  // Calculate annual revenue for ALL mature buffaloes with individual cycles
  const calculateAnnualRevenueForHerd = (herd, startYearVal, startMonthVal, currentYear) => {
    let annualRevenue = 0;
    
    const matureBuffaloes = herd.filter(buffalo => {
      const ageInCurrentYear = currentYear - buffalo.birthYear;
      return ageInCurrentYear >= 3;
    });

    matureBuffaloes.forEach((buffalo) => {
      const acquisitionMonth = buffalo.acquisitionMonth;
      
      for (let month = 0; month < 12; month++) {
        annualRevenue += calculateMonthlyRevenueForBuffalo(
          buffalo.id, 
          acquisitionMonth, 
          currentYear, 
          month,
          startYearVal
        );
      }
    });

    return {
      annualRevenue,
      matureBuffaloes: matureBuffaloes.length,
      totalBuffaloes: herd.filter(buffalo => buffalo.birthYear <= currentYear).length
    };
  };

  // Calculate total revenue data based on ACTUAL herd growth with staggered cycles
  const calculateRevenueData = (herd, startYearVal, startMonthVal, totalYears) => {
    const yearlyData = [];
    let totalRevenue = 0;
    let totalMatureBuffaloYears = 0;

    const monthNames = ["January", "February", "March", "April", "May", "June", 
                       "July", "August", "September", "October", "November", "December"];

    for (let yearOffset = 0; yearOffset < totalYears; yearOffset++) {
      const currentYear = startYearVal + yearOffset;
      
      const { annualRevenue, matureBuffaloes, totalBuffaloes } = 
        calculateAnnualRevenueForHerd(herd, startYearVal, startMonthVal, currentYear);

      totalRevenue += annualRevenue;
      totalMatureBuffaloYears += matureBuffaloes;

      const monthlyRevenuePerBuffalo = matureBuffaloes > 0 ? annualRevenue / (matureBuffaloes * 12) : 0;

      yearlyData.push({
        year: currentYear,
        activeUnits: Math.ceil(totalBuffaloes / 2),
        monthlyRevenue: monthlyRevenuePerBuffalo,
        revenue: annualRevenue,
        totalBuffaloes: totalBuffaloes,
        producingBuffaloes: matureBuffaloes,
        nonProducingBuffaloes: totalBuffaloes - matureBuffaloes,
        startMonth: monthNames[startMonthVal],
        startYear: startYearVal,
        matureBuffaloes: matureBuffaloes
      });
    }

    return {
      yearlyData,
      totalRevenue,
      totalUnits: totalMatureBuffaloYears / totalYears,
      averageAnnualRevenue: totalRevenue / totalYears,
      revenueConfig,
      totalMatureBuffaloYears
    };
  };

  // Simulation logic with staggered acquisition months
  const runSimulation = (unitsVal = units, yearsVal = years, startYearVal = startYear, startMonthVal = startMonth) => {
    console.log('Running simulation with:', { unitsVal, yearsVal, startYearVal, startMonthVal });
    
    setLoading(true);
    setTimeout(() => {
      const totalYears = Number(yearsVal);
      const herd = [];
      let nextId = 1;

      // Create initial buffaloes (2 per unit) with staggered acquisition
      for (let u = 0; u < unitsVal; u++) {
        // First buffalo - acquired in starting month
        herd.push({
          id: nextId++,
          age: 3,
          mature: true,
          parentId: null,
          generation: 0,
          birthYear: startYearVal - 3,
          acquisitionMonth: startMonthVal,
          unit: u + 1,
        });

        // Second buffalo - acquired in July (6 months later)
        herd.push({
          id: nextId++,
          age: 3,
          mature: true,
          parentId: null,
          generation: 0,
          birthYear: startYearVal - 3,
          acquisitionMonth: (startMonthVal + 6) % 12,
          unit: u + 1,
        });
      }

      // Simulate years
      for (let year = 1; year <= totalYears; year++) {
        const currentYear = startYearVal + (year - 1);
        const matureBuffaloes = herd.filter((b) => b.age >= 3);

        // Each mature buffalo gives birth to one offspring per year
        matureBuffaloes.forEach((parent) => {
          herd.push({
            id: nextId++,
            age: 0,
            mature: false,
            parentId: parent.id,
            birthYear: currentYear,
            acquisitionMonth: parent.acquisitionMonth,
            generation: parent.generation + 1,
            unit: parent.unit,
          });
        });

        // Age all buffaloes
        herd.forEach((b) => {
          b.age++;
          if (b.age >= 3) b.mature = true;
        });
      }

      // Calculate revenue data based on ACTUAL herd growth with staggered cycles
      const revenueData = calculateRevenueData(herd, startYearVal, startMonthVal, totalYears);

      setTreeData({
        units: unitsVal,
        years: yearsVal,
        startYear: startYearVal,
        startMonth: startMonthVal,
        totalBuffaloes: herd.length,
        buffaloes: herd,
        revenueData: revenueData
      });

      setLoading(false);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }, 300);
  };

  // Drag to pan functionality
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
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

  useEffect(() => {
    const handler = (event) => {
      console.log('Message received from Flutter:', event.data);
      
      if (!event.data) return;

      if (event.data.type === "RUN_SIMULATION") {
        console.log('Running simulation with data:', event.data.payload);
        const { units, years, startYear, startMonth } = event.data.payload;
        runSimulationFromFlutter(units, years, startYear, startMonth);
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-blue-600 mb-6"></div>
        <div className="text-2xl text-gray-700 font-semibold">Growing Buffalo Herd...</div>
        <div className="text-base text-gray-500 mt-3">Simulating {units} unit{units > 1 ? 's' : ''} over {years} years</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col overflow-hidden">
      <TreeVisualization
        treeData={treeData}
        zoom={zoom}
        position={position}
        isDragging={isDragging}
        handleMouseDown={handleMouseDown}
        handleMouseMove={handleMouseMove}
        handleMouseUp={handleMouseUp}
        containerRef={containerRef}
        treeContainerRef={treeContainerRef}
      />
    </div>
  );
}