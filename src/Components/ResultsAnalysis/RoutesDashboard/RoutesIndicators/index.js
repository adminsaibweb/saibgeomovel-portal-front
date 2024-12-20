import React, { Component } from 'react';
import {
  Labels,
  Container,
  Linha,
  Line,
  IndicatorsLine,
  DivDetalhe,
  // BrowserView,
  // MobileView,
} from './style';
import Skeleton from 'react-loading-skeleton';
import { currencyFormat } from '../../../../services/funcoes';
import {  Collapsible, CollapsibleItem } from 'react-materialize';
import './forced.css';

export class RoutesIndicators extends Component {
  state = {
    globalChartConfig: undefined,
    selectedIndicatorId: -1,
    selectedIndicator: undefined,
  };

  componentDidMount = () => {};

  getHeaderRouter = (route) => {
    //console.log(route);
    const valor =
      route.FATURAMENTO_TOTAL == null
        ? 'R$ 0,00'
        : currencyFormat(route.FATURAMENTO_TOTAL);

    const rota = route.ESTR_NOME.indexOf(String(route.ESTR_ID)) === 0 ? '' : route.ESTR_ID + ' - ';
    return rota + route.ESTR_NOME + ' - ' + String(valor);
  };

  render() {
    return (
      <Container className="containerRoutes">
        {this.props.data === undefined ? (
          <Line style={{ alignItems: 'inherit' }}>
            <IndicatorsLine
              style={{ width: '100%' }}
              loading={this.props.data === undefined ? 1 : 0}
            >
              <Skeleton count={10} />
            </IndicatorsLine>
          </Line>
        ) : (
          <>
            {document.getElementsByTagName('body')[0].clientWidth < 768 ? (
              <>
                <Line style={{ flexDirection: 'column' }}>
                  {this.props.data !== undefined &&
                    this.props.data.map((route, i) => (
                      <Linha key={i} className="divDetalhe" style={{width: '100%'}}>
                        <Collapsible
                          className="indicadorRotas"
                          accordion={false}
                          options={{
                            inDuration: '0',
                            outDuration: '0',
                          }}
                          style={{
                            borderStyle: 'none',
                            boxShadow: 'none',
                          }}
                        >
                          <CollapsibleItem
                            key={route.ID_ESTR}
                            expanded={route.FATURAMENTO_TOTAL != null && route.FATURAMENTO_TOTAL !== 0}
                            header={this.getHeaderRouter(route)}
                            node="div"
                          >
                            <Linha className="linhaIndicadores">
                              <DivDetalhe
                                style={{
                                  padding: '2px',
                                  border: '1px solid #ccc',
                                  borderRadius: '10px',
                                  margin: '3px',
                                  width: '40%',
                                }}
                              >
                                  <Labels fontWeight={700} fontSize={0.8}>
                                    Pedidos totais:
                                  </Labels>
                                  <Labels fontWeight={500} fontSize={0.8}>
                                    {route.FATURAMENTO_TOTAL == null
                                      ? 'R$ 0,00'
                                      : currencyFormat(route.FATURAMENTO_TOTAL)}
                                  </Labels>
                              </DivDetalhe>
                              <DivDetalhe
                                style={{
                                  padding: '2px',
                                  border: '1px solid #ccc',
                                  borderRadius: '10px',
                                  margin: '3px',
                                  width: '40%',
                                }}
                              >

                                  <Labels fontWeight={700} fontSize={0.8}>
                                    Pedidos 10+:
                                  </Labels>
                                  <Labels fontWeight={500} fontSize={0.8}>
                                    {route.FATURAMENTO_TOP10 == null
                                      ? 'R$ 0,00'
                                      : currencyFormat(route.FATURAMENTO_TOP10)}
                                  </Labels>

                              </DivDetalhe>
                            </Linha>
                            <Linha className="linhaIndicadores">
                              <DivDetalhe
                                style={{
                                  padding: '2px',
                                  border: '1px solid #ccc',
                                  borderRadius: '10px',
                                  margin: '3px',
                                  width: '40%',
                                }}
                              >
                                  <Labels fontWeight={700} fontSize={0.8}>
                                    Nr.clientes visitados:
                                  </Labels>
                                  <Labels fontWeight={500} fontSize={0.8}>
                                    {route.NR_CLIENTES_VISITADOS == null
                                      ? '0'
                                      :
                                          route.NR_CLIENTES_VISITADOS
                                        }
                                  </Labels>
                              </DivDetalhe>
                              <DivDetalhe
                                style={{
                                  padding: '2px',
                                  border: '1px solid #ccc',
                                  borderRadius: '10px',
                                  margin: '3px',
                                  width: '40%',
                                }}
                              >
                                  <Labels fontWeight={700} fontSize={0.8}>
                                    Nr.clientes por dia:
                                  </Labels>
                                  <Labels fontWeight={500} fontSize={0.8}>
                                    {route.NR_CLIENTES_DIA == null
                                      ? '0'
                                      : route.NR_CLIENTES_DIA}
                                  </Labels>
                              </DivDetalhe>
                            </Linha>
                            <Linha className="linhaIndicadores">
                              <DivDetalhe
                                style={{
                                  padding: '2px',
                                  border: '1px solid #ccc',
                                  borderRadius: '10px',
                                  margin: '3px',
                                  width: '40%',
                                }}
                              >
                                  <Labels fontWeight={700} fontSize={0.8}>
                                    Fora de rota:
                                  </Labels>
                                  <Labels fontWeight={500} fontSize={0.8}>
                                    {route.NR_CLI_FORA_DIA_VIS == null
                                      ? '0'
                                      :
                                          route.NR_CLI_FORA_DIA_VIS
                                        }
                                  </Labels>
                              </DivDetalhe>
                              <DivDetalhe
                                style={{
                                  padding: '2px',
                                  border: '1px solid #ccc',
                                  borderRadius: '10px',
                                  margin: '3px',
                                  width: '40%',
                                }}
                              >
                                  <Labels fontWeight={700} fontSize={0.8}>
                                    Positivados:
                                  </Labels>
                                  <Labels fontWeight={500} fontSize={0.8}>
                                    {route.NR_CLIENTES_POSITIVADOS == null
                                      ? '0'
                                      :
                                          route.NR_CLIENTES_POSITIVADOS
                                       }
                                  </Labels>
                              </DivDetalhe>
                            </Linha>
                            <Linha className="linhaIndicadores">
                              <DivDetalhe
                                style={{
                                  padding: '2px',
                                  border: '1px solid #ccc',
                                  borderRadius: '10px',
                                  margin: '3px',
                                  width: '40%',
                                }}
                              >
                                  <Labels fontWeight={700} fontSize={0.8}>
                                    % positivados:
                                  </Labels>
                                  <Labels fontWeight={500} fontSize={0.8}>
                                    {route.PERC_POSITIVACAO == null
                                      ? '0'
                                      : route.PERC_POSITIVACAO}
                                  </Labels>
                              </DivDetalhe>
                              <DivDetalhe
                                style={{
                                  padding: '2px',
                                  border: '1px solid #ccc',
                                  borderRadius: '10px',
                                  margin: '3px',
                                  width: '40%',
                                }}
                              >
                                  <Labels fontWeight={700} fontSize={0.8}>
                                    % visitas:
                                  </Labels>
                                  <Labels fontWeight={500} fontSize={0.8}>
                                    {route.PERC_VISITAS_REALIZADAS == null
                                      ? '0'
                                      :
                                          route.PERC_VISITAS_REALIZADAS
                                        }
                                  </Labels>
                              </DivDetalhe>
                            </Linha>
                            <Linha className="linhaIndicadores">
                              <DivDetalhe
                                style={{
                                  padding: '2px',
                                  border: '1px solid #ccc',
                                  borderRadius: '10px',
                                  margin: '3px',
                                  width: '40%',
                                }}
                              >
                                  <Labels fontWeight={700} fontSize={0.8}>
                                    Nr.pedidos:
                                  </Labels>
                                  <Labels fontWeight={500} fontSize={0.8}>
                                    {route.NR_PEDIDOS == null
                                      ? '0'
                                      : route.NR_PEDIDOS}
                                  </Labels>
                              </DivDetalhe>
                              <DivDetalhe
                                style={{
                                  padding: '2px',
                                  border: '1px solid #ccc',
                                  borderRadius: '10px',
                                  margin: '3px',
                                  width: '40%',
                                }}
                              >
                                  <Labels fontWeight={700} fontSize={0.8}>
                                    Qt.venda:
                                  </Labels>
                                  <Labels fontWeight={500} fontSize={0.8}>
                                    {route.TOTAL_QTDE_VENDIDA == null
                                      ? '0'
                                      :
                                          route.TOTAL_QTDE_VENDIDA
                                        }
                                  </Labels>
                              </DivDetalhe>
                            </Linha>
                            <Linha className="linhaIndicadores">
                              <DivDetalhe
                                style={{
                                  padding: '2px',
                                  border: '1px solid #ccc',
                                  borderRadius: '10px',
                                  margin: '3px',
                                  width: '40%',
                                }}
                              >
                                  <Labels fontWeight={700} fontSize={0.8}>
                                    Total peso:
                                  </Labels>
                                  <Labels fontWeight={500} fontSize={0.8}>
                                    {route.PESO_BRUTO == null
                                      ? '0'
                                      : route.PESO_BRUTO}
                                  </Labels>
                              </DivDetalhe>
                              <DivDetalhe
                                style={{
                                  padding: '2px',
                                  border: '1px solid #ccc',
                                  borderRadius: '10px',
                                  margin: '3px',
                                  width: '40%',
                                }}
                              >
                                  <Labels fontWeight={700} fontSize={0.8}>
                                    Qt.faturar:
                                  </Labels>
                                  <Labels fontWeight={500} fontSize={0.8}>
                                    {route.PEDIDOS_A_FATURAR == null
                                      ? '0'
                                      : route.PEDIDOS_A_FATURAR}
                                  </Labels>
                              </DivDetalhe>
                            </Linha>
                            <Linha className="linhaIndicadores">
                              <DivDetalhe
                                style={{
                                  padding: '2px',
                                  border: '1px solid #ccc',
                                  borderRadius: '10px',
                                  margin: '3px',
                                  width: '40%',
                                }}
                              >
                                  <Labels fontWeight={700} fontSize={0.8}>
                                    Qt.faturado:
                                  </Labels>
                                  <Labels fontWeight={500} fontSize={0.8}>
                                    {route.PEDIDOS_A_FATURAR == null
                                      ? '0'
                                      : route.PEDIDOS_FATURADOS}
                                  </Labels>
                              </DivDetalhe>
                            </Linha>
                          </CollapsibleItem>
                        </Collapsible>
                      </Linha>
                    ))}
                </Line>
              </>
            ) : (
              <>
                <Line>
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
                        <td id="product">Vendedor</td>
                        <td
                          id="indicator"
                          style={{
                            textAlign: 'right',
                            paddingRight: '10px !important',
                          }}
                        >
                          Pedidos totais
                        </td>
                        <td
                          id="indicator"
                          style={{
                            textAlign: 'right',
                            paddingRight: '10px !important',
                          }}
                        >
                          Pedidos 10+
                        </td>
                        <td
                          id="indicator"
                          style={{
                            textAlign: 'right',
                            paddingRight: '10px !important',
                          }}
                        >
                          Nr.clientes/dia
                        </td>
                        <td
                          id="indicator"
                          style={{
                            textAlign: 'right',
                            paddingRight: '10px !important',
                          }}
                        >
                          Nr.clientes visitados
                        </td>
                        <td
                          id="indicator"
                          style={{
                            textAlign: 'right',
                            paddingRight: '10px !important',
                          }}
                        >
                          Nr.clientes positivados
                        </td>
                        <td
                          id="indicator"
                          style={{
                            textAlign: 'right',
                            paddingRight: '10px !important',
                          }}
                        >
                          Nr.clientes fora rota
                        </td>
                        <td
                          id="indicator"
                          style={{
                            textAlign: 'right',
                            paddingRight: '10px !important',
                          }}
                        >
                          % positivação
                        </td>
                        <td
                          id="indicator"
                          style={{
                            textAlign: 'right',
                            paddingRight: '10px !important',
                          }}
                        >
                          % visitas realizadas
                        </td>
                        <td
                          id="indicator"
                          style={{
                            textAlign: 'right',
                            paddingRight: '10px !important',
                          }}
                        >
                          Nr.pedidos
                        </td>
                        <td
                          id="indicator"
                          style={{
                            textAlign: 'right',
                            paddingRight: '10px !important',
                          }}
                        >
                          Qtde total vendida
                        </td>
                        <td
                          id="indicator"
                          style={{
                            textAlign: 'right',
                            paddingRight: '10px !important',
                          }}
                        >
                          Total peso
                        </td>
                        <td
                          id="indicator"
                          style={{
                            textAlign: 'right',
                            paddingRight: '10px !important',
                          }}
                        >
                          Nr.pedidos faturados
                        </td>
                        <td
                          id="indicator"
                          style={{
                            textAlign: 'right',
                            paddingRight: '10px !important',
                          }}
                        >
                          Nr.pedidos a faturar
                        </td>
                      </thead>
                      {this.props.data !== undefined &&
                        this.props.data.map((route) => (
                          <tr
                            key={route.ID_ESTR}
                            style={{
                              backgroundColor:
                                route.counter % 2 !== 0
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
                              {route.ESTR_ID !== undefined &&
                                route.ESTR_NOME.toLowerCase()}
                            </td>
                            <td
                              id="indicator"
                              style={{ textAlign: 'right', fontWeight: '700' }}
                            >
                              {currencyFormat(
                                route.FATURAMENTO_TOTAL,
                                ''
                              )}
                            </td>
                            <td
                              id="indicator"
                              style={{ textAlign: 'right', fontWeight: '700' }}
                            >
                              {currencyFormat(route.FATURAMENTO_TOP10)}
                            </td>
                            <td
                              id="indicator"
                              style={{ textAlign: 'right', fontWeight: '700' }}
                            >
                              {route.NR_CLIENTES_DIA}
                            </td>
                            <td
                              id="indicator"
                              style={{ textAlign: 'right', fontWeight: '700' }}
                            >
                              {route.NR_CLIENTES_VISITADOS}
                            </td>
                            <td
                              id="indicator"
                              style={{ textAlign: 'right', fontWeight: '700' }}
                            >
                              {route.NR_CLIENTES_POSITIVADOS}
                            </td>
                            <td
                              id="indicator"
                              style={{ textAlign: 'right', fontWeight: '700' }}
                            >
                              {route.NR_CLI_FORA_DIA_VIS}
                            </td>
                            <td
                              id="indicator"
                              style={{ textAlign: 'right', fontWeight: '700' }}
                            >
                              {currencyFormat(route.PERC_POSITIVACAO, '')}
                            </td>
                            <td
                              id="indicator"
                              style={{ textAlign: 'right', fontWeight: '700' }}
                            >
                              {currencyFormat(
                                route.PERC_VISITAS_REALIZADAS,
                                ''
                              )}
                            </td>
                            <td
                              id="indicator"
                              style={{ textAlign: 'right', fontWeight: '700' }}
                            >
                              {route.NR_PEDIDOS}
                            </td>
                            <td
                              id="indicator"
                              style={{ textAlign: 'right', fontWeight: '700' }}
                            >
                              {route.TOTAL_QTDE_VENDIDA}
                            </td>
                            <td
                              id="indicator"
                              style={{ textAlign: 'right', fontWeight: '700' }}
                            >
                              {currencyFormat(route.PESO_BRUTO, '')}
                            </td>
                            <td
                              id="indicator"
                              style={{ textAlign: 'right', fontWeight: '700' }}
                            >
                              {route.PEDIDOS_FATURADOS}
                            </td>{' '}
                            <td
                              id="indicator"
                              style={{ textAlign: 'right', fontWeight: '700' }}
                            >
                              {route.PEDIDOS_A_FATURAR}
                            </td>
                          </tr>
                        ))}
                    </table>
                  </IndicatorsLine>
                </Line>
              </>
            )}
          </>
        )}
      </Container>
    );
  }
}

export default RoutesIndicators;
