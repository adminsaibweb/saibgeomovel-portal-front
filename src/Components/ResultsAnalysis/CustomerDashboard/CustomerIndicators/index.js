import React, { Component } from 'react';
import { Graph, Indicator, Container, Line, IndicatorsLine } from './style';
import downIndicator from '../../../../assets/images/downindicator.png';
import upIndicator from '../../../../assets/images/upindicator.png';
import { Doughnut } from 'react-chartjs-2';
import Skeleton from 'react-loading-skeleton';
import { formatFloatBr } from '../../../../services/funcoes';

export class CustomerIndicators extends Component {
  state = { globalChartConfig: undefined, selectedIndicator: -1 };
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
    setTimeout(() => {
      this.handleChangeIndicatorGraph();
    }, 500);
  };

  componentWillMountDidUpdate = () => {
    setTimeout(() => {
      this.handleChangeIndicatorGraph();
    }, 500);
  };

  handleMakeGlobalGraph = (indicatorGraph) => {
    // let { indicatorGraph } = this.state;
    //console.log(indicatorGraph);
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

    const config = this.makeConfigChart(
      indicatorGraph.legend,
      indicatorGraph.prior,
      indicatorGraph.value,
      indicatorGraph.priorLabel,
      indicatorGraph.actualLabel,
      indicatorGraph.legend,
      indicatorGraph.legendXLabel,
      indicatorGraph.legendYLabel,
      indicatorGraph.format
    );
    //console.log('config');
    //console.log(config);
    return config;
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
    let globalChartConfig = this.handleMakeGlobalGraph(indicatorGraph);
    // //console.log(globalChartConfig);
    this.setState({ globalChartConfig });
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
            <Graph>
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
                    <div>
                      <h6>{indicator.title}</h6>
                      <p>
                        {indicator.format === '$'
                          ? formatFloatBr(indicator.value)
                          : indicator.format === '%'
                          ? indicator.value + ' %'
                          : indicator.value}{' '}
                      </p>
                    </div>
                    <div style={{ width: '100%', marginTop: 'auto' }}>
                      <div style={{ display: 'flex', flexDirection: 'row' }}>
                        {indicator.change === '+' ? (
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                              minWidth: '100%',
                              justifyContent: 'flex-end',
                            }}
                          >
                            <img
                              src={upIndicator}
                              alt={indicator.title}
                              width={16}
                            />
                            <p style={{ color: '#2980b9', fontWeight: '700' }}>
                              {indicator.percentualValue+ '%'}
                            </p>
                          </div>
                        ) : (
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                              minWidth: '100%',
                              justifyContent: 'flex-end',
                            }}
                          >
                            <img
                              src={downIndicator}
                              alt={indicator.title}
                              width={16}
                            />
                            <p
                              style={{
                                color: 'rgb(192, 57, 43)',
                                fontWeight: '700',
                              }}
                            >
                             {indicator.percentualValue+ '%'}
                            </p>
                          </div>
                        )}
                      </div>
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

export default CustomerIndicators;
