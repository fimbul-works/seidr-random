![Seidr](seidr-logo.svg)
## SSR-friendly `random()` number generator

A pseudo-random number generator for [Seidr](https://github.com/fimbul-works/seidr) based on the Alea algorithm.

This function is stateful and deterministic within a render lifecycle. Unlike `Math.random()`, this integrates with Seidr's *AppState* so the server and client produce the same sequence during hydration, preventing mismatches.

[![npm version](https://badge.fury.io/js/%40fimbul-works%2Fseidr-random.svg)](https://www.npmjs.com/package/@fimbul-works/seidr-random)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/microsoft/TypeScript)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/%40fimbul-works%2Fseidr-random)](https://bundlephobia.com/package/@fimbul-works/seidr-random)

## Features

- 🔬 **High entropy** - Alea algorithm (Baagøe 2010); passes basic PRNG statistical tests.
- 🎲 **SSR-safe seeding** - Deterministic during SSR/hydration for server-client sequence parity; entropy-seeded on the client otherwise.

## Installation

```bash
npm install @fimbul-works/seidr-random
```

Or using your preferred package manager:

```bash
yarn add @fimbul-works/seidr-random
pnpm install @fimbul-works/seidr-random
```

## Quick Start

```typescript
import { mount, Seidr, $div, $button } from '@fimbul-works/seidr';
import { random } from '@fimbul-works/seidr-random';

const RandomExample = () => {
  const messages = ["Push me", "Poke me", "Try me"];
  const number = new Seidr(0);

  return $div({}, [
    $button({
      textContent: messages[Math.floor(random() * messages.length)],
      onclick: () => number.value = Math.floor(random() * 10) + 1
    }),
    $div({ textContent: number }),
  ]);
};

mount(RandomExample, document.body);
```

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

---

Built with 🎲 by [FimbulWorks](https://github.com/fimbul-works)
