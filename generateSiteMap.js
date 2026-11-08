import fs from "fs";
import { SitemapStream, streamToPromise } from "sitemap";

const baseUrl = "https://runtohealth.tech";
const urls = [{ url: "/", changefreq: "daily", priority: 1.0 }];

(async () => {
  const stream = new SitemapStream({ hostname: baseUrl });
  urls.forEach((url) => {
    stream.write(url);
  });
  stream.end();

  const sitemap = await streamToPromise(stream);
  fs.writeFileSync("public/sitemap.xml", sitemap.toString());
  console.log("Sitemap generated successfully!");
})();
