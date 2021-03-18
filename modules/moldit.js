/* Copyright (C) 2020 TaiAurori (Gabriel Sylvain) - All Rights Reserved
 * You may use, distribute and modify this code under the
 * terms of the MIT license.
 * Basically, you can change and redistribute this code
 * but this copyright notice must remain unmodified.
 */

var client;
if (window.vizality) {client = "vizality"} else {client = "powercord"}

console.log("[moldit] I am on "+ client[0].toUpperCase() + client.slice(1) + ".")
module.exports.req = function(mod) {
    switch(mod) {
        case "injector":
            if (client == "vizality") {
                var vizalityconn = require("@vizality/patcher");
                return {inject: vizalityconn.patch, uninject: vizalityconn.unpatch}
            }
            return require("powercord/injector")
        case "util":
            if (client == "vizality") {
                var vizalityconn = require("@vizality/util");
                return {...vizalityconn, findInReactTree: vizalityconn.react.findInReactTree}
            }
            return require("powercord/util")
        default:
            return require((client == "vizality" ? "@vizality" : "powercord") + "/" + mod)
    }
}

module.exports.MoldSettings = class MolditSettings {
    constructor(_this, id=null) {
        this.obj = _this
        if (typeof(_this.addonId) == "string") {
            id = _this.addonId
        }
        if (_this.state) {
            this.obj = _this
            if (window.vizality) var vzflux = vizality.api.settings._fluxProps(id)
            this.getSetting = window.vizality ? vzflux.getSetting : _this.props.getSetting
            this.updateSetting = window.vizality ? vzflux.updateSetting : _this.props.updateSetting
            this.toggleSetting = window.vizality ? vzflux.toggleSetting : _this.props.toggleSetting
        } else {
            this.obj = _this
            this.get = _this.settings.get
            this.set = _this.settings.set
            this.unregister = client == "powercord" ? powercord.api.settings.unregisterSettings.bind(powercord.api.settings) : () => {}
        }
    }
    register(details) {
        if (window.vizality) {
            this.obj.registerSettings(details.render)
        } else {
            powercord.api.settings.registerSettings("custom-timestamps", {
                category: details.id,
                label: details.label,
                render: details.render,
            });
        }
    }
}