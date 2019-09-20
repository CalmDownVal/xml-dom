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
	let attributes;

	return {
		...options,
		onAttribute(name, value)
		{
			if (startsWith(name, 'xmlns'))
			{
				scope.set(name[5] === ':' ? name.slice(6) : Scope.DEFAULT, value || null);
			}
			else
			{
				(attributes = attributes || []).push(name, value);
			}
		},
		onTagOpenEnd(name)
		{
			let ns;
			let ln;

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

			let element;
			if (ns)
			{
				element = document.createElementNS(ns, ln);
				if (parts)
				{
					element.prefix = parts[0];
				}
			}
			else
			{
				element = document.createElement(ln);
			}

			if (attributes)
			{
				let attr;
				let i;

				for (i = 0; i < attributes.length; i += 2)
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

					if (ns)
					{
						attr = document.createAttributeNS(ns, ln);
						if (parts)
						{
							attr.prefix = parts[0];
						}
					}
					else
					{
						attr = document.createAttribute(ln);
					}

					attr.value = attributes[i + 1];
					element.setAttributeNodeNS(attr);
				}
				attributes = null;
			}

			stack.push(current);
			scope.sink();

			current.appendChild(element);
			current = element;
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
