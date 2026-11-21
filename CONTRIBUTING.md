# Contributing

Thanks for helping agents find good directories.

## Add or change a directory

1. Edit [`registry.json`](registry.json): add one entry to `directories` (format in the [README](README.md#format)).
2. Run `node scripts/validate.mjs` (Node 20 or newer, no install step).
3. Open a pull request. Say which site it is and confirm that `https://<site>/data/directory.json` answers.

What gets merged:

- The site is an Ever Works directory (or follows Agent Access Contract v1) and is publicly reachable over https.
- One entry per site; ids stay stable once merged, because agents may have saved them.
- `topics` are the words people search with ("time tracking software"), not marketing copy.

To take a directory out, set `"listed": false` rather than deleting the entry.

## License

By contributing you agree that your changes are released under the [MIT License](LICENSE).
