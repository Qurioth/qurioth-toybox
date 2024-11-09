"use client";

import Template from "@/components/Template";
import scenarios from "@/data/scenario/scenario-list";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Home() {
  const displaySenarios = () => {
    const responseList: JSX.Element[] = [];

    for (const key in scenarios) {
      responseList.push(
        <div className="mb-6">
          <a href={`/trpg/scenario/${key}`}>
            <h1>{scenarios[key].title}</h1>
          </a>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {scenarios[key].overview}
          </ReactMarkdown>
        </div>
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
