export function sanitizeContent(html?: string | null) {
  if (!html) return "";
  let out = html;

  out = out.replace(/<span[^>]*math-inline[^>]*>([\s\S]*?)<\/span>/gi, "$1");
  out = out.replace(/data-math="[^"]*"/gi, "");

  out = out.replace(/\uFFFD+/g, "");
  out = out.replace(/(?:&#65533;)+/g, "");
  out = out.replace(/\?{2,}/g, "");

  out = out.replace(
    /\$(\d+)\s*\^\s*\\circ\s*\\text\s*\{\s*C\s*\}\s*\$/g,
    "$1°C",
  );
  out = out.replace(
    /\$(\d+)\s*\^\s*\\circ\s*\\mathrm\s*\{\s*C\s*\}\s*\$/g,
    "$1°C",
  );
  out = out.replace(/\$(\d+)\s*\^\s*\\circ\s*C\s*\$/g, "$1°C");
  out = out.replace(/\$(\d+)\s*\\circ\s*C\$/g, "$1°C");

  out = out.replace(/\$([^$]{1,80})\$/g, (_match, inner: string) =>
    inner
      .replace(/\\text\s*\{([^}]+)\}/g, "$1")
      .replace(/\\mathrm\s*\{([^}]+)\}/g, "$1")
      .replace(/\\circ/g, "°")
      .replace(/\^/g, "")
      .replace(/\\[a-zA-Z]+/g, "")
      .replace(/[{}]/g, "")
      .trim(),
  );

  out = out.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "");
  out = out.replace(/[ \t]{2,}/g, " ");
  out = out.replace(/\n{3,}/g, "\n\n");
  out = out.replace(/>\s+</g, "><");
  return out.trim();
}

export function stripHtml(html?: string | null) {
  if (!html) return "";
  return sanitizeContent(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, "–")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}
