import { Icon as SVG } from '^/exports/zod';
import { createElement, Key, SVGAttributes } from 'react';

export type IconProps<K extends string> = {
  map: Record<K, SVG>;
  name: K;
  default?: string;
};

export function Icon<K extends string>(props: IconProps<K>) {
  const [width, height, paths] = props.map[props.name];

  const viewBox = `0 0 ${width} ${height}`;

  const children = paths.map(([d, opacity, fill], i) => {
    const init: SVGAttributes<SVGPathElement> & { key: Key } = { key: i };
    init.d = d;
    if (opacity !== 1) {
      init.fillOpacity = opacity;
    }
    if (typeof fill === 'undefined') {
      init.fill = 'currentcolor';
    } else if ('hex' in fill) {
      init.fill = fill.hex;
    } else {
      if (props.default && fill.var === props.default) {
        init.fill = 'currentcolor';
      } else {
        init.fill = `var(--${fill.var})`;
      }
    }
    return createElement('path', init);
  });

  return (
    <svg viewBox={viewBox} width='1em' height='1em'>
      {children}
    </svg>
  );
}
