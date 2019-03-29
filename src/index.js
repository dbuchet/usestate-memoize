import { useState } from 'react';
import memoize from 'memoizee';

const execute = memoize(set => memoize(action => () => set(action)));

export default (initialProps, actions) => {
	const [ value, setValue ] = useState(initialProps);
	const e = execute(setValue);

	const a = actions ? Object.entries(actions).reduce((p, [name, func]) => Object.assign(p, {
		[name]: execute(setValue)(func)
	}), {}) : null;

	return [value, setValue, e, a];
}
