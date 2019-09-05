function startsWith(str, sub)
{
	const l0 = str.length;
	const l1 = sub.length;
	if (l0 < l1)
	{
		return false;
	}

	if (l0 === l1)
	{
		return str === sub;
	}

	for (let i = 0; i < l1; ++i)
	{
		if (str[i] !== sub[i])
		{
			return false;
		}
	}

	return true;
}

export function bindEvents(document, options)
{
	const stack = [];
	let current = document;

	// TODO: recognize namespaces
	return {
		...options,
		onTagOpen(name)
		{
			stack.push(current);

			const node = document.createElement(name);
			current.appendChild(node);
			current = node;
		},
		onAttribute(name, value)
		{
			current.setAttribute(name, value);
		},
		onTagClose(name/*, isSelfClosing*/)
		{
			if (current.tagName !== name)
			{
				throw new Error(`unmatched closing tag </${name}>`);
			}
			current = stack.pop();
		},
		onText(text)
		{
			current.appendChild(document.createTextNode(text));
		},
		onCData(data)
		{
			current.appendChild(document.createCDATASection(data));
		},
		onInstruction(target, data)
		{
			current.appendChild(document.createProcessingInstruction(target, data));
		},
		onComment(data)
		{
			current.appendChild(document.createComment(data));
		},
		onDeclaration(data)
		{
			if (startsWith(data, 'DOCTYPE '))
			{
				current.appendChild(document.createDocumentType(data.slice(8)));
			}
		}
	};
}
