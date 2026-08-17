import { stripHtml as stripHtmlContent } from "./sanitize";

export function formatPrice(price: number | null | undefined) {
  if (price == null || price <= 0) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
}

export function discountPercent(price: number | null, compare: number | null) {
  if (!price || !compare || compare <= price) return null;
  return Math.round(((compare - price) / compare) * 100);
}

export function conditionLabel(value: string) {
  if (value === "new") return "Máy mới";
  if (value === "display") return "Trưng bày";
  return "Đã qua sử dụng";
}

export function orderStatusLabel(status: string) {
  const map: Record<string, string> = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    SHIPPING: "Đang giao",
    COMPLETED: "Hoàn tất",
    CANCELLED: "Đã hủy",
  };
  return map[status] ?? status;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function stripHtml(html?: string | null) {
  return stripHtmlContent(html);
}
