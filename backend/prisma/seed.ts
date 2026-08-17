import {
  PrismaClient,
  type Category,
  type Product,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { sanitizeContent, stripHtml } from '../src/common/sanitize';

const prisma = new PrismaClient();
const SOURCE = process.env.SOURCE_SITE ?? 'https://dogiadungnhat.com.vn';

const NAV_SLUGS = [
  'dieu-hoa-nhat',
  'bep-tu-nhat',
  'tu-lanh',
  'may-giat',
  'may-rua-bat',
  'noi-com-dien',
  'quat-nhat',
  'loc-khi-bu-am',
];

const ICONS: Record<string, string> = {
  'dieu-hoa-nhat': 'wind',
  'bep-tu-nhat': 'flame',
  'tu-lanh': 'refrigerator',
  'may-giat': 'washing-machine',
  'may-rua-bat': 'droplets',
  'noi-com-dien': 'utensils',
  'quat-nhat': 'fan',
  'loc-khi-bu-am': 'leaf',
  'binh-nong-lanh': 'thermometer',
  'bon-cau': 'bath',
  'dieu-hoa-di-dong': 'move',
  'ghe-massage': 'armchair',
  'hut-mui-nha-bep': 'wind',
  'hut-nui-nha-bep': 'wind',
  'may-hut-am': 'droplet',
  'may-loc-khong-khi': 'sparkles',
  'may-loc-nuoc-kiem': 'glass-water',
  quat: 'fan',
  'thiet-bi-nha-tam': 'shower-head',
  'voi-rua-bat': 'droplets',
  'voi-sen': 'shower-head',
};

const CATEGORY_COPY: Record<string, string> = {
  'dieu-hoa-nhat':
    'Điều hòa nội địa Nhật inverter, tiết kiệm điện, êm và bền. Hàng mới và đã qua sử dụng, đã kiểm tra kỹ trước khi giao.',
  'bep-tu-nhat':
    'Bếp từ Nhật IH nhiều vùng nấu, cảm ứng nhạy, mặt kính chịu lực. Phù hợp căn hộ và gian bếp hiện đại.',
  'tu-lanh':
    'Tủ lạnh Hitachi, Panasonic, Mitsubishi dung tích lớn, mặt gương hoặc thép phay, ngăn chân không giữ thực phẩm tươi lâu.',
  'may-giat':
    'Máy giặt sấy lồng nghiêng nội địa Nhật, giặt 9–12kg, sấy block heat pump, Nanoe diệt khuẩn.',
  'may-rua-bat':
    'Máy rửa bát Panasonic NP-TH / NP-TZ gọn cho căn hộ, rửa nóng diệt khuẩn, tiết kiệm nước.',
  'noi-com-dien':
    'Nồi cơm cao tần IH, hút chân không Zojirushi và Toshiba — cơm ngọt, giữ ấm lâu.',
  'quat-nhat':
    'Quạt cây, quạt treo tường Panasonic, Toshiba, Hitachi, Sanyo — gió đều, êm, bền.',
  'loc-khi-bu-am':
    'Máy lọc không khí kiêm bù ẩm, hút ẩm nội địa Nhật cho phòng ngủ và phòng khách.',
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function guessBrand(name: string) {
  const brands = [
    'Panasonic',
    'Hitachi',
    'Toshiba',
    'Mitsubishi',
    'Daikin',
    'Zojirushi',
    'Sanyo',
    'Sharp',
    'National',
    'Instant Pot',
  ];
  const found = brands.find((b) => name.toLowerCase().includes(b.toLowerCase()));
  return found ?? null;
}

function guessCondition(name: string) {
  const n = name.toLowerCase();
  if (n.includes('mới') || n.includes('new 2024') || n.includes('sản xuất 2024'))
    return 'new';
  if (n.includes('trưng bày')) return 'display';
  return 'used';
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'NoidiaNhatDemoBot/1.0 (local catalog import)',
      Accept: 'application/json',
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return (await res.json()) as T;
}

type WpCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
};

type WcProduct = {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  sku: string;
  description: string;
  short_description: string;
  is_in_stock: boolean;
  prices: { price: string; regular_price: string; sale_price: string };
  images: { src: string; thumbnail?: string; alt?: string }[];
  categories: { id: number; name: string; slug: string }[];
};

type WpPost = {
  slug: string;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  _embedded?: { 'wp:featuredmedia'?: { source_url?: string }[] };
};

async function scrapeCategories(): Promise<WpCategory[]> {
  return fetchJson<WpCategory[]>(
    `${SOURCE}/wp-json/wp/v2/product_cat?per_page=50`,
  );
}

async function scrapeProducts(categoryId: number, perPage: number) {
  return fetchJson<WcProduct[]>(
    `${SOURCE}/wp-json/wc/store/v1/products?category=${categoryId}&per_page=${perPage}`,
  );
}

async function scrapePosts() {
  return fetchJson<WpPost[]>(
    `${SOURCE}/wp-json/wp/v2/posts?per_page=5&_embed=1`,
  );
}

async function seedPages() {
  const pages = [
    {
      slug: 'mien-phi-van-chuyen',
      title: 'Miễn phí vận chuyển',
      content: `<p>Nội Địa Nhật hỗ trợ giao hàng tận nơi tại Hà Nội và các tỉnh thành.</p>
<ul><li>Nội thành Hà Nội: miễn phí với đơn từ 5 triệu, lắp đặt điều hòa/máy giặt theo lịch kỹ thuật.</li>
<li>Ngoại tỉnh: báo phí trước khi chốt đơn, đóng kiện gỗ với hàng cồng kềnh.</li>
<li>Kiểm hàng khi nhận: quý khách được xem máy, test nguồn (kèm biến áp 100V nếu cần).</li></ul>`,
    },
    {
      slug: 'dieu-khoan-giao-dich',
      title: 'Điều khoản giao dịch',
      content: `<p>Khi đặt hàng trên website, quý khách xác nhận thông tin liên hệ và địa chỉ lắp đặt là chính xác.</p>
<p>Giá hiển thị đã bao gồm VAT (nếu có). Một số máy “Giá liên hệ” vì tồn kho thay đổi theo ngày — nhân viên sẽ báo giá chốt trước khi giao.</p>
<p>Đơn được xác nhận khi có tin nhắn/cuộc gọi từ hotline 0937.445.330.</p>`,
    },
    {
      slug: 'phuong-thuc-thanh-toan',
      title: 'Phương thức thanh toán',
      content: `<ul><li>Tiền mặt khi nhận hàng (COD)</li>
<li>Chuyển khoản ngân hàng trước khi giao máy cồng kềnh</li>
<li>Thanh toán tại showroom Ngõ 87, 68C Láng Hạ, Đống Đa, Hà Nội</li></ul>
<p>Xuất hóa đơn VAT theo yêu cầu — vui lòng ghi MST khi đặt hàng.</p>`,
    },
    {
      slug: 'thoi-gian-giao-hang',
      title: 'Thời gian giao hàng',
      content: `<p>Giờ làm việc: 7:30 – 22:00 (Thứ 2 đến Chủ nhật).</p>
<ul><li>Nội thành: 2–24 giờ với hàng sẵn showroom.</li>
<li>Máy cần vệ sinh/kiểm tra: 1–3 ngày.</li>
<li>Ngoại tỉnh: 2–5 ngày tùy đơn vị vận chuyển.</li></ul>`,
    },
    {
      slug: 'bao-hanh',
      title: 'Chính sách bảo hành',
      content: `<p>Cam kết bảo hành dài hạn theo từng dòng máy, ghi rõ trên phiếu xuất.</p>
<ul><li>Máy mới nội địa: theo tiêu chuẩn hãng + hỗ trợ đổi nguồn 100V.</li>
<li>Máy đã qua sử dụng: bảo hành phần cơ/điện, không bảo hành hao mòn tự nhiên.</li>
<li>Showroom hỗ trợ bảo dưỡng, vệ sinh máy giặt, nạp gas điều hòa.</li></ul>`,
    },
    {
      slug: 'huong-dan-mua-hang',
      title: 'Hướng dẫn mua hàng',
      content: `<ol><li>Chọn danh mục hoặc tìm kiếm model.</li>
<li>Xem ảnh thật, thông số, tình trạng (mới / đã qua sử dụng / trưng bày).</li>
<li>Thêm vào giỏ hoặc gọi 0937.445.330 để được tư vấn biến áp, kích thước, công suất.</li>
<li>Đặt hàng trên web hoặc tại cửa hàng. Theo dõi đơn bằng mã ND… tại trang Kiểm tra đơn hàng.</li></ol>`,
    },
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: page,
      create: page,
    });
  }
}

