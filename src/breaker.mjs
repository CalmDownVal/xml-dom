import { Node } from '@calmdownval/mini-dom';

function childNodesOf(node)
{
	let str = '';
	for (const childNode of node.childNodes)
	{
		str += stringify(childNode);
	}
	return str;
}

export function stringify(node)
{
	if (!node || typeof node !== 'object')
	{
		return typeof node === 'string' ? node : '';
	}

	// TODO: namespaces
	switch (node && node.nodeType)
	{
		case Node.ELEMENT_NODE:
		{
			let attrs = '';
			for (const attr of node.attributes)
			{
				// TODO: escape value
				attrs += ` ${attr.name}="${attr.value}"`;
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
