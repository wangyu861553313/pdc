let isInited = false;
let resizeHandler: (() => void) | null = null;

/**
 * 防抖（resize 必备）
 */
function debounce(fn: () => void, delay = 100) {
  let timer: number | null = null;

  return () => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = window.setTimeout(fn, delay);
  };
}

/**
 * PC 端 rem 自适应（最终版）
 *
 * @param designWidth 设计稿宽度（1920 / 1440 / 1366）
 * @param baseFont    设计稿下 html font-size
 */
export function setupRem(designWidth = 1920, baseFont = 16) {
  const docEl = document.documentElement;

  const setFontSize = () => {
    const clientWidth = docEl.clientWidth;

    // 限制缩放区间（防止过大或过小）
    const width = Math.max(Math.min(clientWidth, 2560), 1200);

    const scale = width / designWidth;
    docEl.style.fontSize = `${baseFont * scale}px`;
  };

  // 首次立即执行
  setFontSize();

  // 🚫 防止重复监听
  if (isInited) return;

  resizeHandler = debounce(setFontSize, 100);
  window.addEventListener('resize', resizeHandler);

  isInited = true;
}
