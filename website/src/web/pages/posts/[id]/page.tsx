import { cloneElement, ReactElement, useEffect, useState } from 'react';
import { post } from './page.css';

import { evaluate } from '@mdx-js/mdx';
import { MDXContent } from 'mdx/types';
import * as runtime from 'react/jsx-runtime';
import { default as rehypeMdxTitle } from 'rehype-mdx-title';
import { default as rehypeMdxToc, TocItem } from 'rehype-mdx-toc';
import { default as rehypePrettyCode } from 'rehype-pretty-code';
import { default as rehypeSlug } from 'rehype-slug';
import { default as remarkGFM } from 'remark-gfm';

// import * as Article from '^/web/articles/1-test-mdx.mdx';
import Article3Text from '^/web/articles/stm32.mdx?asset=source';
// console.log(Article);
// console.log('Article3Text:', Article3Text);

type CustomMDXModule = {
  default: MDXContent;
  title: string;
  toc: TocItem[];
};

export function Component() {
  const [Article3, setModule] = useState<CustomMDXModule>();

  console.log('Article3:', Article3);

  useEffect(() => {
    evaluate(Article3Text, {
      ...runtime,
      baseUrl: import.meta.url,
      remarkPlugins: [
        remarkGFM,
      ],
      rehypePlugins: [
        rehypeSlug,
        rehypeMdxToc,
        rehypeMdxTitle,
        [rehypePrettyCode, {
          // [Multiple Themes](https://rehype-pretty.pages.dev/#multiple-themes-dark-and-light-mode)
          theme: {
            dark: 'github-dark-dimmed',
            light: 'github-light',
          },
        }],
      ],
    }).then((module) => setModule(module as CustomMDXModule));
  }, []);

  if (!Article3) {
    return null;
  }

  return (
    <>
      <div className={post.header}>
        <div className={post.title}>{Article3.title}</div>
        <div className={post.metadata}>
          <span>Created by </span>
          <a className={post.author} href="/">SherLuoK</a>
          <span> at </span>
          <time dateTime="1970-01-01T00:00:00.000Z">January 1, 1970</time>
        </div>
      </div>
      <article className={post.article}>
        {/* <p>Discover some of the interesting features that have landed in stable and beta web browsers during May 2024.</p> */}
        {/* <p>看到插件化这个词，熟悉 vscode 的同学第一时间想到的可能是 Extension，例如 Prettier 插件、ESLint 插件等等。是的，这确实是非常典型的插件化设计（也是本系列文章打算着重分析的一块内容），但是这篇文章要讨论是 vscode 内部以插件化方式编写的各种功能，英文叫做 contribution。这篇文章将会讨论以下问题。</p> */}
        <Article3.default
          components={{
            h1: () => null,
          }}
        />
        {/* <hr /> */}
        {/* <Article2.default /> */}
      </article>
      <nav className={post.toc}>
        {toTocItemElements(Article3.toc)}
      </nav>
    </>
  );
}

// function* generateTocItemElements(items: RemarkMdxTocItem[]): Generator<ReactElement> {
//   for (const it of items) {
//     yield <a className={post.tocItem} style={{ paddingLeft: `${it.depth - 2}em` }} href="#">{it.value}</a>;
//     yield* generateTocItemElements(it.children);
//   }
// }

// function toTocItemElements(items: RemarkMdxTocItem[]): ReactElement[] {
//   return generateTocItemElements(items).map((element, key) => {
//     return cloneElement(element, { key });
//   }).toArray();
// }

function* generateTocItemElements(items: TocItem[]): Generator<ReactElement> {
  for (const it of items) {
    yield <a className={post.tocItem} style={{ paddingLeft: `${it.depth - 2}em` }} href={it.href ?? '#'}>{it.value}</a>;
  }
}

function toTocItemElements(items: TocItem[]): ReactElement[] {
  return generateTocItemElements(items).map((element, key) => {
    return cloneElement(element, { key });
  }).toArray();
}
