import { Node } from '@calmdownval/mini-dom';

const ESC =
{
	'"': '&quot;',
	'<': '&lt;',
	'&': '&amp;'
};

function childNodesOf(node)
{
	let str = '';
	for (const childNode of node.childNodes)
	{
		str += stringify(childNode);
	}
	return str;
}

function escape(str)
{
	const length = str.length;

	let anchor = 0;
	let index = 0;
	let result = '';

	while (index !== length)
	{
		const sequence = ESC[str[index]];
		if (sequence)
		{
			result += str.slice(anchor, index) + sequence;
			anchor = index + 1;
		}
		++index;
	}

	return result + str.slice(anchor);
}

export function stringify(node)
{
	if (!node || typeof node !== 'object')
	{
		return typeof node === 'string' ? node : '';
	}

	switch (node && node.nodeType)
	{
		case Node.ELEMENT_NODE:
		{
			let attrs = '';
			for (const attr of node.attributes)
			{
				attrs += ` ${attr.name}="${escape(attr.value)}"`;
			}

			const children = childNodesOf(node);
			const name = node.tagName;
			return children
				? `<${name}${attrs}>${children}</${name}>`
				: `<${name}${attrs}/>`;
		}

		case Node.TEXT_NODE:
			return node.data;

		case Node.CDATA_SECTION_NODE:
			return `<![CDATA[${node.data}]]>`;

		case Node.PROCESSING_INSTRUCTION_NODE:
			return `<?${node.target} ${node.data}?>`;

		case Node.COMMENT_NODE:
			return `<!--${node.data}-->`;

		case Node.DOCUMENT_NODE:
			return childNodesOf(node);

		case Node.DOCUMENT_TYPE_NODE:
			return `<!DOCTYPE ${node.data}>`;

		default:
			throw new Error('invalid node ' + (node && node.nodeType));
	}
}
