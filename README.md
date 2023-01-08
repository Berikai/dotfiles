# Berikai's dotfiles

Your dotfiles are how you personalize your system. These are mine.

This repo is forked from [holman's dotfiles](https://github.com/holman/dotfiles).

## What makes hierarchy work

In [holman's dotfiles](https://github.com/holman/dotfiles) the main components that make the [Components](https://github.com/Berikai/dotfiles#Components) hierarchy work are not explained well (at least for me). I decided to explain it in my fork.

- **zsh/zshrc.symlink**: It loads all the `.zsh` files into your environment. (I simplified it in my fork.)
- **system/_path.zsh**: It makes anything in `bin/` be added to your `$PATH` and be made available everywhere.
- **scripts/..**: dotfiles setup scripts.

## Components

There's a few special files in the hierarchy.

- **bin/**: Anything in `bin/` will get added to your `$PATH` and be made
  available everywhere.
- **topic/\*.zsh**: Any files ending in `.zsh` get loaded into your
  environment.
- **topic/path.zsh**: Any file named `path.zsh` is loaded first and is
  expected to setup `$PATH` or similar.
- **topic/completion.zsh**: Any file named `completion.zsh` is loaded
  last and is expected to setup autocomplete.
- **topic/install.sh**: Any file named `install.sh` is executed when you run `script/install`. To avoid being loaded automatically, its extension is `.sh`, not `.zsh`.
- **topic/\*.symlink**: Any file ending in `*.symlink` gets symlinked into
  your `$HOME`. This is so you can keep all of those versioned in your dotfiles
  but still keep those autoloaded files in your home directory. These get
  symlinked in when you run `script/bootstrap`.

## Install

Run this:

```sh
git clone https://github.com/berikai/dotfiles.git ~/.dotfiles
cd ~/.dotfiles
scripts/bootstrap
```

This will symlink the appropriate files in `.dotfiles` to your home directory.
Everything is configured and tweaked within `~/.dotfiles`.


`doti` is a simple script that installs some dependencies. Tweak this script, and occasionally run `doti` from
time to time to keep your environment fresh and up-to-date. You can find
this script in `bin/`