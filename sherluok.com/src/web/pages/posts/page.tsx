import { Link } from 'react-router';
import { post } from './page.css';

export function Component() {
  return (
    <div>
      <Link className={post.container} to={`/posts/abc123`}>
        <time className={post.time} dateTime="1970-01-01T00:00:00.000Z">January 1, 1970</time>
        <div className={post.title}>New to the web platform in May</div>
        <div className={post.preview}>Discover some of the interesting features that have landed in stable and beta web browsers during May 2024.</div>
      </Link>
      <Link className={post.container} to={`/posts/def456`}>
        <time className={post.time} dateTime="1970-01-01T00:00:00.000Z">January 1, 1970</time>
        <div className={post.title}>草履虫都能看懂的 React 入门教程</div>
        <div className={post.preview}>Discover some of the interesting features that have landed in stable and beta web browsers during May 2024.</div>
      </Link>
    </div>
  );
}
