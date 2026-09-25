/* ============================================================================
   时间小包 官网脚本
   ----------------------------------------------------------------------------
   站点定位是「纯静态、零依赖、双击 index.html 就能看」，所以这里没有框架、
   没有模块打包，也不发任何网络请求。整份脚本只做一件事：
   点二维码下方那行链接文本时，把地址复制到剪贴板并给一句提示。
   ========================================================================== */

(function () {
  'use strict';

  var toast = document.getElementById('toast');
  var toastTimer = null;

  /** 弹一条提示；连续点击时重置计时，不会叠出两条。 */
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-on');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-on');
    }, 1800);
  }

  /**
   * 复制文本。
   *
   * 优先用 navigator.clipboard（现代浏览器、且需要安全上下文）；
   * 拿不到就退回「临时 textarea + execCommand」这条老路 ——
   * 用 file:// 双击打开时，剪贴板 API 在部分浏览器上会被判成非授权来源，
   * 没有这条兜底就会出现「点了没反应」，而本地预览恰恰是改这页时的常规姿势。
   */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(
        function () { showToast('已复制链接'); },
        function () { legacyCopy(text); }
      );
      return;
    }
    legacyCopy(text);
  }

  function legacyCopy(text) {
    var area = document.createElement('textarea');
    area.value = text;
    // 固定在可视区外，避免复制瞬间页面被顶得抖一下
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '-1000px';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (e) {
      ok = false;
    }
    document.body.removeChild(area);
    showToast(ok ? '已复制链接' : '复制失败，请手动选择地址');
  }

  // 二维码下方那行链接文本：点一下复制。
  // 地址取自 data-copy 而不是 location.href —— 二维码扫出来的是正式域名，
  // 两者必须一致，否则用户会遇到「复制的地址和扫码打开的地址不一样」。
  Array.prototype.forEach.call(
    document.querySelectorAll('[data-copy]'),
    function (el) {
      el.addEventListener('click', function () {
        copyText(el.getAttribute('data-copy') || '');
      });
    }
  );
})();
