import Template from "@/components/Template";
import scenarios from "@/data/scenario/scenario-list";
import ScenarioList, { ScenarioListItem } from "./ScenarioList";

export default function Home() {
  const scenarioItems: ScenarioListItem[] = Object.entries(scenarios).map(
    ([id, scenario]) => ({
      id,
      title: scenario.title,
      titleKana: scenario.titleKana,
      system: scenario.system,
      players: scenario.players,
      playTimeHours: scenario.playTimeHours,
      summary: scenario.summary,
    }),
  );

  return (
    <Template>
      <div className="mx-auto min-h-[calc(100vh-16rem)] w-full max-w-[66rem]">
        <ScenarioList scenarios={scenarioItems} />
      </div>
    </Template>
  );
}
