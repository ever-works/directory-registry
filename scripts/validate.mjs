// Checks registry.json against Directory Registry v1 with no dependencies: `node scripts/validate.mjs`.
// The rules match what the directory hub accepts (ever-co/ever-works apps/directory-hub/src/registry.ts), but stricter:
// an entry the hub would silently skip is an error here.
import { readFileSync } from 'node:fs';

const ID = /^[a-z0-9][a-z0-9-]{0,62}$/;
const FIELDS = new Set(['id', 'url', 'name', 'description', 'topics', 'aliases', 'listed']);
const errors = [];

function stringList(entry, key, where) {
	if (entry[key] === undefined) return;
	const value = entry[key];
	if (!Array.isArray(value) || value.length > 50) return errors.push(`${where}: "${key}" must be a list of at most 50`);
	value.forEach((item, i) => {
		if (typeof item !== 'string' || !item.trim() || item.length > 200)
			errors.push(`${where}: "${key}"[${i}] must be a non-empty string of at most 200 characters`);
	});
}

let doc;
try {
	doc = JSON.parse(readFileSync(new URL('../registry.json', import.meta.url), 'utf8'));
} catch (error) {
	console.error(`registry.json is not valid JSON: ${error.message}`);
	process.exit(1);
}

if (doc.version !== 1) errors.push('"version" must be 1');
if (!Array.isArray(doc.directories)) errors.push('"directories" must be a list');
const ids = new Set();
const origins = new Set();
for (const [index, entry] of (doc.directories ?? []).entries()) {
	const where = `directories[${index}]${entry?.id ? ` (${entry.id})` : ''}`;
	if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
		errors.push(`${where}: must be an object`);
		continue;
	}
	for (const key of Object.keys(entry)) if (!FIELDS.has(key)) errors.push(`${where}: unknown field "${key}"`);
	if (typeof entry.id !== 'string' || !ID.test(entry.id))
		errors.push(`${where}: "id" must be lowercase letters, digits and "-" (at most 63)`);
	else if (ids.has(entry.id)) errors.push(`${where}: duplicate id`);
	else ids.add(entry.id);
	let url;
	try {
		url = new URL(entry.url);
	} catch {
		errors.push(`${where}: "url" is not a URL`);
	}
	if (url) {
		if (url.protocol !== 'https:') errors.push(`${where}: "url" must use https`);
		if (url.username || url.password) errors.push(`${where}: "url" must not carry credentials`);
		if (url.pathname !== '/' || url.search || url.hash) errors.push(`${where}: "url" must be an origin only`);
		if (origins.has(url.origin)) errors.push(`${where}: duplicate url`);
		origins.add(url.origin);
	}
	for (const key of ['name', 'description'])
		if (entry[key] !== undefined && (typeof entry[key] !== 'string' || !entry[key].trim()))
			errors.push(`${where}: "${key}" must be a non-empty string`);
	stringList(entry, 'topics', where);
	stringList(entry, 'aliases', where);
	if (entry.listed !== undefined && typeof entry.listed !== 'boolean') errors.push(`${where}: "listed" must be true or false`);
}
if ((doc.directories?.length ?? 0) > 400) errors.push('at most 400 directories (the hub reads two documents per directory per cold search)');

if (errors.length) {
	console.error(errors.join('\n'));
	process.exit(1);
}
console.log(`registry.json is valid: ${ids.size} directories`);
