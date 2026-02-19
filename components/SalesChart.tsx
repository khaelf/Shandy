
import React, { useState, useMemo } from 'react';
import { MonthlySales } from '../types';

type SalesChartProps = {
  data: MonthlySales[];
};

const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  const [hoveredBar, setHoveredBar] = useState<{ month: string; sales: number; x: number; y: number } | null>(null);

  const formatCurrency = (amount: number) => {
    if (amount >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(1)}jt`;
    }
    if (amount >= 1_000) {
      return `${(amount / 1_000).toFixed(0)}rb`;
    }
    return amount.toString();
  };
  
  const formatTooltipCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const chartDimensions = {
    width: 500,
    height: 250,
    marginTop: 20,
    marginRight: 20,
    marginBottom: 30,
    marginLeft: 50,
  };

  const { maxSales, yAxisLabels } = useMemo(() => {
    const salesValues = data.map(d => d.sales);
    const maxVal = Math.max(...salesValues, 0);
    const maxSales = maxVal > 0 ? Math.ceil(maxVal / 100000) * 100000 : 100000; // Round up to nearest 100k or default
    
    const labels = [];
    const step = maxSales / 5;
    for (let i = 0; i <= 5; i++) {
        labels.push(step * i);
    }
    return { maxSales, yAxisLabels: labels };

  }, [data]);

  const xScale = chartDimensions.width / data.length;
  const yScale = chartDimensions.height / maxSales;

  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500">Tidak ada data penjualan untuk ditampilkan.</div>;
  }

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox={`0 0 ${chartDimensions.width + chartDimensions.marginLeft + chartDimensions.marginRight} ${chartDimensions.height + chartDimensions.marginTop + chartDimensions.marginBottom}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
      >
        <g transform={`translate(${chartDimensions.marginLeft}, ${chartDimensions.marginTop})`}>
          {/* Y-Axis Grid Lines and Labels */}
          {yAxisLabels.map((label, i) => (
            <g key={i}>
              <line
                x1={0}
                x2={chartDimensions.width}
                y1={chartDimensions.height - label * yScale}
                y2={chartDimensions.height - label * yScale}
                stroke="#e5e7eb"
                strokeDasharray="2,2"
              />
              <text
                x={-10}
                y={chartDimensions.height - label * yScale}
                textAnchor="end"
                alignmentBaseline="middle"
                fontSize="10"
                fill="#6b7280"
              >
                {formatCurrency(label)}
              </text>
            </g>
          ))}

          {/* X-Axis */}
          <line x1={0} x2={chartDimensions.width} y1={chartDimensions.height} y2={chartDimensions.height} stroke="#d1d5db" />

          {/* Bars and X-Axis Labels */}
          {data.map((d, i) => {
            const barHeight = d.sales * yScale;
            const barWidth = xScale * 0.6;
            const x = i * xScale + (xScale - barWidth) / 2;
            const y = chartDimensions.height - barHeight;
            return (
              <g key={d.month}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="#3b82f6"
                  className="transition-opacity duration-200"
                  opacity={hoveredBar && hoveredBar.month !== d.month ? 0.5 : 1}
                  onMouseEnter={() => setHoveredBar({ ...d, x: x + barWidth / 2, y: y })}
                  onMouseLeave={() => setHoveredBar(null)}
                />
                <text
                  x={i * xScale + xScale / 2}
                  y={chartDimensions.height + 15}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#374151"
                >
                  {d.month}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      {hoveredBar && (
        <div
          className="absolute bg-gray-800 text-white text-xs rounded-md p-2 shadow-lg pointer-events-none"
          style={{
            left: `${((hoveredBar.x + chartDimensions.marginLeft) / (chartDimensions.width + chartDimensions.marginLeft + chartDimensions.marginRight)) * 100}%`,
            top: `${((hoveredBar.y + chartDimensions.marginTop) / (chartDimensions.height + chartDimensions.marginTop + chartDimensions.marginBottom)) * 100}%`,
            transform: 'translate(-50%, -110%)',
          }}
        >
          <div className="font-bold">{hoveredBar.month}</div>
          <div>{formatTooltipCurrency(hoveredBar.sales)}</div>
        </div>
      )}
    </div>
  );
};

export default SalesChart;
