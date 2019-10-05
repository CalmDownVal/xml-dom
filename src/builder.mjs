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

function splitToken(token)
{
	const index = token.indexOf(':');
	return index === -1 ? null : [ token.slice(0, index), token.slice(index + 1) ];
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
		onTagOpenEnd(name)
		{
			let ns;
			let ln;
			let i;
			let attr;
			let parts = splitToken(name);

			if (parts)
			{
				ns = scope.get(parts[0]);
				ln = parts[1];
			}
			else
			{
				ns = scope.get(Scope.DEFAULT);
				ln = name;
			}

			const element = document.createElementNS(ns, ln);
			if (parts)
			{
				element.prefix = parts[0];
			}

			while (i <= attributes.length)
			{
				parts = splitToken(attributes[i]);
				if (parts)
				{
					ns = scope.get(parts[0]);
					ln = parts[1];
				}
				else
				{
					ns = null; // default namespaces don't affect attributes
					ln = attributes[i];
				}

				attr = document.createAttributeNS(ns, ln);
				if (parts)
				{
					attr.prefix = parts[0];
				}

				attr.value = attributes[++i];
				element.setAttributeNodeNS(attr);
				++i;
			}

			stack.push(current);
			scope.sink();
			current.appendChild(element);
			current = element;
			attributes = [];
		},
		onTagClose(name/*, isSelfClosing*/)
		{
			if (current.tagName !== name)
			{
				return;
				// throw new Error(`unmatched closing tag </${name}>`);
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
