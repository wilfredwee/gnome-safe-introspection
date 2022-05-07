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

const DBUS_INTERFACE = `
    <node>
       <interface name="dev.wxwee.SafeIntrospect">
           <method name="GetWindows">
                <arg name="windows" direction="out" type="a{ta{sv}}" />
           </method>
       </interface>
    </node>
    `;



class SafeIntrospect {
    constructor() {
        log("Initializing SafeIntrospection extension.");

        this._dbusImpl = Gio.DBusExportedObject.wrapJSObject(DBUS_INTERFACE, this);
        this._initializedChecker = false;
    }

    enable() {
        log("Enabling SafeIntrospection extension.");

        this._dbusImpl.export(Gio.DBus.session, '/dev/wxwee/SafeIntrospect');
    }

    checkInitialized() {
        if (this._initializedChecker) {
            return true;
        }

        if (main.introspectService && main.introspectService._senderChecker) {
            main.introspectService._senderChecker = new DBusSenderChecker(APP_ALLOWLIST);
            this._initializedChecker = true;
        }

        return this._initializedChecker;
    }

    async GetWindowsAsync(_params, invocation) {
        const isInitialized = this.checkInitialized();

        if (!isInitialized) {
            invocation.return_gerror(new Error("Unable to initialize Introspect service"));
            return;
        }

        const variant = '(a{ta{sv}})';

        Gio.DBus.session.call(
            'org.gnome.Shell.Introspect',
            '/org/gnome/Shell/Introspect',
            'org.gnome.Shell.Introspect',
            'GetWindows',
            null,
            new GLib.VariantType(variant),
            Gio.DBusCallFlags.NONE,
            -1,
            null,
            (connection, res) => {
                try {
                    const reply = connection.call_finish(res);
                    const replyUnpacked = reply.deepUnpack();

                    for (const [_windowId, windowProperties] of Object.entries(replyUnpacked[0])) {
                        // Obfuscate the title.
                        windowProperties['title'] = GLib.Variant.new_string('');
                    }

                    invocation.return_value(new GLib.Variant(variant, replyUnpacked));
                } catch (e) {
                    log("Failed after calling Introspect: ", e);

                    invocation.return_gerror(GLib.Error(Gio.DBusError,
                        Gio.DBusError.FAILED,
                        `Failed calling Introspect API: ${e}`));
                }
            }
        );
    }

    disable() {
        log("Disabling SafeIntrospection extension.");
        if (this._dbusImpl) this._dbusImpl.unexport();
    }
}

function init() {
    return new SafeIntrospect();
}