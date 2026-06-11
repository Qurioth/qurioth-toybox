import Template from "@/components/Template";
import scenarios from "@/data/scenario/scenario-list";

const formatRange = (min: number, max: number) =>
  min === max ? `${min}` : `${min}～${max}`;

export default function Home() {
  const displaySenarios = () => {
    const responseList: JSX.Element[] = [];

    for (const key in scenarios) {
      const scenario = scenarios[key];

      responseList.push(
        <div key={key} className="mb-6">
          <a href={`/trpg/scenario/${key}`}>
            <h1>{scenario.title}</h1>
          </a>
          <p className="my-1 text-sm opacity-80">
            {scenario.system} / {scenario.players.min}～{scenario.players.max}
            人 /{" "}
            {formatRange(
              scenario.playTimeHours.min,
              scenario.playTimeHours.max,
            )}
            時間程度
          </p>
          <p className="my-1 indent-[1em]">{scenario.summary}</p>
        </div>,
      );
    }
    return responseList;
  };

  return (
    <Template>
      <div className="prose dark:prose-dark w-full flex flex-col justify-center">
        {displaySenarios()}
      </div>
    </Template>
  );
}
