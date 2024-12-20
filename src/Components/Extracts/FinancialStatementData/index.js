import React, { Component } from 'react';
import {
  Container,
  Line,
  IndicatorsLine,
  Linha,
} from './style';
import Skeleton from 'react-loading-skeleton';
// import { currencyFormat } from '../../../../services/funcoes';
import { formatFloatBr } from '../../../services/funcoes';
import { Icon } from 'react-materialize';
import ReactToPrint from 'react-to-print';
import ReportHeader from '../../System/ReportHeader';
// import './forced.css';

export class FinancialStatementData extends Component {
  state = {
    data: undefined,
    changedFilter: 0,
    loading: 1,
  };

  componentDidMount = () => {
    // this.handleAllDataUpdate();
  };

  handleAllDataUpdate = () => {
    let { data, changedFilter } = this.state;
    changedFilter += 1;
    //console.log('this.props.data');
    //console.log(this.props.data);
    if (this.props.data === undefined || this.props.data.rotas === undefined) {
      //console.log('saindo da apresentação de daos');
      this.setState({ changedFilter });
      return;
    }
    //console.log('data local');
    //console.log(this.props.data);
    data = this.props.data.rotas;
    let totalVencido = this.props.data.totalVencido;
    let totalAVencer = this.props.data.totalAVencer;
    let totalGeral = this.props.data.totalGeral;
    let qtdeRotas = this.props.data.qtdeRotas;
    let counter = 0;
    for (const dataItem of data) {
      dataItem.counter = counter;
      counter += 1;
    }

    this.setState({
      data,
      changedFilter,
      loading: 0,
      totalVencido,
      totalAVencer,
      totalGeral,
      qtdeRotas,
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
    return data.DESC_ROTA + ' - ' + data.DATA;
  };

  render() {
    const {
      data,
      loading,
      totalAVencer,
      totalVencido,
      totalGeral,
      qtdeRotas,
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
            <Linha>
              <ReactToPrint
                documentTitle={'Rel. Extrato pendências financeiras - rotas'}
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
                  title={'Rel. Extrato pendências financeiras - rotas'}
                />
              </Linha>
              <Linha
                style={{
                  width: '100%',
                  marginBottom: '10px',
                  justifyContent: 'center',
                  display: qtdeRotas > 1 ? 'flex' : 'none',
                }}
              >
                <span style={{ fontWeight: '700' }}>Total vencido:&nbsp;</span>{' '}
                <span style={{ fontWeight: '400', marginRight: '5px' }}>
                  {formatFloatBr(totalVencido)}
                </span>
                <span style={{ fontWeight: '700' }}>Total à vencer:&nbsp;</span>{' '}
                <span style={{ fontWeight: '400', marginRight: '5px' }}>
                  {formatFloatBr(totalAVencer)}
                </span>
                <span style={{ fontWeight: '700' }}>Total geral:&nbsp;</span>{' '}
                <span style={{ fontWeight: '400', marginRight: '5px' }}>
                  {formatFloatBr(totalGeral)}
                </span>
              </Linha>
              <br />
              {data.map((rota) => (
                <>
                  <Linha
                    key={rota.estrId}
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
                    {rota.codRota + ' - ' + rota.descricaoRota.toLowerCase()}
                  </Linha>
                  {rota.clientes.map((cliente) => (
                    <>
                      <Linha
                        style={{
                          textTransform: 'capitalize',
                          fontWeight: '700',
                          fontSize: '0.8rem',
                          color: '#858585',
                          marginTop: '10px',
                          width: '100%',
                        }}
                      >
                        {cliente.cliCodigo +
                          ' - ' +
                          cliente.razaoSocial.toLowerCase()}
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
                          <td
                            id="indicator"
                            style={{
                              paddingRight: '10px !important',
                            }}
                          >
                            Tipo doc.
                          </td>
                          <td
                            id="indicator"
                            style={{
                              paddingRight: '10px !important',
                            }}
                          >
                            Nº doc.
                          </td>
                          <td
                            id="indicator"
                            style={{
                              paddingRight: '10px !important',
                            }}
                          >
                            Vencimento
                          </td>
                          <td
                            id="indicator"
                            style={{
                              paddingRight: '10px !important',
                            }}
                          >
                            Valor
                          </td>
                        </thead>
                        {cliente.movimentacoes.map((mov) => (
                          <>
                            <tr
                              key={mov.id}
                              style={{
                                color:
                                  mov.diasVcto < 0
                                    ? 'red'
                                    : 'rgb(133, 133, 133)',
                              }}
                            >
                              <td style={{ width: '25%' }}>{mov.tipoDoc}</td>
                              <td style={{ width: '25%' }}>{mov.nrDoc}</td>
                              <td style={{ width: '25%' }}>{mov.vencimento}</td>
                              <td style={{ width: '25%' }}>
                                {formatFloatBr(mov.valor)}
                              </td>
                            </tr>
                          </>
                        ))}
                      </table>
                    </>
                  ))}
                  <Linha
                    style={{
                      width: '100%',
                      marginBottom: '10px',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontWeight: '700' }}>
                      Total vencido rota:&nbsp;
                    </span>{' '}
                    <span style={{ fontWeight: '400', marginRight: '5px' }}>
                      {formatFloatBr(rota.totalVencido)}
                    </span>
                    <span style={{ fontWeight: '700' }}>
                      Total à vencer rota:&nbsp;
                    </span>{' '}
                    <span style={{ fontWeight: '400', marginRight: '5px' }}>
                      {formatFloatBr(rota.totalAVencer)}
                    </span>
                    <span style={{ fontWeight: '700' }}>
                      Total geral rota:&nbsp;
                    </span>{' '}
                    <span style={{ fontWeight: '400', marginRight: '5px' }}>
                      {formatFloatBr(rota.totalGeral)}
                    </span>
                  </Linha>
                </>
              ))}
            </IndicatorsLine>
          </>
        )}
      </Container>
    );
  }
}

export default FinancialStatementData;
