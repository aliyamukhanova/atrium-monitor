import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TemperaturePoint {
  time: string;
  atriumTemperature: number | null;
  outsideTemperature: number | null;
}

interface TemperatureChartProps {
  data: TemperaturePoint[];
}

export default function TemperatureChart({
  data,
}: TemperatureChartProps) {
  return (
    <div className="temperature-chart">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <LineChart
          data={data}
          margin={{
            top: 12,
            right: 12,
            bottom: 8,
            left: 0,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="time"
            minTickGap={24}
          />

          <YAxis
            unit="°C"
            width={52}
          />

          <Tooltip />

          <Legend />

          <Line
            type="monotone"
            dataKey="atriumTemperature"
            name="Atrium"
            connectNulls
            stroke="#4776e6"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5 }}
          />

          <Line
            type="monotone"
            dataKey="outsideTemperature"
            name="Outside"
            connectNulls
            stroke="#25a65a"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}