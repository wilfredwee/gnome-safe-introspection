all: install

.PHONY: install

install:
	install -d ~/.local/share/gnome-shell/extensions
	cp -a safe-introspection@wilfredwee.dev/ ~/.local/share/gnome-shell/extensions/