import * as SAX from '@calmdownval/xml-sax';
import { Document } from '@calmdownval/mini-dom';
import { bindEvents } from './builder.mjs';
import { stringify } from './breaker.mjs';

function parse(str)
{
	const document = new Document();
	const events = bindEvents(document);

	SAX.parse(str, events);
	return document;
}

async function parseStream(readable)
{
	const document = new Document();
	const events = bindEvents(document);

	await SAX.parseStream(readable, events);
	return document;
}

export { parse, parseStream, stringify };
