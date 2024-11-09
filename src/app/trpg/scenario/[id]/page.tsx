import Template from "@/components/Template";
import scenarios from "@/data/scenario/scenario-list";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Home({ params }: { params: { id: string } }) {
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
          {scenarios[params.id]?.markdown}
        </ReactMarkdown>
      </div>
    </Template>
  );
}
