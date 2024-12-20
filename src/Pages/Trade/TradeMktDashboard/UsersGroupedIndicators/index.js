import React, { Component, forwardRef } from 'react';
import { withRouter } from 'react-router-dom';
import { getFromStorage } from '../../../../services/auth';
import {
  alerta,
} from '../../../../services/funcoes';
import {
  Chip,
  Icon,
  Button,
  Collapsible,
  CollapsibleItem,
} from 'react-materialize';
import api from '../../../../services/api';
import {
  DataFilter,
  DataFilterGroup,
  Container,
  SubContainer,
  LineTopFilter,
  SubContainerTitle,
  Linha,
  DivDetalhe,
  Graph,
  Line,
  IndicatorsLine,
} from '../style';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ptBR from 'date-fns/locale/pt-BR';
import Skeleton from 'react-loading-skeleton';
import { KpiIndicators } from '../../../../Components/ResultsAnalysis/KpiDashboard/Indicators';
import moment from 'moment';
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

class UsersGroupedIndicators extends Component {
  state = {
    daySelected: new Date(),
    monthSelected: new Date(),
    dataFilterGroupPrior: -1,
    dataFilterGroup: 1,
    customSelectedInitial: 0,
    customSelectedEnd: 0,
    directIndicators: [],
    loading: true,
    promotoresSelecionados: [],
    ramoAtividadeSelecionados: [],
    selectedFilter: 'day',
    changedFilter: 0,
  };

  componentDidMount = async () => {
    await this.carregarVariaveisEstado();
    let { daySelected } = this.state;
    this.initCustomDates();
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
          // //console.log('estruturaAutorizada');
          // //console.log(estruturaAutorizada);
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
      alerta(`Erro ao carregar os filtros => ` + err);
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
    // this.onChangeFilter();
  };

  handleLoadDayData = async (daySelected, initialLoaging = false) => {
    this.setState({ loading: true, selectedFilter: 'day', daySelected });
    if (!initialLoaging) {
      this.onChangeFilter();
    }
    let directIndicators = await this.loadIndicatorsGeoOf(
      moment(daySelected).format('DD/MM/yyyy'),
      moment(daySelected).format('DD/MM/yyyy'),
      'day'
    );

    this.setState({ loading: false });
    this.setState({
      directIndicators,
    });
  };

  handleLoadMonthData = async (monthSelected) => {
    this.setState({ loading: true, selectedFilter: 'month', monthSelected });

    setTimeout(() => {
      this.onChangeFilter();
    }, 50);

    let startDate = moment(monthSelected).startOf('month').format('DD/MM/YYYY');
    let endDate = moment(monthSelected).endOf('month').format('DD/MM/YYYY');

    let directIndicators = await this.loadIndicatorsGeoOf(
      startDate,
      endDate,
      'month'
    );

    this.setState({
      directIndicators,
      loading: false,
    });
  };

  handleLoadCustomDataEnd = async (customSelectedEnd) => {
    this.setState({
      loading: true,
      selectedFilter: 'custom',
      customSelectedEnd,
    });
    setTimeout(() => {
      this.onChangeFilter();
    }, 50);
    let { customSelectedInitial } = this.state;
    let directIndicators = await this.loadIndicatorsGeoOf(
      moment(customSelectedInitial).format('DD/MM/yyyy'),
      moment(customSelectedEnd).format('DD/MM/yyyy'),
      'custom'
    );
    this.setState({ loading: false });
    this.setState({
      directIndicators,
    });
  };

  handleLoadCustomDataInitial = async (customSelectedInitial) => {
    this.setState({
      loading: true,
      selectedFilter: 'custom',
      customSelectedInitial,
    });
    setTimeout(() => {
      this.onChangeFilter();
    }, 50);
    let { customSelectedEnd } = this.state;
    let directIndicators = await this.loadIndicatorsGeoOf(
      moment(customSelectedInitial).format('DD/MM/yyyy'),
      moment(customSelectedEnd).format('DD/MM/yyyy'),
      'custom'
    );
    this.setState({ loading: false });
    this.setState({
      directIndicators,
    });
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
    return inElements;
  };

