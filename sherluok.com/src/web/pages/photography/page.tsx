import { page } from './page.css';

export function Component() {
  return (
    <>
      <div className={page.left}>
        <img className={page.map} src={new URL('./media/map.png?asset=resource', import.meta.url).toString()} />
      </div>
      <div className={page.center}>
        <img src="https://picsum.photos/seed/p1/704/500" />
      </div>
      <div className={page.right}>
      </div>
    </>
  );
}
