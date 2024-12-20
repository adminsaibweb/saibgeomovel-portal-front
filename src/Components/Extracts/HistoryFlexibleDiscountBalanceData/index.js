import React, { Component } from 'react';
import {
  Container,
  Line,
  IndicatorsLine,
  DivDetalhe,
  Linha,
  Labels,
} from './style';
import Skeleton from 'react-loading-skeleton';
// import { currencyFormat } from '../../../../services/funcoes';
import { Icon, Collapsible, CollapsibleItem } from 'react-materialize';
import ReactToPrint from 'react-to-print';
import ReportHeader from '../../System/ReportHeader';
// import './forced.css';

export class HistoryFlexibleDiscountBalanceData extends Component {
  state = {
    data: undefined,
    changedFilter: 0,
    loading: 1,
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
    // this.handleAllDataUpdate();
  };

  handleAllDataUpdate = () => {
    let { data, changedFilter } = this.state;
    // //console.log('data local');
    data = this.props.data;
    // //console.log(data);
    let counter = 0;
    for (const dataItem of data) {
      dataItem.counter = counter;
      counter += 1;
    }
    changedFilter += 1;

    this.setState({ data, changedFilter, loading: 0 });
  };

  componentDidUpdate = () => {
    let { changedFilter } = this.state;
    if (this.props.changedFilter !== changedFilter) {
      this.setState({ loading: 1, data: undefined });
      // //console.log('atualizando');
      this.handleAllDataUpdate();
    }
  };

