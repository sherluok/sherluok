import { faBilibili, faGithub, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faPoop } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactNode } from 'react';
import { Link, NavLink, Outlet } from 'react-router';
import { globalLayout } from './global-layout.css';

interface GlobalLayoutProps {
}

export function GlobalLayout(props: GlobalLayoutProps) {
  return (
    <div className={globalLayout.container}>
      <header className={globalLayout.header}>
        <Link className={globalLayout.icon} to="/">
          <FontAwesomeIcon icon={faPoop} />
        </Link>
        <div className={globalLayout.middle}>
          <NavLink className={globalLayout.title} to="/">SherLuoK</NavLink>
          <div className={globalLayout.menuList}>
            <NavLink className={globalLayout.menuItem} to="/posts">Posts</NavLink>
            <NavLink className={globalLayout.menuItem} to="/open-source">Music</NavLink>
            <NavLink className={globalLayout.menuItem} to="/photography">Photography</NavLink>
            <NavLink className={globalLayout.menuItem} to="/tools">Tools</NavLink>
          </div>
        </div>
        <div className={globalLayout.externalLinkList}>
          <a className={globalLayout.externalLinkItem} href="https://instagram.com/">
            <FontAwesomeIcon icon={faInstagram} />
          </a>
          <a className={globalLayout.externalLinkItem} href="https://bilibili.com/">
            <FontAwesomeIcon icon={faBilibili} />
          </a>
          <a className={globalLayout.externalLinkItem} href="https://github.com/">
            <FontAwesomeIcon icon={faGithub} />
          </a>
        </div>
      </header>
      <Outlet />
      <footer className={globalLayout.footer}>
        © 2025 sherluok.com
      </footer>
    </div>
  );
}

interface GlobalMainProps {
  children?: ReactNode;
}

export function GlobalMain(props: GlobalMainProps) {
  return (
    <main className={globalLayout.main}>
      {props.children}
    </main>
  );
}
