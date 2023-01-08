EXTENSION_NAME=aylurs-widgets
EXTENSION_OWNER=aylur

EXTENSION=widgets@$EXTENSION_OWNER # Aylur edit

# Symlink config
ln -sf $HOME/.dotfiles/gnome-extensions/$EXTENSION/schemas/gschemas.compiled $HOME/.local/share/gnome-shell/extensions/$EXTENSION/schemas/gschemas.compiled &
ln -sf $HOME/.dotfiles/gnome-extensions/$EXTENSION/schemas/org.gnome.shell.extensions.$EXTENSION_NAME.gschema.xml $HOME/.local/share/gnome-shell/extensions/$EXTENSION/schemas/org.gnome.shell.extensions.$EXTENSION_NAME.gschema.xml &