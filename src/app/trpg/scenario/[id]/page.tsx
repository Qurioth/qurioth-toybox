import Template from "@/components/Template";
import scenarios from "@/data/scenario/scenario-list";
import type { Metadata } from "next";
import ScenarioDetailBody from "./ScenarioDetailBody";

export async function generateMetadata(
  paramsObj: { params: { id: string } } | Promise<{ params: { id: string } }>,
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

export default async function ScenarioDetailPage(
  paramsObj: { params: { id: string } } | Promise<{ params: { id: string } }>,
) {
  const { params } = await paramsObj;
  const resolvedParams = await params;
  const scenario = scenarios[resolvedParams.id];

  return (
    <Template>
      <ScenarioDetailBody scenario={scenario} />
    </Template>
  );
}
