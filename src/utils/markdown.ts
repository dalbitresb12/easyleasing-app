import fs from "fs/promises";
import matter from "gray-matter";
import path from "path";
import { remark } from "remark";
import html from "remark-html";
import { z } from "zod";

export const PageMetadata = z.object({
  title: z.string(),
  lastUpdate: z.string(),
});
export type PageMetadata = z.infer<typeof PageMetadata>;

export type DocsPage = {
  slug: string;
  metadata: PageMetadata;
};

export type RenderedDocsPage = DocsPage & {
  content: string;
};

const docsDirectory = path.join(process.cwd(), "docs");

export const getDocsPages = async (dir = docsDirectory): Promise<DocsPage[]> => {
  const filenames = await fs.readdir(dir);

  const pages = await filenames.reduce<Promise<DocsPage[]>>(async (promiseAcc, file) => {
    const acc: DocsPage[] = await promiseAcc;
    const fullPath = path.join(dir, file);
    const fileMeta = await fs.lstat(fullPath);

    // Warn if trying to create directory structure
    if (fileMeta.isDirectory()) {
      throw new Error("File directories and nesting are not supported yet.");
    }

    // If anything other than file, ignore
    if (!fileMeta.isFile()) return acc;

    // Not a Markdown file, ignore
    if (!file.endsWith(".md")) return acc;

    // Generate URL-friendly ID
    const slug = file.replace(/\.md$/, "");

    // Parse front matter
    const contents = await fs.readFile(fullPath, "utf-8");
    const matterResult = matter(contents);

    acc.push({
      slug,
      metadata: PageMetadata.parse(matterResult.data),
    });
    return acc;
  }, Promise.resolve([] as DocsPage[]));

  return pages;
};

export const getDocsPageWithContent = async (slug = "index"): Promise<RenderedDocsPage> => {
  // Read contents and parse with matter
  const fullPath = path.join(docsDirectory, `${slug}.md`);
  let contents = await fs.readFile(fullPath, "utf-8");

  // Fix public folder URLs
  contents = contents.replace(/\[(.*)\]\((.*)\)/g, (_, text: string, url: string) => {
    if (url.startsWith("/public/")) {
      url = url.replace("/public/", "/");
    }
    return `[${text}](${url})`;
  });

  // Parse front matter and markdown
  const matterResult = matter(contents);
  const parsed = await remark().use(html, { sanitize: true }).process(matterResult.content);

  return {
    slug,
    metadata: PageMetadata.parse(matterResult.data),
    content: parsed.toString(),
  };
};
