const { Gio } = imports.gi;
const GObject = imports.gi.GObject;

const DisplayConfigInterface = 
    '<node>\
        <interface name="org.gnome.Mutter.DisplayConfig">\
            <property name="ApplyMonitorsConfigAllowed" type="b" access="read" />\
            <signal name="MonitorsChanged" />\
            <method name="GetCurrentState">\
                <arg name="serial" direction="out" type="u" />\
                <arg name="monitors" direction="out" type="a((ssss)a(siiddada{sv})a{sv})" />\
                <arg name="logical_monitors" direction="out" type="a(iiduba(ssss)a{sv})" />\
                <arg name="properties" direction="out" type="a{sv}" />\
            </method>\
            <method name="ApplyMonitorsConfig">\
                <arg name="serial" direction="in" type="u" />\
                <arg name="method" direction="in" type="u" />\
                <arg name="logical_monitors" direction="in" type="a(iiduba(ssa{sv}))" />\
                <arg name="properties" direction="in" type="a{sv}" />\
            </method>\
        </interface>\
    </node>';

const DisplayConfigProxy = Gio.DBusProxy.makeProxyWrapper(DisplayConfigInterface);

var DisplayScaleSwitcher = GObject.registerClass({
    Signals: {
        'state-changed': {},
    },
}, class DisplayScaleSwitcher extends GObject.Object {
    constructor(constructProperties = {}) {
        super(constructProperties);
        this._currentState = null;
        this._updatedLogicalMonitors = [];

        this._proxy = new DisplayConfigProxy(
            Gio.DBus.session,
            'org.gnome.Mutter.DisplayConfig',
            '/org/gnome/Mutter/DisplayConfig',
            (proxy, error) => {
                if (error) {
                    log(error.message);
                } else {
                    this._proxy.connectSignal('MonitorsChanged',
                        () => {
                            this._updateState();
                        });
                    this._updateState();
                }
            });
    }

    getDisplayInfo() {
        return this._getConfigurableDisplays();
    }

    setDisplayScale(scale, index = 0, usePrompt = false) {
        if (this._proxy === null) {
            log('Proxy is not initialized');
            return;
        }
        this._updatedLogicalMonitors[index][2] = scale;

        this._proxy.ApplyMonitorsConfigRemote(
            this._currentState[0],
            usePrompt ? 2 : 1,
            this._updatedLogicalMonitors,
            {});
    }

    _updateState() {
        if (this._proxy === null) {
            log('Proxy is not initialized');
            return;
        }

        this._proxy.GetCurrentStateRemote((returnValue, errorObj) => {
            if (errorObj === null) {
                this._currentState = returnValue;
                this.emit('state-changed');
            } else {
                this._currentState = null;
                logError(errorObj);
            }
        });
    }

    _getPhysicalDisplayInfo() {
        if (this._currentState === 0) {
            return null;
        }
        const [, physical_monitors, , ] = this._currentState;
        const displays = [];

        for (let physical_monitor of physical_monitors) {
            const [[connector, , product, ], modes, ] = physical_monitor;
            const display = {};

            display.name = product + ' (' + connector + ')';
            display.connector = connector;

            for (let mode of modes) {
                const [id, , , , , supported_scales, opt_props] = mode;
                if (opt_props['is-current']) {
                    display.scales = supported_scales;
                    display.mode_id = id;
                }
            }

            displays.push(display);
        }
        return displays;
    }

    _getConfigurableDisplays() {
        if (this._currentState === null) {
            return null;
        }
        this._updatedLogicalMonitors = [];
        const configurableDisplays = [];

        const [, , logical_monitors, ] = this._currentState;
        const displays = this._getPhysicalDisplayInfo();

        for (let disp of displays) {
            for (let logical_monitor of logical_monitors) {
                const [x, y, scale, transform, primary, monitors, ] = logical_monitor;
                for (let monitor of monitors) {
                    const [connector, , , ] = monitor;
                    if (connector === disp.connector) {
                        disp.currentScale = scale;
                        configurableDisplays.push(disp);
                        this._updatedLogicalMonitors.push([x, y, scale, transform, primary, [[disp.connector, disp.mode_id, {}]]]);
                    }
                }
            }
        }
        return configurableDisplays;
    }
});
