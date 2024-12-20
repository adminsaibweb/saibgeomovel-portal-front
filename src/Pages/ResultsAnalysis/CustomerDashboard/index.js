import React, { forwardRef, Component } from 'react';
import Header from '../../../Components/System/Header';
import {
  DataFilter,
  DataFilterGroup,
  Container,
  SubContainer,
  LineTopFilter,
  SubContainerTitle,
  Linha,
  DivDetalhe,
} from './style';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ptBR from 'date-fns/locale/pt-BR';
import moment from 'moment';
import api from '../../../services/api';
import { getFromStorage } from '../../../services/auth';
import { alerta } from '../../../services/funcoes';
import { CustomerIndicators } from '../../../Components/ResultsAnalysis/CustomerDashboard/CustomerIndicators';
import {
  Icon,
  Chip,
  Collapsible,
  CollapsibleItem,
  Button,
} from 'react-materialize';
import M from 'materialize-css';

const CustomCalendarInput = forwardRef(({ value, onClick }, ref) => (
  <div style={{ cursor: 'pointer', marginLeft: '10px' }} onClick={onClick}>
    <button
      style={{
        backgroundColor: 'transparent',
        border: '0px',
        fontWeight: '700',
      }}
    >
      {value}
    </button>
    <div
      style={{
        cursor: 'pointer',
        display: 'inline-block',
        marginLeft: '8px',
        width: '0',
        height: '0',
        borderTop: '6px solid transparent',
        borderBottom: '6px solid transparent',
        borderLeft: '6px solid rgb(189, 32, 123)',
      }}
    ></div>
  </div>
));

export default class CustomerDashboard extends Component {
  state = {
    daySelected: new Date(),
    monthSelected: new Date(),
    dataFilterGroupPrior: -1,
    dataFilterGroup: 1,
    customSelectedInitial: 0,
    customSelectedEnd: 0,
    customerIndicators: [],
    loadingFilter: true,
    vendedoresSelecionados: [],
    ramoAtividadeSelecionados: [],
    selectedFilter: '',
  };

