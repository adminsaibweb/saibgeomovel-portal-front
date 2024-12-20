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
import Skeleton from 'react-loading-skeleton';
import SalesAndTeamGoalsData from '../../../Components/Extracts/SalesAndTeamGoalsData';
import SaibRadioGroup from '../../../Components/Globals/SaibRadioGroup';

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

export default class SalesAndTeamGoals extends Component {
  state = {
    daySelected: new Date(),
    monthSelected: new Date(),
    dataFilterGroupPrior: -1,
    dataFilterGroup: 1,
    customSelectedInitial: 0,
    customSelectedEnd: 0,
    reportData: [],
    loading: true,
    vendedoresSelecionados: [],
    selectedFilter: '',
    changedFilter: 0,
    tipoTotalizador: 0,
  };

  componentDidMount = async () => {
    let { daySelected } = this.state;
    this.initCustomDates();
    await this.carregarVariaveisEstado();
    await this.loadFiltersList();
    await this.loadEstruturaAutorizada();
    this.handleLoadDayData(daySelected, true);
  };

  loadEstruturaAutorizada = async () => {
    try {
      const { empresaAtiva, usuarioAtivo } = this.state;
      const url =
        '/v1/dashboard/estruturaautorizada/' +
        empresaAtiva +
        '/' +
        usuarioAtivo;
      const retorno = await api.get(url);

      if (!retorno) {
        return [];
      } else {
        if (retorno.data && retorno.data.sucess) {
          let estruturaAutorizada = retorno.data.data;
          this.setState({
            estruturaAutorizada,
          });
        } else {
          return [];
        }
      }
    } catch (err) {
      // //console.log(err);
      this.setState({ loading: false });
      alerta(`Erro ao carregar a estrututa autorizada => ` + err);
    }
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
    this.setState({
      dataFilterGroupPrior,
      dataFilterGroup: 1,
      selectedFilter: 'day',
    });
    this.handleLoadDayData(daySelected);
    this.onChangeFilter();
  };

  handleClickFilterGroupMonth = () => {
    let { dataFilterGroupPrior, dataFilterGroup, monthSelected } = this.state;
    dataFilterGroupPrior = dataFilterGroup;
    this.setState({
      dataFilterGroupPrior,
      dataFilterGroup: 2,
      selectedFilter: 'month',
    });
    this.handleLoadMonthData(monthSelected);
    this.onChangeFilter();
  };

  handleClickFilterGroupCustom = () => {
    let {
      dataFilterGroupPrior,
      dataFilterGroup,
      customSelectedInitial,
    } = this.state;
    dataFilterGroupPrior = dataFilterGroup;
    this.setState({
      dataFilterGroupPrior,
      dataFilterGroup: 3,
      selectedFilter: 'custom',
    });
    this.handleLoadCustomDataInitial(customSelectedInitial);
    this.onChangeFilter();
  };

  getEstruturaAutorizada = () => {
    let inElements = '';
    let { estruturaAutorizada } = this.state;

    if (estruturaAutorizada !== undefined) {
      for (const element of estruturaAutorizada) {
        inElements += "'" + element['ESTR_ID'] + "',";
      }

      if (inElements !== '') {
        return inElements.substr(0, inElements.length - 1);
      }
    }

    if (inElements === '') {
      inElements = '-9999999';
    }
    return inElements;
  };

