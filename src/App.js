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
import { Snackbar } from "rmwc/Snackbar";
import { Card } from "rmwc/Card";
import { Typography } from "rmwc/Typography";
import { SizeMe } from "react-sizeme";
import "@material/typography/dist/mdc.typography.css";
import "@material/top-app-bar/dist/mdc.top-app-bar.css";
import "@material/card/dist/mdc.card.css";
import "@material/snackbar/dist/mdc.snackbar.css";
import "@material/fab/dist/mdc.fab.css";
import "./App.css";

export type FlameGraphData = {|
  name: string,
  value: number,
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
    value: pyinstrumentOutput.time
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
  errorMessage: string | null
|};

class App extends Component<Props, State> {
  state = {
    data: null,
    errorMessage: null
  };

  dropzone = React.createRef();

  handleDropAccepted = async (files: File[]) => {
    const [file] = files;
    let rawInstrumentOutput: string;
    let pyinstrumentOutput: PyinstrumentOutput;
    let data: FlameGraphData;
    /** @todo use snack bar */
    try {
      rawInstrumentOutput = await readFileAsText(file);
    } catch (error) {
      this.setState({ errorMessage: "Failed to read provided file" });
      return;
    }
    try {
      pyinstrumentOutput = JSON.parse(rawInstrumentOutput);
    } catch (error) {
      this.setState({ errorMessage: "Provided file is not a valid JSON file" });
      return;
    }
    try {
      data = mapPyinstrumentOutputToData(pyinstrumentOutput);
    } catch (error) {
      this.setState({
        errorMessage: "Provided JSON file is not a valid trace output file"
      });
      return;
    }
    this.setState({ data });
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

  render() {
    const { data, errorMessage } = this.state;
    return (
      <div className="App">
        <TopAppBar fixed>
          <TopAppBarRow>
            <TopAppBarSection alignStart>
              <TopAppBarTitle>Python Flame Chart</TopAppBarTitle>
            </TopAppBarSection>
            <TopAppBarSection alignEnd>
              <TopAppBarActionItem onClick={this.handleUploadButtonClick}>
                file_upload
              </TopAppBarActionItem>
            </TopAppBarSection>
          </TopAppBarRow>
        </TopAppBar>
        <SizeMe monitorHeight>
          {({ size }) => (
            <main>
              {/** @todo allow reuploading */}
              <Dropzone
                className="Dropzone"
                activeClassName="active"
                onDropAccepted={this.handleDropAccepted}
                ref={this.dropzone}
                disableClick
              >
                {data === null ? (
                  <div className="helper" onClick={this.openUploadDialog}>
                    <Typography use="subtitle1">
                      Drop trace file here
                    </Typography>
                    <Typography use="body2">Or click to select</Typography>
                  </div>
                ) : (
                  <FlameGraph
                    data={data}
                    height={size.height}
                    width={size.width}
                  />
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
