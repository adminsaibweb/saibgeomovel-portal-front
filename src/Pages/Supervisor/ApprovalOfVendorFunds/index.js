import React, { forwardRef, Component } from 'react';
import Header from '../../../Components/System/Header';
import {
  Kanban,
  LinhaKanban,
  DivBaseKanbanTituloPai,
  DivBaseKanbanBase,
  KanbanContainer,
  DivBaseKanban,
  DataFilter,
  Container,
  Linha,
  DivDetalhe,
  TdTitle,
  ProductCard,
} from './styles';
import NumberFormat from 'react-number-format';
import DirectTituloJanela from '../../../Components/Globals/DirectTituloJanela';
import { Icon, Collapsible, CollapsibleItem, Chip } from 'react-materialize';
import M from 'materialize-css';
import SaibRadioGroup from '../../../Components/Globals/SaibRadioGroup';
import ptBR from 'date-fns/locale/pt-BR';
import InputMask from 'react-input-mask';
import DatePicker from 'react-datepicker';
import { getFromStorage } from '../../../services/auth';
import {
  alerta,
  formatFloatBr,
  formatOracleDateToBr,
  currencyFormat,
  tratarErros,
} from '../../../services/funcoes';
import api from '../../../services/api';
import { format, startOfMonth } from 'date-fns';
import Dialog from '../../../Components/Globals/Question';
import './forced.css';

const CustomCalendarInput = forwardRef(({ value, onClick, onChange }, ref) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'row',
      width: '130px',
      justifyContent: 'space-around',
      borderBottom: '1px solid #ccc',
    }}
  >
    <InputMask
      style={{ width: '100px' }}
      mask="99/99/9999"
      value={value}
      maskChar={null}
      onChange={onChange}
      // onClick={onClick}
      // onBlur={(e) => this.handleValidarData(e, 'Data Inicial')}
    />
    <span
      onClick={onClick}
      style={{ cursor: 'pointer', color: 'rgb(97, 9, 138)' }}
    >
      <Icon>date_range</Icon>
    </span>
  </div>
));