  loadFiltersList = async () => {
    try {
      const { empresaAtiva, usuarioAtivo } = this.state;
      const url =
        '/v1/tradedashboard/allfilter/' + empresaAtiva + '/' + usuarioAtivo;
      const retorno = await api.get(url);

      if (!retorno) {
        return [];
      } else {
        if (retorno.data && retorno.data.sucess) {
          let result = retorno.data.data;
          // //console.log('result');
          // //console.log(result);

          let ramosAtividades = result.ramosAtividades;
          let ramosAtividadesChips = {};
          let cidades = result.cidades;
          let cidadesChips = {};
          let promotores = result.promotores;
          let promotoresChips = {};
          let supervisores = result.supervisores;
          let supervisoresChips = {};
          // //console.log('ramosAtividades');
          // //console.log(ramosAtividades);
          // //console.log('cidades');
          // //console.log(cidades);
          // //console.log('promotores');
          // //console.log(promotores);

          for (const vendedor of promotores) {
            promotoresChips[vendedor.PROMOTOR] = null;
          }
          for (const supervisor of supervisores) {
            supervisoresChips[supervisor.SUPERVISOR] = null;
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
            promotores,
            promotoresChips,
            cidadesChips,
            ramosAtividadesChips,
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

  onChangeFilter = () => {
    let { changedFilter } = this.state;
    changedFilter += 1;
    this.setState({ changedFilter });
    // //console.log('onChangeFilter - KPIDashboard');
  };

  loadIndicatorsGeoOf = async (startDate, finalDate, tipo) => {
    try {
      // return;
      const { empresaAtiva, usuarioAtivo } = this.state;
      let promotores, ramosAtividades, cidades, supervisores;
      promotores = this.getSelectedPromotores();
      ramosAtividades = this.getSelectedRamosAtividades();
      cidades = this.getSelectedCidades();
      supervisores = this.getSelectedSupervisores();

      // //console.log('cidades');
      // //console.log(cidades);
      // //console.log('ramosAtividades');
      // //console.log(ramosAtividades);
      // //console.log('promotores');
      // //console.log(promotores);

      const url =
        '/v1/tradedashboard/basics/grouped/' +
        empresaAtiva +
        '/' +
        usuarioAtivo;
      let datas = {
        startDate,
        finalDate,
        cidades,
        ramosAtividades,
        promotores,
        estruturaAutorizada: this.getEstruturaAutorizada(),
        supervisores,
        tipo,
      };

      //console.log('datas = KPI Dashboard');
      //console.log(datas);

      const retorno = await api.post(url, datas);

      if (!retorno) {
        return [];
      } else {
        if (retorno.data && retorno.data.sucess) {
          let result = retorno.data.data;
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

  makeIn = (chipsElement, elements, searchText, searchKey) => {
    let inElements = '';
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

  getSelectedPromotores = () => {
    let { promotoresSelecionados, promotores } = this.state;
    return this.makeIn(
      promotoresSelecionados,
      promotores,
      'PROMOTOR',
      'PROMOTOR_ID'
    );
  };

  getAllPromotores = () => {
    const { promotores } = this.state;
    let promotoresFiltro = '';
    for (const vendedor of promotores) {
      promotoresFiltro += "'" + vendedor.PROMOTOR_ID + "',";
    }
    return promotoresFiltro.substr(0, promotoresFiltro.length - 1);
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

  getSelectedSupervisores = () => {
    let { supervisoresSelecionados, supervisores } = this.state;
    return this.makeIn(
      supervisoresSelecionados,
      supervisores,
      'SUPERVISOR',
      'SUPERVISOR_ID'
    );
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

  getAllSupervisores = () => {
    const { supervisores } = this.state;
    let supervisoresFiltro = '';

    for (const supervisor of supervisores) {
      supervisoresFiltro += "'" + supervisor.SUPERVISOR + "',";
    }
    return supervisoresFiltro.substr(0, supervisoresFiltro.length - 1);
  };

  handleManipulaVendedores = () => {
    let dados = M.Chips.getInstance(document.getElementById('promotoresChip'));
    let promotoresSelecionados;
    if (dados !== undefined) {
      promotoresSelecionados = dados.chipsData;
    } else {
      promotoresSelecionados = [];
    }

    this.setState({ promotoresSelecionados });
    setTimeout(() => {
      this.handleAllDataUpdate();
    }, 5);
  };

  handleManipulaCidades = () => {
    let dados = M.Chips.getInstance(document.getElementById('cidadesChips'));

    let cidadesSelecionadas;
    if (dados !== undefined) {
      cidadesSelecionadas = dados.chipsData;
    } else {
      cidadesSelecionadas = [];
    }

    this.setState({ cidadesSelecionadas });
    setTimeout(() => {
      this.handleAllDataUpdate();
    }, 5);
  };

  handleManipulaRamosAtividades = () => {
    let dados = M.Chips.getInstance(
      document.getElementById('ramosAtividadesChip')
    );

    let ramosAtividadesSelecionados;
    if (dados !== undefined) {
      ramosAtividadesSelecionados = dados.chipsData;
    } else {
      ramosAtividadesSelecionados = [];
    }

    this.setState({ ramosAtividadesSelecionados });
    setTimeout(() => {
      this.handleAllDataUpdate();
    }, 50);
  };

  handleManipulaSupervisores = () => {
    let dados = M.Chips.getInstance(
      document.getElementById('supervisoresChips')
    );

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
    // this.onChangeFilter();
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
      loading,
      promotoresSelecionados,
      promotoresChips,
      supervisoresSelecionados,
      supervisoresChips,
      ramosAtividadesSelecionados,
      ramosAtividadesChips,
      cidadesSelecionadas,
      cidadesChips,
      selectedFilter,
      ramoAtividadeSelecionados,
      changedFilter,
      promotores,
      cidades,
      ramosAtividades,
      estruturaAutorizada,
      directIndicators,
      supervisores,
      fromHome,
    } = this.state;
    return (
      <>
        <Container className="kpiDashboard">
          <SubContainer className="kpiContainer">
            <SubContainerTitle>
              Indicadores globais atendimentos
            </SubContainerTitle>
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
                        id="supervisoresChips"
                        className="supervisoresChips"
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
                            limit: 5,
                            minLength: 1,
                            onAutocomplete: function noRefCheck() {},
                          },
                        }}
                      />
                    </DivDetalhe>
                    <DivDetalhe style={{ flex: 3 }}>
                      <label>Promotores</label>
                      <Chip
                        id="promotoresChip"
                        className="promotoresChip"
                        close={false}
                        closeIcon={<Icon className="close">close</Icon>}
                        options={{
                          data:
                            promotoresSelecionados !== undefined &&
                            promotoresSelecionados,
                          onChipAdd: this.handleManipulaVendedores,
                          onChipDelete: this.handleManipulaVendedores,
                          autocompleteOptions: {
                            data: promotoresChips,
                            limit: 5,
                            minLength: 1,
                            onAutocomplete: function noRefCheck() {},
                          },
                        }}
                      />
                    </DivDetalhe>
                  </Linha>
                  <Linha>
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
                          promotoresSelecionados: [],
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
            {directIndicators !== undefined && directIndicators.length > 0 ? (
              <KpiIndicators
                data={directIndicators}
                loading={loading ? 1 : 0}
              />
            ) : (
              <>
                <Line style={{ alignItems: 'inherit' }}>
                  <Graph style={{ padding: '20px' }}>
                    <Skeleton count={1} height={50} />
                    <Skeleton circle={true} height={200} width={200} />
                  </Graph>
                  <IndicatorsLine style={{ width: '100%' }} loading={1}>
                    <Skeleton count={10} />
                  </IndicatorsLine>
                </Line>
              </>
            )}
          </SubContainer>
        </Container>
      </>
    );
  }
}

export default withRouter(UsersGroupedIndicators);
