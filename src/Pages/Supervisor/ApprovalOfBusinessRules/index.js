import React, { Component } from 'react';
import Header from '../../../Components/System/Header';
import { TdTitle, Container, Linha, DivDetalhe, Labels, ProductCard } from './styles';
import DirectTituloJanela from '../../../Components/Globals/DirectTituloJanela';
import WaitScreen from '../../../Components/Globals/WaitScreen';
import { Icon, Collapsible, CollapsibleItem } from 'react-materialize';
import SaibRadioGroup from '../../../Components/Globals/SaibRadioGroup';
import { getFromStorage } from '../../../services/auth';
import { alerta, formatFloatBr, haveData } from '../../../services/funcoes';
import api from '../../../services/api';
import Dialog from '../../../Components/Globals/Question';
import './forced.css';

const DataComponent = (props) => {
  return (
    <>
      <Collapsible
        className="collapsiblePedidos"
        accordion={false}
        style={{
          width: '100%',
          border: '2px solid #bf1f7c',
          borderRadius: '10px',
        }}
      >
        <CollapsibleItem expanded={true} header="Dados da venda" icon={<Icon>shopping_cart</Icon>} node="div">
          {props.data !== undefined && (
            <table className="DataComponent" style={{ fontSize: '0.9rem' }}>
              <tbody>
                <tr>
                  <TdTitle>Número pedido</TdTitle>
                  <td
                    style={{
                      paddingTop: '0px',
                      paddingBottom: '2px',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    {props.data.pedidoId}
                  </td>
                </tr>
                <tr>
                  <TdTitle>Cliente</TdTitle>
                  <td
                    style={{
                      paddingTop: '0px',
                      paddingBottom: '2px',
                      textAlign: 'left',
                      width: '100%',
                      textTransform: 'capitalize',
                      backgroundColor: 'rgb(46,204,113)',
                    }}
                  >
                    {props.data.cliente.toLowerCase()}
                  </td>
                </tr>
                <tr>
                  <TdTitle>Valor bruto</TdTitle>
                  <td
                    style={{
                      paddingTop: '0px',
                      paddingBottom: '2px',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    {formatFloatBr(props.data.valorBruto)}
                  </td>
                </tr>
                <tr>
                  <TdTitle>Valor comodato</TdTitle>
                  <td
                    style={{
                      paddingTop: '0px',
                      paddingBottom: '2px',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    {formatFloatBr(props.data.valorComodato)}
                  </td>
                </tr>
                <tr>
                  <TdTitle>Valor troca</TdTitle>
                  <td
                    style={{
                      paddingTop: '0px',
                      paddingBottom: '2px',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    {formatFloatBr(props.data.valorTroca)}
                  </td>
                </tr>
                <tr>
                  <TdTitle>Percentual desconto</TdTitle>
                  <td
                    style={{
                      paddingTop: '0px',
                      paddingBottom: '2px',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    {formatFloatBr(props.data.percentualDesconto, '')}
                  </td>
                </tr>
                <tr>
                  <TdTitle>Valor bonificação</TdTitle>
                  <td
                    style={{
                      paddingTop: '0px',
                      paddingBottom: '2px',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    {formatFloatBr(props.data.valorBonificacao, '')}
                  </td>
                </tr>
                <tr>
                  <TdTitle>Valor venda</TdTitle>
                  <td
                    style={{
                      paddingTop: '0px',
                      paddingBottom: '2px',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    {formatFloatBr(props.data.valorVenda)}
                  </td>
                </tr>
                <tr>
                  <TdTitle>Vcto cliente</TdTitle>
                  <td
                    style={{
                      paddingTop: '0px',
                      paddingBottom: '2px',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    {props.data.vctoCliente}
                  </td>
                </tr>
                <tr>
                  <TdTitle>Vcto pedido</TdTitle>
                  <td
                    style={{
                      paddingTop: '0px',
                      paddingBottom: '2px',
                      textAlign: 'left',
                      width: '100%',
                      textTransform: 'capitalize',
                    }}
                  >
                    {props.data.vctoPedido}
                  </td>
                </tr>
                <tr>
                  <TdTitle>Pgto cliente</TdTitle>
                  <td
                    style={{
                      paddingTop: '0px',
                      paddingBottom: '2px',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    {props.data.pgtoCliente}
                  </td>
                </tr>
                <tr>
                  <TdTitle>Pgto pedido</TdTitle>
                  <td
                    style={{
                      paddingTop: '0px',
                      paddingBottom: '2px',
                      textAlign: 'left',
                      width: '100%',
                      textTransform: 'capitalize',
                    }}
                  >
                    {props.data.pgtoPedido}
                  </td>
                </tr>
                <tr>
                  <TdTitle>Forma pagamento</TdTitle>
                  <td
                    style={{
                      paddingTop: '0px',
                      paddingBottom: '2px',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    {props.data.formaPagamento}
                  </td>
                </tr>
              </tbody>
            </table>
          )}

          <Collapsible
            className="collapsiblePedidosItens"
            accordion={false}
            style={{
              width: '100%',
              borderStyle: 'none',
              boxShadow: 'none',
            }}
          >
            <CollapsibleItem expanded={false} header="Produtos da venda" icon={<Icon>shopping_basket</Icon>} node="div">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'start',
                  padding: '2px',
                }}
              >
                {props.data !== undefined &&
                  props.data.items !== undefined &&
                  props.data.items.map((item) => (
                    <ProductCard key={Math.floor(Math.random() * 10000)}>
                      <p
                        className="titleCard"
                        style={{
                          backgroundColor: '#8870A4',
                          color: 'white',
                          fontWeight: '700',
                          textAlign: 'center',
                        }}
                      >
                        {item.produto.toLowerCase()}
                      </p>
                      <p>
                        <small>Qtd.</small>
                        <li>{item.quantidade}</li>
                      </p>
                      <p>
                        <small>%Desc.</small> <li>{formatFloatBr(item.percentualDesconto, '')}</li>
                      </p>
                      <p>
                        <small>$Desc..</small> <li>{item.valorDesconto}</li>
                      </p>
                      <p>
                        <small>Vlr tot.</small> <li>{formatFloatBr(item.valorTotal, '')}</li>
                      </p>
                      <p
                        style={{
                          color: item.bonificacao === 'Sim' ? 'red' : 'unset',
                        }}
                      >
                        <small>Bonific.</small> <li>{item.bonificacao}</li>
                      </p>
                      <p style={{ color: item.comodato === 'Sim' ? 'red' : 'unset' }}>
                        <small>Comodat.</small> <li>{item.comodato}</li>
                      </p>
                      <p style={{ color: item.desconto === 'Sim' ? 'red' : 'unset' }}>
                        <small>Descont.</small> <li>{item.desconto}</li>
                      </p>
                      <p
                        style={{
                          color: item.formaCondicao === 'Sim' ? 'red' : 'unset',
                        }}
                      >
                        <small>F.condi.</small> <li>{item.formaCondicao}</li>
                      </p>
                      <p
                        style={{
                          color: item.inadimplente === 'Sim' ? 'red' : 'unset',
                        }}
                      >
                        <small>Inadimp.</small> <li>{item.inadimplente}</li>
                      </p>
                      <p
                        style={{
                          color: item.limiteCredito === 'Sim' ? 'red' : 'unset',
                        }}
                      >
                        <small>Lim.cré.</small> <li>{item.limiteCredito}</li>
                      </p>
                      <p
                        style={{
                          color: item.tipoPessoa === 'Sim' ? 'red' : 'unset',
                        }}
                      >
                        <small>Tp.pess.</small> <li>{item.tipoPessoa}</li>
                      </p>
                      <p style={{ color: item.troca === 'Sim' ? 'red' : 'unset' }}>
                        <small>Troca</small> <li>{item.troca}</li>
                      </p>
                      <p
                        style={{
                          color: item.valorBoleto === 'Sim' ? 'red' : 'unset',
                        }}
                      >
                        <small>Vlr bol.</small> <li>{item.valorBoleto}</li>
                      </p>
                      <p
                        style={{
                          color: item.valorMinimo === 'Sim' ? 'red' : 'unset',
                        }}
                      >
                        <small>Vlr min.</small> <li>{item.valorMinimo}</li>
                      </p>
                      <p>
                        <small>Tot.Vda.Dia.</small> <li>{item.totalVendas}</li>
                      </p>
                    </ProductCard>
                  ))}
              </div>
            </CollapsibleItem>
          </Collapsible>
        </CollapsibleItem>
      </Collapsible>
    </>
  );
};

const DataComponentVendasDoDia = (props) => {
  return (
    <>
      {props !== undefined &&
        props.data !== undefined &&
        props.data.length > 0 &&
        props.data.map((item) => (
          <>
            <Collapsible
              className="collapsiblePedidos"
              accordion={false}
              style={{
                width: '100%',
                border: '2px solid #bf1f7c',
                borderRadius: '10px',
              }}
            >
              <CollapsibleItem
                expanded={true}
                header={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Icon>shopping_cart</Icon> Venda Nº {item.pedidoId}
                  </div>
                }
                icon={<></>}
                node="div"
              >
                {haveData(item) && haveData(item.pedidoId) && (
                  <table className="DataComponent" style={{ fontSize: '0.9rem' }}>
                    <tbody>
                      <tr>
                        <TdTitle>Número pedido</TdTitle>
                        <td
                          style={{
                            paddingTop: '0px',
                            paddingBottom: '2px',
                            textAlign: 'left',
                            width: '100%',
                          }}
                        >
                          {haveData(item.pedidoId) ? item.pedidoId : ''}
                        </td>
                      </tr>
                      <tr>
                        <TdTitle>Cliente</TdTitle>
                        <td
                          style={{
                            paddingTop: '0px',
                            paddingBottom: '2px',
                            textAlign: 'left',
                            width: '100%',
                            textTransform: 'capitalize',
                            backgroundColor: 'rgb(46,204,113)',
                          }}
                        >
                          {item.cliente ? item.cliente.toLowerCase() : ''}
                        </td>
                      </tr>
                      <tr>
                        <TdTitle>Data</TdTitle>
                        <td
                          style={{
                            paddingTop: '0px',
                            paddingBottom: '2px',
                            textAlign: 'left',
                            width: '100%',
                          }}
                        >
                          {item.data}
                        </td>
                      </tr>
                      <tr>
                        <TdTitle>Valor bruto</TdTitle>
                        <td
                          style={{
                            paddingTop: '0px',
                            paddingBottom: '2px',
                            textAlign: 'left',
                            width: '100%',
                          }}
                        >
                          {formatFloatBr(item.valorBruto)}
                        </td>
                      </tr>
                      <tr>
                        <TdTitle>Percentual desconto</TdTitle>
                        <td
                          style={{
                            paddingTop: '0px',
                            paddingBottom: '2px',
                            textAlign: 'left',
                            width: '100%',
                          }}
                        >
                          {formatFloatBr(item.percentualDesconto, '')}
                        </td>
                      </tr>
                      <tr>
                        <TdTitle>Forma pagamento</TdTitle>
                        <td
                          style={{
                            paddingTop: '0px',
                            paddingBottom: '2px',
                            textAlign: 'left',
                            width: '100%',
                          }}
                        >
                          {item.formaPagamento}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
                <Collapsible
                  className="collapsiblePedidosItens"
                  accordion={false}
                  style={{
                    width: '100%',
                    borderStyle: 'none',
                    boxShadow: 'none',
                  }}
                >
                  <CollapsibleItem
                    expanded={false}
                    header={
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Icon>shopping_basket</Icon> Produtos da venda
                      </div>
                    }
                    icon={<></>}
                    node="div"
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        justifyContent: 'start',
                        padding: '2px',
                      }}
                    >
                      {item !== undefined &&
                        item.items !== undefined &&
                        item.items.map((item) => (
                          <ProductCard key={Math.floor(Math.random() * 10000)}>
                            <p
                              className="titleCard"
                              style={{
                                backgroundColor: '#8870A4',
                                color: 'white',
                                fontWeight: '700',
                                textAlign: 'center',
                              }}
                            >
                              {item.produto.toLowerCase()}
                            </p>
                            <p>
                              <small>Qtd.</small>
                              <li>{item.quantidade}</li>
                            </p>
                            <p>
                              <small>%Desc.</small> <li>{formatFloatBr(item.percentualDesconto, '')}</li>
                            </p>
                            <p>
                              <small>$Desc..</small> <li>{item.valorDesconto}</li>
                            </p>
                            <p>
                              <small>Vlr tot.</small> <li>{formatFloatBr(item.valorTotal, '')}</li>
                            </p>
                          </ProductCard>
                        ))}
                    </div>
                  </CollapsibleItem>
                </Collapsible>
              </CollapsibleItem>
            </Collapsible>
          </>
        ))}

      {props !== undefined && props.data !== undefined && props.data.length === 0 && (
        <Linha>
          <Labels>SEM PEDIDOS</Labels>
        </Linha>
      )}
    </>
  );
};

class ApprovalOfBusinessRules extends Component {
  state = {
    loading: false,
    filtro: 0,
  };

  componentDidMount = async () => {
    await this.carregarVariaveisEstado();
    await this.refreshScreen();
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
    });
  };

  getRoutesList = async (routes) => {
    const { vendedores } = this.state;
    let result = '';
    for (const route of routes) {
      let _route = vendedores.find((_vend) => _vend.VENDEDOR === route.tag);
      if (_route !== undefined) {
        result += _route.VENDEDOR_ID + ',';
      }
    }

    if (result !== '') {
      result = '(' + result.substr(0, result.length - 1) + ')';
    }

    return result;
  };

  loadMoneyList = async () => {
    const { empresaAtiva } = this.state;
    try {
      const { usuarioAtivo, filtro } = this.state;
      let url;
      url = '/v1/ApprovalOfComercialRules/' + empresaAtiva + '/' + usuarioAtivo;
      // //console.log(url);

      let data = {
        filtro,
      };
      const retorno = await api.post(url, data);
      if (retorno.data && retorno.data.sucess) {
        const approvalList = retorno.data.data.routes;

        this.setState({
          approvalList,
        });
      }
    } catch (err) {
      alerta('Erro ao carregar osas regras comerciais =>' + err, 2);
    }
  };

  setPedidoStatus = async (status, pedidoId) => {
    try {
      this.setState({ loading: true });
      const { empresaAtiva, usuarioAtivo } = this.state;
      let url;
      url = '/v1/ApprovalOfComercialRules/setstatus/' + empresaAtiva + '/' + usuarioAtivo;
      // //console.log(url);

      let data = {
        status,
        pedidoId,
      };
      const retorno = await api.post(url, data);
      if (retorno.data && retorno.data.sucess) {
        this.refreshScreen();
      }
    } catch (err) {
      alerta('Erro ao atualizar a venda =>' + err, 2);
    }
  };

  prepareMoneyList = async () => {
    let { approvalList } = this.state;
    let salesWaitToApproval = [];
    let approvedSales = [];
    let deniedSales = [];

    approvalList !== undefined &&
      approvalList.forEach((delivery) => {
        if (delivery.ATD_BLOQUEIO_VERBA === 'B') {
          let wait = delivery;
          wait.VERBA_APROVADA = delivery.VALOR_SOLICITADO;
          salesWaitToApproval.push(wait);
        }
        if (delivery.ATD_BLOQUEIO_VERBA === 'A') {
          approvedSales.push(delivery);
        }
        if (delivery.ATD_BLOQUEIO_VERBA === 'N') {
          deniedSales.push(delivery);
        }
        // verbasSolicitadasHoje = delivery.VERBAS_DIA_PEDIDO;
      });
    this.setState({
      salesWaitToApproval,
      approvedSales,
      deniedSales,
      // verbasSolicitadasHoje,
    });
  };

  onChangeApproveStatus = (e) => {
    let { filtro } = this.state;
    filtro = e;
    this.setState({ filtro });
  };

  refreshScreen = async () => {
    this.setState({ loading: true });
    // // this.setState({ salesReleased: [], salesBlocked: [], salesPending: [] });

    await this.loadMoneyList();
    this.setState({ loading: false });
  };

  handleChangeObservacao = (e) => {
    let { observacao } = this.state;
    observacao = e.target.value;
    this.setState({ observacao });
  };

  localOnClose = () => {
    //console.log('onClose');
  };

  render() {
    const { loading, approvalList } = this.state;
    return (
      <>
        <Header />
        <WaitScreen loading={loading} />
        <Container>
          <DirectTituloJanela
            urlVoltar={'/home'}
            titulo={
              loading ? (
                'Aguarde...'
              ) : (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon>card_giftcard</Icon>Aprovação de regras comerciais
                </span>
              )
            }
          />
          <Linha style={{ alignItems: 'stretch' }}>
            <DivDetalhe>
              <SaibRadioGroup
                valueItems={'"0","1","2","3","4","5","6","7","8","9"'}
                classNameItems={
                  '"itemTodos","itemDesconto","itemBonificacao","itemTroca","itemComodato","itemInadimplente","itemLimiteCredito","itemValorMinBoleto","itemTipoPessoa","itemFormaPgto"'
                }
                textItems={
                  '"Todos","Desconto","Bonificação","Troca", "Comodato", "Inadimplente", "Limite de crédito", "Valor mínimo boleto", "Tipo pessoa", "Forma/Cond. pagamento"'
                }
                idItems={
                  '"itemTodos","itemDesconto","itemBonificacao","itemTroca","itemComodato","itemInadimplente","itemLimiteCredito","itemValorMinBoleto","itemTipoPessoa","itemFormaPgto"'
                }
                classNameRadio="FiltroSituacaoPedido"
                flexDirectionRadio="row"
                disabledRadio="false"
                captionRadio=""
                defaultCheckedId={'itemTodos'}
                onChange={this.onChangeApproveStatus}
              />
            </DivDetalhe>
            <DivDetalhe style={{ minWidth: 'unset' }}>
              <span className="waves-effect waves-light saib-button is-primary" onClick={this.refreshScreen}>
                Filtrar
              </span>
            </DivDetalhe>
          </Linha>
          <Linha>
            {approvalList !== undefined &&
              approvalList.map((item) => (
                <Linha key={item.routeId}>
                  <Collapsible className="colapsibleRotas">
                    <CollapsibleItem
                      expanded={false}
                      header={
                        <>
                          <table>
                            <thead>
                              <th>Vendedor</th>
                              <th style={{ textAlign: 'right' }}>Quantidade</th>
                              <th style={{ textAlign: 'right' }}>Valor</th>
                            </thead>
                            <tr>
                              <td>{item.vendedor}</td>
                              <td style={{ textAlign: 'right' }}>{item.quantidadePedidos}</td>
                              <td style={{ textAlign: 'right' }}>{formatFloatBr(item.valorTotalPedidos, '')}</td>
                            </tr>
                          </table>
                        </>
                      }
                      icon={''}
                      node="div"
                    >
                      {item !== undefined &&
                        item.clientes.map((cli) => (
                          <Linha key={cli.cliId} className="preLinhaColapsibleClientes">
                            <Collapsible className="colapsibleClientes" accordion>
                              <CollapsibleItem
                                className="colapsibleClientesItem"
                                expanded={false}
                                header={
                                  <div style={{ display: 'flex' }}>
                                    <li className="material-icons plus">add_circle_outline</li>
                                    <li className="material-icons minus">remove_circle_outline</li>
                                    <table style={{ padding: '0px 5px' }}>
                                      <tr>
                                        <td>Cliente: {cli.cliente}</td>
                                      </tr>
                                    </table>
                                  </div>
                                }
                                icon={<></>}
                                node="div"
                              >
                                <Linha
                                  className="headerVendasHoje"
                                  style={{
                                    alignItems: 'center',
                                    justifyContent: 'space-evenly',
                                    padding: '4px 0px',
                                  }}
                                >
                                  {haveData(cli) && haveData(cli.vendasDoDia) && cli.vendasDoDia.length > 0 && (
                                    <>
                                      <Dialog
                                        iconeBotaoPadrao={
                                          <>
                                            <Icon>shopping_cart</Icon> Total Vendas Hoje: {formatFloatBr(cli.totaVendaDia)}
                                          </>
                                        }
                                        classeBotaoPadrao="waves-effect waves-light saib-button is-primary is-alert"
                                        textoBotaoPadrao=""
                                        titulo=""
                                        tituloBotaoSim={
                                          <>
                                            <Icon>arrow_back</Icon>
                                            Voltar
                                          </>
                                        }
                                        classeBotaoSim={'waves-effect waves-light saib-button is-primary modal-close'}
                                        tituloBotaoNao={
                                          <>
                                            <Icon>check</Icon> Liberar
                                          </>
                                        }
                                        classeBotaoNao="hidden"
                                        message={
                                          <>
                                            <DataComponentVendasDoDia data={cli.vendasDoDia} />
                                          </>
                                        }
                                        onYes={() => {}}
                                        onNo={() => {}}
                                      />
                                    </>
                                  )}
                                  {haveData(cli) && haveData(cli.vendasDoDia) && cli.vendasDoDia.length === 0 && (
                                    <span className='waves-effect waves-light saib-button is-primary is-alert'><Icon>remove_shopping_cart</Icon> Total Vendas Hoje: {formatFloatBr(cli.totaVendaDia)}</span>
                                  )}
                                </Linha>
                                <Linha
                                  className="linhaCliente"
                                  style={{
                                    alignItems: 'stretch',
                                    justifyContent: 'space-between',
                                  }}
                                >
                                  <DivDetalhe className="detalheLinhaPedido">
                                    <Labels
                                      fontSize="0.9rem"
                                      fontWeight="700"
                                      valor={cli.bonificacao}
                                      className="primeiraColunaCliente"
                                    >
                                      Bonificação
                                    </Labels>
                                    <Labels fontSize="0.9rem" fontWeight="400" valor={cli.bonificacao}>
                                      {cli.bonificacao}
                                    </Labels>
                                  </DivDetalhe>
                                  <DivDetalhe className="detalheLinhaPedido">
                                    <Labels
                                      fontSize="0.9rem"
                                      fontWeight="700"
                                      valor={cli.troca}
                                      className="segundaColunaCliente"
                                    >
                                      Troca
                                    </Labels>
                                    <Labels fontSize="0.9rem" fontWeight="400" valor={cli.troca}>
                                      {cli.troca}
                                    </Labels>
                                  </DivDetalhe>
                                  <DivDetalhe className="detalheLinhaPedido">
                                    <Labels
                                      fontSize="0.9rem"
                                      fontWeight="700"
                                      valor={cli.inadimplente}
                                      className="primeiraColunaCliente"
                                    >
                                      Inadimplente
                                    </Labels>
                                    <Labels fontSize="0.9rem" fontWeight="400" valor={cli.inadimplente}>
                                      {cli.inadimplente}
                                    </Labels>
                                  </DivDetalhe>
                                  <DivDetalhe className="detalheLinhaPedido">
                                    <Labels
                                      fontSize="0.9rem"
                                      fontWeight="700"
                                      valor={cli.limiteCredito}
                                      className="segundaColunaCliente"
                                    >
                                      Limite crédito
                                    </Labels>
                                    <Labels fontSize="0.9rem" fontWeight="400" valor={cli.limiteCredito}>
                                      {cli.limiteCredito}
                                    </Labels>
                                  </DivDetalhe>
                                  <DivDetalhe className="detalheLinhaPedido">
                                    <Labels
                                      fontSize="0.9rem"
                                      fontWeight="700"
                                      valor={cli.valorBoleto}
                                      className="primeiraColunaCliente"
                                    >
                                      Valor boleto
                                    </Labels>
                                    <Labels fontSize="0.9rem" fontWeight="400" valor={cli.valorBoleto}>
                                      {cli.valorBoleto}
                                    </Labels>
                                  </DivDetalhe>
                                  <DivDetalhe className="detalheLinhaPedido">
                                    <Labels
                                      fontSize="0.9rem"
                                      fontWeight="700"
                                      valor={cli.valorMinimo}
                                      className="segundaColunaCliente"
                                    >
                                      Valor mínimo
                                    </Labels>
                                    <Labels fontSize="0.9rem" fontWeight="400" valor={cli.valorMinimo}>
                                      {cli.valorMinimo}
                                    </Labels>
                                  </DivDetalhe>
                                  <DivDetalhe className="detalheLinhaPedido">
                                    <Labels
                                      fontSize="0.9rem"
                                      fontWeight="700"
                                      valor={cli.tipoPessoa}
                                      className="primeiraColunaCliente"
                                    >
                                      Tipo pessoa
                                    </Labels>
                                    <Labels fontSize="0.9rem" fontWeight="400" valor={cli.tipoPessoa}>
                                      {cli.tipoPessoa}
                                    </Labels>
                                  </DivDetalhe>
                                  <DivDetalhe className="detalheLinhaPedido">
                                    <Labels
                                      fontSize="0.9rem"
                                      fontWeight="700"
                                      valor={cli.formaCondicao}
                                      className="segundaColunaCliente"
                                    >
                                      Cond. pagamento
                                    </Labels>
                                    <Labels fontSize="0.9rem" fontWeight="400" valor={cli.formaCondicao}>
                                      {cli.formaCondicao}
                                    </Labels>
                                  </DivDetalhe>
                                  <DivDetalhe className="detalheLinhaPedido">
                                    <Labels
                                      fontSize="0.9rem"
                                      fontWeight="700"
                                      valor={cli.desconto}
                                      className="primeiraColunaCliente"
                                    >
                                      Desconto
                                    </Labels>
                                    <Labels fontSize="0.9rem" fontWeight="400" valor={cli.desconto}>
                                      {cli.desconto}
                                    </Labels>
                                  </DivDetalhe>
                                </Linha>
                                {cli !== undefined &&
                                  cli.vendas.map((venda) => (
                                    <Linha key={venda.pedidoId}>
                                      <Collapsible className="colapsibleVendas" accordion>
                                        <CollapsibleItem
                                          className="colapsibleVendasItem"
                                          expanded={false}
                                          header={
                                            <div style={{ display: 'flex' }}>
                                              <li className="material-icons mais">add_circle_outline</li>
                                              <li className="material-icons menos">remove_circle_outline</li>
                                              <table>
                                                <tr>
                                                  <td>Pedido: {venda.pedidoId}</td>
                                                  <td
                                                    style={{
                                                      textAlign: 'right',
                                                    }}
                                                  >
                                                    Valor: {formatFloatBr(venda.valorVenda, '')}
                                                  </td>
                                                </tr>
                                              </table>
                                            </div>
                                          }
                                          icon={<></>}
                                          node="div"
                                        >
                                          <Linha className="linhaPedido">
                                            <DivDetalhe className="detalheLinhaPedido">
                                              <Labels
                                                fontSize="0.9rem"
                                                fontWeight="700"
                                                className="primeiraColunaPedido"
                                              >
                                                Vcto cliente
                                              </Labels>
                                              <Labels fontSize="0.9rem" fontWeight="400">
                                                {venda.vctoCliente}
                                              </Labels>
                                            </DivDetalhe>
                                            <DivDetalhe className="detalheLinhaPedido">
                                              <Labels
                                                fontSize="0.9rem"
                                                fontWeight="700"
                                                className="segundaColunaPedido"
                                              >
                                                Valor bruto
                                              </Labels>
                                              <Labels
                                                fontSize="0.9rem"
                                                fontWeight="400"
                                                className="segundaColunaValorPedido"
                                              >
                                                {formatFloatBr(venda.valorBruto, '')}
                                              </Labels>
                                            </DivDetalhe>
                                            <DivDetalhe className="detalheLinhaPedido">
                                              <Labels
                                                fontSize="0.9rem"
                                                fontWeight="700"
                                                className="primeiraColunaPedido"
                                              >
                                                % Desconto
                                              </Labels>
                                              <Labels fontSize="0.9rem" fontWeight="400">
                                                {formatFloatBr(venda.percentualDesconto, '')}
                                              </Labels>
                                            </DivDetalhe>
                                            <DivDetalhe className="detalheLinhaPedido">
                                              <Labels
                                                fontSize="0.9rem"
                                                fontWeight="700"
                                                className="segundaColunaPedido"
                                              >
                                                Valor troca
                                              </Labels>
                                              <Labels
                                                fontSize="0.9rem"
                                                fontWeight="400"
                                                className="segundaColunaValorPedido"
                                              >
                                                {formatFloatBr(venda.valorTroca, '')}
                                              </Labels>
                                            </DivDetalhe>
                                            <DivDetalhe className="detalheLinhaPedido">
                                              <Labels
                                                fontSize="0.9rem"
                                                fontWeight="700"
                                                className="primeiraColunaPedido"
                                              >
                                                Pgto pedido
                                              </Labels>
                                              <Labels fontSize="0.9rem" fontWeight="400">
                                                {venda.pgtoPedido}
                                              </Labels>
                                            </DivDetalhe>
                                            <DivDetalhe className="detalheLinhaPedido">
                                              <Labels
                                                fontSize="0.9rem"
                                                fontWeight="700"
                                                className="segundaColunaPedido"
                                              >
                                                Valor bonif.
                                              </Labels>
                                              <Labels
                                                fontSize="0.9rem"
                                                fontWeight="400"
                                                className="segundaColunaValorPedido"
                                              >
                                                {formatFloatBr(venda.valorBonificacao, '')}
                                              </Labels>
                                            </DivDetalhe>
                                            <DivDetalhe className="detalheLinhaPedido">
                                              <Labels
                                                fontSize="0.9rem"
                                                fontWeight="700"
                                                className="primeiraColunaPedido"
                                              >
                                                Vcto pedido
                                              </Labels>
                                              <Labels fontSize="0.9rem" fontWeight="400">
                                                {venda.vctoPedido}
                                              </Labels>
                                            </DivDetalhe>
                                            <DivDetalhe className="detalheLinhaPedido">
                                              <Labels
                                                fontSize="0.9rem"
                                                fontWeight="700"
                                                className="segundaColunaPedido"
                                              >
                                                Valor comod.
                                              </Labels>
                                              <Labels
                                                fontSize="0.9rem"
                                                fontWeight="400"
                                                className="segundaColunaValorPedido"
                                              >
                                                {formatFloatBr(venda.valorComodato, '')}
                                              </Labels>
                                            </DivDetalhe>
                                            <DivDetalhe className="detalheLinhaPedido">
                                              <Labels
                                                fontSize="0.9rem"
                                                fontWeight="700"
                                                className="primeiraColunaPedido"
                                              >
                                                Pgto cliente
                                              </Labels>
                                              <Labels fontSize="0.9rem" fontWeight="400">
                                                {venda.pgtoCliente}
                                              </Labels>
                                            </DivDetalhe>
                                          </Linha>
                                          {haveData(venda.observacao) && (
                                            <Linha style={{ width: '100%', marginBottom: '10px' }}>
                                              <DivDetalhe>
                                                <Labels fontSize="0.9rem" fontWeight="700">
                                                  Observação
                                                </Labels>
                                                <Labels fontSize="0.9rem" fontWeight="400">
                                                  {venda.observacao}
                                                </Labels>
                                              </DivDetalhe>
                                            </Linha>
                                          )}
                                          {haveData(venda.bonificaMotivo) && (
                                            <Linha style={{ width: '100%', marginBottom: '10px' }}>
                                              <DivDetalhe>
                                                <Labels fontSize="0.9rem" fontWeight="700">
                                                  Motivo bonificação
                                                </Labels>
                                                <Labels fontSize="0.9rem" fontWeight="400">
                                                  {venda.bonificaMotivo}
                                                </Labels>
                                              </DivDetalhe>
                                            </Linha>
                                          )}
                                          <Linha style={{ justifyContent: 'center' }}>
                                            <DivDetalhe
                                              className="detalheLinhaPedido"
                                              style={{
                                                flexDirection: 'row',
                                                width: 'auto!important',
                                              }}
                                            >
                                              <button
                                                className="waves-effect waves-light saib-button is-primary"
                                                style={{
                                                  display: 'flex',
                                                  flexDirection: 'row',
                                                  alignItems: 'center',
                                                }}
                                                onClick={() => this.setPedidoStatus('L', venda.pedidoId)}
                                              >
                                                <Icon>check</Icon>Liberar
                                              </button>{' '}
                                            </DivDetalhe>
                                            <DivDetalhe
                                              className="detalheLinhaPedido"
                                              style={{
                                                flexDirection: 'row',
                                                width: 'auto!important',
                                                margin: '0px 10px',
                                              }}
                                            >
                                              <button
                                                style={{
                                                  display: 'flex',
                                                  flexDirection: 'row',
                                                  alignItems: 'center',
                                                }}
                                                onClick={() => this.setPedidoStatus('B', venda.pedidoId)}
                                                className="waves-effect waves-light saib-button is-primary"
                                              >
                                                <Icon>clear</Icon>Negar
                                              </button>{' '}
                                            </DivDetalhe>
                                            <DivDetalhe
                                              className="detalheLinhaPedido"
                                              style={{
                                                flexDirection: 'row',
                                                width: 'auto!important',
                                              }}
                                            >
                                              <Dialog
                                                iconeBotaoPadrao={<Icon>pageview</Icon>}
                                                classeBotaoPadrao="waves-effect waves-light saib-button is-primary is-primary-local"
                                                textoBotaoPadrao="Itens"
                                                titulo=""
                                                tituloBotaoSim={
                                                  <>
                                                    <Icon>arrow_back</Icon>
                                                    Voltar
                                                  </>
                                                }
                                                classeBotaoSim={
                                                  'waves-effect waves-light saib-button is-primary modal-close'
                                                }
                                                tituloBotaoNao={
                                                  <>
                                                    <Icon>check</Icon> Liberar
                                                  </>
                                                }
                                                classeBotaoNao="waves-effect waves-light saib-button is-primary modal-close"
                                                message={
                                                  <>
                                                    <DataComponent data={venda} />
                                                  </>
                                                }
                                                onYes={() => {}}
                                                onNo={() => {
                                                  this.setPedidoStatus('L', venda.pedidoId);
                                                }}
                                              />
                                            </DivDetalhe>
                                          </Linha>
                                        </CollapsibleItem>
                                      </Collapsible>
                                    </Linha>
                                  ))}
                              </CollapsibleItem>
                            </Collapsible>
                          </Linha>
                        ))}
                    </CollapsibleItem>
                  </Collapsible>
                </Linha>
              ))}
          </Linha>
        </Container>
      </>
    );
  }
}

export default ApprovalOfBusinessRules;
