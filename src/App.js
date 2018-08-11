// @flow

import React, { Component } from "react";
import { FlameGraph } from "react-flame-graph";
import Dropzone from "react-dropzone";
import {
  TopAppBar,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
  TopAppBarActionItem
} from "rmwc/TopAppBar";
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogFooter,
  DialogFooterButton,
  DialogBackdrop
} from "rmwc/Dialog";
import { Snackbar } from "rmwc/Snackbar";
import { Card } from "rmwc/Card";
import { Typography } from "rmwc/Typography";
import { SizeMe } from "react-sizeme";
import Help from "./Help";
import "@material/typography/dist/mdc.typography.css";
import "@material/top-app-bar/dist/mdc.top-app-bar.css";
import "@material/card/dist/mdc.card.css";
import "@material/snackbar/dist/mdc.snackbar.css";
import "@material/dialog/dist/mdc.dialog.css";
import "@material/button/dist/mdc.button.css";
import "./App.css";

export type FlameGraphData = {|
  name: string,
  value: number,
  tooltip?: string,
  children?: Array<FlameGraphData>
|};

type PyinstrumentOutput = {|
  function: string,
  file_path: string,
  line_no: number,
  time: number,
  children: PyinstrumentOutput[]
|};

function mapPyinstrumentOutputToData(
  pyinstrumentOutput: PyinstrumentOutput
): FlameGraphData {
  const data: FlameGraphData = {
    name: pyinstrumentOutput.function,
    value: pyinstrumentOutput.time,
    tooltip: `${pyinstrumentOutput.time.toFixed(2)}ms ${
      pyinstrumentOutput.function
    }`
  };
  if (pyinstrumentOutput.children.length > 0) {
    data.children = pyinstrumentOutput.children.map(
      mapPyinstrumentOutputToData
    );
  }
  return data;
}

type FileReaderProgressEvent = { target: FileReader };

function readFileAsText(file: File): Promise<string> {
  const fileReader = new FileReader();
  const promise = new Promise((resolve, reject) => {
    fileReader.onload = (event: FileReaderProgressEvent) => {
      resolve(event.target.result);
    };
    fileReader.onerror = (event: FileReaderProgressEvent) => {
      reject(event.target.error);
    };
  });
  fileReader.readAsText(file);
  // $FlowFixMe
  return promise;
}

const RIPPLE_ANIMATION_DURATION = 200;

type Props = {||};

type State = {|
  data: FlameGraphData | null,
  errorMessage: string | null,
  tutorialShown: boolean
|};

const setQuery = (partialQuery: {
  [key: string | number]: string | number | boolean
}) => {
  const nextQuery = { ...partialQuery, ...partialQuery };
  const nextURL = `?${String(new URLSearchParams(nextQuery))}`;
  window.history.pushState({}, "", nextURL);
};

class App extends Component<Props, State> {
  state = {
    data: null,
    errorMessage: null,
    tutorialShown: false
  };

  dropzone = React.createRef();

  handleRawPyinstrumentOutput = (rawPyinstrumentOutput: string) => {
    let pyinstrumentOutput: PyinstrumentOutput;
    let data: FlameGraphData;
    try {
      pyinstrumentOutput = JSON.parse(rawPyinstrumentOutput);
    } catch (error) {
      this.setState({ errorMessage: "Provided data is not a valid JSON" });
      return;
    }
    try {
      data = mapPyinstrumentOutputToData(pyinstrumentOutput);
    } catch (error) {
      this.setState({
        errorMessage: "Provided JSON data is not a valid trace output"
      });
      return;
    }
    setQuery({ data: encodeURIComponent(JSON.stringify(data)) });
    this.setState({ data });
  };

  componentDidMount() {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has("data")) {
      const encodedRawData = searchParams.get("data");
      const rawData = decodeURIComponent(encodedRawData);
      let data: FlameGraphData;
      try {
        data = JSON.parse(rawData);
      } catch (error) {
        this.setState({
          errorMessage: "Provided data is not a valid JSON"
        });
        return;
      }
      this.setState({ data });
    }
    // $FlowFixMe
    document.addEventListener("paste", event => {
      const rawPyinstrumentOutput = event.clipboardData.getData("text");
      this.handleRawPyinstrumentOutput(rawPyinstrumentOutput);
    });
  }

  handleDropAccepted = async (files: File[]) => {
    const [file] = files;
    let rawPyinstrumentOutput: string;
    try {
      rawPyinstrumentOutput = await readFileAsText(file);
    } catch (error) {
      this.setState({ errorMessage: "Failed to read provided data" });
      return;
    }
    this.handleRawPyinstrumentOutput(rawPyinstrumentOutput);
  };

  openUploadDialog = () => {
    if (this.dropzone.current) {
      this.dropzone.current.open();
    } else {
      this.setState({
        errorMessage: "Upload is not available"
      });
    }
  };

  handleUploadButtonClick = () => {
    // Opening the upload dialog is delayed because opening upload dialog is
    // synchronous. requestAnimationFrame() won't do because then the browser will
    // ignore the dialog request.
    setTimeout(this.openUploadDialog, RIPPLE_ANIMATION_DURATION);
  };

  handleSnackbarHide = () => {
    this.setState({ errorMessage: null });
  };

  showTutorial = () => {
    this.setState({ tutorialShown: true });
  };

  hideTutorial = () => {
    this.setState({ tutorialShown: false });
  };

  render() {
    const { data, errorMessage, tutorialShown } = this.state;
    const hasData = Boolean(data);
    return (
      <div className="App">
        <TopAppBar fixed prominent={!hasData}>
          <TopAppBarRow>
            <TopAppBarSection alignStart>
              <TopAppBarTitle>Python Flame Chart</TopAppBarTitle>
            </TopAppBarSection>
            <TopAppBarSection alignEnd>
              {hasData && (
                <TopAppBarActionItem onClick={this.showTutorial}>
                  help
                </TopAppBarActionItem>
              )}
              <TopAppBarActionItem onClick={this.handleUploadButtonClick}>
                file_upload
              </TopAppBarActionItem>
            </TopAppBarSection>
          </TopAppBarRow>
        </TopAppBar>
        <SizeMe monitorHeight>
          {({ size }: { size: { width: number, height: number } }) => (
            <main>
              <Dropzone
                className="Dropzone"
                activeClassName="active"
                onDropAccepted={this.handleDropAccepted}
                ref={this.dropzone}
                disableClick
              >
                {data === null ? (
                  <Card className="helper">
                    <Help openUploadDialog={this.handleUploadButtonClick} />
                  </Card>
                ) : (
                  Boolean(size.height && size.width) && (
                    <FlameGraph
                      data={data}
                      height={size.height}
                      width={size.width}
                    />
                  )
                )}
                <div className="drop-highlight">
                  <Card className="drop-helper">
                    <Typography use="body2">Drop trace file</Typography>
                  </Card>
                </div>
              </Dropzone>
            </main>
          )}
        </SizeMe>
        <Dialog open={tutorialShown} onClose={this.hideTutorial}>
          <DialogSurface>
            <DialogBody>
              <Help openUploadDialog={this.handleUploadButtonClick} />
            </DialogBody>
            <DialogFooter>
              <DialogFooterButton onClick={this.hideTutorial}>
                Close
              </DialogFooterButton>
            </DialogFooter>
          </DialogSurface>
          <DialogBackdrop />
        </Dialog>
        <Snackbar
          show={Boolean(errorMessage)}
          message={errorMessage}
          onHide={this.handleSnackbarHide}
        />
      </div>
    );
  }
}

export default App;
