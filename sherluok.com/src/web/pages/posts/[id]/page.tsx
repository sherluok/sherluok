import { post } from './page.css';

export function Component() {
  return (
    <div className={post.container}>
      <div className={post.title}>New to the web platform in May</div>
      <div className={post.metadata}>
        <span>Created by </span>
        <span>SherLuoK</span>
        <span> at </span>
        <time dateTime="1970-01-01T00:00:00.000Z">January 1, 1970</time>
      </div>
      <article className={post.article}>
        <p>Discover some of the interesting features that have landed in stable and beta web browsers during May 2024.</p>
        <p>看到插件化这个词，熟悉 vscode 的同学第一时间想到的可能是 Extension，例如 Prettier 插件、ESLint 插件等等。是的，这确实是非常典型的插件化设计（也是本系列文章打算着重分析的一块内容），但是这篇文章要讨论是 vscode 内部以插件化方式编写的各种功能，英文叫做 contribution。这篇文章将会讨论以下问题。</p>
      </article>
    </div>
  );
}
