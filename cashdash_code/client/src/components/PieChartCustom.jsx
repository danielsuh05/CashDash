import { PieChart } from '@mui/x-charts/PieChart'

export default function PieChartCustom() {
  const data = [
    { id: 0, value: 10, label: 'Category A' },
    { id: 1, value: 15, label: 'Category B' },
    { id: 2, value: 20, label: 'Category C' },
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <PieChart
        series={[
          {
            data: data,
            innerRadius: 65,
            outerRadius: 100,
            valueFormatter: (value) => {
              const percentage = (value.value / total) * 100;
              return `${Math.round(percentage)}%`;
            },
          },
        ]}
        width={400}
      />
    </div>
  );
}