export function ThemeScript() {
  const script = `
    (function () {
      try {
        var key = "ravika-theme";
        var stored = window.localStorage.getItem(key);
        var path = window.location.pathname;
        var fallback = path.indexOf("/kds") === 0
          ? "dark"
          : path.indexOf("/app/pos") === 0 || path.indexOf("/menu/") === 0 || path.indexOf("/order/") === 0
            ? "light"
            : "system";
        var theme = stored === "light" || stored === "dark" || stored === "system" ? stored : fallback;
        var isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
        document.documentElement.classList.toggle("dark", isDark);
      } catch (error) {
        document.documentElement.classList.remove("dark");
      }
    })();
  `;

  // biome-ignore lint/security/noDangerouslySetInnerHtml: static theme bootstrap script
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
