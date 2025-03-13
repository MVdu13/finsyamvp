
import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface LineChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      color: string;
      fill?: boolean;
    }[];
  };
  title?: string;
  height?: number;
}

const LineChart: React.FC<LineChartProps> = ({ data, title, height = 300 }) => {
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
          type: 'line',
          data: {
            labels: data.labels,
            datasets: data.datasets.map(dataset => ({
              label: dataset.label,
              data: dataset.data,
              borderColor: dataset.color,
              backgroundColor: dataset.fill 
                ? `${dataset.color}20` // 20 is hex for 12% opacity
                : 'transparent',
              fill: dataset.fill || false,
              tension: 0.4,
              borderWidth: 2.5,
              pointRadius: 3,
              pointBackgroundColor: 'white',
              pointBorderColor: dataset.color,
              pointBorderWidth: 2,
              pointHoverRadius: 5,
              pointHoverBackgroundColor: dataset.color,
              pointHoverBorderColor: 'white',
              pointHoverBorderWidth: 2,
            })),
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                grid: {
                  display: false,
                  drawBorder: false,
                },
                ticks: {
                  font: {
                    family: 'Inter',
                    size: 11,
                  },
                  color: '#737373',
                },
              },
              y: {
                grid: {
                  borderDash: [3, 3],
                  color: '#E5E5E5',
                  drawBorder: false,
                },
                ticks: {
                  font: {
                    family: 'Inter',
                    size: 11,
                  },
                  color: '#737373',
                  callback: function(value) {
                    return `${value} €`;
                  }
                },
                beginAtZero: true,
              }
            },
            plugins: {
              legend: {
                position: 'top',
                align: 'end',
                labels: {
                  usePointStyle: true,
                  pointStyle: 'circle',
                  boxWidth: 8,
                  boxHeight: 8,
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
                    const label = context.dataset.label || '';
                    const value = context.formattedValue;
                    return `${label}: ${value} €`;
                  }
                }
              },
            },
            animation: {
              duration: 1000,
              easing: 'easeOutQuart',
            },
            interaction: {
              mode: 'index',
              intersect: false,
            },
            hover: {
              mode: 'index',
              intersect: false,
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
      {title && <h3 className="text-lg font-medium mb-4">{title}</h3>}
      <div style={{ height: `${height}px` }}>
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default LineChart;
