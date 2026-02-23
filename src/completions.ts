const BASH = `# log-sherpa bash completion
_log_sherpa_completions() {
  COMPREPLY=( $(compgen -W "--json --from --to --suppress-noise --scrub-pii --format --compare --ci --fail-on-level --fail-on-pattern --tail --tail-interval --pattern-pack --config --export-otel --export-sentry --tui baseline" -- "\${COMP_WORDS[COMP_CWORD]}") )
}
complete -F _log_sherpa_completions log-sherpa
`;

const ZSH = `#compdef log-sherpa
_arguments '*: :->args' && return 0`;

const FISH = `complete -c log-sherpa -l json
complete -c log-sherpa -l from
complete -c log-sherpa -l to
complete -c log-sherpa -l suppress-noise
complete -c log-sherpa -l scrub-pii`;

export function getCompletion(shell: string): string {
  if (shell === "bash") return BASH;
  if (shell === "zsh") return ZSH;
  if (shell === "fish") return FISH;
  throw new Error(`Unsupported shell '${shell}'. Use bash|zsh|fish.`);
}
