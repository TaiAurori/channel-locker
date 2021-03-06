/* Copyright (C) 2021 TaiAurori (Gabriel Sylvain) - All Rights Reserved
 * (Some code from TheShadowGamer)
 * You may use, distribute and modify this code under the
 * terms of the MIT license.
 * Basically, you can change and redistribute this code
 * but this copyright notice must remain unmodified.
 */

var settings;

const textareaNotice = require("./components/textareaNotice.jsx");
const { Plugin } = require("powercord/entities");
const { getModule, getModuleByDisplayName, React } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { Icon } = require("powercord/components");
var rerenderTextarea;
var toggleLocked;
var toggleLockedGlobal;

class TextareaWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }
  componentDidMount() {
    rerenderTextarea = (() => {this.setState({})}).bind(this)
  }
  render() {
  	if (settings.get("lockedGlobal", false)) {
      return React.createElement(
        textareaNotice,
        { button: "Unlock", onClick: () => {toggleLockedGlobal()} },
        "You currently have the text area locked. Unlock it to speak."
      );    
  	} else {
	    if (settings.get("lockedChannels", {})[this.props.args[0].channel.id]) {
	      return React.createElement(
	        textareaNotice,
	        { button: "Unlock", onClick: () => {toggleLocked(this.props.args[0].channel.id)} },
	        "You currently have this channel locked. Unlock this channel to speak in it."
	      );      
	    }
    }
    return this.props.textarea;
    
  }
}

const plugin = class ChannelLocker extends Plugin {
  startPlugin() {
    settings = this.settings
    toggleLocked = this.toggleLocked.bind(this);
    toggleLockedGlobal = this.toggleLockedGlobal.bind(this);
    this.initInject();
  }

  async initInject() {
    const classes = await getModule([ 'iconWrapper', 'clickable' ]);
    const HeaderBarContainer = await getModuleByDisplayName('HeaderBarContainer')
    const TextArea = await getModuleByDisplayName("SlateChannelTextArea");
    const TextAreaContainer = getModule(
      (m) => m.type && m.type.render && m.type.render.displayName === "ChannelTextAreaContainer", false
    );
    inject("channel-locker-header-button", HeaderBarContainer.prototype, "render", (args, res) => {
      if (res.props.children[1].key) {
	      if (!res.props.toolbar) {
	        res.props.toolbar = React.createElement(React.Fragment, { children: [] });
	      }
	      let isLocked = settings.get("lockedChannels", {})[res.props.children[1].key];
	      res.props.toolbar.props.children.push(
	        React.createElement(HeaderBarContainer.Icon, {
	          onClick: () => this.toggleLockedGlobal(),
	          icon: () => React.createElement(Icon, {
	            className: classes.icon,
	            name: 'LockClosed',
	          }),
	          tooltip: "Toggle Global Lock"
	        }),
	      )
	      res.props.toolbar.props.children.push(
	        React.createElement(HeaderBarContainer.Icon, {
	          onClick: () => this.toggleLocked(res.props.children[1].key),
	          icon: () => React.createElement(Icon, {
	            className: classes.icon,
	            name: 'ChannelText',
	          }),
	          tooltip: "Toggle Channel Lock"
	        }),
	      )
      }
      return res;
    });
    inject("channel-locker-text-area", TextAreaContainer.type, "render", (args, res) => {
      return React.createElement(TextareaWrapper, {textarea: res, args: args});
    });
  }

  toggleLocked(channelId) {
    let locked = settings.get("lockedChannels", {});
    locked[channelId] = !locked[channelId];
    settings.set("lockedChannels", locked);
    rerenderTextarea();
  }

  toggleLockedGlobal() {
    let locked = settings.get("lockedGlobal", false);
    settings.set("lockedGlobal", !locked);
    rerenderTextarea()
  }

  pluginWillUnload() {
    uninject("channel-locker-header-button");
    uninject("channel-locker-text-area");
  };
};
module.exports = plugin
