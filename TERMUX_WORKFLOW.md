# Workflow: ChatGPT + GitHub + Termux

## Goal
Use ChatGPT for architecture and code decisions, GitHub for source control, and Termux as the local execution environment.

## Responsibilities
### ChatGPT
- Architecture and design
- Code changes
- Debugging and analysis
- Migration planning
- Exact commands for local execution

### Termux
- Execute Node.js scripts
- Run git commands
- Build and validate the project
- Read local image dimensions
- Execute repository utilities

## Rules
1. ChatGPT analyzes first.
2. If local execution is required, ChatGPT provides exact commands.
3. User runs them in Termux.
4. User shares the output.
5. ChatGPT continues based on the results.

## Safety
Do not run destructive git commands unless explicitly agreed.

## Principle
ChatGPT makes engineering decisions.
Termux executes commands and returns factual results.