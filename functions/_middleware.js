// Host hygiene for SubCheck (added Nov 8, 2026, SEO Release 1):
// - www.subcheckapp.com served duplicate content; send it to the apex.
// - The Cloudflare Pages default host (subcheck-ews.pages.dev) served a full
//   duplicate; redirect it to the real domain. Branch preview hosts are
//   left alone so previews keep working.
export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === "subcheck-ews.pages.dev" || url.hostname === "www.subcheckapp.com") {
    url.hostname = "subcheckapp.com";
    url.protocol = "https:";
    return Response.redirect(url.toString(), 301);
  }
  return context.next();
}