async function seedAuthAndSampleOrder(products: Product[]) {
  const passwordHash = await bcrypt.hash('demo1234', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@noidianhat.vn' },
    update: { passwordHash, name: 'Khách demo', phone: '0937445330' },
    create: {
      email: 'demo@noidianhat.vn',
      passwordHash,
      name: 'Khách demo',
      phone: '0937445330',
    },
  });

  const sample = products.find((p) => p.price && p.price > 0) ?? products[0];
  if (!sample) return;

  await prisma.order.upsert({
    where: { code: 'ND20260817001' },
    update: {},
    create: {
      code: 'ND20260817001',
      status: 'CONFIRMED',
      customerName: 'Nguyễn Văn An',
      phone: '0912345678',
      email: 'an@example.com',
      address: '68C Láng Hạ, Đống Đa, Hà Nội',
      note: 'Giao buổi chiều, mang theo biến áp 100V.',
      total: sample.price ?? 0,
      userId: user.id,
      items: {
        create: {
          productId: sample.id,
          name: sample.name,
          price: sample.price ?? 0,
          quantity: 1,
        },
      },
    },
  });
}

async function importFromSource() {
  console.log('Đang cào danh mục từ', SOURCE);
  const wpCats = await scrapeCategories();
  const categoryMap = new Map<string, Category>();

  for (const cat of wpCats) {
    if (cat.slug === 'uncategorized') continue;
    const navIndex = NAV_SLUGS.indexOf(cat.slug);
    const data = {
      name: cat.name,
      slug: cat.slug,
      description: cat.description || CATEGORY_COPY[cat.slug] || null,
      icon: ICONS[cat.slug] ?? 'package',
      featured: navIndex >= 0,
      navOrder: navIndex >= 0 ? navIndex + 1 : 50 + cat.id,
    };
    const saved = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: data,
      create: data,
    });
    categoryMap.set(cat.slug, saved);
    categoryMap.set(String(cat.id), saved);
  }

  const seen = new Set<string>();
  let imported = 0;

  for (const cat of wpCats) {
    const local = categoryMap.get(cat.slug);
    if (!local || cat.count === 0) continue;
    const perPage = NAV_SLUGS.includes(cat.slug) ? 6 : 3;
    try {
      const items = await scrapeProducts(cat.id, perPage);
      await sleep(250);
      for (const item of items) {
        if (seen.has(item.slug)) continue;
        seen.add(item.slug);
        const priceNum = Number(item.prices?.price ?? 0);
        const regular = Number(item.prices?.regular_price ?? 0);
        const sale = Number(item.prices?.sale_price ?? 0);
        const price = priceNum > 0 ? priceNum : null;
        const compareAt =
          regular > 0 && sale > 0 && regular > sale ? regular : null;
        const text = stripHtml(item.short_description || item.description);
        const product = await prisma.product.upsert({
          where: { slug: item.slug },
          update: {
            name: item.name,
            sku: item.sku || null,
            description: sanitizeContent(item.description || text),
            shortDescription: text.slice(0, 280),
            price,
            compareAtPrice: compareAt,
            inStock: item.is_in_stock,
            condition: guessCondition(item.name),
            brand: guessBrand(item.name),
            featured: NAV_SLUGS.includes(cat.slug) && imported < 16,
            sourceUrl: item.permalink,
            categoryId: local.id,
          },
          create: {
            name: item.name,
            slug: item.slug,
            sku: item.sku || null,
            description: sanitizeContent(item.description || text),
            shortDescription: text.slice(0, 280),
            price,
            compareAtPrice: compareAt,
            inStock: item.is_in_stock,
            condition: guessCondition(item.name),
            brand: guessBrand(item.name),
            featured: NAV_SLUGS.includes(cat.slug),
            sourceUrl: item.permalink,
            categoryId: local.id,
          },
        });
        await prisma.productImage.deleteMany({ where: { productId: product.id } });
        const images = (item.images ?? []).slice(0, 4);
        if (images.length) {
          await prisma.productImage.createMany({
            data: images.map((img, index) => ({
              productId: product.id,
              url: img.src,
              alt: img.alt || item.name,
              sortOrder: index,
            })),
          });
          if (!local.imageUrl && images[0]?.src) {
            await prisma.category.update({
              where: { id: local.id },
              data: { imageUrl: images[0].src },
            });
          }
        }
        imported += 1;
      }
      console.log(`  ✓ ${cat.name}: ${items.length} sản phẩm`);
    } catch (error) {
      console.warn(`  ⚠ Bỏ qua ${cat.slug}:`, (error as Error).message);
    }
  }

  try {
    const posts = await scrapePosts();
    for (const post of posts) {
      const title = stripHtml(post.title.rendered);
      const excerpt = stripHtml(post.excerpt.rendered).slice(0, 240);
      const cover = post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null;
      await prisma.post.upsert({
        where: { slug: post.slug },
        update: {
          title,
          excerpt,
          content: post.content.rendered,
          coverUrl: cover,
          publishedAt: new Date(post.date),
        },
        create: {
          slug: post.slug,
          title,
          excerpt,
          content: post.content.rendered,
          coverUrl: cover,
          publishedAt: new Date(post.date),
        },
      });
    }
    console.log(`  ✓ ${posts.length} bài viết`);
  } catch (error) {
    console.warn('Không cào được tin tức:', (error as Error).message);
  }

  return imported;
}

