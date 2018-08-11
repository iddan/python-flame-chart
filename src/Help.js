// @flow

import React, { Component } from "react";
import { TabBar, Tab } from "rmwc/Tabs";
import Typography from "rmwc/Typography";
import Button from "rmwc/Button";
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
          {activeTabIndex === 0 && (
            <pre>
              <code>
                python -m pyinstrument script.py --renderer json | pbcopy;
              </code>
            </pre>
          )}
          {activeTabIndex === 1 && (
            <pre>
              <code>
                python -m pyinstrument script.py --renderer json | xclip -sel
                clip;
              </code>
            </pre>
          )}
          {activeTabIndex === 2 && (
            <pre>
              <code>
                python -m pyinstrument script.py --renderer json | clip;
              </code>
            </pre>
          )}
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
