import { createHash, timingSafeEqual, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";

const port = Number(process.env.PORT || 8080);
const dataDir = "/data";
const releasesDir = path.join(dataDir, "releases");
const currentFile = path.join(dataDir, "current.json");
const imageDist = "/app/dist";
const hookToken = process.env.FEED_PREVIEW_HOOK_TOKEN || "";
const imageId = process.env.FEED_PREVIEW_IMAGE_ID || "local";
let currentRoot = imageDist;
let activeBuild = null;
const jobs = new Map();

fs.mkdirSync(releasesDir, { recursive: true });

function copyCurrentImage() {
  const releaseName = `image-${imageId.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  const destination = path.join(releasesDir, releaseName);
  fs.rmSync(destination, { recursive: true, force: true });
  fs.cpSync(imageDist, destination, { recursive: true });
  writeCurrent({ releaseName, buildId: imageId, updatedAt: new Date().toISOString() });
  currentRoot = destination;
}

function writeCurrent(value) {
  const temporary = `${currentFile}.${randomUUID()}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(value));
  fs.renameSync(temporary, currentFile);
}

try {
  const persisted = JSON.parse(fs.readFileSync(currentFile, "utf8"));
  const persistedRoot = path.join(releasesDir, persisted.releaseName);
  if (persisted.buildId === imageId && fs.existsSync(persistedRoot)) currentRoot = persistedRoot;
  else copyCurrentImage();
} catch {
  copyCurrentImage();
}

function safeEqual(left, right) {
  const a = createHash("sha256").update(left).digest();
  const b = createHash("sha256").update(right).digest();
  return timingSafeEqual(a, b);
}

