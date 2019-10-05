import Scope from './Scope.mjs';

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

function getPrefix(name)
{
	const index = name.indexOf(':');
	return index > 0 && index !== name.length ? name.slice(0, index) : null;
}

export function bindEvents(document, options)
{
	const stack = [];
	const scope = new Scope();

	let current = document;
	let attributes = [];

	return {
		...options,
		onAttribute(name, value)
		{
			if (startsWith(name, 'xmlns'))
			{
				if (name.length === 5)
				{
					scope.set(Scope.DEFAULT, value);
				}
				else if (name[5] === ':')
				{
					scope.set(name.slice(6), value);
				}
			}

			attributes.push(name, value);
		},
		onTagOpenEnd(tagName)
		{
			let i = 0;
			let attr;
			let prefix = getPrefix(tagName);
			let ns = scope.get(prefix || Scope.DEFAULT);

			const element = ns
				? document.createElementNS(ns, tagName)
				: document.createElement(tagName);

			while (i < attributes.length)
			{
				prefix = getPrefix(attributes[i]);
				ns = prefix ? scope.get(prefix) : null; // default namespaces don't apply to attributes

				attr = ns
					? document.createAttributeNS(ns, attributes[i])
					: document.createAttribute(attributes[i]);

				attr.value = attributes[++i];
				element.setAttributeNode(attr);
				++i;
			}

			attributes = [];

			stack.push(current);
			scope.sink();

			current.appendChild(element);
			current = element;
		},
		onTagClose(tagName/*, isSelfClosing*/)
		{
			if (current.tagName !== tagName)
			{
				return;
				// throw new Error(`unmatched closing tag </${tagName}>`);
			}

			scope.rise();
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
