# PoX Events Fetcher

A set of scripts to help export Stacking data.

## Installation

```bash
pnpm install
```

## Running Scripts

### Exporting next cycle's reward set

This will output a CSV of all _registered_ Stackers. Delegated pools won't be listed here until their delegations have been committed.

```bash
pnpm mainnet:reward-set
```

### Exporting a raw list of Stacking events

This is a two-step process. The first command saves events and transaction info to local files. The second command injects that data and outputs a CSV.

```bash
# first, save events
pnpm mainnet:save-events
# then, list them
pnpm mainnet:list-events
# list delegations
pnpm mainnet:delegations
```
