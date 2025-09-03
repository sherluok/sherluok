import { GlobalMain } from '^/web/pages/layout';
import { Link } from 'react-router';
import { page } from './page.css';

export function Component() {
  return (
    <GlobalMain className={page.toolList}>
      <Item
        to="/tools/oklch"
        icon={new URL('./media/culori.png?asset=resouce', import.meta.url).toString()}
        title="CSS Color Picker & Converter"
        description="Convert CSS <color> into equal forms, pick color in OKLCH color space."
      />
      <Item
        to="/tools/ss-qrcode"
        icon={new URL('./media/shadowsocks.png?asset=resouce', import.meta.url).toString()}
        title="Shadowsocks QR Code Generator"
        description="Generate Shadowsocks SIP002 URI scheme QR Code."
      />
      <Item
        to="/tools/developer-home-tab"
        icon={new URL('./media/chrome.svg?asset=resouce', import.meta.url).toString()}
        title="Developer's Home Tab"
        description="Browser home tab page for developers, including popular tech offical websites."
      />
      <Item
        to="/tools/developer-home-tab"
        icon={new URL('./media/vscode.svg?asset=resouce', import.meta.url).toString()}
        title="VS Code Problem Matcher Extension"
        description="Browser home tab page for developers, including popular tech offical websites."
      />
      <Item
        to="/tools/developer-home-tab"
        icon={new URL('./media/figma.svg?asset=resouce', import.meta.url).toString()}
        title="Figma Icons Explorter Plugin"
        description="Browser home tab page for developers, including popular tech offical websites."
      />
      <Item
        to="/tools/developer-home-tab"
        icon={new URL('./media/svg.svg?asset=resouce', import.meta.url).toString()}
        title="SVG Simplifier"
        description="Browser home tab page for developers, including popular tech offical websites."
      />
      <Item
        to="/tools/developer-home-tab"
        icon={new URL('./media/npm.svg?asset=resouce', import.meta.url).toString()}
        title="Standard Javascript Library"
        description="Browser home tab page for developers, including popular tech offical websites."
      />
    </GlobalMain>
  );
}

interface ItemProps {
  to: string;
  icon: string;
  title: string;
  description: string;
}

function Item(props: ItemProps) {
  return (
    <Link className={page.toolItem} to={props.to}>
      <img className={page.itemIcon} src={props.icon} />
      <div className={page.itemTitle}>{props.title}</div>
      <div className={page.itemDescription}>{props.description}</div>
    </Link>
  );
}
