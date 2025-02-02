import { expect, test } from "@playwright/test";

import type { AppFixture, Fixture } from "./helpers/create-fixture.js";
import { createFixture, js } from "./helpers/create-fixture.js";
import {
	PlaywrightFixture,
	prettyHtml,
	selectHtml,
} from "./helpers/playwright-fixture.js";

test.describe("fs-router", () => {
	let fixture: Fixture;
	let appFixture: AppFixture;

	test.beforeAll(async () => {
		fixture = await createFixture({
			files: {},
			template: "react-ssr-fs",
		});

		appFixture = await fixture.createServer();
	});

	test.afterAll(async () => {
		await appFixture.close();
	});

	let logs: string[] = [];

	test.beforeEach(({ page }) => {
		page.on("console", (msg) => {
			logs.push(msg.text());
		});
	});

	test("ssr", async ({ page }) => {
		let res = await fixture.requestDocument("/");
		expect(res.status).toBe(200);
		expect(res.headers.get("Content-Type")).toBe("text/html");
		let html = await res.text();
		expect(selectHtml(html, "[data-test-id=title]")).toBe(
			prettyHtml(`<h1 data-test-id="title">Vinxi Home</h1>`),
		);
		expect(selectHtml(html, "[data-test-id=counter]")).toBe(
			prettyHtml(`<button data-test-id="counter">0</button>`),
		);

		res = await fixture.requestDocument("/hello");
		expect(res.status).toBe(200);
		expect(res.headers.get("Content-Type")).toBe("text/html");
		html = await res.text();
		expect(selectHtml(html, "[data-test-id=title]")).toBe(
			prettyHtml(`<h1 data-test-id="title">Hello from Vinxi</h1>`),
		);
		expect(selectHtml(html, "[data-test-id=counter]")).toBe(
			prettyHtml(`<button data-test-id="counter">0</button>`),
		);
	});

	test("hydrates", async ({ page }) => {
		let app = new PlaywrightFixture(appFixture, page);
		await app.goto("/", true);

		expect(await app.getHtml("[data-test-id=title]")).toBe(
			prettyHtml(`<h1 data-test-id="title">Vinxi Home</h1>`),
		);
		expect(await app.getHtml("[data-test-id=counter]")).toBe(
			prettyHtml(`<button data-test-id="counter">0</button>`),
		);

		await app.clickElement("[data-test-id=counter]");

		expect(await app.getHtml("[data-test-id=counter]")).toBe(
			prettyHtml(`<button data-test-id="counter">1</button>`),
		);

		await app.clickElement("a[href='/hello']");
		await app.waitForURL("/hello");
		await new Promise((r) => setTimeout(r, 1000));

		expect(await app.getHtml("[data-test-id=title]")).toBe(
			prettyHtml(`<h1 data-test-id="title">Hello from Vinxi</h1>`),
		);
		expect(await app.getHtml("[data-test-id=counter]")).toBe(
			prettyHtml(`<button data-test-id="counter">1</button>`),
		);

		await app.clickElement("a[href='/']");
		await app.waitForURL("/");
		await new Promise((r) => setTimeout(r, 1000));

		expect(await app.getHtml("[data-test-id=title]")).toBe(
			prettyHtml(`<h1 data-test-id="title">Vinxi Home</h1>`),
		);
		expect(await app.getHtml("[data-test-id=counter]")).toBe(
			prettyHtml(`<button data-test-id="counter">1</button>`),
		);
	});
});
