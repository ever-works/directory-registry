# Ever Works Directory Registry

The list of public [Ever Works](https://ever.works) directories that the **directory hub** searches.

The hub is one MCP server and one read API across every directory listed here:

- MCP (Streamable HTTP, no sign-in): `https://directories.ever.works/mcp`
- Search over plain HTTP: `https://directories.ever.works/data/search.json?q=time%20tracking`
- For agents: `https://directories.ever.works/llms.txt`

Its source and spec live in [`ever-co/ever-works`](https://github.com/ever-co/ever-works) (`apps/directory-hub`,
`docs/specs/features/directory-hub/`).

## Format

[`registry.json`](registry.json) follows Directory Registry v1 ([`registry.schema.json`](registry.schema.json)):

```json
{
	"version": 1,
	"name": "Ever Works directories",
	"directories": [
		{
			"id": "crm",
			"url": "https://crm.ever.works",
			"name": "Awesome CRM",
			"topics": ["crm software", "sales crm"]
		}
	]
}
```

| Field         | Required | Meaning                                                                                       |
| ------------- | -------- | --------------------------------------------------------------------------------------------- |
| `id`          | yes      | Short stable id that agents pass as `directory` (lowercase letters, digits and `-`; at most 63)|
| `url`         | yes      | The site's `https://` origin. No path, no credentials                                         |
| `name`        | no       | Fallback name, shown only while the site is unavailable                                       |
| `description` | no       | Fallback description, shown only while the site is unavailable                                |
| `topics`      | no       | Words agents may use for this directory ("time tracking software"). They help ranking         |
| `aliases`     | no       | Other names for the directory                                                                 |
| `listed`      | no       | `false` hides the entry without deleting it                                                   |

The hub checks every entry against the site itself: a directory counts only when its `/data/directory.json`
(Agent Access Contract v1) answers and names the same origin. Its live name and description win over the fallbacks
here. Entries whose site is not up yet, or runs an older build, show as unavailable with a reason.

## Adding a directory

Open a pull request that adds one entry. The site must serve Agent Access Contract v1 (`/data/directory.json`,
`/data/items.json`); sites built from the current Ever Works templates do.

The hub keeps a copy of this file for up to an hour, so a merged change shows within about an hour.