function buildRelease(jobId) {
  const stage = `/work/feed-${jobId}`;
  const releaseName = `release-${jobId}`;
  const stagedRelease = path.join(releasesDir, `.${releaseName}.tmp`);
  const destination = path.join(releasesDir, releaseName);
  const excluded = new Set(["node_modules", "dist", ".git", ".vercel", "coverage"]);

  jobs.set(jobId, { status: "building", startedAt: new Date().toISOString() });
  fs.rmSync(stage, { recursive: true, force: true });
  fs.rmSync(stagedRelease, { recursive: true, force: true });
  fs.rmSync(destination, { recursive: true, force: true });
  fs.cpSync("/app", stage, {
    recursive: true,
    filter(source) {
      const relative = path.relative("/app", source);
      return !relative.split(path.sep).some((part) => excluded.has(part)) && !/^\.env/.test(path.basename(source));
    },
  });
  fs.symlinkSync("/app/node_modules", path.join(stage, "node_modules"), "dir");

  const build = spawn("npm", ["run", "build"], {
    cwd: stage,
    env: {
      ...process.env,
      FEED_NAMESPACE: process.env.FEED_NAMESPACE || "preview/radio-88",
      FEED_RELEASE_BASE_URL: process.env.FEED_RELEASE_BASE_URL || "",
      NODE_ENV: "production",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  const collect = (chunk) => { output = `${output}${chunk}`.slice(-6000); };
  build.stdout.on("data", collect);
  build.stderr.on("data", collect);
  build.on("error", (error) => finishBuild(error));
  build.on("close", (code) => finishBuild(code === 0 ? null : new Error(`build exited ${code}`)));

  function finishBuild(error) {
    if (!jobs.has(jobId) || jobs.get(jobId).status !== "building") return;
    try {
      if (error) throw error;
      fs.cpSync(path.join(stage, "dist"), stagedRelease, { recursive: true });
      fs.renameSync(stagedRelease, destination);
      const marker = JSON.parse(fs.readFileSync(path.join(destination, "feed/release.json"), "utf8"));
      writeCurrent({ releaseName, buildId: imageId, releaseId: marker.releaseId, updatedAt: new Date().toISOString() });
      currentRoot = destination;
      jobs.set(jobId, { status: "ready", releaseId: marker.releaseId, completedAt: new Date().toISOString() });
      console.info(`Preview feed build ready: ${jobId}`);
    } catch (failure) {
      jobs.set(jobId, { status: "failed", completedAt: new Date().toISOString() });
      console.error(`Preview feed build failed: ${jobId}`);
      if (output.trim()) console.error(output.slice(-2500));
    } finally {
      activeBuild = null;
      fs.rmSync(stage, { recursive: true, force: true });
      fs.rmSync(stagedRelease, { recursive: true, force: true });
    }
  }
}

function contentType(filePath) {
  return ({
    ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8", ".xml": "application/xml; charset=utf-8", ".svg": "image/svg+xml",
    ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif",
    ".mp4": "video/mp4", ".woff": "font/woff", ".woff2": "font/woff2", ".ico": "image/x-icon",
  })[path.extname(filePath).toLowerCase()] || "application/octet-stream";
}

function staticFile(pathname) {
  let decoded;
  try { decoded = decodeURIComponent(pathname); } catch { return null; }
  if (decoded.includes("\\") || decoded.split("/").includes("..")) return null;
  if (decoded === "/feed/release.json") return path.join(currentRoot, "feed/release.json");
  if (decoded === "/") return path.join(currentRoot, "index.html");
  let candidate = path.resolve(currentRoot, `.${decoded}`);
  if (!candidate.startsWith(`${path.resolve(currentRoot)}${path.sep}`) && candidate !== path.resolve(currentRoot, "index.html")) return null;
  if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) candidate = path.join(candidate, "index.html");
  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  if (!path.extname(decoded)) {
    const routeIndex = path.join(path.resolve(currentRoot), decoded.replace(/^\/+/, ""), "index.html");
    if (routeIndex.startsWith(`${path.resolve(currentRoot)}${path.sep}`) && fs.existsSync(routeIndex)) return routeIndex;
  }
  return null;
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url || "/", "http://localhost");
  const pathname = url.pathname;
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("X-Frame-Options", "DENY");

  if (request.method === "GET" && pathname === "/__preview/healthz") {
    response.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
    response.end(JSON.stringify({ status: activeBuild ? "building" : "ok" }));
    return;
  }

  const hookPrefix = "/__preview/deploy/";
  if (request.method === "POST" && pathname.startsWith(hookPrefix)) {
    const supplied = pathname.slice(hookPrefix.length);
    if (!hookToken || !safeEqual(supplied, hookToken)) {
      response.writeHead(404);
      response.end();
      return;
    }
    if (activeBuild) {
      response.writeHead(409, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "A preview build is already running." }));
      return;
    }
    const jobId = randomUUID();
    activeBuild = jobId;
    response.writeHead(202, { "Content-Type": "application/json", "Cache-Control": "no-store" });
    response.end(JSON.stringify({ id: jobId, job: { id: jobId } }));
    setImmediate(() => {
      try { buildRelease(jobId); }
      catch {
        jobs.set(jobId, { status: "failed", completedAt: new Date().toISOString() });
        activeBuild = null;
        console.error(`Preview feed build could not start: ${jobId}`);
      }
    });
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD, POST" });
    response.end();
    return;
  }
  const file = staticFile(pathname);
  if (!file) {
    const notFound = path.join(currentRoot, "404.html");
    response.writeHead(404, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    response.end(request.method === "HEAD" ? undefined : fs.readFileSync(notFound));
    return;
  }
  const isHtml = file.endsWith(".html");
  const isFeedJson = pathname.startsWith("/feed/") && file.endsWith(".json");
  response.writeHead(200, {
    "Content-Type": contentType(file),
    "Cache-Control": isFeedJson || isHtml ? "no-store" : "public, max-age=31536000, immutable",
  });
  if (request.method === "HEAD") response.end();
  else fs.createReadStream(file).pipe(response);
});

server.listen(port, "0.0.0.0", () => console.info(`Radio 88 feed preview listening on ${port}`));
