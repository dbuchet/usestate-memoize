# usestate-memoize

## memoize/cache solution for React useState

This package uses [React.useState](https://reactjs.org/docs/hooks-state.html) and [Memoizee](https://github.com/medikoo/memoizee) for cache solution.

### What's the "problem" with React.useState
What happen in a code like this one?
```javascript
import React, { memo, useState } from 'react';

const MyCounter = memo(() => {
	const [ count, setCount ] = useState(0);

	return <>
		<Button onClick={() => setCount(count+1)}>Increment me!</Button>
		<Button onClick={() => setCount(count-1)}>Decrement me!</Button>
		<span>Value is {count}</span>
	</>
});

const Button = memo(({onClick, children}) => {
	console.log("I'm rendered!");
	return (
		<Button onClick={onClick}>{children}</Button>
	);
});

```
Each time you click a button, Component is re-rendered, and `onClick` function references are changed (because you create a new function at each render).
While this change of references are pretty insignificant [Are hooks slow because of creating functions in render?](https://reactjs.org/docs/hooks-faq.html#are-hooks-slow-because-of-creating-functions-in-render), when we have multiple components, with many `componentDidUpdate` or `useEffects` logics, it would be better not to recreate functions each time, and causing children to re-render


### Installation

```javascript
npm i usestate-memoize
```

### Usage
```javascript
import React, { memo } from 'react';
import useState from 'usestate-memoize';

const _inc = () => c => c+1;
const _dec = () => c => c-1;
const MyCounter = memo(() => {
	const [ count, setCount, defineCountActions, actions ] = useState(0, {
		increment: _inc,
		decrement: _dec,
	});

	return <>
		<Button onClick={actions.increment}>Increment me!</Button>
		<Button onClick={actions.decrement}>Decrement me!</Button>
		<span>Value is {count}</span>
	</>
});

const Button = memo(({onClick, children}) => {
	console.log("I'm rendered!");
	return (
		<Button onClick={onClick}>{children}</Button>
	);
})
```
`usestate-memoize` exposes same api as `React.useState`. It returns a 4 values array:

`[0]` State value (same as React.useState)

`[1]` Function to set state value(same as React.useState)

`[2]` Function to bind a custom function which will be memoized

`[3]` Shortcut to access auto-memoized functions defined in useState constructor

```javascript
const _inc = () => c => c+1;
const _dec = () => c => c-1;
const MyCounter = () => {
    const [ count, setCount, defineCountActions] = useState(0);

	const increment = defineCountActions(_inc);
	const decrement = defineCountActions(_dec);

    return <>
        <Button onClick={increment}>Increment me!</Button>
        <Button onClick={decrement}>Decrement me!</Button>
        <span>Value is {count}</span>
    </>
};
```

Note that `_inc` and `_dec` are defined **OUTSIDE** of component. If you define these functions inside your functional component, they will be re-created each-time, and you'll loose memoization.

`usestate-memoized` provides a shortcut, to auto-memoized custom actions, passing them in constructor, and getting back them as fourth array value

```javascript
const _inc = () => c => c+1;
const _dec = () => c => c-1;
const MyCounter = () => {
    const [ count,,, { increment, decrement } ] = useState(0, {
		increment: _inc,
		decrement: _dec,
	});

    return <>
        <Button onClick={increment}>Increment me!</Button>
        <Button onClick={decrement}>Decrement me!</Button>
        <span>Value is {count}</span>
    </>
};
```

Please not the double arrow function `const _inc = () => c => c+1;`. If needed, first function argument is the `SyntheticEvent` returned by React. Keep in mind that `SyntheticEvent` are immediately destroyed by React after callback. So because these functions are memoized, the `SyntheticEvent` event will be lost after first call. To bypass this, we trigger a `SyntheticEvent.persist()` before memoization.
Second function argument is the current state value.

```javascript
const _setValue = ({target:{value}}) => () => value;
const MyInput = () => {
    const [ value,,, { setValue } ] = useState("", {
		setValue: _setValue,
	});

    return <>
        <input onChange={setValue} value={value} />
    </>
};
```
