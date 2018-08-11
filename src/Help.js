// @flow

import React, { Component } from "react";
import { TabBar, Tab } from "rmwc/Tabs";
import Typography from "rmwc/Typography";
import { Button, ButtonIcon } from "rmwc/Button";
import { writeTextToClipboard } from "./util";
import pcPaste from "./PC-paste.svg";
import macOSPaste from "./macOS-paste.svg";
import "@material/typography/dist/mdc.typography.css";
import "@material/tabs/dist/mdc.tabs.css";
import "@material/button/dist/mdc.button.css";
import "./Help.css";

type Props = { openUploadDialog: () => void };
type State = { activeTabIndex: number };

class Help extends Component<Props, State> {
  state = { activeTabIndex: 0 };

  handleTabBarChange = (
    event: Event & { detail: { activeTabIndex: number } }
  ) => {
    this.setState({ activeTabIndex: event.detail.activeTabIndex });
  };

  blockClick = (event: MouseEvent) => {
    event.stopPropagation();
  };

  getCommands = (): ?string => {
    const { activeTabIndex } = this.state;
    switch (activeTabIndex) {
      case 0: {
        return `pip install --upgrade pyinstrument;
python -m pyinstrument script.py --renderer json | pbcopy;`;
      }
      case 1: {
        return `pip install --upgrade pyinstrument;
python -m pyinstrument script.py --renderer json | xclip -sel clip;`;
      }
      case 2: {
        return `pip install --upgrade pyinstrument;
python -m pyinstrument script.py --renderer json | clip;`;
      }
      default: {
        /* should never get here */
        break;
      }
    }
  };

  copyCommands = () => {
    writeTextToClipboard(this.getCommands());
  };

  render() {
    const { openUploadDialog } = this.props;
    const { activeTabIndex } = this.state;

    return (
      <div className="Help">
        <div onClick={this.blockClick}>
          <TabBar
            activeTabIndex={activeTabIndex}
            onChange={this.handleTabBarChange}
          >
            <Tab>Mac OS</Tab>
            <Tab>Linux</Tab>
            <Tab>Windows</Tab>
          </TabBar>
        </div>
        <Typography use="body" tag="p">
          Run in your terminal
        </Typography>
        <div className="code-example">
          <Button onClick={this.copyCommands}>
            <ButtonIcon use="file_copy" />
            Copy
          </Button>
          <pre>
            <code>{this.getCommands()}</code>
          </pre>
        </div>
        <Typography use="body" tag="p">
          Print with your keyboard
        </Typography>
        <img
          className="paste-graphic"
          src={activeTabIndex === 0 ? macOSPaste : pcPaste}
        />
        <Typography use="body" tag="p">
          Or drop trace file or{" "}
          <Button onClick={openUploadDialog}>click to select</Button>
        </Typography>
      </div>
    );
  }
}

export default Help;
