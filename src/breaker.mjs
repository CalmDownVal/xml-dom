import { Node } from '@calmdownval/mini-dom';

export function stringify(node)
{
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

			let children = '';
			for (const childNode of node.childNodes)
			{
				children += stringify(childNode);
			}

			const name = node.name;
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

		case Node.DOCUMENT_TYPE_NODE:
			return `<!DOCTYPE ${node.data}>`;

		default:
			throw new Error('invalid node');
	}
}
