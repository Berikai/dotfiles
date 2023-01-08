EXTENSION_NAME=quick-settings-tweaks
EXTENSION_OWNER=qwreey

EXTENSION=$EXTENSION_NAME@$EXTENSION_OWNER

# Symlink config
ln -sf $HOME/.dotfiles/gnome-extensions/$EXTENSION/schemas/gschemas.compiled $HOME/.local/share/gnome-shell/extensions/$EXTENSION/schemas/gschemas.compiled &
ln -sf $HOME/.dotfiles/gnome-extensions/$EXTENSION/schemas/org.gnome.shell.extensions.$EXTENSION_NAME.gschema.xml $HOME/.local/share/gnome-shell/extensions/$EXTENSION/schemas/org.gnome.shell.extensions.$EXTENSION_NAME.gschema.xml &