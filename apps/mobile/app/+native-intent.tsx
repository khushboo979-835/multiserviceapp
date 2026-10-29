export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }) {
  if (
    !path ||
    path === "/" ||
    path === "///" ||
    path === "" ||
    path.startsWith("///") ||
    path.includes("inishacityservice:///") ||
    path.includes("inishacityservice://")
  ) {
    const cleaned = (path || "")
      .replace(/^inishacityservice:\/\//, "")
      .replace(/^\/+/, "/");
    return cleaned === "" || cleaned === "/" ? "/" : cleaned;
  }

  return path;
}
