import { GlobalMain } from '^/web/pages/global-layout';
import { Link } from 'react-router';

export function Component() {
  return (
    <GlobalMain>
      <Link to="/tools/oklch">OKLCH Color Picker & Converter</Link>
    </GlobalMain>
  );
}
