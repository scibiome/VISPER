import React from "react";
import "./UploadProgressBar.css";
import { ProgressBar, Step } from "react-step-progress-bar";
/**
 * Controls the progress bar of the upload steps
 */
class UploadProgressBar extends React.Component {
  render() {
    var stepNumber = this.props.stepNumber;
    var stepPercentage = 0;
    if(stepNumber === 1){
        stepPercentage = 0;
    }else if (stepNumber === 2){
        stepPercentage = 25;
    }else if (stepNumber === 3){
      stepPercentage = 50;
    }else if (stepNumber === 4){
      stepPercentage = 75;
    }else if (stepNumber === 5){
      stepPercentage = 100;
    }
    return (

      <ProgressBar
        percent={stepPercentage}
      >
  <Step>
    {({ accomplished, index }) => (
      <div
        className={`indexedStep ${accomplished ? "accomplished" : null}`}
      >
        {index + 1}
      </div>
    )}
  </Step>
  <Step>
    {({ accomplished, index }) => (
      <div
        className={`indexedStep ${accomplished ? "accomplished" : null}`}
      >
        {index + 1}
      </div>
    )}
  </Step>
  <Step>
    {({ accomplished, index }) => (
      <div
        className={`indexedStep ${accomplished ? "accomplished" : null}`}
      >
        {index + 1}
      </div>
    )}
  </Step>
  <Step>
    {({ accomplished, index }) => (
      <div
        className={`indexedStep ${accomplished ? "accomplished" : null}`}
      >
        {index + 1}
      </div>
    )}
  </Step>
  <Step>
    {({ accomplished, index }) => (
      <div
        className={`indexedStep ${accomplished ? "accomplished" : null}`}
      >
        {index + 1}
      </div>
    )}
  </Step>
      </ProgressBar>
    );
    }
}
export default UploadProgressBar;
