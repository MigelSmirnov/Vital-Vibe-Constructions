# Termux execution bridge

Use Termux for commands that require a real local checkout, image files, shell tools, or checks that cannot run through the GitHub connector.

## Update the working branch

```bash
git status -sb
git fetch origin
git switch agent/architecture-sandbox
git pull --ff-only origin agent/architecture-sandbox
```

Do not use `reset --hard` or `clean -fd` unless local changes have been reviewed and are disposable.

## Standard tasks

Repository diagnostics:

```bash
bash tools/termux/run-task.sh doctor
```

Full project checks:

```bash
bash tools/termux/run-task.sh checks
```

Read real image dimensions:

```bash
bash tools/termux/run-task.sh dimensions proyecto-1/*.jpeg
```

Run an explicitly requested command while capturing all output:

```bash
bash tools/termux/run-task.sh command git diff --check
```

Every task writes the complete output to:

```text
artifacts/termux/latest.log
```

Paste that file's contents into the chat after a failed or requested command:

```bash
cat artifacts/termux/latest.log
```

## Safety contract

The task runner never performs these operations automatically:

- `git reset`
- `git clean`
- `git commit`
- `git push`
- file deletion

Commands that mutate history or publish changes must be issued separately and reviewed first.
