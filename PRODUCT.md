# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Solo operators and builders who reuse prompt recipes across engineering, research, and writing work.

## Product Purpose

Prompt Workbench keeps proven prompt recipes inspectable and easy to adapt. Success means a visitor can find a recipe by job, edit its instructions, copy the exact text, and understand the stage it is meant for without implying that this local library runs a model or guarantees an output.

## Positioning

This is a prompt workbench, not a chat interface. It helps a person prepare and reuse an instruction; execution stays with the provider and workflow they choose.

## Operating Context

The current app is a browser-only portfolio demonstration with deterministic sample recipes. User additions and edits stay in localStorage. There is no model API, provider billing, account, sync, or claim that the examples are universally best.

## Capabilities and Constraints

- Browse and filter prompt recipes by work area and lifecycle stage.
- Search prompt name, purpose, and instruction text.
- Select a recipe, edit its instruction, save the revision locally, and copy it.
- Add and remove local recipes.
- Keep copy honest: the library stores text; it does not execute prompts or fabricate results.
- Support keyboard and touch input, clear feedback, readable mobile layout, and reduced motion.

## Evidence on Hand

- Existing implementation: `app/page.tsx`, `app/globals.css`, and `app/layout.tsx`.
- Evidence is limited to deterministic sample recipes and browser-local state; no model output or production usage data is available.

## Product Principles

- Show the instruction before promising the outcome.
- Reuse should be faster than rewriting from memory.
- Stage is a cue for readiness, not a quality score.
- Copying is an explicit handoff to another tool.

## Accessibility & Inclusion

Use semantic forms and buttons, visible keyboard focus, strong contrast, clear live feedback, readable text areas, reduced-motion support, and text equivalents for all stage signals.
