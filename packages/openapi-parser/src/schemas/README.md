# The schemas

This folder contain the JSON schemas for the openApi specifications as used by this package.

The original OAS 3.1 schemas from the [openApi specification repository](https://github.com/OAI/OpenAPI-Specification) have been slightly modified to work with the current AJV version that this package uses.

This means:

- replacing $dynamicRefs by normal $refs as the current version of AJV has an issue with resolving $dynamicRefs outside the root object in draft-2020-12 specs.

The OAS 3.2 schema (`https://spec.openapis.org/oas/3.2/schema/2025-09-17`, the plain `schema` without Schema Object validation) has the same modification: its `$dynamicRef: "#meta"` entries are replaced by `$ref: "#/$defs/schema"`. Nothing else differs from the published schema.