  getHeader = (data) => {
    return data.DESC_ROTA + ' - ' + data.DATA;
  };
  render() {
    const { data, loading } = this.state;
    return (
      <Container>
        {this.props.loading === 1 || loading === 1 ? (
          <>
            <div style={{ width: '100%' }}>
              <Skeleton height={30} />
            </div>
            <div style={{ width: '100%' }}>
              <Skeleton count={1} height={20} />
            </div>
            <div style={{ width: '100%', height: '20px' }}></div>
            <div style={{ width: '100%' }}>
              <Skeleton count={10} />
            </div>
          </>
        ) : (
          <>
            {document.getElementsByTagName('body')[0].clientWidth < 768 ? (
              <>
                <Line style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {data !== undefined &&
                    data.map((dataItem) => (
                      <DivDetalhe
                        className="divDetalhe"
                        style={{ width: '100%' }}
                      >
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
                            key={dataItem.CODIGO}
                            expanded={true}
                            header={this.getHeader(dataItem)}
                            node="div"
                          >
                            <Linha style={{ justifyContent: 'space-around' }}>
                              <DivDetalhe
                                style={{
                                  padding: '2px',
                                  border: '1px solid #ccc',
                                  borderRadius: '10px',
                                  margin: '3px',
                                }}
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
                                    Hr. rota
                                  </Labels>
                                  <Labels
                                    fontWeight={500}
                                    fontSize={0.8}
                                    style={{
                                      cursor: 'pointer',
                                      paddingRight: '2px',
                                    }}
                                  >
                                    {dataItem.DATA_PDA}
                                  </Labels>
                                </Linha>
                              </DivDetalhe>
                              <DivDetalhe
                                style={{
                                  padding: '2px',
                                  border: '1px solid #ccc',
                                  borderRadius: '10px',
                                  margin: '3px',
                                }}
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
                                    Hr. sistema
                                  </Labels>
                                  <Labels
                                    fontWeight={500}
                                    fontSize={0.8}
                                    style={{
                                      cursor: 'pointer',
                                      paddingRight: '2px',
                                    }}
                                  >
                                    {dataItem.DATA_SISTEMA}
                                  </Labels>
                                </Linha>
                              </DivDetalhe>
                              <DivDetalhe
                                style={{
                                  padding: '2px',
                                  border: '1px solid #ccc',
                                  borderRadius: '10px',
                                  margin: '3px',
                                }}
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
                                    Operação
                                  </Labels>
                                  <Labels
                                    fontWeight={500}
                                    fontSize={0.8}
                                    style={{
                                      cursor: 'pointer',
                                      paddingRight: '2px',
                                    }}
                                  >
                                    {dataItem.OPERACAO}
                                  </Labels>
                                </Linha>
                              </DivDetalhe>
                              <DivDetalhe
                                style={{
                                  padding: '2px',
                                  border: '1px solid #ccc',
                                  borderRadius: '10px',
                                  margin: '3px',
                                }}
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
                                    Valor. op.
                                  </Labels>
                                  <Labels
                                    fontWeight={500}
                                    fontSize={0.8}
                                    style={{
                                      cursor: 'pointer',
                                      paddingRight: '2px',
                                    }}
                                  >
                                    {dataItem.VALOR}
                                  </Labels>
                                </Linha>
                              </DivDetalhe>
                              <DivDetalhe
                                style={{
                                  padding: '2px',
                                  border: '1px solid #ccc',
                                  borderRadius: '10px',
                                  margin: '3px',
                                }}
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
                                    Valor atual
                                  </Labels>
                                  <Labels
                                    fontWeight={500}
                                    fontSize={0.8}
                                    style={{
                                      cursor: 'pointer',
                                      paddingRight: '2px',
                                    }}
                                  >
                                    {dataItem.VALOR_ATUAL}
                                  </Labels>
                                </Linha>
                              </DivDetalhe>
                              <DivDetalhe
                                style={{
                                  padding: '2px',
                                  border: '1px solid #ccc',
                                  borderRadius: '10px',
                                  margin: '3px',
                                  display: dataItem.CLIENTE != null ? 'flex' : 'none',
                                }}
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
                                    Cliente
                                  </Labels>
                                  <Labels
                                    fontWeight={500}
                                    fontSize={0.8}
                                    style={{
                                      cursor: 'pointer',
                                      paddingRight: '2px',
                                    }}
                                  >
                                    {dataItem.CLIENTE}
                                  </Labels>
                                </Linha>
                              </DivDetalhe>
                              <DivDetalhe
                                style={{
                                  padding: '2px',
                                  border: '1px solid #ccc',
                                  borderRadius: '10px',
                                  margin: '3px',
                                  display: dataItem.CLIENTE != null ? 'flex' : 'none',
                                }}
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
                                    Cli. nome
                                  </Labels>
                                  <Labels
                                    fontWeight={500}
                                    fontSize={0.8}
                                    style={{
                                      cursor: 'pointer',
                                      paddingRight: '2px',
                                      textTransform: 'capitalize',
                                    }}
                                  >
                                    {dataItem.NOME_CLIENTE != null ? dataItem.NOME_CLIENTE.toLowerCase() : ''}
                                  </Labels>
                                </Linha>
                              </DivDetalhe>
                              <DivDetalhe
                                style={{
                                  padding: '2px',
                                  border: '1px solid #ccc',
                                  borderRadius: '10px',
                                  margin: '3px',
                                }}
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
                                    Canal
                                  </Labels>
                                  <Labels
                                    fontWeight={500}
                                    fontSize={0.8}
                                    style={{
                                      cursor: 'pointer',
                                      paddingRight: '2px',
                                    }}
                                  >
                                    {dataItem.CANAL}
                                  </Labels>
                                </Linha>
                              </DivDetalhe>
                            </Linha>
                          </CollapsibleItem>
                        </Collapsible>
                      </DivDetalhe>
                    ))}
                </Line>
              </>
            ) : (
              <>
                <Linha>
                  <ReactToPrint
                    documentTitle={'Rel. Histórico Saldo de Desconto Flexível'}
                    onBeforeGetContent={() => {
                      this.setState({ imprimindo: true });
                    }}
                    onAfterPrint={() => {
                      this.setState({ imprimindo: false });
                    }}
                    trigger={() => {
                      // NOTE: could just as easily return <SomeComponent />. Do NOT pass an `onClick` prop
                      // to the root node of the returned component as it will be overwritten.
                      return (
                        <Line>
                          <button className="waves-effect waves-light saib-button is-primary">
                            <Icon>print</Icon>
                          </button>
                        </Line>
                      );
                    }}
                    content={() => this.componentRef}
                  />
                </Linha>
                <IndicatorsLine
                  ref={(el) => (this.componentRef = el)}
                  style={{ marginBottom: '30px' }}
                >
                  <Linha style={{ width: '100%' }}>
                    <ReportHeader
                      title={'Rel. Histórico Saldo de Desconto Flexível'}
                    />
                  </Linha>
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
                      <td id="product">Rota</td>
                      <td
                        id="indicator"
                        style={{
                          paddingRight: '10px !important',
                        }}
                      >
                        Data
                      </td>
                      <td
                        id="indicator"
                        style={{
                          paddingRight: '10px !important',
                        }}
                      >
                        Hr. Rota
                      </td>
                      <td
                        id="indicator"
                        style={{
                          paddingRight: '10px !important',
                        }}
                      >
                        Hr. Sistema
                      </td>
                      <td
                        id="indicator"
                        style={{
                          paddingRight: '10px !important',
                        }}
                      >
                        Operação
                      </td>
                      <td
                        id="indicator"
                        style={{
                          paddingRight: '10px !important',
                        }}
                      >
                        Valor Op.
                      </td>
                      <td
                        id="indicator"
                        style={{
                          paddingRight: '10px !important',
                        }}
                      >
                        Valor Atual
                      </td>
                      <td
                        id="indicator"
                        style={{
                          paddingRight: '10px !important',
                        }}
                      >
                        Cliente
                      </td>
                      <td
                        id="indicator"
                        style={{
                          paddingRight: '10px !important',
                        }}
                      >
                        Cli. Nome
                      </td>
                      <td
                        id="indicator"
                        style={{
                          paddingRight: '10px !important',
                        }}
                      >
                        Canal
                      </td>
                    </thead>
                    {data !== undefined &&
                      data.length > 0 &&
                      data.map((dataItem) => (
                        <tr
                          key={dataItem.CODIGO}
                          style={{
                            backgroundColor:
                              dataItem.counter % 2 !== 0
                                ? 'rgb(223, 178, 251)'
                                : 'white',
                          }}
                        >
                          <td
                            style={{
                              textTransform: 'capitalize',
                              fontWeight: '700',
                            }}
                          >
                            {dataItem.DESC_ROTA.toLowerCase()}
                          </td>
                          <td
                            style={{
                              fontWeight: '500',
                            }}
                          >
                            {dataItem.DATA}
                          </td>
                          <td
                            style={{
                              fontWeight: '500',
                            }}
                          >
                            {dataItem.DATA_PDA}
                          </td>
                          <td
                            style={{
                              fontWeight: '500',
                            }}
                          >
                            {dataItem.DATA_SISTEMA}
                          </td>
                          <td
                            style={{
                              fontWeight: '500',
                            }}
                          >
                            {dataItem.OPERACAO}
                          </td>
                          <td
                            style={{
                              fontWeight: '500',
                            }}
                          >
                            {dataItem.VALOR}
                          </td>
                          <td
                            style={{
                              fontWeight: '500',
                            }}
                          >
                            {dataItem.VALOR_ATUAL}
                          </td>
                          <td
                            style={{
                              fontWeight: '500',
                            }}
                          >
                            {dataItem.CLIENTE}
                          </td>
                          <td
                            style={{
                              fontWeight: '500',
                            }}
                          >
                            {dataItem.NOME_CLIENTE}
                          </td>
                          <td
                            style={{
                              fontWeight: '500',
                            }}
                          >
                            {dataItem.CANAL}
                          </td>
                        </tr>
                      ))}
                  </table>
                </IndicatorsLine>
              </>
            )}
          </>
        )}
      </Container>
    );
  }
}

export default HistoryFlexibleDiscountBalanceData;
