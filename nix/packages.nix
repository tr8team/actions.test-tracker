{ nixpkgs ? import <nixpkgs> { } }:
let
  pkgs = rec {
    atomi_classic = (
      with import (fetchTarball "https://github.com/kirinnee/test-nix-repo/archive/refs/tags/v8.1.0.tar.gz");
      {
        inherit sg;
      }
    );
    atomi = (
      with import (fetchTarball "https://github.com/kirinnee/test-nix-repo/archive/refs/tags/v17.0.0.tar.gz");
      {
        inherit pls precommit-patch-nix;
      }
    );
    "Unstable 21st Feb 2023" = (
      with import (fetchTarball "https://github.com/NixOS/nixpkgs/archive/5ab8b5ae26e6a4b781bdebdfd131c054f0b96e70.tar.gz") { };
      {
        inherit
          coreutils
          gnugrep

          pre-commit
          gitlint
          nodejs-16_x
          jq
          nixpkgs-fmt
          shfmt
          shellcheck;

        node18 = nodejs;

        webstorm = jetbrains.webstorm;
        prettier = nodePackages.prettier;
        pnpm = nodePackages.pnpm;
      }
    );
  };
in
with pkgs;
atomi //
atomi_classic //
pkgs."Unstable 21st Feb 2023"
