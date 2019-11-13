import { parse, parseStream } from '@calmdownval/xml-sax';
import { Document } from '@calmdownval/mini-dom';
import { bindEvents } from './builder.mjs';
import { stringify } from './breaker.mjs';

function parse(str)
{
	const document = new Document();
	const events = bindEvents(document);

	parse(str, events);
	return document;
}

async function parseStream(readable)
{
	const document = new Document();
	const events = bindEvents(document);

	await parseStream(readable, events);
	return document;
}

export { parse, parseStream, stringify };
