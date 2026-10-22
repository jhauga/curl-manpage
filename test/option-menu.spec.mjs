// Tests for the search box in the option menu of the man page demo.
import { test, expect } from "@playwright/test";

// roffit names the anchors of -# and -: just "-" (roffit issue 42), so
// these two menu links have no target until roffit is fixed.
const KNOWN_DEAD = ["-#", "-:"];

const LINKS = "#opt-dropdown div.dropdown-content a[href^='#']";

let built;
async function build(page) {
  if (!built) {
    const res = await page.request.get("demo-build.json");
    expect(res.ok()).toBeTruthy();
    built = await res.json();
  }
  return built;
}

// Serve the page with a Content-Security-Policy, the way curl.se does.
// WebKit applies upgrade-insecure-requests to http://localhost as well, so
// leave it out when the test server is not HTTPS.
const isPage = (url) => /\/(index\.html)?$/.test(url.pathname);
async function useCsp(page, policy) {
  if (new URL(test.info().project.use.baseURL).protocol === "http:")
    policy = policy.replace(/upgrade-insecure-requests;\s*/, "");
  await page.unroute(isPage);
  await page.route(isPage, async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, headers: { ...response.headers(), "content-security-policy": policy } });
  });
}

// Every test runs with the CSP curl.se sends for the man page.
test.beforeEach(async ({ page }) => {
  await useCsp(page, (await build(page)).csp.page);
});

// The site navigation covers the top of the page, where the option menu
// sits, until the page is scrolled past it.
async function load(page) {
  await page.goto("./");
  await page.evaluate(() => window.scrollTo(0, 200));
}

// Open the menu with the mouse and type into the search box.
async function search(page, text) {
  await page.locator("#opt-dropdown .dropbtn").hover();
  const box = page.locator("#optsearch");
  await box.click();
  await box.fill(text);
  return box;
}

function shownLinks(page) {
  return page.$$eval(LINKS, (as) => as.filter((a) => !a.hidden).map((a) => a.textContent));
}

const menuContent = (page) => page.locator("#opt-dropdown div.dropdown-content");

test("loads without errors and only from its own origin", async ({ page, baseURL }) => {
  const errors = [];
  const failed = [];
  const origins = new Set();
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("requestfailed", (r) => failed.push(`${r.url()} ${r.failure()?.errorText}`));
  page.on("response", (r) => r.status() >= 400 && failed.push(`${r.url()} ${r.status()}`));
  page.on("request", (r) => {
    if (!r.url().startsWith("data:")) origins.add(new URL(r.url()).origin);
  });
  await page.goto("./", { waitUntil: "load" });
  await page.evaluate(() => window.scrollTo(0, 200));
  await page.locator("#opt-dropdown .dropbtn").hover();
  expect(errors).toEqual([]);
  expect(failed).toEqual([]);
  expect([...origins]).toEqual([new URL(baseURL).origin]);
});

test("lists every option", async ({ page }) => {
  await load(page);
  const { options } = await build(page);
  expect(options).toBeGreaterThan(250);
  await expect(page.locator(LINKS)).toHaveCount(options);
});

test("menu links point at man page anchors", async ({ page }) => {
  await load(page);
  const dead = await page.$$eval(LINKS, (as) =>
    as
      .map((a) => decodeURIComponent(a.hash.slice(1)))
      .filter((id) => !document.getElementById(id) && document.getElementsByName(id).length === 0));
  expect(dead.sort()).toEqual(KNOWN_DEAD);
});

test("filters while typing", async ({ page }) => {
  await load(page);
  const all = (await shownLinks(page)).length;

  await search(page, "proxy");
  const proxy = await shownLinks(page);
  expect(proxy.length).toBeGreaterThan(1);
  for (const t of proxy) expect(t).toContain("proxy");

  await search(page, "PROXY");
  expect(await shownLinks(page)).toEqual(proxy);

  await search(page, "-x");
  expect(await shownLinks(page)).toContain("-x, --proxy");
  await expect(page.locator("#optsearch-none")).toBeHidden();

  await search(page, "zzzz");
  expect(await shownLinks(page)).toEqual([]);
  await expect(page.locator("#optsearch-none")).toBeVisible();

  await search(page, "");
  expect((await shownLinks(page)).length).toBe(all);
  await expect(page.locator("#optsearch-none")).toBeHidden();
});

