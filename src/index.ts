// TypeScript example for Chart.js
//import { Chart, registerables } from 'chart.js';

// Register components
//Chart.register(...registerables);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Chart: any; // Declare Chart globally for TypeScript to avoid errors

/**
 * Waits for the Chart.js library to load and initializes the charts.
 */
function waitForChartJsAndInitialize(timeout = 5000, interval = 50): void {
  const startTime = Date.now();

  const checkChartJs = () => {
    if (typeof Chart !== 'undefined') {
      // eslint-disable-next-line no-console
      console.log('Chart.js is loaded. Initializing charts...');
      initializeCharts(); // Call the main chart initialization function
    } else if (Date.now() - startTime < timeout) {
      setTimeout(checkChartJs, interval); // Retry after the interval
    } else {
      console.error('Chart.js library did not load within the timeout period.');
    }
  };

  checkChartJs();
}

/**
 * Main function to initialize all charts from embedded JSON data.
 */
function initializeCharts(): void {
  // Select all chart items
  const chartItems = document.querySelectorAll<HTMLDivElement>('.chart-item');

  chartItems.forEach((chartItem) => {
    const canvasId = `${chartItem.id}-canvas`; // Unique canvas ID
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    const scriptTag = chartItem.querySelector<HTMLScriptElement>('.chart-data');

    if (canvas && scriptTag) {
      try {
        const chartData = JSON.parse(scriptTag.textContent.replace(/&quot;/g, '"') || '{}');
        // Extract data for the chart
        const labels = chartData.map((data) => data[scriptTag.dataset.label]) || [];
        const values = chartData.map((data) => data[scriptTag.dataset.value]) || [];
        initializeChart(canvas, labels, values, chartItem.id);
        scriptTag.remove(); // Remove the script tag after processing
      } catch (error) {
        console.error(`Error parsing JSON for chart ID: ${chartItem.id}`, error);
      }
    }
  });
}

/**
 * Initialize a Chart.js chart.
 * @param canvas - HTMLCanvasElement where the chart will render.
 * @param labels - Array of labels for the x-axis.
 * @param data - Array of data values for the chart.
 * @param chartId - Unique ID for the chart (for logging/debugging purposes).
 */
function initializeChart(
  canvas: HTMLCanvasElement,
  labels: string[],
  data: number[],
  chartId: string
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error(`Canvas context not found for chart ID: ${chartId}`);
    return;
  }

  // Create gradient for the chart background
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(0, 192, 0, 0.7)'); // Top color
  gradient.addColorStop(1, 'rgba(0, 192, 0, 0.1)'); // Bottom transparent color

  // Initialize Chart.js chart
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: ``,
          data: data,
          borderColor: 'rgba(0, 192, 0, 0.7)',
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          //hoverRadius: 7,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          title: { display: false, text: 'Time' },
          ticks: {
            maxTicksLimit: 10,
            padding: -30,
            z: 10,
            callback: function (value, index) {
              return index === 0 ? '' : this.getLabelForValue(value);
            },
          },
        },
        y: {
          grid: { display: false },
          title: { display: false, text: 'Values' },
        },
      },
      plugins: {
        legend: { display: false, position: 'top' },
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
    },
  });
}

// Run the check for Chart.js after DOM is loaded
document.addEventListener('DOMContentLoaded', () => waitForChartJsAndInitialize());
