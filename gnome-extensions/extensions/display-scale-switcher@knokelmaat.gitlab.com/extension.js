/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const Gettext = imports.gettext;
const { GObject } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const QuickSettings = imports.ui.quickSettings;
const QuickSettingsMenu = imports.ui.main.panel.statusArea.quickSettings;

const Domain = Gettext.domain(Me.metadata.uuid);
const _ = Domain.gettext;

const DisplayBackend = Me.imports.dbus;

const LAST_SCALE_KEY = 'last-selected-display-scale';

// Round scale values to multiple of 25 % just like Gnome Settings
function scaleToPercentage(scale) {
    return Math.floor(scale * 4 + 0.5) * 25;
}

const DisplayScaleQuickMenuToggle = GObject.registerClass(
    class DisplayScaleQuickMenuToggle extends QuickSettings.QuickMenuToggle {

        _init() {
            // Set QuickMenu name and icon
            super._init({
                label: _('Display Scale'),
                iconName: 'video-display-symbolic',
                toggleMode: true,
            });
            this.menu.setHeader('video-display-symbolic', 'Display Scale');
            
            this.settings = ExtensionUtils.getSettings(
                'org.gnome.shell.extensions.display-scale-switcher');
            
            this._displayScaleSwitcher = new DisplayBackend.DisplayScaleSwitcher();
            this._displayScaleSwitcher.connect('state-changed', () => {
                this._updateDisplayList();
            });
            
            this.connect('clicked', () => {
                const newScale = this.checked
                    ? this.settings.get_double(LAST_SCALE_KEY)
                    : 1.0;
                this._displayScaleSwitcher.setDisplayScale(newScale);
            });
        }

        _addDummyItem(message) {
            const item = new PopupMenu.PopupMenuItem(message);
            item.label.get_clutter_text().set_line_wrap(true);
            this.menu.addMenuItem(item);
        }
        
        _updateCurrentScale(scale) {
            this.label = _('Scale: ') + scaleToPercentage(scale) + ' %';
            
            this.checked = scaleToPercentage(scale) !== 100;
            
            if (this.checked) {
                this.settings.set_double(LAST_SCALE_KEY, scale);
            }
        }

        _updateDisplayList() {
            this.menu.removeAll();

            const displays = this._displayScaleSwitcher.getDisplayInfo();

            if (displays === null) {
                this._addDummyItem(_('Unable to get display info.'));
                return;
            }

            // Current version only supports single display.
            if (displays.length > 1) {
                this._addDummyItem(_('Multiple displays detected. This is not supported by the extension.'));
                return;
            }
            else {
                const display = displays[0];

                for (let scale of display.scales) {
                    const scaleItem = new PopupMenu.PopupMenuItem(scaleToPercentage(scale) + ' %');
                    
                    scaleItem.connect('activate', () => {
                        this._displayScaleSwitcher.setDisplayScale(scale);
                    });

                    scaleItem.setOrnament(scale === display.currentScale
                        ? PopupMenu.Ornament.CHECK
                        : PopupMenu.Ornament.NONE);
        
                    this.menu.addMenuItem(scaleItem);
                }
                
                this._updateCurrentScale(display.currentScale);
            }
        }
    });

class Extension {
    constructor(uuid) {
        this._uuid = uuid;
        this._items = null;

        ExtensionUtils.initTranslations(uuid);
    }

    enable() {
        this._items = [];
        this._items.push(new DisplayScaleQuickMenuToggle());
        QuickSettingsMenu._addItems(this._items);
    }

    disable() {
        this._items.forEach(item => item.destroy());
        this._items = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
