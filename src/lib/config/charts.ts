import type { ApexOptions } from 'apexcharts';

const baseChartConfig: Partial<ApexOptions> = {
  chart: {
    fontFamily: 'inherit',
    toolbar: {
      show: false
    },
    zoom: {
      enabled: false
    },
    background: 'transparent'
  },
  grid: {
    show: true,
    borderColor: '#f3f4f6',
    strokeDashArray: 0,
    position: 'back',
    padding: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    }
  },
  tooltip: {
    enabled: true,
    theme: 'dark',
    style: {
      fontSize: '12px'
    },
    marker: {
      show: true
    },
    custom: ({ series, seriesIndex, dataPointIndex, w }) => {
      const value = series[seriesIndex][dataPointIndex];
      const color = w.globals.colors[seriesIndex];
      const formatted = new Intl.NumberFormat('es-PA', {
        style: 'currency',
        currency: 'USD',
        currencyDisplay: 'narrowSymbol',
        currencySign: 'standard',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
      return `<div style="padding: 8px 16px;">
        <div style="display: flex; align-items: center;">
          <span style="color: ${color}; font-size: 16px;">●</span>
          <span style="margin-left: 12px">$${formatted}</span>
        </div>
      </div>`;
    }
  }
};

export const revenueChartConfig: ApexOptions = {
  ...baseChartConfig,
  chart: {
    ...baseChartConfig.chart,
    height: 350,
    type: 'area'
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    width: 2,
    curve: 'smooth',
    colors: ['#22c55e']
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [0, 100]
    },
    colors: ['#22c55e']
  },
  xaxis: {
    labels: {
      style: {
        fontSize: '13px',
        fontWeight: 400,
        colors: '#6b7280'
      }
    },
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    },
    title: {
      text: 'Fecha'
    }
  },
  yaxis: {
    labels: {
      style: {
        fontSize: '13px',
        fontWeight: 400,
        colors: '#6b7280'
      },
      formatter: (val: number) => {
        return new Intl.NumberFormat('es-PA', {
          style: 'currency',
          currency: 'USD',
          currencyDisplay: 'narrowSymbol',
          currencySign: 'standard',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(val);
      }
    },
    title: {
      text: 'Ingresos ($)'
    }
  },
  tooltip: {
    ...baseChartConfig.tooltip,
    custom: ({ series, seriesIndex, dataPointIndex, w }) => {
      const value = series[seriesIndex][dataPointIndex];
      const color = w.globals.colors[seriesIndex];
      const formatted = new Intl.NumberFormat('es-PA', {
        style: 'currency',
        currency: 'USD',
        currencyDisplay: 'narrowSymbol',
        currencySign: 'standard',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
      return `<div style="padding: 8px 16px;">
        <div style="display: flex; align-items: center;">
          <span style="color: ${color}; font-size: 16px;">●</span>
          <span style="margin-left: 12px">Ingresos: ${formatted}</span>
        </div>
      </div>`;
    }
  }
};

export const customerChartConfig: ApexOptions = {
  ...baseChartConfig,
  chart: {
    ...baseChartConfig.chart,
    height: 350,
    type: 'bar'
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: '60%',
      colors: {
        ranges: [{
          from: 0,
          to: Infinity,
          color: '#4f46e5'
        }]
      }
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    show: false
  },
  xaxis: {
    labels: {
      style: {
        fontSize: '13px',
        fontWeight: 400,
        colors: '#6b7280'
      }
    },
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    },
    title: {
      text: 'Fecha'
    }
  },
  yaxis: {
    labels: {
      style: {
        fontSize: '13px',
        fontWeight: 400,
        colors: '#6b7280'
      },
      formatter: (val: number) => Math.round(val).toString()
    },
    title: {
      text: 'Nuevos Clientes'
    }
  },
  tooltip: {
    ...baseChartConfig.tooltip,
    custom: ({ series, seriesIndex, dataPointIndex, w }) => {
      const value = series[seriesIndex][dataPointIndex];
      const color = w.globals.colors[seriesIndex];
      return `<div style="padding: 8px 16px;">
        <div style="display: flex; align-items: center;">
          <span style="color: ${color}; font-size: 16px;">●</span>
          <span style="margin-left: 12px">Nuevos Clientes: ${Math.round(value)}</span>
        </div>
      </div>`;
    }
  }
};

export const shipmentChartConfig: ApexOptions = {
  chart: {
    type: "bar",
    height: 300,
    toolbar: {
      show: false
    }
  },
  plotOptions: {
    bar: {
      horizontal: true,
      distributed: true,
      dataLabels: {
        position: 'center'
      },
      barHeight: '50%',
      borderRadius: 4
    }
  },
  colors: ["#f43f5e", "#f59e0b", "#10b981"],
  dataLabels: {
    enabled: true,
    formatter: function(val: any) {
      return Math.round(val).toString();
    },
    style: {
      fontSize: '14px',
      fontWeight: 500,
      colors: ["#ffffff"]
    }
  },
  xaxis: {
    categories: ["No Enviados", "Pendientes de Pago/Retiro", "Completados"],
    labels: {
      style: {
        fontSize: '13px',
        fontWeight: 400,
        colors: '#6b7280'
      }
    },
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    }
  },
  yaxis: {
    labels: {
      style: {
        fontSize: '13px',
        fontWeight: 400,
        colors: '#6b7280'
      }
    }
  },
  grid: {
    show: false
  },
  tooltip: {
    enabled: true,
    theme: 'dark',
    marker: {
      show: true
    },
    custom: function({ series, seriesIndex, dataPointIndex, w }) {
      const value = series[seriesIndex].data[dataPointIndex];
      const status = w.globals.labels[dataPointIndex];
      const color = w.globals.colors[dataPointIndex];
      return `
        <div style="padding: 8px 12px;">
          <div style="display: flex; align-items: center;">
            <span style="color: ${color}; font-size: 16px; margin-right: 8px;">●</span>
            <span>Facturas: ${Math.round(value)}</span>
          </div>
        </div>
      `;
    }
  }
};

export const orderStatusChartConfig: ApexOptions = {
  ...baseChartConfig,
  chart: {
    ...baseChartConfig.chart,
    height: 350,
    type: 'pie'
  },
  series: [],
  labels: ["No Enviados", "Pendientes de Pago/Retiro", "Completados"],
  colors: ["#f43f5e", "#f59e0b", "#10b981"],
  legend: {
    show: true,
    position: "bottom",
    labels: {
      colors: "#1f2937"
    },
    markers: {
      fillColors: ["#f43f5e", "#f59e0b", "#10b981"]
    }
  },
  plotOptions: {
    pie: {
      donut: {
        size: "70%",
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: "14px",
            fontFamily: "inherit",
            color: "#6b7280"
          },
          value: {
            show: true,
            fontSize: "16px",
            fontFamily: "inherit",
            color: "#1f2937",
            formatter: (val: any) => {
              const numVal = typeof val === 'string' ? parseInt(val) : val;
              return numVal.toString();
            }
          },
          total: {
            show: true,
            label: "Total",
            fontSize: "16px",
            fontFamily: "inherit",
            color: "#1f2937"
          }
        }
      }
    }
  },
  dataLabels: {
    enabled: true,
    formatter: (val: any) => {
      const numVal = typeof val === 'string' ? parseInt(val) : val;
      return numVal.toString();
    }
  },
  tooltip: {
    enabled: true,
    theme: "dark",
    style: {
      fontSize: "12px"
    },
    marker: {
      show: true
    },
    custom: ({ series, seriesIndex, dataPointIndex, w }) => {
      const value = series[dataPointIndex];
      const color = w.globals.colors[dataPointIndex];
      const status = w.globals.labels[dataPointIndex];
      const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
      const percentage = total > 0 ? (value / total * 100).toFixed(1) : '0.0';
      return `<div style="padding: 8px 16px;">
        <div style="display: flex; align-items: center;">
          <span style="color: ${color}; font-size: 16px;">●</span>
          <span style="margin-left: 12px">Estado: ${status} (${value} - ${percentage}%)</span>
        </div>
      </div>`;
    }
  }
};
