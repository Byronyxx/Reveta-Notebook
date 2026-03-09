# Reveta Notebook — Google Project IDX Workspace Configuration
# Compatible with Google Project IDX (idx.google.com)

{ pkgs, ... }: {
  channel = "stable-24.05";

  packages = [
    pkgs.nodejs_20
    pkgs.nodePackages.npm
    pkgs.git
    pkgs.typescript
  ];

  idx = {
    extensions = [
      "bradlc.vscode-tailwindcss"
      "dbaeumer.vscode-eslint"
      "esbenp.prettier-vscode"
      "rangav.vscode-thunder-client"
      "yzhang.markdown-all-in-one"
      "davidanson.vscode-markdownlint"
      "bierner.markdown-mermaid"
      "pkief.material-icon-theme"
      "github.github-vscode-theme"
    ];

    workspace = {
      onCreate = {
        install-deps = "npm install 2>/dev/null || true";
        open-readme = "code docs/00_README.md";
      };
      onStart = {
        show-status = "echo '✦ Reveta Notebook Workspace Ready — 5 Documents Loaded'";
      };
    };

    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0"];
          manager = "web";
        };
      };
    };
  };
}
