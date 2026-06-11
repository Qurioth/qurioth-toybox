import Template from "@/components/Template";
import scenarios from "@/data/scenario/scenario-list";

const renderOverview = (overview: string) =>
  overview
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => (
      <p key={index} className="my-1 indent-[1em]">
        {line}
      </p>
    ));

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
          {renderOverview(scenario.overview)}
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
