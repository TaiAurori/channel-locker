/* Copyright (C) 2021 TaiAurori (Gabriel Sylvain) - All Rights Reserved
 * (Some code from TheShadowGamer)
 * You may use, distribute and modify this code under the
 * terms of the MIT license.
 * Basically, you can change and redistribute this code
 * but this copyright notice must remain unmodified.
 */

const { MoldSettings, req } = require("./modules/moldit.js");
var settings;

const textareaNotice = require("./components/textareaNotice.jsx");
const { Plugin } = req("entities");
const { getModule, getModuleByDisplayName, React } = req('webpack');
const { inject, uninject } = req('injector');
const { Icon } = req("components");
var rerenderTextarea;
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
    if (settings.get("lockedChannels", {})[this.props.args[0].channel.id]) {
      return React.createElement(
        textareaNotice,
        { button: "Unlock", onClick: () => {toggleLockedGlobal(this.props.args[0].channel.id)} },
        "You currently have this channel locked. Unlock this channel to speak in it."
      );      
    }
    return this.props.textarea;
  }
}

const plugin = class ChannelLocker extends Plugin {
  startPlugin() {
    settings = new MoldSettings(this);
    toggleLockedGlobal = this.toggleLocked.bind(this);
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
      if (!res.props.toolbar) {
        res.props.toolbar = React.createElement(React.Fragment, { children: [] });
      }
      let isLocked = settings.get("lockedChannels", {})[res.props.children[1].key];
      res.props.toolbar.props.children.push(
        React.createElement(HeaderBarContainer.Icon, {
          onClick: () => this.toggleLocked(res.props.children[1].key),
          icon: () => React.createElement(Icon, {
            className: classes.icon,
            name: 'LockClosed',
          }),
          tooltip: "Toggle Channel Lock"
        }),
      )
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

  pluginWillUnload() {
    uninject("channel-locker-header-button");
    uninject("channel-locker-text-area");
  };

  start() {this.startPlugin()}
  stop() {this.pluginWillUnload()}
};
module.exports = plugin