  loadDataOf = async (startDate, finalDate, tipo) => {
    try {
      // return;
      const { empresaAtiva, usuarioAtivo, tipoTotalizador } = this.state;
      let vendedores,
        canais,
        produtos,
        marcas,
        embalagens,
        sabores,
        supervisores;

      vendedores = this.getSelectedVendedores();
      canais = this.getSelectedcanais();
      produtos = this.getSelectedProdutos();
      marcas = this.getSelectedMarcas();
      embalagens = this.getSelectedEmbalagens();
      sabores = this.getSelectedSabores();
      supervisores = this.getSelectedSupervisores();

      //console.log('vendedores');
      //console.log(vendedores);
      //console.log('canais');
      //console.log(canais);
      //console.log('produtos');
      //console.log(produtos);
      //console.log('marcas');
      //console.log(marcas);
      //console.log('supervisores');
      //console.log(supervisores);
      //console.log('tipoTotalizador');
      //console.log(tipoTotalizador);

      const url =
        '/v1/extracts/salesandteamgoals/sales/' +
        empresaAtiva +
        '/' +
        usuarioAtivo;
      let datas = {
        dataInicial: startDate,
        dataFinal: finalDate,
        canais,
        vendedores,
        estruturaAutorizada: this.getEstruturaAutorizada(),
        tipo,
        produtos,
        marcas,
        embalagens,
        sabores,
        supervisores,
        totalizar: tipoTotalizador,
      };

      // //console.log(datas);

      const retorno = await api.post(url, datas);

      if (!retorno) {
        return [];
      } else {
        if (retorno.data && retorno.data.sucess) {
          let result = retorno.data.data;
          //console.log(result);
          return result;
        } else {
          return [];
        }
      }
    } catch (err) {
      // //console.log(err);
      this.setState({ loading: false });
      alerta(`Erro ao carregar os indicadores => ` + err);
    }
  };

  handleLoadDayData = async (daySelected, initialLoaging = false) => {
    this.setState({
      loading: true,
      selectedFilter: 'day',
      daySelected,
      reportData: [],
    });
    if (!initialLoaging) {
      this.onChangeFilter();
    }
    let reportData = await this.loadDataOf(
      moment(daySelected).format('DD/MM/yyyy'),
      moment(daySelected).format('DD/MM/yyyy'),
      'day'
    );
    setTimeout(() => {
      this.onChangeFilter();
    }, 50);

    //console.log('reportData');
    //console.log(reportData);
    this.setState({ reportData, loading: false });
  };

  handleLoadMonthData = async (monthSelected) => {
    this.setState({ loading: true, selectedFilter: 'month', reportData: [] });

    this.onChangeFilter();

    let startDate = moment(monthSelected).startOf('month').format('DD/MM/YYYY');
    let endDate = moment(monthSelected).endOf('month').format('DD/MM/YYYY');
    let reportData = await this.loadDataOf(startDate, endDate, 'month');

    setTimeout(() => {
      this.onChangeFilter();
    }, 50);
    this.setState({
      monthSelected,
      reportData,
      loading: false,
    });
  };

  handleLoadCustomDataEnd = async (customSelectedEnd) => {
    this.setState({ loading: true, selectedFilter: 'custom', reportData: [] });
    this.onChangeFilter();
    let { customSelectedInitial } = this.state;
    let reportData = await this.loadDataOf(
      moment(customSelectedInitial).format('DD/MM/yyyy'),
      moment(customSelectedEnd).format('DD/MM/yyyy'),
      'custom'
    );
    setTimeout(() => {
      this.onChangeFilter();
    }, 50);
    this.setState({ loading: false });
    this.setState({
      customSelectedEnd,
      reportData,
    });
  };

  handleLoadCustomDataInitial = async (customSelectedInitial) => {
    this.setState({ loading: true, selectedFilter: 'custom', reportData: [] });
    this.onChangeFilter();
    let { customSelectedEnd } = this.state;
    let reportData = await this.loadDataOf(
      moment(customSelectedInitial).format('DD/MM/yyyy'),
      moment(customSelectedEnd).format('DD/MM/yyyy'),
      'custom'
    );
    setTimeout(() => {
      this.onChangeFilter();
    }, 50);
    this.setState({ loading: false });
    this.setState({
      customSelectedInitial,
      reportData,
    });
  };

