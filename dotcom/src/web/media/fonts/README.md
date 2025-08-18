# Inter 字体

在 Github 仓库 https://github.com/rsms/inter 的 Releases 页面下载 `.zip` 文件并解压，然后：

|从压缩包内|复制到本目录|
|--|--|
|`web/InterVariable.woff2`|`inter-normal.woff2`|
|`web/InterVariable-Italic.woff2`|`inter-italic.woff2`|

# JetBrains Mono 字体

在网页 https://www.jetbrains.com/lp/mono/ 下载 `.zip` 文件并解压，然后：

|从压缩包内|复制到本目录|
|--|--|
|`fonts/variable/JetBrainsMono[wght].ttf`|`jetbrains-mono-normal.ttf`|
|`fonts/variable/JetBrainsMono-Italic[wght].ttf`|`jetbrains-mono-italic.ttf`|

# 参考资料

- [`@font-face`](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face) 中 [`src`](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/src) 属性的 [`format()`](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/src#format) 和 [`tech()`](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/src#tech)。
- vanilla-extract 的 [`globalFontFace()`](https://vanilla-extract.style/documentation/global-api/global-font-face/) 和 [`fontFace()`](https://vanilla-extract.style/documentation/api/font-face/)。
- 要判断 `.ttf` 文件是 `opentype` 还是 `truetype` 可以在 Windows 系统中***右键字体文件>属性>详细信息>类型***。
