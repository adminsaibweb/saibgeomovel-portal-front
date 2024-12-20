import React, { forwardRef, Component } from 'react';
import Header from '../../../Components/System/Header';
import {
  DataFilter,
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
import SupervisorBudgetData from '../../../Components/Extracts/SupervisorBudgetData';
import SaibRadioGroup from '../../../Components/Globals/SaibRadioGroup';
import './forced.css';
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

export default class SupervisorBudget extends Component {
  state = {
    dataFilterGroupPrior: -1,
    dataFilterGroup: 3,
    customSelectedInitial: 0,
    customSelectedEnd: 0,
    reportData: undefined,
    loading: true,
    supervisoresSelecionados: [],
    selectedFilter: '',
    changedFilter: 0,
    tipoVerba: -1,
  };

  componentDidMount = async () => {
    this.initCustomDates();
    await this.carregarVariaveisEstado();
    await this.loadFiltersList();
    await this.loadEstruturaAutorizada();
    let { customSelectedEnd } = this.state;
    this.handleLoadCustomDataEnd(customSelectedEnd, true);
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

  loadDataOf = async (startDate, finalDate, tipoVerba) => {
    try {
      // return;
      const { empresaAtiva, usuarioAtivo } = this.state;
      let supervisores;
      supervisores = this.getSelectedSupervisores();

      const url =
        '/v1/extracts/supervisorbudget/' + empresaAtiva + '/' + usuarioAtivo;
      let datas = {
        startDate,
        finalDate,
        supervisores,
        estruturaAutorizada: this.getEstruturaAutorizada(),
        tipoVerba,
      };

      // //console.log(datas);
      // return;
      const retorno = await api.post(url, datas);

      if (!retorno) {
        return [];
      } else {
        if (retorno.data && retorno.data.sucess) {
          let result = retorno.data.data;
          // //console.log('result');
          // //console.log(result);
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

  handleLoadCustomDataEnd = async (customSelectedEnd) => {
    this.setState({
      loading: true,
      selectedFilter: 'custom',
      reportData: undefined,
    });
    this.onChangeFilter();
    let { customSelectedInitial, tipoVerba } = this.state;
    let reportData = await this.loadDataOf(
      moment(customSelectedInitial).format('DD/MM/yyyy'),
      moment(customSelectedEnd).format('DD/MM/yyyy'),
      tipoVerba
    );
    this.setState({ loading: false });
    this.setState({
      customSelectedEnd,
      reportData,
    });
    setTimeout(() => {
      this.onChangeFilter();
    }, 50);
  };

  handleLoadCustomDataInitial = async (customSelectedInitial) => {
    this.setState({
      loading: true,
      selectedFilter: 'custom',
      reportData: undefined,
    });
    this.onChangeFilter();
    let { customSelectedEnd, tipoVerba } = this.state;
    let reportData = await this.loadDataOf(
      moment(customSelectedInitial).format('DD/MM/yyyy'),
      moment(customSelectedEnd).format('DD/MM/yyyy'),
      tipoVerba
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
        '/v1/extracts/supervisorbudget/allfilter/' +
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
          // //console.log('result');
          // //console.log(result);

          let supervisores = result.supervisores;
          let supervisoresChips = {};

          // //console.log('supervisores');
          // //console.log(supervisores);

          for (const vendedor of supervisores) {
            supervisoresChips[vendedor.SUPERVISOR] = null;
          }
          this.setState({
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
    const { selectedFilter, customSelectedInitial } = this.state;
    if (selectedFilter === 'custom') {
      this.handleLoadCustomDataInitial(customSelectedInitial);
    }
    this.onChangeFilter();
  };

  handleManipulaSupervisores = () => {
    let dados = M.Chips.getInstance(
      document.getElementById('supervisoresChip')
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

  getSelectedSupervisores = () => {
    let { supervisoresSelecionados, supervisores } = this.state;
    return this.makeIn(
      supervisoresSelecionados,
      supervisores,
      'SUPERVISOR',
      'SUPERVISOR_ID'
    );
  };

  getAllSupervisores = () => {
    const { supervisores } = this.state;
    let supervisoresFiltro = '';
    for (const vendedor of supervisores) {
      supervisoresFiltro += "'" + vendedor.VENDEDOR_ID + "',";
    }
    return supervisoresFiltro.substr(0, supervisoresFiltro.length - 1);
  };

  onChangeFiltroSituacaoEntrega = (status) => {
    // //console.log(status);
    this.setState({ tipoVerba: status });
    setTimeout(() => {
      this.handleAllDataUpdate();
    }, 10);
  };

  onChangeFilter = () => {
    let { changedFilter } = this.state;
    changedFilter += 1;
    this.setState({ changedFilter });
  };

  render() {
    const {
      dataFilterGroup,
      customSelectedEnd,
      customSelectedInitial,
      dataFilterGroupPrior,
      loading,
      supervisoresSelecionados,
      supervisoresChips,
      selectedFilter,
      changedFilter,
      supervisores,
      estruturaAutorizada,
      reportData,
    } = this.state;
    return (
      <>
        <Header />
        <Container>
          <SubContainer className="kpiContainer">
            <SubContainerTitle>
              Rel. Extrato verbas supervisor
            </SubContainerTitle>
            <LineTopFilter
              selected={dataFilterGroup}
              priorSelected={dataFilterGroupPrior}
              style={{
                justifyContent: 'start',
                alignItems: 'center',
              }}
            >
              <DivDetalhe>
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
              </DivDetalhe>
              <DivDetalhe className="detalheSaibRadio">
                <SaibRadioGroup
                  valueItems={'"-1","1","2","3","4","NA"'}
                  classNameItems={
                    '"itemTodos","itemSupervisor","itemTroca","itemFlexivel","itemOutros","itemNA"'
                  }
                  textItems={
                    '"Todos","Supervisor","Troca","Flexível","Outros","N/A"'
                  }
                  idItems={
                    '"itemTodos","itemSupervisor","itemTroca","itemFlexivel","itemOutros","itemNA"'
                  }
                  classNameRadio="FiltroTipoVerba"
                  flexDirectionRadio="row"
                  disabledRadio="false"
                  captionRadio="Tipo de verba"
                  defaultCheckedId={'itemTodos'}
                  onChange={this.onChangeFiltroSituacaoEntrega}
                />
              </DivDetalhe>
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
                        id="supervisoresChip"
                        className="supervisoresChip"
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
                  </Linha>
                  <Linha>
                    <Button
                      className="waves-effect waves-light saib-button is-primary"
                      onClick={() => {
                        this.setState({
                          supervisoresSelecionados: [],
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
            {reportData !== undefined ? (
              <SupervisorBudgetData
                selectedFilter={selectedFilter}
                customSelectedInitial={customSelectedInitial}
                supervisoresSelecionados={supervisoresSelecionados}
                supervisores={supervisores}
                changedFilter={changedFilter}
                estruturaAutorizada={estruturaAutorizada}
                data={reportData}
                loading={loading ? 1 : 0}
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
