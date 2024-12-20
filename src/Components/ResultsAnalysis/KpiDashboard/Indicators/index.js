import React, { Component } from 'react';
import { Graph, Indicator, Container, Line, IndicatorsLine } from './style';
import { Doughnut } from 'react-chartjs-2';
import Skeleton from 'react-loading-skeleton';
import { formatFloatBr } from '../../../../services/funcoes';
import { ComponentsHomeContext } from '../../../../providers/componentsHome';

export class KpiIndicators extends Component {
  static contextType = ComponentsHomeContext
  state = { globalChartConfig: undefined, selectedIndicator: -1, myTimeout: undefined };
  makeConfigChart = (
    indicator,
    priorData,
    actualData,
    priorLabel,
    actualLabel,
    legend,
    legendXLabel,
    legendYLabel,
    format
  ) => {
    const data = {
      labels: [priorLabel, actualLabel],
      datasets: [
        {
          data: [priorData, actualData],
          backgroundColor: ['rgb(189, 32, 123)', 'rgb(97, 9, 138)'],
          hoverBackgroundColor: ['rgb(189, 32, 123)', 'rgb(97, 9, 138)'],
        },
      ],
    };
    return data;
  };

  componentDidMount = () => {
    const myTimeout = setTimeout(() => {
      this.handleChangeIndicatorGraph();
    }, 500);
    this.setState({ myTimeout })
  };

  componentWillMountDidUpdate = () => {
    const myTimeout = setTimeout(() => {
      this.handleChangeIndicatorGraph();
    }, 500);
    this.setState({ myTimeout })
  };

  componentWillUnmount = () => {
    let { myTimeout } = this.state;
    clearTimeout(myTimeout);
  };

  handleMakeGlobalGraph = (indicatorGraph) => {
    const { setActiveActivity } = this.context
    setActiveActivity(true)
    if (
      indicatorGraph === undefined &&
      this.props.data !== undefined &&
      this.props.data.length > 0
    ) {
      indicatorGraph = this.props.data[0];
      this.setState({ indicatorGraph });
    }

    let globalChartTitle = indicatorGraph.title;
    let selectedIndicator = parseInt(indicatorGraph.id);

    this.setState({ globalChartTitle, selectedIndicator });

    setActiveActivity(false)
    return this.makeConfigChart(
      indicatorGraph.legend,
      indicatorGraph.anterior,
      indicatorGraph.atual,
      indicatorGraph.priorLabel,
      indicatorGraph.actualLabel,
      indicatorGraph.legend,
      indicatorGraph.legendXLabel,
      indicatorGraph.legendYLabel,
      indicatorGraph.format
    );
  };

  handleMakeGlobalGraphTitle = (indicatorGraph) => {
    // let { indicatorGraph } = this.state;
    // if (
    //   indicatorGraph === undefined &&
    //   this.props.data !== undefined &&
    //   this.props.data.length > 0
    // ) {
    //   indicatorGraph = this.props.data[0];
    //   this.setState({ indicatorGraph });
    // }
    return indicatorGraph.title;
  };

  handleChangeIndicatorGraph = (indicatorGraph) => {
    const { setActiveActivity } = this.context
    setActiveActivity(true)
    let globalChartConfig = this.handleMakeGlobalGraph(indicatorGraph);
    // //console.log(globalChartConfig);
    this.setState({ globalChartConfig });
    setActiveActivity(false)
  };

  render() {
    const {
      globalChartConfig,
      globalChartTitle,
      selectedIndicator,
    } = this.state;
    return (
      <Container>
        {this.props.loading === 1 ? (
          <Line style={{ alignItems: 'inherit' }}>
            <Graph style={{ padding: '20px' }}>
              <Skeleton count={1} height={50} />
              <Skeleton circle={true} height={200} width={200} />
            </Graph>
            <IndicatorsLine
              style={{ width: '100%' }}
              loading={this.props.loading ? 1 : 0}
            >
              <Skeleton count={10} />
            </IndicatorsLine>
          </Line>
        ) : (
          <Line>
            <Graph className="graph">
              {<h6>{globalChartTitle !== undefined && globalChartTitle}</h6>}
              {globalChartConfig !== undefined && (
                <Doughnut
                  data={globalChartConfig}
                  id="globalChart"
                  options={{
                    maintainAspectRatio: true,
                  }}
                />
              )}
            </Graph>
            <IndicatorsLine>
              {this.props.data !== undefined &&
                this.props.data.map((indicator) => (
                  <Indicator
                    key={indicator.id}
                    onClick={() => this.handleChangeIndicatorGraph(indicator)}
                    selected={indicator.id === selectedIndicator}
                  >
                    <div
                      style={{
                        width: '100%',
                        alignItems: 'stretch',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <h6>{indicator.title}</h6>
                      <h5>
                        {indicator.format === '$'
                          ? formatFloatBr(indicator.atual, '')
                          : indicator.format === '%'
                          ? indicator.atual + ' %'
                          : indicator.atual}
                      </h5>
                    </div>
                  </Indicator>
                ))}
            </IndicatorsLine>
          </Line>
        )}
      </Container>
    );
  }
}

export default KpiIndicators;
