export default class Scope
{
	static DEFAULT = 5;

	#dict = {};
	#stack = [];
	#scope = [];

	get(ns)
	{
		const list = this.#dict[ns];
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

		const list = this.#dict[ns];
		if (list)
		{
			list.push(uri);
		}
		else
		{
			this.#dict[ns] = [ uri ];
		}

		this.#scope.push(ns);
	}

	sink()
	{
		let scope = null;
		if (this.#scope.length !== 0)
		{
			scope = this.#scope;
			this.#scope = [];
		}
		this.#stack.push(scope);
	}

	rise()
	{
		const scope = this.#stack.pop();
		if (scope)
		{
			for (const ns of scope)
			{
				this.#dict[ns].pop();
			}
		}
	}
}
