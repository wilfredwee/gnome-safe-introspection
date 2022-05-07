# GNOME Safe Introspection
Exposes the [`Introspect`](https://gitlab.gnome.org/GNOME/gnome-shell/-/blob/386d25e6f8ce11549526ea3776eb34138fcb3774/data/dbus-interfaces/org.gnome.Shell.Introspect.xml) API.

This allows applications to query important information about the GNOME Shell, without exposing too much information for malicious actors.

# Installation
```
git clone git@github.com:wilfredwee/gnome-safe-introspection.git
cd gnome-safe-introspection
make install

# If you're in Wayland, log out and log back in again.
```

# Test
You can test this extension is working by running the following:
```
busctl --user call org.gnome.Shell /dev/wxwee/SafeIntrospect dev.wxwee.SafeIntrospect GetWindows
```