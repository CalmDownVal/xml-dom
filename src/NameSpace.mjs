export class NameSpace
{
	static DEFAULT = Symbol('default-ns');

	constructor()
	{
		this.nsMap = {};
		this.stack = [];
		this.scope = [];
	}

	get(ns)
	{
		const list = this.nsMap[ns];
		if (list && list.length !== 0)
		{
			return list[list.length - 1];
		}
		return null;
	}

	set(ns, uri)
	{
		if (ns === 'xmlns')
		{
			return;
		}

		if (!(uri && typeof uri === 'string'))
		{
			uri = null;
		}

		const list = this.nsMap[ns];
		if (list)
		{
			list.push(uri);
		}
		else
		{
			this.nsMap[ns] = [ uri ];
		}

		this.scope.push(ns);
	}

	sink()
	{
		let scope = null;
		if (this.scope.length !== 0)
		{
			scope = this.scope;
			this.scope = [];
		}
		this.stack.push(scope);
	}

	rise()
	{
		const scope = this.stack.pop();
		if (scope)
		{
			for (const ns of scope)
			{
				this.nsMap[ns].pop();
			}
		}
	}
}
