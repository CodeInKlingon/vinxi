import { H3Event } from "h3";

export * from "h3";

/**
 *
 * @param {H3Event} event
 * @param {string} key
 * @param {any} value
 */
export function setContext(event, key, value) {
	event.context[key] = value;
}

/**
 *
 * @param {H3Event} event
 * @param {string} key
 */
export function getContext(event, key) {
	return event.context[key];
}

/**
 *
 * @param {{ onRequest?: import("h3")._RequestMiddleware | import("h3")._RequestMiddleware[]; onBeforeResponse?: import("h3")._ResponseMiddleware | import("h3")._ResponseMiddleware[] }} options
 * @returns
 */
export function defineMiddleware(options) {
	return options;
}
