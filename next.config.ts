import type { NextConfig } from "next";

// Supabase Storage public URLs look like:
//   https://<project-ref>.supabase.co/storage/v1/object/public/listing-images/...
// next/image requires every remote host it loads from to be explicitly
// allow-listed, or it throws at request time — this covers uploaded
// listing photos on both localhost and Vercel (the storage host is the
// same Supabase project URL in both environments; only the deploying
// app's own host differs).
function supabaseImageHostname(): string | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return undefined;
  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}

const supabaseHostname = supabaseImageHostname();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
