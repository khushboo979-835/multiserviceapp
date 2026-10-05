declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "@/styles/globals.css" {
  const content: any;
  export default content;
}