async function seedFallbackCategories() {
  const defaults = [
    ['ĐIỀU HÒA NHẬT', 'dieu-hoa-nhat'],
    ['BẾP TỪ NHẬT', 'bep-tu-nhat'],
    ['TỦ LẠNH', 'tu-lanh'],
    ['MÁY GIẶT', 'may-giat'],
    ['MÁY RỬA BÁT', 'may-rua-bat'],
    ['NỒI CƠM ĐIỆN', 'noi-com-dien'],
    ['QUẠT NHẬT', 'quat-nhat'],
    ['LỌC KHÍ BÙ ẨM', 'loc-khi-bu-am'],
    ['BÌNH NÓNG LẠNH', 'binh-nong-lanh'],
    ['BỒN CẦU', 'bon-cau'],
    ['ĐIỀU HÒA DI ĐỘNG', 'dieu-hoa-di-dong'],
    ['GHẾ MASSAGE', 'ghe-massage'],
    ['HÚT MÙI NHÀ BẾP', 'hut-mui-nha-bep'],
    ['MÁY HÚT ẨM', 'may-hut-am'],
    ['MÁY LỌC KHÔNG KHÍ', 'may-loc-khong-khi'],
    ['MÁY LỌC NƯỚC KIỀM', 'may-loc-nuoc-kiem'],
    ['QUẠT', 'quat'],
    ['THIẾT BỊ NHÀ TẮM', 'thiet-bi-nha-tam'],
    ['VÒI RỬA BÁT', 'voi-rua-bat'],
    ['VÒI SEN', 'voi-sen'],
  ] as const;

  for (let i = 0; i < defaults.length; i++) {
    const [name, slug] = defaults[i];
    const featured = NAV_SLUGS.includes(slug);
    await prisma.category.upsert({
      where: { slug },
      update: {
        name,
        featured,
        navOrder: featured ? NAV_SLUGS.indexOf(slug) + 1 : 80 + i,
        icon: ICONS[slug],
        description: CATEGORY_COPY[slug] ?? null,
      },
      create: {
        name,
        slug,
        featured,
        navOrder: featured ? NAV_SLUGS.indexOf(slug) + 1 : 80 + i,
        icon: ICONS[slug],
        description: CATEGORY_COPY[slug] ?? null,
      },
    });
  }
}

async function main() {
  await seedFallbackCategories();
  await seedPages();

  let imported = 0;
  try {
    imported = await importFromSource();
  } catch (error) {
    console.warn('Cào data thất bại, giữ danh mục tĩnh:', (error as Error).message);
  }

  const products = await prisma.product.findMany();
  for (const product of products) {
    await prisma.product.update({
      where: { id: product.id },
      data: {
        description: product.description
          ? sanitizeContent(product.description)
          : product.description,
        shortDescription: product.shortDescription
          ? sanitizeContent(product.shortDescription)
          : product.shortDescription,
      },
    });
  }
  if (products.length) {
    await seedAuthAndSampleOrder(products);
  }

  console.log(`Hoàn tất seed. Sản phẩm: ${products.length} (cào mới ~${imported}).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
