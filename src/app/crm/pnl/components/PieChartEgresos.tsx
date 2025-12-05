"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type Egreso = {
  id: string;
  categoria: string;
  Egreso?: number;
};

type Props = {
  egresos: Egreso[];
};

const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

export function PieChartEgresos({ egresos }: Props) {
  const dataByCategoria = egresos.reduce((acc, egreso) => {
    const cat = egreso.categoria || "Sin categoría";
    const monto = Number(egreso.Egreso) || 0;
    if (!acc[cat]) acc[cat] = 0;
    acc[cat] += monto;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(dataByCategoria)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const total = chartData.reduce((acc, item) => acc + item.value, 0);

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md border p-6 flex items-center justify-center h-[400px]">
        <p className="text-gray-500">No hay datos para mostrar</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Distribución de Egresos por Categoría
      </h3>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [
                `$${value.toLocaleString("es-AR")}`,
                "Monto",
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 space-y-2 max-h-[200px] overflow-y-auto">
        {chartData.map((item, index) => (
          <div
            key={item.name}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-gray-700">{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-500">
                {((item.value / total) * 100).toFixed(1)}%
              </span>
              <span className="font-semibold text-red-600">
                ${item.value.toLocaleString("es-AR")}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-700">Total Egresos</span>
          <span className="text-xl font-bold text-red-600">
            ${total.toLocaleString("es-AR")}
          </span>
        </div>
      </div>
    </div>
  );
}
