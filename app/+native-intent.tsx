export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }) {
  if (!path) return "/";

  // Clean custom scheme inishacityservice:// or inishacityservice:///
  let cleaned = path.replace(/^inishacityservice:\/\//i, "");

  // Remove leading multiple slashes: /// -> /
  cleaned = cleaned.replace(/^\/+/, "/");

  // If path is just "/" or empty, route to root home
  if (!cleaned || cleaned === "/" || cleaned === "") {
    return "/";
  }

  // Handle product deep links
  if (cleaned.startsWith("/product/") || cleaned.startsWith("product/")) {
    const id = cleaned.split("/").pop();
    return `/product/${id}`;
  }

  // Handle booking tracking deep links
  if (cleaned.startsWith("/track-booking/") || cleaned.startsWith("track-booking/")) {
    const id = cleaned.split("/").pop();
    return `/track-booking/${id}`;
  }

  // Handle order tracking deep links
  if (cleaned.startsWith("/track-order/") || cleaned.startsWith("track-order/")) {
    const id = cleaned.split("/").pop();
    return `/track-order/${id}`;
  }

  return cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
}
