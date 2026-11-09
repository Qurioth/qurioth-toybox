/**
 * 写真を R2 から配信する Cloudflare Worker(ADR-0017、specs/009-photograph/contracts/photo-worker.md)。
 *
 * GET / HEAD で `/<16文字の16進数>-(640|1280).webp` のときだけ R2 から返す。一覧の取得や書き込みは
 * できない。デプロイは `pnpm dlx wrangler deploy --config workers/photo/wrangler.jsonc`。
 */

/** この Worker が使う R2 の機能だけを書いた型(@cloudflare/workers-types は入れない。research R7) */
type Env = {
  PHOTOS: {
    get(
      key: string,
    ): Promise<{ body: ReadableStream; httpEtag: string } | null>;
  };
};

const PHOTO_PATH = /^\/([0-9a-f]{16}-(?:640|1280)\.webp)$/;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { Allow: "GET, HEAD" },
      });
    }

    const key = new URL(request.url).pathname.match(PHOTO_PATH)?.[1];
    if (!key) {
      return new Response("Not Found", { status: 404 });
    }

    const object = await env.PHOTOS.get(key);
    if (!object) {
      return new Response("Not Found", { status: 404 });
    }

    return new Response(request.method === "HEAD" ? null : object.body, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        ETag: object.httpEtag,
      },
    });
  },
};
