import React, { useRef, useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';

/**
 * Create the Protein-Drug Beta/p-value plot
 */
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataArray: [],
      dataLoaded: false,
    };
  }
  /**
   * Get necessary data for the plot from the server
   */
  componentDidMount() {
    axios.get("http://localhost:8000/biomarkers/")
      .then(response => {
        this.setState({ dataArray: response.data, dataLoaded: true });
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }
  /**
   * Handle click on node in the plot
   * @param {*} event 
   */
  handleClick = (event) => {
    if (event.points && event.points.length > 0) {
      const clickedPointIndex = event.points[0].pointNumber;
      const dataArray = this.state.dataArray;

      if (dataArray && dataArray.length > 0) {
        const uidsArray = dataArray[0].uids[clickedPointIndex]; 
        this.props.getElementName(dataArray[0].name[clickedPointIndex]);
        this.props.getElementUid(uidsArray);
      }
    }
  }


  render() {
    const { dataArray, dataLoaded } = this.state;

    if (!dataLoaded) {
      return <div>Loading...</div>; // Render a loading indicator if data is not yet loaded
    }

    const plotData = dataArray[0] ? [{
      x: dataArray[0].beta,
      y: dataArray[0].pval,
      uids: dataArray[0].uids,
      mode: 'markers',
      type: 'scattergl',
      name: '-',
      text: dataArray[0].name,
      marker: {
        colorscale: 'Viridis',
        color: '#99B5D0',
        opacity: 0.7,
      }
    }, {
      x: dataArray[1].beta,
      y: dataArray[1].pval,
      uids: dataArray[1].uids,
      mode: 'markers',
      type: 'scattergl',
      name: '1',
      text: dataArray[1].name,
      marker: {
        colorscale: 'Viridis',
        color: '#A3A3A3',
        opacity: 0.7,
      }
    },
    {
      x: dataArray[2].beta,
      y: dataArray[2].pval,
      uids: dataArray[2].uids,
      mode: 'markers',
      type: 'scattergl',
      name: '2',
      text: dataArray[2].name,
      marker: {
        colorscale: 'Viridis',
        color: '#AFAFAF',
        opacity: 0.7,
      }
    },
    {
      x: dataArray[3].beta,
      y: dataArray[3].pval,
      uids: dataArray[3].uids,
      mode: 'markers',
      type: 'scattergl',
      name: '3',
      text: dataArray[3].name,
      marker: {
        colorscale: 'Viridis',
        color: '#BDBDBF',
        opacity: 0.7,
      }
    }
      ,
    {
      x: dataArray[4].beta,
      y: dataArray[4].pval,
      uids: dataArray[4].uids,
      mode: 'markers',
      type: 'scattergl',
      name: '4',
      text: dataArray[4].name,
      marker: {
        colorscale: 'Viridis',
        color: '#CECECE',
        opacity: 0.7,
      }
    }
      ,
    {
      x: dataArray[5].beta,
      y: dataArray[5].pval,
      uids: dataArray[5].uids,
      mode: 'markers',
      type: 'scattergl',
      name: '5+',
      text: dataArray[5].name,
      marker: {
        colorscale: 'Viridis',
        color: '#D8DAD9',
        opacity: 0.7,
      }
    }
      ,
    {
      x: dataArray[6].beta,
      y: dataArray[6].pval,
      uids: dataArray[6].uids,
      mode: 'markers',
      type: 'scattergl',
      name: 'T',
      text: dataArray[6].name,
      marker: {
        colorscale: 'Viridis',
        color: '#E6B7A2',
        opacity: 0.7,
      }
    }
    ] : [];

    const layout = {
      width: 800,
      height: 600,
      xaxis: {
        title: 'Beta',
      },
      yaxis: {
        title: 'P-value (-log10)',
      },
      legend: {
        tracegroupgap: 20,
      },
      plot_bgcolor: 'transparent',
      paper_bgcolor: '#F5F5F5'
    };

    const config = {
      scrollZoom: true,
      displayModeBar: false,
    };

    return (
      <div>
        <Plot
          data={plotData}
          layout={layout}
          config={config}
          onClick={this.handleClick}
        />
      </div>
    );
  }
}

export default App;