export function ThemeScript(): JSX.Element {
  const script = `
    (function () {
      try {
        var stored = localStorage.getItem("newshub_theme") || "system";
        var isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        var resolved = stored === "system" ? (isSystemDark ? "dark" : "light") : stored;
        var root = document.documentElement;
        if (resolved === "dark") {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
        root.style.colorScheme = resolved;
      } catch (err) {
        document.documentElement.classList.remove("dark");
      }
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
