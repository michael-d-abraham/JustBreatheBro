// Minimal ambient declaration for the (untyped) react-test-renderer module.
// Kept self-contained (no imports) so this file stays a global script and
// declares the module rather than augmenting it. Avoids adding
// @types/react-test-renderer, which targets React 18.
declare module "react-test-renderer" {
  export function create(element: unknown): {
    update(element: unknown): void;
    unmount(): void;
  };
  const TestRendererDefault: { create: typeof create };
  export default TestRendererDefault;
}