  componentDidMount = async () => {
    let { daySelected } = this.state;
    this.initCustomDates();
    await this.carregarVariaveisEstado();
    await this.loadEstruturaAutorizada();
    // let estrutura = this.getEstruturaAutorizada();
    // //console.log('estrutura');
    // //console.log(estrutura);
    this.handleLoadDayData(daySelected);
    this.loadAllFiltersList();
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    // //console.log(sessao);
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
    });
  };

  loadEstruturaAutorizada = async () => {
    try {
      const { empresaAtiva, usuarioAtivo } = this.state;
      const url = '/v1/dashboard/estruturaautorizada/' + empresaAtiva+ '/' + usuarioAtivo;
      const retorno = await api.get(url);

      if (!retorno) {
        return [];
      } else {
        if (retorno.data && retorno.data.sucess) {
          let estruturaAutorizada = retorno.data.data;
          //console.log('estruturaAutorizada');
          //console.log(estruturaAutorizada);
          this.setState({
            estruturaAutorizada,
          });
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

  initCustomDates = () => {
    const endOfWeek = moment();
    const startOfWeek = moment().subtract(14, 'days');
    let customSelectedInitial = startOfWeek.toDate();
    let customSelectedEnd = endOfWeek.toDate();
    this.setState({ customSelectedInitial, customSelectedEnd });
  };

  handleClickFilterGroupDay = () => {
    let { dataFilterGroupPrior, dataFilterGroup, daySelected } = this.state;
    dataFilterGroupPrior = dataFilterGroup;
    this.setState({ dataFilterGroupPrior, dataFilterGroup: 1 });
    this.handleLoadDayData(daySelected);
  };

  handleClickFilterGroupMonth = () => {
    let { dataFilterGroupPrior, dataFilterGroup, monthSelected } = this.state;
    dataFilterGroupPrior = dataFilterGroup;
    this.setState({ dataFilterGroupPrior, dataFilterGroup: 2 });
    this.handleLoadMonthData(monthSelected);
  };

  handleClickFilterGroupCustom = () => {
    let {
      dataFilterGroupPrior,
      dataFilterGroup,
      customSelectedInitial,
    } = this.state;
    dataFilterGroupPrior = dataFilterGroup;
    this.setState({ dataFilterGroupPrior, dataFilterGroup: 3 });
    this.handleLoadCustomDataInitial(customSelectedInitial);
  };

  loadTopSellers = async (startDate, finalDate, tipo) => {
    try {
      const { empresaAtiva, usuarioAtivo } = this.state;
      const url =
        '/v1/dashboard/topsellersdata/' + empresaAtiva + '/' + usuarioAtivo;
      let datas = { startDate, finalDate };

      const retorno = await api.post(url, datas);
      if (!retorno) {
        return [];
      } else {
        if (retorno.data && retorno.data.sucess) {
          let result = retorno.data.data;
          if (tipo === 'day') {
            result.title = 'Mais vendidos do dia';
          }
          if (tipo === 'month') {
            result.title = 'Mais vendidos do mês';
          }
          if (tipo === 'custom') {
            result.title = 'Mais vendidos';
          }
          // //console.log(result);
          this.setState({ loadingTopSellers: false });
          return result;
        } else {
          return [];
        }
      }
    } catch (err) {
      alerta('Erro ao carregar os mais vendidos =>' + err);
      return [];
    }
  };

  loadIndicatorsCustomer = async (startDate, finalDate, tipo) => {
    try {
      const { empresaAtiva, usuarioAtivo } = this.state;
      let vendedores, ramosAtividades, cidades, estruturaAutorizada;
      vendedores = this.getSelectedVendedores();
      ramosAtividades = this.getSelectedRamosAtividades();
      cidades = this.getSelectedCidades();
      estruturaAutorizada = this.getEstruturaAutorizada();

      const url =
        '/v1/dashboard/clientessaibgeodata/' +
        empresaAtiva +
        '/' +
        usuarioAtivo;
      let datas = {
        startDate,
        finalDate,
        cidades,
        ramosAtividades,
        vendedores,
        estruturaAutorizada,
      };

      const retorno = await api.post(url, datas);

      if (!retorno) {
        return [];
      } else {
        if (retorno.data && retorno.data.sucess) {
          let result = retorno.data.data;
          result !== undefined &&
            result.length &&
            result.forEach((_indicator) => {
                if (tipo === 'day') {
                  _indicator.legend = `${_indicator.title}`;
                  _indicator.priorLabel = 'Dia anterior';
                  _indicator.actualLabel = 'Dia atual';
                  _indicator.legendXLabel = '';
                  _indicator.legendYLabel = _indicator.title;
                }

                if (tipo === 'month') {
                  _indicator.legend = `${_indicator.title}`;
                  _indicator.priorLabel = 'Mês anterior';
                  _indicator.actualLabel = 'Mês atual';
                  _indicator.legendXLabel = '';
                  _indicator.legendYLabel = _indicator.title;
                }

                if (tipo === 'custom') {
                  _indicator.legend = `${_indicator.title}`;
                  _indicator.priorLabel =
                    moment(_indicator.startDatePrior, 'DD/MM/YYYY').format(
                      'DD/MM'
                    ) +
                    ' á ' +
                    moment(_indicator.endDatePrior, 'DD/MM/YYYY').format(
                      'DD/MM'
                    );
                  _indicator.actualLabel =
                    moment(_indicator.startDate, 'DD/MM/YYYY').format('DD/MM') +
                    ' á ' +
                    moment(_indicator.endDate, 'DD/MM/YYYY').format('DD/MM');
                  _indicator.legendXLabel = '';
                  _indicator.legendYLabel = _indicator.title;
                }
            });
          //console.log(result);
          return result;
        } else {
          return [];
        }
      }
    } catch (err) {
      // //console.log(err);
      this.setState({ loadingFilter: '0' });
      alerta(`Erro ao carregar os indicadores => ` + err);
    }
  };

  handleLoadDayData = async (daySelected) => {
    this.setState({ loadingFilter: true, loadingTopSellers: true });

    let customerIndicators = await this.loadIndicatorsCustomer(
      moment(daySelected).format('DD/MM/yyyy'),
      moment(daySelected).format('DD/MM/yyyy'),
      'day'
    );
    // let topSellers = await this.loadTopSellers(
    //   moment(daySelected).format('DD/MM/yyyy'),
    //   moment(daySelected).format('DD/MM/yyyy'),
    //   'day'
    // );

    this.setState({ loadingFilter: false, loadingTopSellers: false });
    this.setState({
      daySelected,
      customerIndicators,
      // topSellers,
      selectedFilter: 'day',
    });
  };

  handleLoadMonthData = async (monthSelected) => {
    this.setState({ loadingFilter: true, loadingTopSellers: true });
    let startDate = moment(monthSelected).startOf('month').format('DD/MM/YYYY');
    let endDate = moment(monthSelected).endOf('month').format('DD/MM/YYYY');
    let customerIndicators = await this.loadIndicatorsCustomer(
      startDate,
      endDate,
      'month'
    );
    // let topSellers = await this.loadTopSellers(startDate, endDate, 'month');
    this.setState({ loadingFilter: false, loadingTopSellers: false });
    this.setState({
      monthSelected,
      customerIndicators,
      // topSellers,
      selectedFilter: 'month',
    });
  };

  handleLoadCustomDataEnd = async (customSelectedEnd) => {
    this.setState({ loadingFilter: true, loadingTopSellers: true });
    let { customSelectedInitial } = this.state;
    let customerIndicators = await this.loadIndicatorsCustomer(
      moment(customSelectedInitial).format('DD/MM/yyyy'),
      moment(customSelectedEnd).format('DD/MM/yyyy'),
      'custom'
    );
    // let topSellers = await this.loadTopSellers(
    //   moment(customSelectedInitial).format('DD/MM/yyyy'),
    //   moment(customSelectedEnd).format('DD/MM/yyyy'),
    //   'custom'
    // );
    this.setState({ loadingFilter: false, loadingTopSellers: false });
    this.setState({
      customSelectedEnd,
      customerIndicators,
      // topSellers,
      selectedFilter: 'custom',
    });
  };

  handleLoadCustomDataInitial = async (customSelectedInitial) => {
    this.setState({ loadingFilter: true, loadingTopSellers: true });
    let { customSelectedEnd } = this.state;
    let customerIndicators = await this.loadIndicatorsCustomer(
      moment(customSelectedInitial).format('DD/MM/yyyy'),
      moment(customSelectedEnd).format('DD/MM/yyyy'),
      'custom'
    );
    // let topSellers = await this.loadTopSellers(
    //   moment(customSelectedInitial).format('DD/MM/yyyy'),
    //   moment(customSelectedEnd).format('DD/MM/yyyy'),
    //   'custom'
    // );
    this.setState({ loadingFilter: false, loadingTopSellers: false });
    this.setState({
      customSelectedInitial,
      customerIndicators,
      // topSellers,
      selectedFilter: 'custom',
    });
  };

  loadAllFiltersList = async () => {
    try {
      const { empresaAtiva, usuarioAtivo } = this.state;
      const url = '/v1/dashboard/allfilter/' + empresaAtiva+ '/' + usuarioAtivo;
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

          this.setState({
            ramosAtividades,
            cidades,
            vendedores,
            vendedoresChips,
            cidadesChips,
            ramosAtividadesChips,
          });
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

  handleAllDataUpdate = () => {
    const {
      selectedFilter,
      daySelected,
      customSelectedInitial,
      monthSelected,
    } = this.state;
    if (selectedFilter === 'day') {
      this.handleLoadDayData(daySelected);
    }
    if (selectedFilter === 'month') {
      this.handleLoadMonthData(monthSelected);
    }
    if (selectedFilter === 'custom') {
      this.handleLoadCustomDataInitial(customSelectedInitial);
    }
  };

  handleManipulaVendedores = () => {
    let vendedoresSelecionados = M.Chips.getInstance(
      document.getElementById('vendedoresChip')
    ).chipsData;
    // //console.log(vendedoresSelecionados);
    this.setState({ vendedoresSelecionados });
    setTimeout(() => {
      this.handleAllDataUpdate();
    }, 50);
  };

  handleManipulaCidades = () => {
    let cidadesSelecionadas = M.Chips.getInstance(
      document.getElementById('cidadesChips')
    ).chipsData;
    // //console.log(cidadesSelecionadas);
    this.setState({ cidadesSelecionadas });
    setTimeout(() => {
      this.handleAllDataUpdate();
    }, 50);
  };

  handleManipulaRamosAtividades = () => {
    let ramosAtividadesSelecionados = M.Chips.getInstance(
      document.getElementById('ramosAtividadesChip')
    ).chipsData;
    // //console.log(ramosAtividadesSelecionados);
    this.setState({ ramosAtividadesSelecionados });
    setTimeout(() => {
      this.handleAllDataUpdate();
    }, 50);
  };

  makeIn = (chipsElement, elements, searchText, searchKey) => {
    let inElements = '';
    // //console.log('chipsElement');
    // //console.log(chipsElement);
    // //console.log('elements');
    // //console.log(elements);
    // //console.log('searchText');
    // //console.log(searchText);
    // //console.log('searchKey');
    // //console.log(searchKey);
    if (chipsElement === undefined || elements === undefined) {
      return inElements;
    }
    for (const element of chipsElement) {
      const _element = elements.find(
        (elemento) => elemento[searchText] === element.tag
      );
      if (_element !== undefined) {
        inElements += "'" + _element[searchKey] + "',";
      }
    }
    if (inElements !== '') {
      return inElements.substr(0, inElements.length - 1);
    }
    return inElements;
  };

  getSelectedVendedores = () => {
    let { vendedoresSelecionados, vendedores } = this.state;
    return this.makeIn(
      vendedoresSelecionados,
      vendedores,
      'VENDEDOR',
      'VENDEDOR_ID'
    );
  };

  getAllVendedores = () => {
    const { vendedores } = this.state;
    let vendedoresFiltro = '';
    for (const vendedor of vendedores) {
      vendedoresFiltro += "'" + vendedor.VENDEDOR_ID + "',";
    }
    return vendedoresFiltro.substr(0, vendedoresFiltro.length - 1);
  };

  getSelectedRamosAtividades = () => {
    let { ramosAtividadesSelecionados, ramosAtividades } = this.state;
    return this.makeIn(
      ramosAtividadesSelecionados,
      ramosAtividades,
      'RAMO',
      'RAMO_ID'
    );
  };

  getSelectedCidades = () => {
    let { cidadesSelecionadas, cidades } = this.state;
    return this.makeIn(cidadesSelecionadas, cidades, 'CIDADE', 'CIDADE');
  };

  getEstruturaAutorizada = () => {
    let { estruturaAutorizada } = this.state;
    let inElements = "";

    for (const element of estruturaAutorizada) {
      inElements += "'" + element["ESTR_ID"] + "',";
    }
    
    if (inElements !== '') {
      return inElements.substr(0, inElements.length - 1);
    }
    return inElements;
  };  

  getAllRamosAtividades = () => {
    const { ramosAtividades } = this.state;
    let ramosAtividadesFiltro = '';
    for (const ramo of ramosAtividades) {
      ramosAtividadesFiltro += "'" + ramo.RAMO_ID + "',";
    }
    return ramosAtividadesFiltro.substr(0, ramosAtividadesFiltro.length - 1);
  };

  getAllCidades = () => {
    const { cidades } = this.state;
    let cidadesFiltro = '';

    for (const cidade of cidades) {
      cidadesFiltro += "'" + cidade.CIDADE + "',";
    }
    return cidadesFiltro.substr(0, cidadesFiltro.length - 1);
  };

  render() {
    const {
      daySelected,
      dataFilterGroup,
      customSelectedEnd,
      customSelectedInitial,
      resultado,
      monthSelected,
      dataFilterGroupPrior,
      customerIndicators,
      loadingFilter,
      vendedoresSelecionados,
      vendedoresChips,
      ramosAtividadesSelecionados,
      ramosAtividadesChips,
      cidadesSelecionadas,
      cidadesChips,
    } = this.state;
    return (
      <>
        <Header />
        <Container>
          <SubContainerTitle>DASHBOARD CLIENTES</SubContainerTitle>
          <SubContainer>
            {resultado !== undefined && <p>Resultado => {resultado}</p>}
            <LineTopFilter
              selected={dataFilterGroup}
              priorSelected={dataFilterGroupPrior}
            >
              {dataFilterGroup === 1 && (
                <DataFilter loading={loadingFilter ? 1 : 0}>
                  <DatePicker
                    selected={daySelected}
                    onChange={(date) => this.handleLoadDayData(date)}
                    locale={ptBR}
                    placeholderText="Selecione um dia"
                    dateFormat="dd/MM/yyyy"
                    customInput={<CustomCalendarInput />}
                    todayButton="Hoje"
                  />
                  <Icon tiny>autorenew</Icon>
                </DataFilter>
              )}
              {dataFilterGroup === 2 && (
                <DataFilter loading={loadingFilter ? 1 : 0}>
                  <Icon tiny>autorenew</Icon>
                  <DatePicker
                    selected={monthSelected}
                    onChange={(date) => this.handleLoadMonthData(date)}
                    locale={ptBR}
                    placeholderText="Selecione um mês"
                    dateFormat="MM/yyyy"
                    showMonthYearPicker
                    showFullMonthYearPicker
                    showTwoColumnMonthYearPicker
                    customInput={<CustomCalendarInput />}
                  />
                </DataFilter>
              )}
              {dataFilterGroup === 3 && (
                <DataFilter loading={loadingFilter ? 1 : 0}>
                  <DatePicker
                    selected={customSelectedInitial}
                    onChange={(date) => this.handleLoadCustomDataInitial(date)}
                    locale={ptBR}
                    placeholderText="Data inicial"
                    dateFormat="dd/MM/yyyy"
                    selectsStart
                    startDate={customSelectedInitial}
                    endDate={customSelectedEnd}
                    customInput={<CustomCalendarInput />}
                  />
                  <DatePicker
                    selected={customSelectedEnd}
                    onChange={(date) => this.handleLoadCustomDataEnd(date)}
                    selectsEnd
                    startDate={customSelectedEnd}
                    endDate={customSelectedEnd}
                    minDate={customSelectedInitial}
                    locale={ptBR}
                    placeholderText="Data final"
                    dateFormat="dd/MM/yyyy"
                    customInput={<CustomCalendarInput />}
                  />
                  <Icon tiny>autorenew</Icon>
                </DataFilter>
              )}
              <DataFilterGroup
                selected={dataFilterGroup}
                priorSelected={dataFilterGroupPrior}
              >
                <div
                  className="dataFilterGroupDay"
                  onClick={this.handleClickFilterGroupDay}
                >
                  Dia
                  <hr className="dataFilterGroupDayHr" />{' '}
                </div>
                <div
                  className="dataFilterGroupMonth"
                  onClick={this.handleClickFilterGroupMonth}
                >
                  Mensal
                  <hr className="dataFilterGroupMonthHr" />
                </div>
                <div
                  className="dataFilterGroupCustom"
                  onClick={this.handleClickFilterGroupCustom}
                >
                  Customizado
                  <hr className="dataFilterGroupCustomHr" />{' '}
                </div>
              </DataFilterGroup>
            </LineTopFilter>
            <Linha className="filter">
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
                  header="Clique para filtrar"
                  icon={<Icon>filter_list</Icon>}
                  node="div"
                >
                  <Linha style={{ alignItems: 'row', display: 'flex' }}>
                    <DivDetalhe style={{ flex: 3 }}>
                      <label>Vendedores</label>
                      <Chip
                        id="vendedoresChip"
                        className="vendedoresChip"
                        close={false}
                        closeIcon={<Icon className="close">close</Icon>}
                        options={{
                          data:
                            vendedoresSelecionados !== undefined &&
                            vendedoresSelecionados,
                          onChipAdd: this.handleManipulaVendedores,
                          onChipDelete: this.handleManipulaVendedores,
                          autocompleteOptions: {
                            data: vendedoresChips,
                            limit: 5,
                            minLength: 1,
                            onAutocomplete: function noRefCheck() {},
                          },
                        }}
                      />
                    </DivDetalhe>
                    <DivDetalhe style={{ flex: 3 }}>
                      <label>Cidades</label>
                      <Chip
                        id="cidadesChips"
                        className="cidadesChips"
                        close={false}
                        closeIcon={<Icon className="close">close</Icon>}
                        options={{
                          data:
                            cidadesSelecionadas !== undefined &&
                            cidadesSelecionadas,
                          onChipAdd: this.handleManipulaCidades,
                          onChipDelete: this.handleManipulaCidades,
                          autocompleteOptions: {
                            data: cidadesChips,
                            limit: 5,
                            minLength: 1,
                            onAutocomplete: function noRefCheck() {},
                          },
                        }}
                      />
                    </DivDetalhe>
                    <DivDetalhe style={{ flex: 3 }}>
                      <label>Ramos atividades</label>
                      <Chip
                        id="ramosAtividadesChip"
                        className="ramosAtividadesChip"
                        close={false}
                        closeIcon={<Icon className="close">close</Icon>}
                        options={{
                          data:
                            ramosAtividadesSelecionados !== undefined &&
                            ramosAtividadesSelecionados,
                          onChipAdd: this.handleManipulaRamosAtividades,
                          onChipDelete: this.handleManipulaRamosAtividades,
                          autocompleteOptions: {
                            data: ramosAtividadesChips,
                            limit: 5,
                            minLength: 1,
                            onAutocomplete: function noRefCheck() {},
                          },
                        }}
                      />
                    </DivDetalhe>
                  </Linha>
                  <Linha>
                    <Button
                      className="waves-effect waves-light saib-button is-primary"
                      onClick={() => {
                        this.setState({
                          ramosAtividadesSelecionados: [],
                          cidadesSelecionadas: [],
                          vendedoresSelecionados: [],
                        });
                        setTimeout(() => {
                          this.handleAllDataUpdate();
                        }, 50);
                      }}
                    >
                      Limpar
                    </Button>
                  </Linha>
                </CollapsibleItem>
              </Collapsible>
            </Linha>
            {customerIndicators !== undefined &&
              customerIndicators.length > 0 && (
                <CustomerIndicators
                  data={customerIndicators}
                  loading={loadingFilter ? 1 : 0}
                />
              )}
          </SubContainer>
        </Container>
      </>
    );
  }
}
