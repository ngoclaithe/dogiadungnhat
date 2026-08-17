const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function sanitizeContent(html) {
  if (!html) return html;
  let out = html;
  out = out.replace(/<span[^>]*math-inline[^>]*>([\s\S]*?)<\/span>/gi, '$1');
  out = out.replace(/data-math="[^"]*"/gi, '');
  out = out.replace(/\uFFFD+/g, '');
  out = out.replace(/(?:&#65533;)+/g, '');
  out = out.replace(/\?{2,}/g, '');
  out = out.replace(/\$(\d+)\s*\^\s*\\circ\s*\\text\s*\{\s*C\s*\}\s*\$/g, '$1°C');
  out = out.replace(/\$(\d+)\s*\^\s*\\circ\s*\\mathrm\s*\{\s*C\s*\}\s*\$/g, '$1°C');
  out = out.replace(/\$(\d+)\s*\^\s*\\circ\s*C\s*\$/g, '$1°C');
  out = out.replace(/\$(\d+)\s*\\circ\s*C\$/g, '$1°C');
  out = out.replace(/\$([^$]{1,80})\$/g, (_m, inner) =>
    inner
      .replace(/\\text\s*\{([^}]+)\}/g, '$1')
      .replace(/\\mathrm\s*\{([^}]+)\}/g, '$1')
      .replace(/\\circ/g, '°')
      .replace(/\^/g, '')
      .replace(/\\[a-zA-Z]+/g, '')
      .replace(/[{}]/g, '')
      .trim(),
  );
  out = out.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '');
  return out.trim();
}

(async () => {
  const products = await prisma.product.findMany({
    select: { id: true, description: true, shortDescription: true },
  });
  for (const p of products) {
    await prisma.product.update({
      where: { id: p.id },
      data: {
        description: p.description ? sanitizeContent(p.description) : p.description,
        shortDescription: p.shortDescription
          ? sanitizeContent(p.shortDescription)
          : p.shortDescription,
      },
    });
  }
  console.log('cleaned', products.length);
  await prisma.$disconnect();
})();
