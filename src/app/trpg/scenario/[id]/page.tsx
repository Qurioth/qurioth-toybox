import Template from "@/components/Template";
import scenarios from "@/data/scenario/scenario-list";
import { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const copyright = `
本作は、「株式会社アークライト」及び「株式会社KADOKAWA」が権利を有する『クトゥルフ神話TRPG』シリーズの二次創作物です。

Call of Cthulhu is copyright ©1981, 2015, 2019 by Chaosium Inc. ;all rights reserved. Arranged by Arclight Inc.  
Call of Cthulhu is a registered trademark of Chaosium Inc.  
PUBLISHED BY KADOKAWA CORPORATION　「クトゥルフ神話TRPG」「新クトゥルフ神話TRPG」
`;

const isCthulhuScenario = (system?: string) =>
  system?.includes("クトゥルフ神話TRPG") ?? false;

export async function generateMetadata(
  paramsObj: { params: { id: string } } | Promise<{ params: { id: string } }>
): Promise<Metadata> {
  const { params } = await paramsObj;
  const resolvedParams = await params;
  const articleTitle = scenarios[resolvedParams.id]?.title;

  if (articleTitle) {
    return {
      title: articleTitle,
    };
  } else {
    return {};
  }
}

export default async function Home(
  paramsObj: { params: { id: string } } | Promise<{ params: { id: string } }>
) {
  const { params } = await paramsObj;
  const resolvedParams = await params;
  const scenario = scenarios[resolvedParams.id];

  return (
    <Template>
      <div className="prose dark:prose-dark w-full flex flex-col justify-center">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            img: ({ node, ...props }) => (
              // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
              <img {...props} className="size-40 md:size-60 float-right m-2" />
            ),
          }}
        >
          {scenario?.markdown}
        </ReactMarkdown>
        {isCthulhuScenario(scenario?.system) && (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{copyright}</ReactMarkdown>
        )}
      </div>
    </Template>
  );
}
