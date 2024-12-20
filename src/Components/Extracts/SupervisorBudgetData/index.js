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
import { formatFloatBr, formatOracleDateToBr } from '../../../services/funcoes';
import { Icon, Collapsible, CollapsibleItem } from 'react-materialize';
import ReactToPrint from 'react-to-print';
import ReportHeader from '../../System/ReportHeader';
// import './forced.css';

export class SupervisorBudgetData extends Component {
  state = {
    data: undefined,
    dataSaldos: undefined,
    changedFilter: 0,
    loading: 1,
  };

  componentDidMount = () => {
    // this.handleAllDataUpdate();
  };

  handleAllDataUpdate = () => {
    let { data, changedFilter, dataSaldos } = this.state;
    changedFilter += 1;
    //console.log('this.props.data');
    //console.log(this.props.data);
    if (
      this.props.data === undefined ||
      this.props.data.supervisores === undefined
    ) {
      //console.log('saindo da apresentação de daos');
      this.setState({ changedFilter });
      return;
    }
    //console.log('data local');
    //console.log(this.props.data.supervisores);
    data = this.props.data.supervisores;

    let counter = 0;
    for (const sup of data) {
      counter = 0;
      for (const mov of sup.movimentacoes) {
        mov.counter = counter;
        counter += 1;
      }
    }
    dataSaldos = this.props.data.saldoTipoVerba;
    //console.log('dataSaldos');
    //console.log(dataSaldos);
    this.setState({
      data,
      changedFilter,
      loading: 0,
      dataSaldos,
    });
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
    return data.supervisorNome;
  };

