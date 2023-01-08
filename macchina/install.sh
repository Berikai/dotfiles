# Fedora 37
echo "y" | sudo dnf copr enable varlad/macchina
echo "y" | sudo dnf install macchina

# Symlink config
ln -s $HOME/.dotfiles/macchina/config $HOME/.config/macchina &