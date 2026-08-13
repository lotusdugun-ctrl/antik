import { imageAt, srcSetFor } from "@/lib/images";

/**
 * Every photo in the app goes through here so the browser can pick a width
 * instead of always downloading the largest one. `sizes` is required and has
 * no default on purpose: without it the browser assumes the image fills the
 * viewport and picks the biggest candidate, which is exactly the behaviour
 * this component exists to avoid.
 *
 * `fallbackWidth` is what non-srcSet browsers (and the `src` attribute) get.
 */
export function Photo({
  src,
  alt,
  sizes,
  fallbackWidth = 500,
  className,
  width = 1200,
  height = 800,
  loading = "lazy",
  fetchPriority,
  decoding = "async",
}: {
  src: string;
  alt: string;
  sizes: string;
  fallbackWidth?: number;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  decoding?: "async" | "sync" | "auto";
}) {
  return (
    <img
      src={imageAt(src, fallbackWidth)}
      srcSet={srcSetFor(src)}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding={decoding}
      className={className}
    />
  );
}