  render() {
    const {
      data,
      loading,
      dataSaldos,
    } = this.state;
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
                    data.map((supervisor) => (
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
                            key={supervisor.supervisorId}
                            expanded={true}
                            header={this.getHeader(supervisor)}
                            node="div"
                          >
                            {supervisor.movimentacoes.map((dataItem) => (
                              <>
                                <Linha
                                  style={{
                                    justifyContent: 'space-around',
                                    borderBottom: '1px solid #ccc',
                                  }}
                                >
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
                                        Data
                                      </Labels>
                                      <Labels
                                        fontWeight={500}
                                        fontSize={0.8}
                                        style={{
                                          cursor: 'pointer',
                                          paddingRight: '2px',
                                        }}
                                      >
                                        {dataItem.dataInclusao}
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
                                        Tipo
                                      </Labels>
                                      <Labels
                                        fontWeight={500}
                                        fontSize={0.8}
                                        style={{
                                          cursor: 'pointer',
                                          paddingRight: '2px',
                                        }}
                                      >
                                        {dataItem.tipoVerba}
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
                                        {dataItem.operacao}
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
                                        {formatFloatBr(dataItem.valorOperacao)}
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
                                        {formatFloatBr(dataItem.valorAtual)}
                                      </Labels>
                                    </Linha>
                                  </DivDetalhe>
                                  <DivDetalhe
                                    style={{
                                      padding: '2px',
                                      border: '1px solid #ccc',
                                      borderRadius: '10px',
                                      margin: '3px',
                                      display:
                                        dataItem.vendedor != null
                                          ? 'flex'
                                          : 'none',
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
                                        Vendedor
                                      </Labels>
                                      <Labels
                                        fontWeight={500}
                                        fontSize={0.8}
                                        style={{
                                          cursor: 'pointer',
                                          paddingRight: '2px',
                                        }}
                                      >
                                        {dataItem.vendedor}
                                      </Labels>
                                    </Linha>
                                  </DivDetalhe>
                                  <DivDetalhe
                                    style={{
                                      padding: '2px',
                                      border: '1px solid #ccc',
                                      borderRadius: '10px',
                                      margin: '3px',
                                      backgroundColor: '#8e44ad3b',
                                      display:
                                        dataItem.cliente != null
                                          ? 'flex'
                                          : 'none',
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
                                          textTransform: 'capitalize',
                                        }}
                                      >
                                        {dataItem.cliente != null
                                          ? dataItem.cliente.toLowerCase()
                                          : ''}
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
                                        Usuário
                                      </Labels>
                                      <Labels
                                        fontWeight={500}
                                        fontSize={0.8}
                                        style={{
                                          cursor: 'pointer',
                                          paddingRight: '2px',
                                        }}
                                      >
                                        {dataItem.usuarioNome}
                                      </Labels>
                                    </Linha>
                                  </DivDetalhe>
                                </Linha>
                              </>
                            ))}
                          </CollapsibleItem>
                        </Collapsible>
                      </DivDetalhe>
                    ))}
                </Line>
                <Linha>
                  {dataSaldos !== undefined && dataSaldos.length > 0 && (
                    <>
                      <table
                        style={{
                          fontSize: '0.8rem',
                          color: '#858585',
                          marginTop: '20px',
                        }}
                      >
                        <thead>
                          <td></td>
                          <td></td>
                        </thead>
                        {dataSaldos.map((saldo) => (
                          <>
                            <tr>
                              <td
                                style={{
                                  fontSize: '0.8rem',
                                  fontWeight: '700',
                                  color: '#000',
                                  width: '100px',
                                }}
                              >
                                {saldo.tipoVerba}
                              </td>
                              <td>{formatFloatBr(saldo.valorVerba)}</td>
                            </tr>
                          </>
                        ))}
                      </table>
                    </>
                  )}
                </Linha>
              </>
            ) : (
              <>
                <Linha style={{ width: '100%' }}>
                  <ReactToPrint
                    documentTitle={'Rel. Extrato verbas supervisor'}
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
                    <ReportHeader title={'Rel. Extrato verbas supervisor'} />
                  </Linha>
                  {data.map((supervisor) => (
                    <>
                      <Linha
                        key={supervisor.estrId}
                        style={{
                          textTransform: 'capitalize',
                          fontWeight: '900',
                          fontSize: '1rem',
                          color: '#000',
                          marginTop: '10px',
                          flexDirection: 'column',
                          width: '100%',
                        }}
                      >
                        {supervisor.supervisorId +
                          ' - ' +
                          supervisor.supervisorNome.toLowerCase()}
                      </Linha>
                      <Linha style={{ width: '100%' }}>
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
                              Tipo
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
                              Vendedor
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
                              Usuário
                            </td>
                          </thead>

                          {supervisor.movimentacoes.map((mov) => (
                            <>
                              <tr
                                key={mov.id}
                                style={{
                                  backgroundColor:
                                    mov.counter % 2 !== 0
                                      ? 'rgb(223, 178, 251)'
                                      : 'white',
                                }}
                              >
                                <td>
                                  {formatOracleDateToBr(mov.dataInclusao, true)}
                                </td>
                                <td>{mov.tipoVerba}</td>
                                <td>{mov.operacao}</td>
                                <td>{formatFloatBr(mov.valorOperacao)}</td>{' '}
                                <td>{formatFloatBr(mov.valorAtual)}</td>
                                <td>{mov.vendedor}</td>
                                <td>{mov.cliente}</td>
                                <td>{mov.usuarioNome}</td>
                              </tr>
                            </>
                          ))}
                        </table>
                      </Linha>
                      <Linha>
                        {dataSaldos !== undefined && dataSaldos.length > 0 && (
                          <>
                            <table
                              style={{
                                fontSize: '0.8rem',
                                color: '#858585',
                                marginTop: '20px',
                              }}
                            >
                              <thead>
                                <td></td>
                                <td></td>
                              </thead>
                              {dataSaldos.map((saldo) => (
                                <>
                                  <tr>
                                    <td
                                      style={{
                                        fontSize: '0.8rem',
                                        fontWeight: '700',
                                        color: '#000',
                                        width: '100px',
                                      }}
                                    >
                                      {saldo.tipoVerba}
                                    </td>
                                    <td>{formatFloatBr(saldo.valorVerba)}</td>
                                  </tr>
                                </>
                              ))}
                            </table>
                          </>
                        )}
                      </Linha>
                    </>
                  ))}
                </IndicatorsLine>
              </>
            )}
          </>
        )}
      </Container>
    );
  }
}

export default SupervisorBudgetData;
