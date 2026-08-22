import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

const CharacteristicsRadarChart = (props: {
  name: string;
  dataKey: string;
  // biome-ignore lint/suspicious/noExplicitAny: recharts data shape varies per chart
  data: any[];
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={props.data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis domain={[0, 100]} tick={false} tickCount={7} />
        <Radar
          name={props.name}
          dataKey={props.dataKey}
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.6}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default CharacteristicsRadarChart;
