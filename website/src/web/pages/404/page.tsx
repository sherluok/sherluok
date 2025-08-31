import { faGhost } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GlobalMain } from '^/web/pages/layout';
import { Link } from 'react-router';
import { page } from './page.css';

export function Component() {
  return (
    <GlobalMain className={page.main}>
      <div className={page.title}>Not Found ...</div>
      <FontAwesomeIcon className={page.icon} icon={faGhost} />
      <Link className={page.link} to="/">Back to Home</Link>
    </GlobalMain>
  );
}