const DataComponent = (props) => {
  return (
    <>
      <Collapsible
        accordion={false}
        style={{
          width: '100%',
          borderStyle: 'none',
          boxShadow: 'none',
        }}
      >
        <CollapsibleItem
          expanded={true}
          header="Dados da venda"
          icon={<Icon>shopping_cart</Icon>}
          node="div"
        >
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
                    {props.data.PEDIDO}
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
                      backgroundColor: props.data.ALERTA_ATENDIMENTO
                        ? 'red'
                        : 'rgb(46,204,113)',
                    }}
                  >
                    {props.data.CLIENTE ? props.data.CLIENTE.toLowerCase() : ''}
                  </td>
                </tr>
                <tr>
                  <TdTitle>Data pedido</TdTitle>
                  <td
                    style={{
                      paddingTop: '0px',
                      paddingBottom: '2px',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    {formatOracleDateToBr(props.data.PCF_DATA)}
                  </td>
                </tr>
                <tr>
                  <TdTitle>Rota</TdTitle>
                  <td
                    style={{
                      paddingTop: '0px',
                      paddingBottom: '2px',
                      textAlign: 'left',
                      width: '100%',
                      textTransform: 'capitalize',
                    }}
                  >
                    {props.data.VENDEDOR ? props.data.VENDEDOR.toLowerCase() : ''}
                  </td>
                </tr>
                <tr>
                  <TdTitle>Verba solicitada</TdTitle>
                  <td
                    style={{
                      paddingTop: '0px',
                      paddingBottom: '2px',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    {formatFloatBr(props.data.VALOR_SOLICITADO)}
                  </td>
                </tr>
                <tr>
                  <TdTitle>Dia visita</TdTitle>
                  <td
                    style={{
                      paddingTop: '0px',
                      paddingBottom: '2px',
                      textAlign: 'left',
                      width: '100%',
                      textTransform: 'capitalize',
                    }}
                  >
                    {props.data.DIA_VISITA ? props.data.DIA_VISITA.toLowerCase() : ''}
                  </td>
                </tr>
                <tr>
                  <TdTitle>Situação</TdTitle>
                  <td
                    style={{
                      paddingTop: '0px',
                      paddingBottom: '2px',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    {props.data.ATD_BLOQUEIO_VERBA === 'B'
                      ? 'Aguardando'
                      : props.data.ATD_BLOQUEIO_VERBA === 'A'
                      ? 'Aprovada'
                      : 'Negada'}
                  </td>
                </tr>
                <tr>
                  <TdTitle>Observação</TdTitle>
                  <td
                    style={{
                      paddingTop: '0px',
                      paddingBottom: '2px',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    {props.data.OBS_VERBA}
                  </td>
                </tr>
                <tr>
                  <TdTitle>Tipo verba</TdTitle>
                  <td
                    style={{
                      paddingTop: '0px',
                      paddingBottom: '2px',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    {props.data.TIPO_VERBA}
                  </td>
                </tr>
                <tr
                  style={{
                    display:
                      props.data.VERBA_APROVADA !== undefined
                        ? 'table-row'
                        : 'none',
                  }}
                >
                  <TdTitle style={{ textAlign: 'right', fontSize: '1.5rem' }}>
                    Aprovar
                  </TdTitle>
                  <td
                    style={{
                      paddingTop: '0px',
                      paddingBottom: '2px',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    <NumberFormat
                      className="valorSolicitado"
                      value={props.data.VERBA_APROVADA}
                      onValueChange={(e) =>
                        props.onUpdateSale(e, props.data.PEDIDO, props.data)
                      }
                      thousandSeparator={'.'}
                      decimalSeparator={','}
                      decimalScale={'2'}
                      fixedDecimalScale={'true'}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </CollapsibleItem>
      </Collapsible>
      <Collapsible
        accordion={false}
        style={{
          width: '100%',
          borderStyle: 'none',
          boxShadow: 'none',
        }}
      >
        <CollapsibleItem
          expanded={false}
          header="Produtos da venda"
          icon={<Icon>shopping_basket</Icon>}
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
                    {item.PROD_CODIGO + ' - ' + item.PROD_DESCR ? item.PROD_DESCR.toLowerCase() : ''}
                  </p>
                  <p>
                    <small>Emb.</small>{' '}
                    <li>{item.PROD_EMBALAGEM ? item.PROD_EMBALAGEM.toLowerCase() : ''}</li>
                  </p>
                  <p>
                    <small>Mar.</small> <li>{item.PROD_MARCA ? item.PROD_MARCA.toLowerCase() : ''}</li>
                  </p>
                  <p>
                    <small>Und.</small> <li>{item.PROD_UND}</li>
                  </p>
                  <p>
                    <small>Vlr unit.</small> <li>{item.VALOR_UNIT}</li>
                  </p>
                  <p>
                    <small>Qtde</small> <li>{item.PED_QTDE}</li>
                  </p>
                  <p>
                    <small>Vlr desc</small> <li>{item.VALOR_TOTAL_DESC}</li>
                  </p>
                  <p>
                    <small>Vlr frete</small> <li>{item.VALOR_TOTAL_FRETE}</li>
                  </p>
                  <p>
                    <small>Valor</small> <li>{item.VALOR}</li>
                  </p>
                </ProductCard>
              ))}
          </div>
        </CollapsibleItem>
      </Collapsible>
    </>
  );
};

class ApprovalOfVendorFunds extends Component {
  state = {
    loading: false,
    carregandoFiltro: true,
    defaultFiltroSituacaoEntrega: '0',
    salesStatus: -1,
    startDate: new Date(),
    endDate: new Date(),
    verbaDisponivel: 0,
    verbasSolicitadasHoje: 0,
    verbasAprovadasHoje: 0,
    verbaAprovada: -1,
    atdId: -1,
    moneyType: 1,
  };

  componentDidMount = async () => {
    await this.carregarVariaveisEstado();
    this.loadFiltersList();
    const startDate = startOfMonth(new Date());
    this.setState({ startDate });
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
    const {
      empresaAtiva,
      startDate,
      endDate,
      salesStatus,
      moneyType,
    } = this.state;
    try {
      const { usuarioAtivo } = this.state;
      let url;
      url = '/v1/approvalofvendorfunds/' + empresaAtiva + '/' + usuarioAtivo;
      // //console.log(url);
      let routes = M.Chips.getInstance(
        document.getElementById('vendedoresChip')
      ).chipsData;
      let routesIn = await this.getRoutesList(routes);

      let data = {
        startDate: format(startDate, 'dd/MM/yyyy'),
        endDate: format(endDate, 'dd/MM/yyyy'),
        salesStatus: salesStatus,
        routesIn: routesIn,
        moneyType: moneyType === 0 ? 1 : moneyType,
      };
      const retorno = await api.post(url, data);
      if (retorno.data && retorno.data.sucess) {
        const approvalList = retorno.data.data.PEDIDOS;
        this.setState({
          approvalList,
          verbaOrigem: retorno.data.data.VERBA.TIPO_VERBA,
          verbaDisponivel: retorno.data.data.VERBA.VERBA_DISPONIVEL,
          verbasSolicitadasHoje: retorno.data.data.VERBA.VERBA_SOLICITADA,
          verbasAprovadasHoje: retorno.data.data.VERBA.VERBA_APROVADA,

        });
      }
    } catch (err) {
      alerta('Erro ao carregar os verbas =>' + err, 2);
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

  onChangeFiltroSituacaoEntrega = (e) => {
    let { salesStatus } = this.state;
    salesStatus = e;
    this.setState({ salesStatus });
    this.onChangeFilter();
  };

  onChangeFilter = () =>{
    this.setState({approvalList: []});
    setTimeout(()=>{
      this.prepareMoneyList()
    }, 1);
  }

  onChangeFilterMoneyType = (e) => {
    let { moneyType } = this.state;
    moneyType = e;
    // //console.log('moneyType');
    // //console.log(moneyType);
    this.onChangeFilter();
    this.setState({ moneyType });
  };

  refreshScreen = async () => {
    this.setState({ loading: true });
    // // this.setState({ salesReleased: [], salesBlocked: [], salesPending: [] });

    await this.loadMoneyList();
    await this.prepareMoneyList();
    this.setState({ loading: false, atdId: -1, verbaAprovada: -1 });
  };

  loadFiltersList = async () => {
    try {
      const { empresaAtiva, usuarioAtivo } = this.state;
      const url =
        '/v1/dashboard/allfilter/' + empresaAtiva + '/' + usuarioAtivo;
      const retorno = await api.get(url);

      if (!retorno) {
        return [];
      } else {
        if (retorno.data && retorno.data.sucess) {
          let result = retorno.data.data;
          // //console.log('result');
          // //console.log(result);

          let ramosAtividades = result.ramos;
          let ramosAtividadesChips = {};
          let cidades = result.cidades;
          let cidadesChips = {};
          let vendedores = result.vendedores;
          let vendedoresChips = {};

          // //console.log('ramosAtividades');
          // //console.log(ramosAtividades);
          // //console.log('cidades');
          // //console.log(cidades);
          // //console.log('vendedores');
          // //console.log(vendedores);

          for (const vendedor of vendedores) {
            vendedoresChips[vendedor.VENDEDOR] = null;
          }
          for (const cidade of cidades) {
            cidadesChips[cidade.CIDADE] = null;
          }
          for (const ramo of ramosAtividades) {
            ramosAtividadesChips[ramo.RAMO] = null;
          }
          let carregandoFiltro = false;

          this.setState({
            ramosAtividades,
            cidades,
            vendedores,
            vendedoresChips,
            cidadesChips,
            ramosAtividadesChips,
            carregandoFiltro,
          });
          // alert('fim');
        } else {
          return [];
        }
      }
    } catch (err) {
      // //console.log(err);
      this.setState({ loadingFilter: '0' });
      alerta(`Erro ao carregar os filtros => ` + err);
    }
  };

  setDenied = async (sale) => {
    const { atdId, verbaAprovada, empresaAtiva, usuarioAtivo } = this.state;
    try {
      let url;
      url =
        '/v1/approvalofvendorfunds/deny/' + empresaAtiva + '/' + usuarioAtivo;
      // //console.log(url);

      let data = {
        atdId: atdId !== -1 ? atdId : sale.PEDIDO,
        verbaAprovada:
          verbaAprovada !== -1 ? verbaAprovada : sale.VALOR_SOLICITADO,
      };
      const retorno = await api.post(url, data);
      // //console.log('retorno');
      // //console.log(retorno);
      return retorno.data && retorno.data.sucess;
    } catch (err) {
      //console.log('err');
      //console.log(err);
      alerta('Erro ao negar a verba =>' + err, 2);
    }
  };

  setApproved = async (sale) => {
    let {
      verbaDisponivel,
      verbaAprovada,
      empresaAtiva,
      usuarioAtivo,
      moneyType,
    } = this.state;
    try {
      // //console.log(verbaDisponivel);
      // //console.log(verbaDisponivel);

      verbaAprovada =
        verbaAprovada === -1 ? sale.VALOR_SOLICITADO : verbaAprovada;
      if (verbaDisponivel < verbaAprovada) {
        alerta('Você não tem verba suficiente para esta aprovação.', 2);
        return false;
      }
      let url;
      url =
        '/v1/approvalofvendorfunds/approve/' +
        empresaAtiva +
        '/' +
        usuarioAtivo;
      // //console.log(url);

      let data = {
        atdId: sale.PEDIDO,
        verbaAprovada:
          verbaAprovada !== -1 ? verbaAprovada : sale.VALOR_SOLICITADO,
        moneyType,
      };
      const retorno = await api.post(url, data);
      this.setState({ atdId: -1 });
      //console.log(retorno.data);
      return retorno.data && retorno.data.sucess;
    } catch (err) {
      tratarErros(err);
    }
  };

  onUpdateSale = (e, numeroPedido, sale) => {
    let { atdId, verbaAprovada } = this.state;
    if (verbaAprovada === e.floatValue) {
      return;
    }
    // //console.log(e);
    if (e.floatValue === undefined || e.floatValue < 0) {
      verbaAprovada = 0;
    } else {
      verbaAprovada = e.floatValue;
    }
    atdId = numeroPedido;
    // if (verbaAprovada > verbaDisponivel){
    //   alerta('Não há verba suficiente para aprovação.', 2);
    //   verbaAprovada = verbaDisponivel;
    //   // return;
    // }
    // if (verbaAprovada > sale.VALOR_SOLICITADO){
    //   verbaAprovada = sale.VALOR_SOLICITADO;
    // }
    sale.VERBA_APROVADA = verbaAprovada;
    this.setState({ atdId, verbaAprovada });
  };

  onChangeStartDate = (e) => {
    this.setState({ startDate: e });
    this.onChangeFilter();

  };

  onChangeEndDate = (e) => {
    this.setState({ endDate: e });
    this.onChangeFilter();
  };

  render() {
    const {
      loading,
      startDate,
      endDate,
      salesWaitToApproval,
      verbasSolicitadasHoje,
      approvedSales,
      deniedSales,
      vendedoresChips,
      carregandoFiltro,
      verbaDisponivel,
      verbasAprovadasHoje,
    } = this.state;
    return (
      <>
        <div
          style={{
            display: loading !== false ? 'block' : 'none',
            position: 'absolute',
            height: '100vh',
            width: '100vw',
            top: '0px',
            left: '0px',
            backgroundColor: '#00000069',
            zIndex: '1',
          }}
          id="loading"
        ></div>
        <Header />
        <Container>
          <DirectTituloJanela
            urlVoltar={'/home'}
            titulo={
              loading ? (
                'Aguarde...'
              ) : (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon>card_giftcard</Icon>Aprovação de verbas de pedidos
                </span>
              )
            }
          />
          <Linha style={{ alignItems: 'stretch' }}>
            <DivDetalhe>
              <span style={{ paddingLeft: '10px', fontWeight: '700' }}>
                Data de cadastro
              </span>
              <DataFilter
                loading={loading ? 1 : 0}
                style={{ flexWrap: 'wrap' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ paddingLeft: '10px' }}>Data incial</label>
                  <DatePicker
                    id="startDate"
                    selected={startDate}
                    onChange={this.onChangeStartDate}
                    locale={ptBR}
                    placeholderText="Data inicial"
                    dateFormat="dd/MM/yyyy"
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    customInput={<CustomCalendarInput />}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ paddingLeft: '10px' }}>Data final</label>
                  <DatePicker
                    selected={endDate}
                    onChange={this.onChangeEndDate}
                    selectsEnd
                    startDate={endDate}
                    endDate={endDate}
                    minDate={startDate}
                    locale={ptBR}
                    placeholderText="Data final"
                    dateFormat="dd/MM/yyyy"
                    customInput={<CustomCalendarInput />}
                  />
                </div>
              </DataFilter>
            </DivDetalhe>
            <DivDetalhe>
              <SaibRadioGroup
                valueItems={'"-1","B","A","N"'}
                classNameItems={
                  '"itemTodos","itemAguardando","itemAprovados","itemNegado"'
                }
                textItems={'"Todos","Aguardando","Aprovados","Negados"'}
                idItems={
                  '"itemtodos","itemAguardando","itemAprovados","itemNegado"'
                }
                classNameRadio="FiltroSituacaoPedido"
                flexDirectionRadio="row"
                disabledRadio="false"
                captionRadio="Situação Pedido"
                defaultCheckedId={'itemtodos'}
                onChange={this.onChangeFiltroSituacaoEntrega}
              />
            </DivDetalhe>
            <DivDetalhe>
              <SaibRadioGroup
                valueItems={'"1","2","3","4","5"'}
                classNameItems={
                  '"verbaSupervisor","verbaTroca","verbaFlexivel","verbaEmpresa","verbaMarketing"'
                }
                textItems={'"Supervisor","Troca","Flexível","Empresa","Marketing"'}
                idItems={
                  '"verbaSupervisor","verbaTroca","verbaFlexivel","verbaEmpresa","verbaMarketing"'
                }
                classNameRadio="FiltroTipoVerba"
                flexDirectionRadio="row"
                disabledRadio="false"
                captionRadio="Tipo Verba"
                defaultCheckedId={'verbaSupervisor'}
                onChange={this.onChangeFilterMoneyType}
              />
            </DivDetalhe>
            <DivDetalhe>
              <span style={{ paddingLeft: '10px', fontWeight: '700' }}>
                Vendedor
              </span>
              <Chip
                id="vendedoresChip"
                className="vendedoresChip"
                close={false}
                closeIcon={<Icon className="close">close</Icon>}
                options={{
                  // onChipAdd: this.handleManipulaVendedores,
                  // onChipDelete: this.handleManipulaVendedores,
                  placeholder: carregandoFiltro ? 'Carregando...' : ' ',
                  autocompleteOptions: {
                    data: vendedoresChips,
                    limit: 1,
                    minLength: 1,
                    onAutocomplete: function noRefCheck() {},
                  },
                }}
              />
            </DivDetalhe>
            <DivDetalhe style={{ marginTop: '44px' }}>
              <span
                className="waves-effect waves-light saib-button is-primary"
                onClick={this.refreshScreen}
              >
                Filtrar
              </span>
            </DivDetalhe>
          </Linha>
          <Linha
            style={{
              background: 'linear-gradient(to right,#8e44ad8c,#bf1f7cbf)',
              color: 'white',
              textAlign: 'center',
            }}
          >
            <h5
              style={{
                fontSize: '1.5rem',
                margin: '0px',
                width: '100%',
                fontWeight: '300',
              }}
            >
              Verba disponível:{' '}
              <strong style={{ fontWeight: '700' }}>
                {formatFloatBr(verbaDisponivel)}
              </strong>
            </h5>
          </Linha>
          <Linha
            style={{
              background: 'linear-gradient(to right,#8e44ad8c,#bf1f7cbf)',
              color: 'white',
              textAlign: 'center',
            }}
          >
            <h5
              style={{
                fontSize: '1.0rem',
                margin: '0px',
                width: '100%',
                fontWeight: '300',
              }}
            >
              Solicitada hoje:{' '}
              <strong style={{ fontWeight: '700' }}>
                {formatFloatBr(verbasSolicitadasHoje)}
              </strong>
            </h5>
          </Linha>
          <Linha
            style={{
              background: 'linear-gradient(to right,#8e44ad8c,#bf1f7cbf)',
              color: 'white',
              textAlign: 'center',
              marginTop: '0px',
            }}
          >
            <h5
              style={{
                fontSize: '1.0rem',
                margin: '0px',
                width: '100%',
                fontWeight: '300',
              }}
            >
              Aprovada hoje:{' '}
              <strong style={{ fontWeight: '700' }}>
                {formatFloatBr(verbasAprovadasHoje)}
              </strong>
            </h5>
          </Linha>
          <LinhaKanban>
            <Kanban cor={'#8870A4'}>
              <DivBaseKanbanTituloPai cor={'#8870A4'}>
                :: Aguardando
              </DivBaseKanbanTituloPai>
              <KanbanContainer>
                {salesWaitToApproval !== undefined &&
                  salesWaitToApproval.map((sale) => (
                    <DivBaseKanban key={sale.PEDIDO} className="divBaseKanban">
                      <Linha
                        className="linha"
                        style={{
                          padding: '5px 10px 0px 10px',
                          margin: '0px',
                          lineHeight: '0.9rem',
                          justifyContent: 'space-between',
                        }}
                      >
                        <DivDetalhe>
                          <p>Vendedor</p>
                          <p
                            style={{
                              fontWeight: '700',
                              fontSize: '1.0rem',
                              width: '100%',
                              textAlign: 'center',
                              textTransform: 'capitalize',
                            }}
                          >
                            {sale.VENDEDOR ? sale.VENDEDOR.toLowerCase() : ''}
                          </p>
                        </DivDetalhe>
                        <DivDetalhe>
                          <p>Nr.Pedido</p>
                          <p
                            style={{
                              fontWeight: '700',
                              fontSize: '1.0rem',
                              width: '100%',
                              textAlign: 'center',
                            }}
                          >
                            {sale.PEDIDO}
                          </p>
                        </DivDetalhe>
                      </Linha>
                      <Linha
                        style={{
                          padding: '5px 10px 0px 10px',
                          margin: '0px',
                          lineHeight: '0.9rem',
                          justifyContent: 'space-between',
                        }}
                      >
                        <DivDetalhe style={{ width: '100%' }}>
                          <p>Cliente</p>
                          <p
                            style={{
                              fontWeight: '700',
                              fontSize: '1.0rem',
                              width: '100%',
                              textAlign: 'left',
                              textTransform: 'capitalize',
                              alignItems: 'center',
                              color:
                                sale.ALERTA_ATENDIMENTO === 0
                                  ? '#27ae60'
                                  : '#c0392b',
                            }}
                          >
                            {sale.CLIENTE ? sale.CLIENTE.toLowerCase().substr(1, 50) : ''}
                          </p>
                        </DivDetalhe>
                      </Linha>
                      <Linha
                        style={{
                          alignItems: 'stretch',
                          justifyContent: 'space-between',
                          marginTop: '0px',
                          padding: '5px 10px 0px 10px',
                          lineHeight: '1rem',
                        }}
                      >
                        <DivDetalhe>
                          <p>Cidade</p>
                          <p
                            style={{
                              fontWeight: '700',
                              fontSize: '0.9rem',
                              textAlign: 'center',
                              textTransform: 'capitalize',
                              marginTop: 'auto',
                            }}
                          >
                            {sale.CLI_CIDADE}
                          </p>
                        </DivDetalhe>
                        <DivDetalhe style={{ alignItems: 'center' }}>
                          <p>Data pedido</p>
                          <p
                            style={{
                              fontWeight: '700',
                              fontSize: '0.9rem',
                              textAlign: 'center',
                              textTransform: 'capitalize',
                            }}
                          >
                            {formatOracleDateToBr(sale.DATA_SOLICITACAO)}
                          </p>
                        </DivDetalhe>
                      </Linha>
                      <Linha
                        style={{
                          alignItems: 'stretch',
                          justifyContent: 'space-between',
                          marginTop: '0px',
                          padding: '5px 10px 0px 10px',
                          lineHeight: '1rem',
                        }}
                      >
                        <DivDetalhe>
                          <p>Valor pedido</p>
                          <p
                            style={{
                              fontWeight: '700',
                              fontSize: '0.9rem',
                              textAlign: 'left',
                              textTransform: 'capitalize',
                              marginTop: 'auto',
                            }}
                          >
                            {currencyFormat(sale.VALOR_TOTAL_PEDIDO)}
                          </p>
                        </DivDetalhe>
                        <DivDetalhe style={{ alignItems: 'center' }}>
                          <p>Verba x Pedido</p>
                          <p
                            style={{
                              fontWeight: '700',
                              fontSize: '0.9rem',
                              textAlign: 'right',
                              textTransform: 'capitalize',
                              width: '100%',
                            }}
                          >
                            {sale.PERCENTUAL_VERBA_PEDIDO}
                          </p>
                        </DivDetalhe>
                      </Linha>
                      <Linha
                        style={{
                          justifyContent: 'center',
                          padding: '5px 10px 0px 10px',
                          alignItems: 'center',
                          marginTop: '0px',
                        }}
                      >
                        <DivDetalhe>
                          <p
                            style={{
                              fontWeight: '300',
                              fontSize: '1rem',
                              textAlign: 'center',
                            }}
                          >
                            Valor solicitado:{' '}
                            <strong
                              style={{ fontWeight: '700', fontSize: '1.5rem' }}
                            >
                              {formatFloatBr(sale.VALOR_SOLICITADO)}
                            </strong>
                          </p>
                        </DivDetalhe>
                      </Linha>
                      <DivBaseKanbanBase style={{ margin: '0px 5px 10px 5px' }}>
                        <Dialog
                          iconeBotaoPadrao={
                            <span
                              title="Negar a verba"
                              style={{
                                width: '10px!important',
                                display: 'flex',
                              }}
                            >
                              &nbsp;<Icon>block</Icon>
                            </span>
                          }
                          classeBotaoPadrao="waves-effect waves-light saib-button botao-base is-secondary"
                          textoBotaoPadrao="Negar"
                          titulo="Negar a verba para esta venda?"
                          tituloBotaoSim="Sim"
                          classeBotaoSim="waves-effect waves-light saib-button is-primary modal-close"
                          tituloBotaoNao="Não"
                          classeBotaoNao="waves-effect waves-light saib-button is-primary modal-close"
                          message={
                            <DataComponent
                              data={sale}
                              onUpdateSale={this.onUpdateSale}
                            />
                          }
                          onNo={() => {}}
                          onYes={async () => {
                            if (await this.setDenied(sale)) {
                              this.refreshScreen();
                            } else {
                              alerta('Verba não negada!', 2);
                            }
                          }}
                        />
                        <Dialog
                          iconeBotaoPadrao={
                            <span
                              title="Aprovar a verba"
                              style={{
                                width: '10px!important',
                                display: 'flex',
                              }}
                            >
                              &nbsp;<Icon>check</Icon>
                            </span>
                          }
                          classeBotaoPadrao="waves-effect waves-light saib-button botao-base is-secondary"
                          textoBotaoPadrao="Aprovar"
                          titulo="Aprovar verba solicitada?"
                          tituloBotaoSim="Sim"
                          classeBotaoSim="waves-effect waves-light saib-button is-primary modal-close"
                          tituloBotaoNao="Não"
                          classeBotaoNao="waves-effect waves-light saib-button is-primary modal-close"
                          message={
                            <DataComponent
                              data={sale}
                              onUpdateSale={this.onUpdateSale}
                            />
                          }
                          onNo={() => {}}
                          // onYes={()=>this.setApproved(sale)}
                          onYes={async () => {
                            if (await this.setApproved(sale)) {
                              this.refreshScreen();
                            } else {
                              alerta('Verba não aprovada!', 2);
                            }
                          }}
                        />
                      </DivBaseKanbanBase>
                    </DivBaseKanban>
                  ))}
              </KanbanContainer>
            </Kanban>
            <Kanban cor={'#27ae60'}>
              <DivBaseKanbanTituloPai cor={'#27ae60'}>
                :: Aprovados
              </DivBaseKanbanTituloPai>
              <KanbanContainer>
                {approvedSales !== undefined &&
                  approvedSales.map((sale) => (
                    <DivBaseKanban key={sale.PEDIDO} className="divBaseKanban">
                      <Linha
                        className="linha"
                        style={{
                          padding: '5px 10px 0px 10px',
                          margin: '0px',
                          lineHeight: '0.9rem',
                          justifyContent: 'space-between',
                        }}
                      >
                        <DivDetalhe>
                          <p>Vendedor</p>
                          <p
                            style={{
                              fontWeight: '700',
                              fontSize: '1.0rem',
                              width: '100%',
                              textAlign: 'center',
                              textTransform: 'capitalize',
                            }}
                          >
                            {sale.VENDEDOR ? sale.VENDEDOR.toLowerCase(): ''}
                          </p>
                        </DivDetalhe>
                        <DivDetalhe>
                          <p>Nr.Pedido</p>
                          <p
                            style={{
                              fontWeight: '700',
                              fontSize: '1.0rem',
                              width: '100%',
                              textAlign: 'center',
                            }}
                          >
                            {sale.PEDIDO}
                          </p>
                        </DivDetalhe>
                      </Linha>
                      <Linha
                        style={{
                          padding: '5px 10px 0px 10px',
                          margin: '0px',
                          lineHeight: '0.9rem',
                          justifyContent: 'space-between',
                        }}
                      >
                        <DivDetalhe style={{ width: '100%' }}>
                          <p>Cliente</p>
                          <p
                            style={{
                              fontWeight: '700',
                              fontSize: '1.0rem',
                              width: '100%',
                              textAlign: 'left',
                              textTransform: 'capitalize',
                              alignItems: 'center',
                              color:
                                sale.ALERTA_ATENDIMENTO === 0
                                  ? '#27ae60'
                                  : '#c0392b',
                            }}
                          >
                            {sale.CLIENTE ? sale.CLIENTE.toLowerCase().substr(1, 50) : ''}
                          </p>
                        </DivDetalhe>
                      </Linha>
                      <Linha
                        style={{
                          alignItems: 'stretch',
                          justifyContent: 'space-between',
                          marginTop: '0px',
                          padding: '5px 10px 0px 10px',
                          lineHeight: '1rem',
                        }}
                      >
                        <DivDetalhe>
                          <p>Cidade</p>
                          <p
                            style={{
                              fontWeight: '700',
                              fontSize: '0.9rem',
                              textAlign: 'center',
                              textTransform: 'capitalize',
                              marginTop: 'auto',
                            }}
                          >
                            {sale.CLI_CIDADE}
                          </p>
                        </DivDetalhe>
                        <DivDetalhe style={{ alignItems: 'center' }}>
                          <p>Data pedido</p>
                          <p
                            style={{
                              fontWeight: '700',
                              fontSize: '0.9rem',
                              textAlign: 'center',
                              textTransform: 'capitalize',
                            }}
                          >
                            {formatOracleDateToBr(sale.DATA_SOLICITACAO)}
                          </p>
                        </DivDetalhe>
                      </Linha>
                      <Linha
                        style={{
                          alignItems: 'stretch',
                          justifyContent: 'space-between',
                          marginTop: '0px',
                          padding: '5px 10px 0px 10px',
                          lineHeight: '1rem',
                        }}
                      >
                        <DivDetalhe>
                          <p>Valor pedido</p>
                          <p
                            style={{
                              fontWeight: '700',
                              fontSize: '0.9rem',
                              textAlign: 'left',
                              textTransform: 'capitalize',
                              marginTop: 'auto',
                            }}
                          >
                            {currencyFormat(sale.VALOR_TOTAL_PEDIDO)}
                          </p>
                        </DivDetalhe>
                        <DivDetalhe style={{ alignItems: 'center' }}>
                          <p>Verba x Pedido</p>
                          <p
                            style={{
                              fontWeight: '700',
                              fontSize: '0.9rem',
                              textAlign: 'right',
                              textTransform: 'capitalize',
                              width: '100%',
                            }}
                          >
                            {sale.PERCENTUAL_VERBA_PEDIDO}
                          </p>
                        </DivDetalhe>
                      </Linha>

                      <Linha
                        style={{
                          justifyContent: 'center',
                          padding: '5px 10px 0px 10px',
                          alignItems: 'center',
                          marginTop: '0px',
                          color: '#8e44ad',
                        }}
                      >
                        <DivDetalhe>
                          <p
                            style={{
                              fontWeight: '700',
                              fontSize: '1rem',
                              textAlign: 'center',
                            }}
                          >
                            Valor atendido:{' '}
                            <strong
                              style={{ fontWeight: '900', fontSize: '1.5rem' }}
                            >
                              {formatFloatBr(sale.VALOR_ATENDIDO)}
                            </strong>
                          </p>
                        </DivDetalhe>
                      </Linha>
                      <Linha
                        style={{
                          justifyContent: 'center',
                          padding: '0px 10px 0px 10px',
                          alignItems: 'center',
                          marginTop: '0px',
                        }}
                      >
                        <DivDetalhe>
                          <p
                            style={{
                              fontWeight: '300',
                              fontSize: '0.9rem',
                              textAlign: 'center',
                            }}
                          >
                            Valor solicitado:{' '}
                            {formatFloatBr(sale.VALOR_SOLICITADO)}
                          </p>
                        </DivDetalhe>
                      </Linha>
                      <DivBaseKanbanBase style={{ margin: '0px 5px 10px 5px' }}>
                        <Dialog
                          iconeBotaoPadrao={
                            <span
                              title="Ver pedido"
                              style={{
                                width: '10px!important',
                                display: 'flex',
                              }}
                            >
                              &nbsp;<Icon>pageview</Icon>
                            </span>
                          }
                          classeBotaoPadrao="waves-effect waves-light saib-button botao-base is-secondary"
                          textoBotaoPadrao="Ver"
                          titulo=""
                          tituloBotaoSim="Sim"
                          classeBotaoSim="waves-effect waves-light saib-button is-primary modal-close hidden"
                          tituloBotaoNao="Fechar"
                          classeBotaoNao="waves-effect waves-light saib-button is-primary modal-close"
                          message={
                            <DataComponent
                              data={sale}
                              onUpdateSale={this.onUpdateSale}
                            />
                          }
                          onNo={() => {}}
                          onYes={() => {}}
                        />
                      </DivBaseKanbanBase>
                    </DivBaseKanban>
                  ))}
              </KanbanContainer>
            </Kanban>{' '}
            <Kanban cor={'#c0392b'}>
              <DivBaseKanbanTituloPai cor={'#c0392b'}>
                :: Negados
              </DivBaseKanbanTituloPai>
              <KanbanContainer>
                {deniedSales !== undefined &&
                  deniedSales.map((sale) => (
                    <DivBaseKanban key={sale.PEDIDO} className="divBaseKanban">
                      <Linha
                        className="linha"
                        style={{
                          padding: '5px 10px 0px 10px',
                          margin: '0px',
                          lineHeight: '0.9rem',
                          justifyContent: 'space-between',
                        }}
                      >
                        <DivDetalhe>
                          <p>Vendedor</p>
                          <p
                            style={{
                              fontWeight: '700',
                              fontSize: '1.0rem',
                              width: '100%',
                              textAlign: 'center',
                              textTransform: 'capitalize',
                            }}
                          >
                            {sale.VENDEDOR ? sale.VENDEDOR.toLowerCase() : ''}
                          </p>
                        </DivDetalhe>
                        <DivDetalhe>
                          <p>Nr.Pedido</p>
                          <p
                            style={{
                              fontWeight: '700',
                              fontSize: '1.0rem',
                              width: '100%',
                              textAlign: 'center',
                            }}
                          >
                            {sale.PEDIDO}
                          </p>
                        </DivDetalhe>
                      </Linha>
                      <Linha
                        style={{
                          padding: '5px 10px 0px 10px',
                          margin: '0px',
                          lineHeight: '0.9rem',
                          justifyContent: 'space-between',
                        }}
                      >
                        <DivDetalhe style={{ width: '100%' }}>
                          <p>Cliente</p>
                          <p
                            style={{
                              fontWeight: '700',
                              fontSize: '1.0rem',
                              width: '100%',
                              textAlign: 'left',
                              textTransform: 'capitalize',
                              alignItems: 'center',
                              color:
                                sale.ALERTA_ATENDIMENTO === 0
                                  ? '#27ae60'
                                  : '#c0392b',
                            }}
                          >
                            {sale.CLIENTE ? sale.CLIENTE.toLowerCase().substr(1, 50): ''}
                          </p>
                        </DivDetalhe>
                      </Linha>
                      <Linha
                        style={{
                          alignItems: 'stretch',
                          justifyContent: 'space-between',
                          marginTop: '0px',
                          padding: '5px 10px 0px 10px',
                          lineHeight: '1rem',
                        }}
                      >
                        <DivDetalhe>
                          <p>Cidade</p>
                          <p
                            style={{
                              fontWeight: '700',
                              fontSize: '0.9rem',
                              textAlign: 'center',
                              textTransform: 'capitalize',
                              marginTop: 'auto',
                            }}
                          >
                            {sale.CLI_CIDADE}
                          </p>
                        </DivDetalhe>
                        <DivDetalhe style={{ alignItems: 'center' }}>
                          <p>Data pedido</p>
                          <p
                            style={{
                              fontWeight: '700',
                              fontSize: '0.9rem',
                              textAlign: 'center',
                              textTransform: 'capitalize',
                            }}
                          >
                            {formatOracleDateToBr(sale.DATA_SOLICITACAO)}
                          </p>
                        </DivDetalhe>
                      </Linha>
                      <Linha
                        style={{
                          alignItems: 'stretch',
                          justifyContent: 'space-between',
                          marginTop: '0px',
                          padding: '5px 10px 0px 10px',
                          lineHeight: '1rem',
                        }}
                      >
                        <DivDetalhe>
                          <p>Valor pedido</p>
                          <p
                            style={{
                              fontWeight: '700',
                              fontSize: '0.9rem',
                              textAlign: 'left',
                              textTransform: 'capitalize',
                              marginTop: 'auto',
                            }}
                          >
                            {currencyFormat(sale.VALOR_TOTAL_PEDIDO)}
                          </p>
                        </DivDetalhe>
                        <DivDetalhe style={{ alignItems: 'center' }}>
                          <p>Verba x Pedido</p>
                          <p
                            style={{
                              fontWeight: '700',
                              fontSize: '0.9rem',
                              textAlign: 'right',
                              textTransform: 'capitalize',
                              width: '100%',
                            }}
                          >
                            {sale.PERCENTUAL_VERBA_PEDIDO}
                          </p>
                        </DivDetalhe>
                      </Linha>

                      <Linha
                        style={{
                          justifyContent: 'center',
                          padding: '5px 10px 0px 10px',
                          alignItems: 'center',
                          marginTop: '0px',
                        }}
                      >
                        <DivDetalhe>
                          <p
                            style={{
                              fontWeight: '300',
                              fontSize: '1rem',
                              textAlign: 'center',
                            }}
                          >
                            Valor solicitado:{' '}
                            <strong
                              style={{ fontWeight: '700', fontSize: '1.5rem' }}
                            >
                              {formatFloatBr(sale.VALOR_SOLICITADO)}
                            </strong>
                          </p>
                        </DivDetalhe>
                      </Linha>
                      <DivBaseKanbanBase style={{ margin: '0px 5px 10px 5px' }}>
                        <Dialog
                          iconeBotaoPadrao={
                            <span
                              title="Ver pedido"
                              style={{
                                width: '10px!important',
                                display: 'flex',
                              }}
                            >
                              &nbsp;<Icon>pageview</Icon>
                            </span>
                          }
                          classeBotaoPadrao="waves-effect waves-light saib-button botao-base is-secondary"
                          textoBotaoPadrao="Ver"
                          titulo=""
                          tituloBotaoSim="Sim"
                          classeBotaoSim="waves-effect waves-light saib-button is-primary modal-close hidden"
                          tituloBotaoNao="Fechar"
                          classeBotaoNao="waves-effect waves-light saib-button is-primary modal-close"
                          message={
                            <DataComponent
                              data={sale}
                              onUpdateSale={this.onUpdateSale}
                            />
                          }
                          onNo={() => {}}
                          onYes={() => {}}
                        />
                      </DivBaseKanbanBase>
                    </DivBaseKanban>
                  ))}
              </KanbanContainer>
            </Kanban>{' '}
          </LinhaKanban>
        </Container>
      </>
    );
  }
}

export default ApprovalOfVendorFunds;
