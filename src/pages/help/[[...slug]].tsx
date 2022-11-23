import { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { ParsedUrlQuery } from "querystring";
import { FC, useMemo } from "react";

import { getDocsPages, getDocsPageWithContent } from "@/utils/markdown";
// eslint-disable-next-line no-duplicate-imports
import type { PageMetadata, DocsPage } from "@/utils/markdown";

export interface Params extends ParsedUrlQuery {
  slug?: string | string[];
}

export interface Props {
  pages: DocsPage[];
  metadata: PageMetadata;
  content: string;
}

const dateFormatter = Intl.DateTimeFormat(["es-PE", "en-US"]);

const HelpPages: FC<Props> = props => {
  const {
    pages,
    metadata: { title },
    content,
  } = props;

  const lastUpdate = useMemo<string>(() => {
    const date = new Date(props.metadata.lastUpdate);
    return dateFormatter.format(date);
  }, [props.metadata.lastUpdate]);

  return (
    <div className="flex px-10 py-16">
      <div className="w-48">
        <span className="font-medium text-sky-700">Navegación</span>
        <ul className="flex flex-col space-y-2 mt-4">
          {pages.map(page => (
            <Link key={page.slug} href={`/help/${page.slug}`} className="text-sm">
              {page.metadata.title}
            </Link>
          ))}
        </ul>
      </div>
      <div className="flex">
        <article className="prose mx-auto">
          <div>
            <h1 className="text-4xl font-bold mb-1 text-sky-700">{title}</h1>
            <span className="font-light">Última actualización: {lastUpdate}</span>
          </div>
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </article>
      </div>
    </div>
  );
};

export const getStaticPaths: GetStaticPaths<Params> = async () => {
  const pages = await getDocsPages();
  return {
    paths: pages.map(page => ({
      params: page.slug === "index" ? { slug: [] } : { slug: [page.slug] },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props, Params> = async ctx => {
  const slug = Array.isArray(ctx.params?.slug) ? ctx.params?.slug[0] : ctx.params?.slug;
  const page = await getDocsPageWithContent(slug);
  const pages = await getDocsPages();
  return {
    props: {
      ...page,
      pages: pages.map(page => ({
        ...page,
        slug: page.slug === "index" ? "" : page.slug,
      })),
    },
  };
};

export default HelpPages;