  loadFiltersList = async () => {
    try {
      const { empresaAtiva, usuarioAtivo } = this.state;
      const url =
        '/v1/extracts/salesandteamgoals/allfilter/' +
        empresaAtiva +
        '/' +
        usuarioAtivo;
      const retorno = await api.get(url);
      // //console.log(retorno);

      if (!retorno) {
        return [];
      } else {
        if (retorno.data && retorno.data.sucess) {
          let result = retorno.data.data;
          //console.log('result');
          //console.log(result);

          let canais = result.canais;
          let canaisChips = {};
          let embalagens = result.embalagens;
          let embalagensChips = {};
          let marcas = result.marcas;
          let marcasChips = {};
          let produtos = result.produtos;
          let produtosChips = {};
          let sabores = result.sabores;
          let saboresChips = {};
          let vendedores = result.vendedores;
          let vendedoresChips = {};
          let retornoRdp = result.retornoRdp;
          let retornoRdpChips = {};
          let supervisores = result.supervisores;
          let supervisoresChips = {};

          for (const retorno of supervisores) {
            supervisoresChips[retorno.SUPERVISOR] = null;
          }
          for (const retorno of retornoRdp) {
            retornoRdpChips[retorno.RETORNORDP_DESCRICAO] = null;
          }
          for (const embalagem of embalagens) {
            embalagensChips[embalagem] = null;
          }
          for (const marca of marcas) {
            marcasChips[marca] = null;
          }
          for (const produto of produtos) {
            produtosChips[produto.PROD_DESCR] = null;
          }
          for (const vendedor of vendedores) {
            vendedoresChips[vendedor.VENDEDOR] = null;
          }
          for (const canal of canais) {
            canaisChips[canal.CANAL] = null;
          }
          for (const sabor of sabores) {
            saboresChips[sabor] = null;
          }
          this.setState({
            canais,
            canaisChips,
            vendedores,
            vendedoresChips,
            sabores,
            saboresChips,
            produtos,
            produtosChips,
            embalagens,
            embalagensChips,
            marcas,
            marcasChips,
            retornoRdp,
            retornoRdpChips,
            supervisores,
            supervisoresChips,
          });
        } else {
          return [];
        }
      }
    } catch (err) {
      // //console.log(err);
      this.setState({ loading: false });
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
    // //console.log('handleAllDataUpdate');
    if (selectedFilter === 'day') {
      this.handleLoadDayData(daySelected);
    }
    if (selectedFilter === 'month') {
      this.handleLoadMonthData(monthSelected);
    }
    if (selectedFilter === 'custom') {
      this.handleLoadCustomDataInitial(customSelectedInitial);
    }
    this.onChangeFilter();
  };

  handleManipulaVendedores = () => {
    let dados = M.Chips.getInstance(document.getElementById('vendedoresChip'));
    let vendedoresSelecionados;
    if (dados !== undefined) {
      vendedoresSelecionados = dados.chipsData;
    } else {
      vendedoresSelecionados = [];
    }

    this.setState({ vendedoresSelecionados });
    setTimeout(() => {
      this.handleAllDataUpdate();
    }, 5);
  };

  handleManipulaCanais = () => {
    let dados = M.Chips.getInstance(document.getElementById('canaisChips'));

    let canaisSelecionadas;
    if (dados !== undefined) {
      canaisSelecionadas = dados.chipsData;
      if (canaisSelecionadas.length > 1) {
        canaisSelecionadas.splice(1, 1);
      }
    } else {
      canaisSelecionadas = [];
    }

    this.setState({ canaisSelecionadas });
    setTimeout(() => {
      this.handleAllDataUpdate();
    }, 5);
  };

  handleManipulaRetornoRdp = () => {
    let dados = M.Chips.getInstance(document.getElementById('retornoRdpChip'));

    let retornoRdpSelecionados;
    if (dados !== undefined) {
      retornoRdpSelecionados = dados.chipsData;
      if (retornoRdpSelecionados.length > 1) {
        retornoRdpSelecionados.splice(1, 1);
      }
    } else {
      retornoRdpSelecionados = [];
    }

    this.setState({ retornoRdpSelecionados });
    setTimeout(() => {
      this.handleAllDataUpdate();
    }, 5);
  };

  handleManipulaEmbalagens = () => {
    let dados = M.Chips.getInstance(document.getElementById('embalagensChip'));

    let embalagensSelecionadas;
    if (dados !== undefined) {
      embalagensSelecionadas = dados.chipsData;
    } else {
      embalagensSelecionadas = [];
    }

    this.setState({ embalagensSelecionadas });
    setTimeout(() => {
      this.handleAllDataUpdate();
    }, 5);
  };

  handleManipulaSabores = () => {
    let dados = M.Chips.getInstance(document.getElementById('saboresChip'));

    let saboresSelecionados;
    if (dados !== undefined) {
      saboresSelecionados = dados.chipsData;
    } else {
      saboresSelecionados = [];
    }

    this.setState({ saboresSelecionados });
    setTimeout(() => {
      this.handleAllDataUpdate();
    }, 5);
  };

  handleManipulaProdutos = () => {
    let dados = M.Chips.getInstance(document.getElementById('produtosChip'));

    let produtosSelecionados;
    if (dados !== undefined) {
      produtosSelecionados = dados.chipsData;
    } else {
      produtosSelecionados = [];
    }

    this.setState({ produtosSelecionados });
    setTimeout(() => {
      this.handleAllDataUpdate();
    }, 5);
  };

  handleManipulaSupervisores = () => {
    let dados = M.Chips.getInstance(document.getElementById('supervisorChip'));

    let supervisoresSelecionados;
    if (dados !== undefined) {
      supervisoresSelecionados = dados.chipsData;
    } else {
      supervisoresSelecionados = [];
    }

    this.setState({ supervisoresSelecionados });
    setTimeout(() => {
      this.handleAllDataUpdate();
    }, 5);
  };

  handleManipulaMarcas = () => {
    let dados = M.Chips.getInstance(document.getElementById('marcasChip'));

    let marcasSelecionadas;
    if (dados !== undefined) {
      marcasSelecionadas = dados.chipsData;
    } else {
      marcasSelecionadas = [];
    }

    this.setState({ marcasSelecionadas });
    setTimeout(() => {
      this.handleAllDataUpdate();
    }, 5);
  };

  makeIn = (chipsElement, elements, searchText, searchKey) => {
    let inElements = '';
    if (chipsElement === undefined || elements === undefined) {
      return inElements;
    }
    for (const element of chipsElement) {
      if (searchText === '' || searchKey === '') {
        inElements += "'" + element.tag + "',";
      } else {
        const _element = elements.find(
          (elemento) => elemento[searchText] === element.tag
        );
        if (_element !== undefined) {
          inElements += "'" + _element[searchKey] + "',";
        }
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

  getAllSupervisores = () => {
    const { supervisores } = this.state;
    let supervisorFiltro = '';
    for (const supervisor of supervisores) {
      supervisorFiltro += "'" + supervisor.COD_SUPERVISOR_ID + "',";
    }
    return supervisorFiltro.substr(0, supervisorFiltro.length - 1);
  };

  getSelectedcanais = () => {
    let { canaisSelecionadas, canais } = this.state;
    return this.makeIn(canaisSelecionadas, canais, 'CANAL', 'CANAL_ID');
  };

  getSelectedSupervisores = () => {
    let { supervisoresSelecionados, supervisores } = this.state;
    return this.makeIn(
      supervisoresSelecionados,
      supervisores,
      'SUPERVISOR',
      'COD_SUPERVISOR_ID'
    );
  };

  getSelectedProdutos = () => {
    let { produtosSelecionados, produtos } = this.state;
    return this.makeIn(produtosSelecionados, produtos, 'PROD_DESCR', 'PROD_ID');
  };

  getSelectedMarcas = () => {
    let { marcasSelecionadas, marcas } = this.state;
    return this.makeIn(marcasSelecionadas, marcas, '', '');
  };

  getSelectedEmbalagens = () => {
    let { embalagensSelecionadas, embalagens } = this.state;
    return this.makeIn(embalagensSelecionadas, embalagens, '', '');
  };

  getSelectedSabores = () => {
    let { saboresSelecionados, sabores } = this.state;
    return this.makeIn(saboresSelecionados, sabores, '', '');
  };

  getAllcanais = () => {
    const { canais } = this.state;
    let canaisFiltro = '';

    for (const canal of canais) {
      canaisFiltro += "'" + canal.CANAL + "',";
    }
    return canaisFiltro.substr(0, canaisFiltro.length - 1);
  };

  onChangeFilter = () => {
    let { changedFilter } = this.state;
    changedFilter += 1;
    this.setState({ changedFilter });
    // //console.log('onChangeFilter - HistoryFlexibleDiscountBalance');
  };

  onChangeFiltroSituacaoEntrega = (status) => {
    // //console.log(status);
    this.setState({ tipoTotalizador: status });
    setTimeout(() => {
      this.handleAllDataUpdate();
    }, 10);
  };

  render() {
    const {
      daySelected,
      dataFilterGroup,
      customSelectedEnd,
      customSelectedInitial,
      monthSelected,
      dataFilterGroupPrior,
      loading,
      vendedoresChips,
      canaisChips,
      changedFilter,

      reportData,
      produtosChips,
      marcasChips,

      saboresChips,
      embalagensChips,

      vendedoresSelecionados,
      canaisSelecionadas,
      produtosSelecionados,
      marcasSelecionadas,
      saboresSelecionados,
      embalagensSelecionadas,
      supervisoresSelecionados,
      supervisoresChips,

      tipoTotalizador,
    } = this.state;
    return (
      <>
        <Header />
        <Container>
          <SubContainer className="kpiContainer">
            <SubContainerTitle>Rel. Vendas e Metas Equipes.</SubContainerTitle>
            {/* {resultado !== undefined && <p>Resultado => {resultado}</p>} */}
            <LineTopFilter
              selected={dataFilterGroup}
              priorSelected={dataFilterGroupPrior}
            >
              {dataFilterGroup === 1 && (
                <DataFilter loading={loading ? 1 : 0}>
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
                <DataFilter loading={loading ? 1 : 0}>
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
                <DataFilter loading={loading ? 1 : 0}>
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
                      <label>Supervisores</label>
                      <Chip
                        id="supervisorChip"
                        className="supervisorChip"
                        close={false}
                        closeIcon={<Icon className="close">close</Icon>}
                        options={{
                          data:
                            supervisoresSelecionados !== undefined &&
                            supervisoresSelecionados,
                          onChipAdd: this.handleManipulaSupervisores,
                          onChipDelete: this.handleManipulaSupervisores,
                          autocompleteOptions: {
                            data: supervisoresChips,
                            minLength: 1,
                            onAutocomplete: function noRefCheck() {},
                          },
                        }}
                      />
                    </DivDetalhe>
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
                  </Linha>
                  <Linha style={{ alignItems: 'row', display: 'flex' }}>
                    <DivDetalhe style={{ flex: 3 }}>
                      <label>Produtos</label>
                      <Chip
                        id="produtosChip"
                        className="produtosChip"
                        close={false}
                        closeIcon={<Icon className="close">close</Icon>}
                        options={{
                          data:
                            produtosSelecionados !== undefined &&
                            produtosSelecionados,
                          onChipAdd: this.handleManipulaProdutos,
                          onChipDelete: this.handleManipulaProdutos,
                          autocompleteOptions: {
                            data: produtosChips,
                            minLength: 1,
                            onAutocomplete: function noRefCheck() {},
                          },
                        }}
                      />
                    </DivDetalhe>
                    <DivDetalhe style={{ flex: 3 }}>
                      <label>Marcas</label>
                      <Chip
                        id="marcasChip"
                        className="marcasChip"
                        close={false}
                        closeIcon={<Icon className="close">close</Icon>}
                        options={{
                          data:
                            marcasSelecionadas !== undefined &&
                            marcasSelecionadas,
                          onChipAdd: this.handleManipulaMarcas,
                          onChipDelete: this.handleManipulaMarcas,
                          autocompleteOptions: {
                            data: marcasChips,
                            minLength: 1,
                            onAutocomplete: function noRefCheck() {},
                          },
                        }}
                      />
                    </DivDetalhe>
                  </Linha>
                  <Linha style={{ alignItems: 'row', display: 'flex' }}>
                    <DivDetalhe style={{ flex: 3 }}>
                      <label>Embalagens</label>
                      <Chip
                        id="embalagensChip"
                        className="embalagensChip"
                        close={false}
                        closeIcon={<Icon className="close">close</Icon>}
                        options={{
                          data:
                            embalagensSelecionadas !== undefined &&
                            embalagensSelecionadas,
                          onChipAdd: this.handleManipulaEmbalagens,
                          onChipDelete: this.handleManipulaEmbalagens,
                          autocompleteOptions: {
                            data: embalagensChips,
                            onAutocomplete: function noRefCheck() {},
                          },
                        }}
                      />
                    </DivDetalhe>
                    <DivDetalhe style={{ flex: 3 }}>
                      <label>Sabores</label>
                      <Chip
                        id="saboresChip"
                        className="saboresChip"
                        close={false}
                        closeIcon={<Icon className="close">close</Icon>}
                        options={{
                          data:
                            saboresSelecionados !== undefined &&
                            saboresSelecionados,
                          onChipAdd: this.handleManipulaSabores,
                          onChipDelete: this.handleManipulaSabores,
                          autocompleteOptions: {
                            data: saboresChips,
                            minLength: 1,
                            onAutocomplete: function noRefCheck() {},
                          },
                        }}
                      />
                    </DivDetalhe>
                  </Linha>
                  <Linha>
                    <DivDetalhe style={{ flex: 3 }}>
                      <label>Canais</label>
                      <Chip
                        id="canaisChips"
                        className="canaisChips"
                        close={false}
                        closeIcon={<Icon className="close">close</Icon>}
                        options={{
                          data:
                            canaisSelecionadas !== undefined &&
                            canaisSelecionadas,
                          onChipAdd: this.handleManipulaCanais,
                          onChipDelete: this.handleManipulaCanais,
                          autocompleteOptions: {
                            data: canaisChips,
                            limit: 1,
                            minLength: 1,
                            onAutocomplete: function noRefCheck() {},
                          },
                        }}
                      />
                    </DivDetalhe>{' '}
                    <DivDetalhe style={{ flex: 3 }}>
                      <SaibRadioGroup
                        valueItems={'"0","1","2","3"'}
                        classNameItems={
                          '"itemGeral","itemSupervisor","itemRota","itemCliente"'
                        }
                        textItems={'"Geral","Supervisor","Vendedor","Cliente"'}
                        idItems={'"itemGeral","itemSupervisor","itemRota","itemCliente"'}
                        classNameRadio="FiltroTotalizacao"
                        flexDirectionRadio="row"
                        disabledRadio="false"
                        captionRadio="Totalizar"
                        defaultCheckedId={'itemGeral'}
                        onChange={this.onChangeFiltroSituacaoEntrega}
                      />
                    </DivDetalhe>
                  </Linha>
                  <Linha>
                    <DivDetalhe style={{ flex: 3 }}>
                      <Button
                        className="waves-effect waves-light saib-button is-primary"
                        onClick={() => {
                          this.setState({
                            supervisoresSelecionados: [],
                            vendedoresSelecionados: [],
                            produtosSelecionados: [],
                            marcasSelecionadas: [],
                            embalagensSelecionadas: [],
                            saboresSelecionados: [],
                            canaisSelecionados: [],
                          });
                          setTimeout(() => {
                            this.handleAllDataUpdate();
                          }, 50);
                        }}
                      >
                        Limpar
                      </Button>
                    </DivDetalhe>
                  </Linha>
                </CollapsibleItem>
              </Collapsible>
            </Linha>
            {reportData !== undefined ? (
              <SalesAndTeamGoalsData
                changedFilter={changedFilter}
                data={reportData}
                loading={loading ? 1 : 0}
                totalizador={tipoTotalizador}
                vendedoresSelecionados={vendedoresSelecionados}
                canaisSelecionadas={canaisSelecionadas}
                produtosSelecionados={produtosSelecionados}
                marcasSelecionadas={marcasSelecionadas}
                saboresSelecionados={saboresSelecionados}
                embalagensSelecionadas={embalagensSelecionadas}
                supervisoresSelecionados={supervisoresSelecionados}
              />
            ) : (
              <>
                <Linha style={{ alignItems: 'inherit' }}>
                  <DivDetalhe style={{ width: '100%' }} loading={1}>
                    <Skeleton count={10} />
                  </DivDetalhe>
                </Linha>
              </>
            )}
          </SubContainer>
        </Container>
      </>
    );
  }
}
