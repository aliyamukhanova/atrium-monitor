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

interface EnvironmentPoint {
  time: string;
  noiseLevel: number | null;
  brightnessLevel: number | null;
}

interface EnvironmentChartProps {
  data: EnvironmentPoint[];
}

const noiseLabels: Record<number, string> = {
  1: "Quiet",
  2: "Mild noise",
  3: "Noisy",
  4: "Very noisy",
};

const brightnessLabels: Record<number, string> = {
  1: "Dark",
  2: "Dim",
  3: "Normal",
  4: "Bright",
  5: "Very bright",
};

export default function EnvironmentChart({
  data,
}: EnvironmentChartProps) {
  return (
    <div className="environment-chart">
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
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            width={36}
          />

          <Tooltip
            formatter={(value, name) => {
              const numericValue =
                typeof value === "number"
                  ? value
                  : Number(value);

              if (
                name === "Noise" &&
                numericValue in noiseLabels
              ) {
                return [
                  noiseLabels[numericValue],
                  "Noise",
                ];
              }

              if (
                name === "Brightness" &&
                numericValue in brightnessLabels
              ) {
                return [
                  brightnessLabels[numericValue],
                  "Brightness",
                ];
              }

              return [
                String(value ?? "Not available"),
                String(name),
              ];
            }}
          />

          <Legend />

          <Line
            type="monotone"
            dataKey="noiseLevel"
            name="Noise"
            connectNulls
            stroke="#d97706"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5 }}
          />

          <Line
            type="monotone"
            dataKey="brightnessLevel"
            name="Brightness"
            connectNulls
            stroke="#7c3aed"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}