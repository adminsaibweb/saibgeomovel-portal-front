import React, { Component } from 'react';
import {
  Graph,
  GraphTitle,
  GraphTitleGrade,
  GraphGradeTitleItems,
  GraphGradeItems,
  Container,
  Line,
  IndicatorsLine,
  GraphTotalGrade,
  DivDetalhe,
  Linha,
  Labels,
} from './style';
import Skeleton from 'react-loading-skeleton';
import { formatFloatBr } from '../../../../../services/funcoes';
import { Collapsible, CollapsibleItem } from 'react-materialize';

export class ProductIndicators extends Component {
  state = {
    globalChartConfig: undefined,
    selectedIndicatorId: -1,
    selectedIndicator: undefined,
  };

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
    // setTimeout(() => {
    //   this.handleChangeIndicatorGraph();
    // }, 500);
  };

  componentWillMountDidUpdate = () => {
    // setTimeout(() => {
    //   this.handleChangeIndicatorGraph();
    // }, 500);
  };

  handleMakeGlobalGraph = (title, indicatorGraph) => {
    // let { indicatorGraph } = this.state;
    if (
      indicatorGraph === undefined &&
      this.props.data !== undefined &&
      this.props.data.length > 0
    ) {
      indicatorGraph = this.props.data[0];
      this.setState({ indicatorGraph });
    }

    let globalChartTitle = indicatorGraph.title;
    let selectedIndicatorId = parseInt(indicatorGraph.id);
    let selectedIndicator = {
      title,
      indicators: indicatorGraph,
    };
    // //console.log(selectedIndicator);

    this.setState({ globalChartTitle, selectedIndicatorId, selectedIndicator });

    return this.makeConfigChart(
      indicatorGraph.legend,
      indicatorGraph.prior,
      indicatorGraph.actual,
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
    let globalChartConfig = this.handleMakeGlobalGraph(indicatorGraph);
    // //console.log(globalChartConfig);
    this.setState({ globalChartConfig });
  };

  getHeaderProduct = (produto) => {
    return produto.id + ' - ' + produto.product;
  };

  render() {
    const { selectedIndicator } = this.state;
    return (
      <Container>
        {this.props.loading === 1 ? (
          <Line style={{ alignItems: 'inherit' }}>
            <Graph style={{ padding: '20px' }}>
              <Skeleton count={1} height={50} />
              <Skeleton height={200} />
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
            <Graph style={{display: document.getElementsByTagName('body')[0].clientWidth < 768? 'none' : 'flex' }}>
              {selectedIndicator !== undefined ? (
                <>
                  <GraphTitle
                    style={{
                      textTransform: 'capitalize',
                      textAlign: 'center',
                      display:
                        document.getElementsByTagName('body')[0].clientWidth <
                        768
                          ? 'none'
                          : 'flex',
                    }}
                  >
                    {selectedIndicator.title}
                  </GraphTitle>
                  <GraphTitleGrade>
                    <p>{selectedIndicator.indicators.title}</p>
                  </GraphTitleGrade>
                  <GraphGradeTitleItems>
                    <div>
                      <p>{selectedIndicator.indicators.priorLabel}</p>{' '}
                      <small>
                        {selectedIndicator.indicators.percentual + '%'}
                      </small>
                    </div>
                    <div>
                      <p>{selectedIndicator.indicators.actualLabel}</p>{' '}
                      <small>
                        {selectedIndicator.indicators.perc_actual + '%'}
                      </small>
                    </div>
                  </GraphGradeTitleItems>
                  <GraphGradeItems>
                    <p>
                      {selectedIndicator.indicators.format === '$'
                        ? formatFloatBr(selectedIndicator.indicators.prior, '')
                        : this.props.format === '%'
                        ? selectedIndicator.indicators.prior + ' %'
                        : selectedIndicator.indicators.prior}
                    </p>
                    <p>
                      {selectedIndicator.indicators.format === '$'
                        ? formatFloatBr(selectedIndicator.indicators.actual, '')
                        : this.props.format === '%'
                        ? selectedIndicator.indicators.actual + ' %'
                        : selectedIndicator.indicators.actual}
                    </p>
                  </GraphGradeItems>
                  {selectedIndicator.indicators.makeTotal && (
                    <GraphTotalGrade>
                      <p>Total</p>
                      <p>
                        {selectedIndicator.indicators.format === '$'
                          ? formatFloatBr(
                              selectedIndicator.indicators.total,
                              ''
                            )
                          : this.props.format === '%'
                          ? selectedIndicator.indicators.total + ' %'
                          : selectedIndicator.indicators.total}
                      </p>
                    </GraphTotalGrade>
                  )}
                </>
              ) : (
                <h6 style={{ textAlign: 'center' }}>
                  Selecione um dos indicatores
                </h6>
              )}
            </Graph>
            {document.getElementsByTagName('body')[0].clientWidth < 768 ? (
              <>
                <Line style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {this.props.data !== undefined &&
                    this.props.data.map((produto) => (
                      <DivDetalhe className="divDetalhe" style={{width: '100%'}}>
                        <Collapsible
                          className="indicadorRotas"
                          accordion={false}
                          options={{
                            inDuration: '0',
                            outDuration: '0',
                          }}
                          style={{
                            width: '100%',
                            borderStyle: 'none',
                            boxShadow: 'none',
                          }}
                        >
                          <CollapsibleItem
                            key={produto.id}
                            expanded={true}
                            header={this.getHeaderProduct(produto)}
                            node="div"
                          >
                            <Linha style={{justifyContent: 'space-around'}}>
                              {produto.indicators.map((indicator) => (
                                <DivDetalhe
                                  style={{
                                    padding: '2px',
                                    cursor: 'pointer',
                                    border: '1px solid #ccc',
                                    borderRadius: '10px',
                                    margin: '3px',
                                  }}
                                  onClick={() =>
                                    this.handleMakeGlobalGraph(
                                      produto.product.toLowerCase(),
                                      indicator
                                    )
                                  }
                                >
                                  <Linha style={{ cursor: 'pointer' }}>
                                    <Labels
                                      fontWeight={700}
                                      fontSize={0.8}
                                      style={{
                                        cursor: 'pointer',
                                        paddingRight: '2px',
                                      }}
                                    >
                                      {indicator.title}:
                                    </Labels>
                                    <Labels
                                      fontWeight={500}
                                      fontSize={0.8}
                                      style={{
                                        cursor: 'pointer',
                                        paddingRight: '2px',
                                      }}
                                    >
                                      {indicator.format === '$'
                                        ? formatFloatBr(indicator.actual, '')
                                        : this.props.format === '%'
                                        ? indicator.actual + ' %'
                                        : indicator.actual}{' '}
                                    </Labels>
                                  </Linha>
                                </DivDetalhe>
                              ))}
                            </Linha>
                          </CollapsibleItem>
                        </Collapsible>
                      </DivDetalhe>
                    ))}
                </Line>
              </>
            ) : (
              <>
                <IndicatorsLine>
                  <table
                    style={{
                      fontSize: '0.8rem',
                      color: '#858585',
                    }}
                  >
                    <thead
                      style={{
                        fontWeight: '700',
                        width: '100%',
                        top: '-10px',
                        position: 'sticky',
                        backgroundColor: 'white',
                        padding: '10px 0px',
                      }}
                    >
                      <td id="product">Produto</td>
                      <td
                        id="indicator"
                        style={{
                          textAlign: 'right',
                          paddingRight: '10px !important',
                        }}
                      >
                        {document.getElementsByTagName('body')[0].clientWidth <
                        768
                          ? 'Qtd.Vda.'
                          : 'Qtde venda'}
                      </td>
                      <td
                        id="indicator"
                        style={{
                          textAlign: 'right',
                          paddingRight: '10px !important',
                        }}
                      >
                        {document.getElementsByTagName('body')[0].clientWidth <
                        768
                          ? 'Vlr.Vda'
                          : 'Valor venda'}
                      </td>
                      <td
                        id="indicator"
                        style={{
                          textAlign: 'right',
                          paddingRight: '10px !important',
                        }}
                      >
                        {document.getElementsByTagName('body')[0].clientWidth <
                        768
                          ? 'Prc.Méd.'
                          : 'Preço médio'}
                      </td>
                      <td
                        id="indicator"
                        style={{
                          textAlign: 'right',
                          paddingRight: '10px !important',
                        }}
                      >
                        {document.getElementsByTagName('body')[0].clientWidth <
                        768
                          ? 'Qt.Bon.'
                          : 'Qtde bonificação'}
                      </td>
                      <td
                        id="indicator"
                        style={{
                          textAlign: 'right',
                          paddingRight: '10px !important',
                        }}
                      >
                        {document.getElementsByTagName('body')[0].clientWidth <
                        768
                          ? 'Vlr.Bon.'
                          : 'Valor bonificação'}
                      </td>
                      <td
                        id="indicator"
                        style={{
                          textAlign: 'right',
                          paddingRight: '10px !important',
                        }}
                      >
                        Peso
                      </td>
                    </thead>
                    {this.props.data !== undefined &&
                      this.props.data.map((produto) => (
                        <tr
                          key={produto.id}
                          style={{
                            backgroundColor:
                              produto.counter % 2 !== 0
                                ? 'rgb(223, 178, 251)'
                                : 'white',
                          }}
                        >
                          <td
                            id="product"
                            style={{
                              textTransform: 'capitalize',
                              fontWeight: '700',
                            }}
                          >
                            {produto.product !== undefined &&
                              produto.product.toLowerCase()}
                          </td>
                          {produto.indicators.map((indicator) => (
                            <td
                              id="indicator"
                              style={{
                                textAlign: 'right',
                                cursor: 'pointer',
                                fontWeight: '700',
                              }}
                              onClick={() =>
                                this.handleMakeGlobalGraph(
                                  produto.product.toLowerCase(),
                                  indicator
                                )
                              }
                            >
                              {indicator.format === '$'
                                ? formatFloatBr(indicator.actual, '')
                                : this.props.format === '%'
                                ? indicator.actual + ' %'
                                : indicator.actual}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </table>
                </IndicatorsLine>
              </>
            )}
          </Line>
        )}
      </Container>
    );
  }
}

export default ProductIndicators;