test("Enter goes to the first option shown, Escape clears and then leaves", async ({ page }) => {
  await load(page);
  // no option is named exactly "proxy-tls", so Enter takes the first one shown
  const box = await search(page, "proxy-tls");
  const first = await page.$eval(LINKS + ":not([hidden])", (a) => a.hash);
  expect(first).toBe("#--proxy-tls13-ciphers");
  await box.press("Enter");
  await expect(page).toHaveURL(new RegExp(`${first.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));
  const inView = () => page.evaluate((hash) => {
    const id = decodeURIComponent(hash.slice(1));
    const el = document.getElementById(id) || document.getElementsByName(id)[0];
    const r = el.getBoundingClientRect();
    // the browser puts the target at the top, sometimes a fraction above 0
    return r.top > -2 && r.top < window.innerHeight;
  }, first);
  await expect.poll(inView).toBe(true);
  expect(await page.evaluate(() => document.activeElement?.id)).not.toBe("optsearch");

  await search(page, "abc");
  await box.press("Escape");
  await expect(box).toHaveValue("");
  expect((await shownLinks(page)).length).toBe(await page.locator(LINKS).count());
  expect(await page.evaluate(() => document.activeElement?.id)).toBe("optsearch");
  await box.press("Escape");
  expect(await page.evaluate(() => document.activeElement?.id)).not.toBe("optsearch");
});

test("Enter prefers an exact option match", async ({ page }) => {
  await load(page);
  for (const [text, hash] of [["-k", "#-k"], ["-K", "#-K"], ["insecure", "#-k"], ["--proxy", "#-x"]]) {
    const box = await search(page, text);
    await box.press("Enter");
    await expect.poll(() => page.evaluate(() => location.hash), { message: text }).toBe(hash);
  }
});

test("stays open while the search box has focus", async ({ page }) => {
  await load(page);
  await search(page, "proxy");
  await page.mouse.move(900, 700);
  await expect(menuContent(page)).toBeVisible();
});

test("a mouse click on an option still closes the menu", async ({ page }) => {
  await load(page);
  await page.locator("#opt-dropdown .dropbtn").hover();
  await page.locator(LINKS).first().click();
  await page.mouse.move(900, 700);
  await expect(menuContent(page)).toBeHidden();
});

test("opens and stays open by keyboard", async ({ page }) => {
  await load(page);
  const active = () => page.evaluate(() => {
    const el = document.activeElement;
    return el?.id || el?.className || el?.tagName;
  });
  for (let i = 0; i < 300 && (await active()) !== "dropbtn"; i++) await page.keyboard.press("Tab");
  expect(await active()).toBe("dropbtn");
  await expect(menuContent(page)).toBeVisible();

  for (let i = 0; i < 5 && (await active()) !== "optsearch"; i++) await page.keyboard.press("Tab");
  expect(await active()).toBe("optsearch");
  await expect(menuContent(page)).toBeVisible();

  // WebKit leaves links out of the tab order by default, so only check
  // the links when focus actually moves onto one.
  await page.keyboard.press("Tab");
  const onLink = await page.evaluate(() =>
    !!document.activeElement?.closest("#opt-dropdown div.dropdown-content a"));
  if (onLink) await expect(menuContent(page)).toBeVisible();
});

const styleOf = (page, sel) => page.$eval(sel, (el) => {
  const s = getComputedStyle(el);
  return { color: s.color, background: s.backgroundColor, border: s.borderTopColor };
});

test("search box uses the dropdown link colors", async ({ page }) => {
  await load(page);
  await search(page, "");
  const s = await styleOf(page, "#optsearch");
  expect(s.color).toBe("rgb(9, 55, 84)");
  expect(s.border).toBe("rgb(9, 55, 84)");
  expect(s.background).toBe("rgb(255, 255, 255)");
});

test.describe("dark mode", () => {
  test.use({ colorScheme: "dark" });

  test("search box uses the dark dropdown colors", async ({ page }) => {
    await load(page);
    await search(page, "zzzz");
    const s = await styleOf(page, "#optsearch");
    expect(s.color).toBe("rgb(250, 250, 250)");
    expect(s.background).toBe("rgb(33, 33, 33)");
    expect(s.border).toBe("rgb(96, 96, 96)");
    const none = await styleOf(page, "#optsearch-none");
    expect(none.color).toBe("rgb(250, 250, 250)");
  });
});

test("the man page CSP allows the script and the default CSP does not", async ({ page }) => {
  const { csp } = await build(page);
  expect(csp.page).toContain("script-src 'self'");
  expect(csp.page).toContain("require-trusted-types-for 'script'");
  expect(csp.default).not.toContain("script-src");
  expect(csp.page.replace(" script-src 'self';", "")).toBe(csp.default);
});

test("with the default curl.se CSP the menu works as before", async ({ page }) => {
  const { csp, options } = await build(page);
  await useCsp(page, csp.default);
  await load(page);
  await page.locator("#opt-dropdown .dropbtn").hover();
  await expect(menuContent(page)).toBeVisible();
  await expect(page.locator("#optsearch")).toBeHidden();
  await expect(page.locator(LINKS)).toHaveCount(options);
  await expect(page.locator(LINKS).first()).toBeVisible();
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the menu works as before and the search box stays hidden", async ({ page }) => {
    await load(page);
    const { options } = await build(page);
    await page.locator("#opt-dropdown .dropbtn").hover();
    await expect(menuContent(page)).toBeVisible();
    await expect(page.locator("#optsearch")).toBeHidden();
    await expect(page.locator(LINKS)).toHaveCount(options);
    await expect(page.locator(LINKS).first()).toBeVisible();
  });
});
