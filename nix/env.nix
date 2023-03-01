{ nixpkgs ? import <nixpkgs> { } }:
let pkgs = import ./packages.nix { inherit nixpkgs; }; in
with pkgs;
{
  system = [
    coreutils
    gnugrep
    findutils
    gnused
    jq
  ];

  main = [
    pls
    nodejs-16_x
    pnpm
    gattai
  ];

  dev = [
    pnpm
    webstorm
  ];

  lint = [
    precommit-patch-nix
    pre-commit
    nixpkgs-fmt
    prettier
    shfmt
    shellcheck
    gitlint
    sg
  ];

  ci = [
    awscli2
  ];

  releaser = [
    pls
    node18
    sg
    prettier
  ];
}
