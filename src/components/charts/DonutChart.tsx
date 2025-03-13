
import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface DonutChartProps {
  data: {
    labels: string[];
    values: number[];
    colors: string[];
  };
  title?: string;
  height?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, title, height = 300 }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      
      if (ctx) {
        // Destroy previous chart if it exists
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
        
        // Create new chart
        chartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: data.labels,
            datasets: [
              {
                data: data.values,
                backgroundColor: data.colors,
                borderColor: 'white',
                borderWidth: 2,
                hoverBorderColor: '#ffffff',
                hoverBorderWidth: 3,
                hoverOffset: 6,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  usePointStyle: true,
                  pointStyle: 'circle',
                  padding: 20,
                  font: {
                    family: 'Inter',
                    size: 12,
                  },
                },
              },
              tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#262626',
                bodyColor: '#404040',
                borderColor: '#E5E5E5',
                borderWidth: 1,
                cornerRadius: 8,
                boxPadding: 6,
                usePointStyle: true,
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.formattedValue;
                    const total = context.dataset.data.reduce((acc: number, data: number) => acc + data, 0);
                    const percentage = Math.round((context.raw as number / total) * 100);
                    return `${label}: ${value} € (${percentage}%)`;
                  }
                }
              },
            },
            animation: {
              animateScale: true,
              animateRotate: true,
              duration: 1000,
              easing: 'easeOutQuart',
            },
          },
        });
      }
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-medium mb-4 text-center">{title}</h3>}
      <div style={{ height: `${height}px` }}>
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default DonutChart;
