const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const { DBusSenderChecker } = imports.misc.util;
const { main } = imports.ui;

// Copied and extended from: https://gitlab.gnome.org/GNOME/gnome-shell/-/blob/main/js/misc/introspect.js
const APP_ALLOWLIST = [
    'org.freedesktop.impl.portal.desktop.gtk',
    'org.freedesktop.impl.portal.desktop.gnome',
    'org.gnome.Shell',
];


class Extension {
    constructor() {
        log("Initializing SafeIntrospection extension.");
    }

    enable() {
        log("Enabling SafeIntrospection extension.");

        main.introspectService._senderChecker = new DBusSenderChecker(APP_ALLOWLIST);

        Gio.DBus.session.call(
            'org.gnome.Shell.Introspect', 
            '/org/gnome/Shell/Introspect', 
            'org.gnome.Shell.Introspect', 
            'GetWindows', 
            null, 
            new GLib.VariantType('(a{ta{sv}})'), 
            Gio.DBusCallFlags.NONE, 
            -1, 
            null, 
            (connection, res) => { 
                console.log("Inside callback hereh");
                const reply = connection.call_finish(res); 
                console.log("got reply: ", reply); 
            }
        );
    }

    disable() {
        log("Disabling SafeIntrospection extension.");
    }
}

function init() {
    return new Extension();
}
