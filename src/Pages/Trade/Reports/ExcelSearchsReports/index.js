import React, { Component, Fragment } from 'react';
import { Checkbox, Chip, Icon, CollapsibleItem, Collapsible } from 'react-materialize';
import DirectTituloJanela from '../../../../Components/Globals/DirectTituloJanela';
import SaibRadioGroup from '../../../../Components/Globals/SaibRadioGroup';
import WaitScreen from '../../../../Components/Globals/WaitScreen';
import Header from '../../../../Components/System/Header';
import Calendar from '../../../../Components/Globals/Calendar';
import M from 'materialize-css';
import {
  Container,
  Linha,
  DivDetalhe,
  ContentBodyCollapsible,
  DataFilter,
  RowFilter,
  Labels,
  ContentIconMoreInfo,
  BodyDropDownInformationReport,
  Ul,
  Li,
  UlOverUl,
  ContentNewsReports,
  ContentTitleNewReports,
  ContentListReports,
} from './styled';
import { alerta, capitalize, formatDateTimeToBr, haveData } from '../../../../services/funcoes';
import api from '../../../../services/api';
import { getFromStorage } from '../../../../services/auth';
import Question from '../../../../Components/Globals/Question';
import { withRouter } from 'react-router-dom';
import SelectQuery from '../../../../Components/Globals/SelectQuery';
import Dropdown from '../../../../Components/Globals/DropDown';
class ExcelSearchsReports extends Component {
  state = {
    dateInitial: new Date(),
    dateFinal: new Date(),
    loading: false,
    searchs: [],
    searchsSelected: [],
    promotores: [],
    supervisores: [],
    dataReport: [],
    visionsReportType: '0',
    lastUpdateScreen: undefined,
    idSearchsSelected: [],
    loadingSelectQuery: false,
    professionalType: '0',
  };

  mounted = false;
  timeInterval = undefined;
  buttonRef = React.createRef(null);
  refContentModal = React.createRef(null);

  async componentDidMount() {
    // ExcelSearchsReports.contextType = ExcelSearchsReportsContext;
    this.mounted = true;
    this.setState({
      loading: true,
    });
    await this.carregarVariaveisEstado();
    await this.handleLoadAllFilters();
    await this.refreshReports();
    // if (await !this.setDataOfBackPerContext()) {
    // }
    this.setState({
      loading: false,
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (JSON.stringify(this.state.reports) !== JSON.stringify(prevState.reports) && this.timeInterval) {
      this.updateScreenWithLastestReports(prevState.reports, this.state.reports);
    }
  }

  handleLoadAllFilters = async () => {
    const { empresaAtiva, usuarioAtivo, gupFlagAgenda } = this.state;
    const url = `v1/tradereport/allfilter/${empresaAtiva}/${usuarioAtivo}`;
    try {
      const res = await api.get(url);
      const { data, sucess } = res.data;
      if (sucess) {
        let pesquisas = [];
        let promotores = data.promotores;
        promotores = gupFlagAgenda === 1 ? promotores.filter((prom) => prom.PROMOTOR_ID === usuarioAtivo) : promotores;
        let supervisores = data.supervisores;
        let gerentes = data.gerentes;
        let ramosAtividades = data.ramosAtividades;

        let ramosAtividadesChips = {};
        for (const ramo of ramosAtividades) {
          let item = ramo.RAMO_ID + ' - ' + ramo.RAMO;
          ramosAtividadesChips[item] = null;
        }

        for (const pesquisa of data.pesquisas) {
          pesquisa.checked = true;
          pesquisas.push(pesquisa);
        }

        let promotoresChips = {};
        for (const promotor of promotores) {
          let item = promotor.PROMOTOR;
          promotoresChips[item] = null;
        }
        let supervisoresChips = {};
        for (const supervisor of supervisores) {
          let item = supervisor.SUPERVISOR;
          supervisoresChips[item] = null;
        }
        let gerentesChips = {};
        for (const gerente of gerentes) {
          let item = gerente.GERENTE;
          gerentesChips[item] = null;
        }

        this.setState({
          pesquisas,
          gerentes,
          gerentesChips,
          supervisores,
          supervisoresChips,
          promotores,
          promotoresChips,
          ramosAtividades,
          ramosAtividadesChips,
        });
        return;
      } else {
        alerta('Erro ao carregar supervisores e promotores');
      }
    } catch (errors) {
      alerta(`Erro ao carregar supervisores e promotores => ${String(errors)}`);
    }
  };

  handleFilterCustomers = async (value) => {
    const { usuarioAtivo, empresaAtiva } = this.state;
    this.setState({
      loadingSelectQuery: true,
    });
    const dataToSend = {
      filtro: value,
    };

    try {
      const url = `v1/tradereport/clientes/${empresaAtiva}/${usuarioAtivo}`;
      const res = await api.post(url, dataToSend);

      const { data, sucess } = res.data;

      if (sucess) {
        this.setState({
          clientes: data,
        });
      }
    } catch (error) {
    } finally {
      this.setState({
        loadingSelectQuery: false,
      });
    }
  };

  refreshReports = async () => {
    const { empresaAtiva, usuarioAtivo } = this.state;
    const dataToSend = {
      nomeRelatorio: 'SEARCHS_DATA_EXCEL',
    };
    const url = `v1/report/list/${empresaAtiva}/${usuarioAtivo}`;
    try {
      const res = await api.post(url, dataToSend);
      const { data, sucess } = res.data;
      if (sucess) {
        this.setState({ reports: data, lastUpdateScreen: new Date() });
      } else {
        alerta('Erro ao carregar a lista de relatórios para download.');
      }
    } catch (errors) {
      alerta(`Erro ao carregar a lista de relatórios para download. => ${String(errors)}`);
    }
  };

  killReportProcess = async () => {
    const { empresaAtiva, usuarioAtivo, nomeUsuario } = this.state;
    const dataToSend = {
      nomeRelatorio: 'SEARCHS_DATA_EXCEL',
      sucesso: false,
      logGeracao: `Processamento abortado pelo usuário: ${nomeUsuario}`,
    };
    const url = `v1/report/endprocess/${empresaAtiva}/${usuarioAtivo}`;
    try {
      const res = await api.put(url, dataToSend);
      const { sucess } = res.data;
      if (!sucess) {
        alerta('Erro ao carregar a lista de relatórios para download.');
      }
    } catch (error) {
      if (error.response !== undefined && error.response.data !== undefined) {
        alerta(`${error.response.data.message} [${error.response.data.error}]`, 2);
      } else {
        alerta(`Erro ao carregar a lista de relatórios para download. => ${String(error)}`);
      }
    }
  };

  setDataOfBackPerContext = () => {
    const { dateInitial, dateFinal, typeReport, idSearchsSelected } = this.context;
    if (idSearchsSelected !== undefined && idSearchsSelected.length > 0) {
      let { pesquisas } = this.state;
      for (const pesquisa of pesquisas) {
        let finded = idSearchsSelected.filter((item) => item === pesquisa.GAP_ID);
        pesquisa.checked = finded.length > 0;
      }
      this.setState({
        pesquisas,
        idSearchsSelected,
      });

      this.setState({
        dateInitial: dateInitial,
        dateFinal: dateFinal,
        filterTypeReport: typeReport,
      });
      return true;
    } else {
      return false;
    }
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
      empresaCnpj: sessao.empresaCnpj,
      nomeUsuario: sessao.nomeUsuario,
      gupFlagAgenda: sessao.gupFlagAgenda,
    });
  };

  prepareInToString = (list, aspas = '"') => {
    let retorno = '';
    if (list === undefined) {
      return retorno;
    }
    for (const [index, item] of list.entries()) {
      if (index === list.length - 1) {
        retorno += aspas + item + aspas;
      } else {
        retorno += aspas + item + aspas + ',';
      }
    }
    return retorno.replace(/"([^"]+(?="))"/g, '$1');
  };

  selectedSearchs = () => {
    const { pesquisas } = this.state;
    let retorno = '';

    for (const pesquisa of pesquisas) {
      if (pesquisa.checked) {
        retorno += pesquisa.GAP_ID + ',';
      }
    }

    if (retorno !== '') {
      retorno = retorno.substring(0, retorno.length - 1);
    }

    return retorno;
  };

  updateScreenWithLastestReports = (prevReports, lastsReports) => {
    const newsReports = [];

    for (let report of lastsReports) {
      const findedReport = prevReports.find((report_) => JSON.stringify(report_) === JSON.stringify(report));

      if (!findedReport) {
        newsReports.push(report);
      }
    }

    this.setState({
      newsReports: [newsReports[0]],
    });
  };

  processReport = async () => {
    const { professionalType } = this.state;
    this.setState({ loading: true });
    try {
      let {
        dateInitial,
        dateFinal,
        idSearchsSelected,
        idsRamosAtividades,
        idsPromoters,
        idsSupervisors,
        idsGerentes,
        visionsReportType,
        customerSelected,
      } = this.state;

      let postVar = {
        dataPesquisaInicial: formatDateTimeToBr(dateInitial, 'DD/MM/YYYY'),
        dataPesquisaFinal: formatDateTimeToBr(dateFinal, 'DD/MM/YYYY'),
        codigoPesquisa: this.prepareInToString(idSearchsSelected),
        ramosAtividades: this.prepareInToString(idsRamosAtividades),
        promotores: this.prepareInToString(idsPromoters),
        supervisores: this.prepareInToString(idsSupervisors),
        gerentes: this.prepareInToString(idsGerentes),
        visoes: visionsReportType,
        pesquisas: this.selectedSearchs(),
        cliente: customerSelected ? String(customerSelected?.CLI_ID) : '',
        somentePromotores: professionalType === '2',
        somenteSupervisor: professionalType === '1',
      };

      const res = await api.post(
        `v1/tradereport/excelexport/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`,
        postVar
      );
      const { data } = res.data;
      alerta(data, 1);

      this.setUpdateListReports();
    } catch (error) {
      if (error.response !== undefined && error.response.data !== undefined) {
        alerta(`${error.response.data.message} [${error.response.data.error}]`, 2);
      } else {
        alerta(`Erro ao solicitar relatorio => ${String(error)}`, 2);
      }
    }
    this.setState({ loading: false });
  };

  setUpdateListReports = () => {
    this.timeInterval = setInterval(async () => {
      if (this.mounted) {
        await this.refreshReports();
      }
    }, 1000 * 10);
  };

  setClearTimeInterval = () => {
    clearInterval(this.timeInterval);
  };

  onChangeDateInitial = async (date) => {
    this.setState({
      dateInitial: date,
    });
  };

  onChangeDateFinal = async (date) => {
    this.setState({
      dateFinal: date,
    });
  };

  onChangeSelectRamosAtividades = () => {
    if (document.getElementById('ramosAtividadesChips') !== undefined) {
      let dados = M.Chips.getInstance(document.getElementById('ramosAtividadesChips'));
      let ramosAtividadesSelecionados;
      let idsRamosAtividades = [];

      if (dados !== undefined) {
        ramosAtividadesSelecionados = dados.chipsData;
        if (ramosAtividadesSelecionados && ramosAtividadesSelecionados?.length > 0) {
          for (let ramosAtividades of ramosAtividadesSelecionados) {
            let idRamo = ramosAtividades.tag.split('-')[0].replace(' ', '');
            idsRamosAtividades.push(idRamo);
          }
        }
        this.setState({
          ramosAtividadesSelecionados,
          idsRamosAtividades,
        });
      }
    }
  };

  onChangeSelectPromoter = () => {
    if (document.getElementById('promotoresChips') !== undefined) {
      let dados = M.Chips.getInstance(document.getElementById('promotoresChips'));
      let promotoresSelecionados;
      let idsPromoters = [];

      if (dados !== undefined) {
        promotoresSelecionados = dados.chipsData;
        if (promotoresSelecionados && promotoresSelecionados?.length > 0) {
          for (let promotor of promotoresSelecionados) {
            let idPromotor = promotor.tag.split('-')[0].replace(' ', '');
            idsPromoters.push(idPromotor);
          }
        }
        this.setState({
          promotoresSelecionados,
          idsPromoters,
        });
      }
    }
  };

  onChangeSelectSupervisor = () => {
    if (document.getElementById('supervisoresChips') !== undefined) {
      let dados = M.Chips.getInstance(document.getElementById('supervisoresChips'));
      let supervisoresSelecionados;
      let idsSupervisors = [];

      if (dados !== undefined) {
        supervisoresSelecionados = dados.chipsData;
        if (supervisoresSelecionados && supervisoresSelecionados?.length > 0) {
          for (let supervisor of supervisoresSelecionados) {
            let idSupervisor = supervisor.tag.split('-')[0].replace(' ', '');
            idsSupervisors.push(idSupervisor);
          }
        }
        this.setState({
          supervisoresSelecionados,
          idsSupervisors,
        });
      }
    }
  };

  onChangeSelectGerente = () => {
    if (document.getElementById('gerentesChips') !== undefined) {
      let dados = M.Chips.getInstance(document.getElementById('gerentesChips'));
      let gerentesSelecionados;
      let idsGerentes = [];

      if (dados !== undefined) {
        gerentesSelecionados = dados.chipsData;
        if (gerentesSelecionados && gerentesSelecionados?.length > 0) {
          for (let gerente of gerentesSelecionados) {
            let idGerente = gerente.tag.split('-')[0].replace(' ', '');
            idsGerentes.push(idGerente);
          }
        }
        this.setState({
          gerentesSelecionados,
          idsGerentes,
        });
      }
    }
  };

  onChangeCheckBox = async (e, item) => {
    let { pesquisas } = this.state;
    // const { setStateSearchsSelected } = this.context;
    if (!e.target.checked) {
      pesquisas.forEach((_item) => {
        if (_item.GAP_ID === item.GAP_ID) {
          _item.checked = false;
        }
      });
      this.setState({
        pesquisas,
      });
    } else {
      pesquisas.forEach((_item) => {
        if (_item.GAP_ID === item.GAP_ID) {
          _item.checked = true;
        }
      });
      this.setState({
        pesquisas,
      });
    }

    // await setStateSearchsSelected(idSearchsSelected);
  };

  returnSearchsPerId = (ids) => {
    const { pesquisas } = this.state;
    ids = ids.split(',');
    let return_ = [];
    for (let id of ids) {
      const search = pesquisas.find((search_) => search_.GAP_ID === parseInt(id));
      return_.push(search);
    }

    return return_;
  };

  returnSupervisorsPerIds = (ids) => {
    const { supervisores } = this.state;
    let return_ = [];

    for (let id of ids) {
      id = id.replace(/"([^"]+(?="))"/g, '$1');
      const supervisor = supervisores.find((supervisor) => supervisor.SUPERVISOR_ID === parseInt(id));
      return_.push(supervisor);
    }

    return return_;
  };

  returnPromotersPerIds = (ids) => {
    const { promotores } = this.state;
    let return_ = [];
    for (let id of ids) {
      id = id.replace(/"([^"]+(?="))"/g, '$1');
      const promotor = promotores.find((promoter) => promoter.PROMOTOR_ID === parseInt(id));
      return_.push(promotor);
    }

    return return_;
  };

  returnManagersPerIds = (ids) => {
    const { gerentes } = this.state;
    let return_ = [];
    for (let id of ids) {
      id = id.replace(/"([^"]+(?="))"/g, '$1');
      const manager = gerentes.find((manager) => manager.GERENTE_ID === parseInt(id));
      return_.push(manager);
    }

    return return_;
  };

  returnActvityBranchs = (ids) => {
    const { ramosAtividades } = this.state;
    let return_ = [];
    for (let id of ids) {
      id = id.replace(/"([^"]+(?="))"/g, '$1');
      const branch = ramosAtividades.find((branch) => branch.RAMO_ID === parseInt(id));
      return_.push(branch);
    }

    return return_;
  };

  getClientById = async (id) => {
    const { empresaAtiva, usuarioAtivo } = this.state;

    try {
      const dataToSend = {
        filtro: parseInt(id),
      };
      const res = await api.post(`v1/tradereport/clientes/${empresaAtiva}/${usuarioAtivo}`, dataToSend);

      const { data, sucess } = res.data;

      if (sucess) {
        return data;
      }
      return;
    } catch (error) {}
  };

  handleDetailsReport = async (data) => {
    let customers = [];
    let promoters = [];
    let supervisors = [];
    let managers = [];
    let activityBranch = [];
    if (data.cliente) {
      customers = await this.getClientById(data.cliente);
    }

    const searchs = this.returnSearchsPerId(data.pesquisas);
    // .replace(/[\\"]/g, '')
    const idsPromoters = data.promotores.split(',').filter((el) => {
      return el !== '';
    });

    const idsSupervisors = data.supervisores.split(',').filter((el) => {
      return el !== '';
    });

    const idsManagers = data.gerentes.split(',').filter((el) => {
      return el !== '';
    });

    const idsActivityBranchies = data.ramosAtividades.split(',').filter((el) => {
      return el !== '';
    });

    promoters = this.returnPromotersPerIds(idsPromoters);

    supervisors = this.returnSupervisorsPerIds(idsSupervisors);

    managers = this.returnManagersPerIds(idsManagers);

    activityBranch = this.returnActvityBranchs(idsActivityBranchies);

    this.setState({
      dataReport: {
        searchs,
        promoters,
        supervisors,
        managers,
        customers,
        activityBranch,
        typeProfessional: data.somenteSupervisor ? 'Supervisor' : data.somentePromotores ? 'Promotor' : 'Todos',
        dateInitial: data.dataPesquisaInicial,
        dateFinal: data.dataPesquisaFinal,
        vision: data.visoes,
      },
    });

    return {
      searchs,
      promoters,
      supervisors,
      managers,
      activityBranch,
    };

    // promoters =  promoters.filter(promoter => promoter.3532 === )
  };

  render() {
    const {
      loading,
      dateInitial,
      dateFinal,
      promotoresChips,
      promotoresSelecionados,
      supervisoresSelecionados,
      supervisoresChips,
      gerentesSelecionados,
      gerentesChips,
      ramosAtividadesSelecionados,
      ramosAtividadesChips,
      clientes,
      pesquisas,
      reports,
      lastUpdateScreen,
      dataReport,
      newsReports,
    } = this.state;

    // const { setStateFilterTypeReport } = this.context;
    return (
      <div>
        <Header />
        <WaitScreen loading={loading} />
        <Container>
          <DirectTituloJanela
            urlVoltar={'/home'}
            // urlNovo={'/search'}
            titulo={
              loading ? (
                'Aguarde...'
              ) : (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon>description</Icon>Relatórios pesquisas (Excel)
                </span>
              )
            }
          />
          <>
            <Linha className="filter">
              <Collapsible
                accordion
                style={{
                  width: '100%',
                  borderStyle: 'none',
                  boxShadow: 'none',
                }}
              >
                <CollapsibleItem expanded header="Clique para filtrar" icon={<Icon>filter_list</Icon>} node="div">
                  <ContentBodyCollapsible>
                    <RowFilter flex="4 !important">
                      <Linha className="rowOptions">
                        <DataFilter>
                          <Calendar
                            date={dateInitial}
                            onChange={(date) => {
                              this.onChangeDateInitial(date);
                            }}
                          />

                          <Calendar
                            date={dateFinal}
                            onChange={(date) => {
                              this.onChangeDateFinal(date);
                            }}
                          />

                          <Icon tiny>autorenew</Icon>
                        </DataFilter>
                        <DivDetalhe>
                          <SaibRadioGroup
                            valueItems={'"0","1","2"'}
                            classNameItems={'"todos","atendimento","pesquisa"'}
                            textItems={'"Todos","Atendimentos","Pesquisas"'}
                            idItems={'"todos","atendimento","pesquisas"'}
                            classNameRadio="filterReportType"
                            flexDirectionRadio="row"
                            disabledRadio="false"
                            captionRadio="Visões relatório"
                            defaultCheckedId={'todos'}
                            onChange={(value) => {
                              this.setState({
                                visionsReportType: value,
                              });
                            }}
                          />
                        </DivDetalhe>
                        <DivDetalhe>
                          <SaibRadioGroup
                            valueItems={'"0","1","2"'}
                            classNameItems={'"todos","supervisor","promotor"'}
                            textItems={'"Todos","Supervisor","Promotor"'}
                            idItems={'"all","supervisor","promotor"'}
                            classNameRadio="filterProfessionalType"
                            flexDirectionRadio="row"
                            disabledRadio="false"
                            captionRadio="Tipo de profissional"
                            defaultCheckedId={'all'}
                            onChange={(value) => {
                              this.setState({
                                professionalType: value,
                              });
                            }}
                          />
                        </DivDetalhe>
                      </Linha>
                      <Linha>
                        <DivDetalhe flex={3} className="divDetailGerente">
                          <Labels>Clientes</Labels>
                          <SelectQuery
                            onChangeComponentIsExternal
                            loading={this.state?.loadingSelectQuery}
                            colorPrimary
                            query={clientes}
                            keys={['CLI_ID', 'CLI_NOME_FANTASIA']}
                            label="CLI_NOME_FANTASIA"
                            onChange={async (text) => {
                              await this.handleFilterCustomers(isNaN(text) ? text?.toUpperCase() : Number(text));
                            }}
                            onSelect={(item) => {
                              this.setState({
                                customerSelected: item,
                              });
                            }}
                            onDelete={() => {
                              this.setState({
                                customerSelected: null,
                              });
                            }}
                          />
                        </DivDetalhe>
                      </Linha>
                      <Linha withPadding={false}>
                        <DivDetalhe flex={3} className="divDetailGerente">
                          <Labels>Gerente</Labels>
                          <Chip
                            id="gerentesChips"
                            className="gerentesChips"
                            close={false}
                            closeIcon={<Icon className="close">close</Icon>}
                            options={{
                              data: gerentesSelecionados !== undefined ? gerentesSelecionados : [],
                              onChipAdd: this.onChangeSelectGerente,
                              onChipDelete: this.onChangeSelectGerente,
                              autocompleteOptions: {
                                data: gerentesChips,
                                limit: 1,
                                onAutocomplete: function noRefCheck() {},
                              },
                            }}
                          />
                        </DivDetalhe>
                        <DivDetalhe flex={3} className="divDetailSupervisor">
                          <Labels>Supervisor</Labels>
                          <Chip
                            id="supervisoresChips"
                            className="supervisoresChips"
                            close={false}
                            closeIcon={<Icon className="close">close</Icon>}
                            options={{
                              data: supervisoresSelecionados !== undefined ? supervisoresSelecionados : [],
                              onChipAdd: this.onChangeSelectSupervisor,
                              onChipDelete: this.onChangeSelectSupervisor,
                              autocompleteOptions: {
                                data: supervisoresChips,
                                limit: 1,
                                onAutocomplete: function noRefCheck() {},
                              },
                            }}
                          />
                        </DivDetalhe>
                      </Linha>
                      <Linha withPadding={false}>
                        <DivDetalhe flex={3} className="divDetailPromoter">
                          <Labels>Promotor</Labels>
                          <Chip
                            id="promotoresChips"
                            className="promotoresChips"
                            close={false}
                            closeIcon={<Icon className="close">close</Icon>}
                            options={{
                              data: promotoresSelecionados !== undefined ? promotoresSelecionados : [],
                              onChipAdd: this.onChangeSelectPromoter,
                              onChipDelete: this.onChangeSelectPromoter,
                              autocompleteOptions: {
                                data: promotoresChips,
                                limit: 1,
                                onAutocomplete: function noRefCheck() {},
                              },
                            }}
                          />
                        </DivDetalhe>
                        <DivDetalhe flex={3} className="divDetailRamoAtividade">
                          <Labels>Ramos de atividades</Labels>
                          <Chip
                            id="ramosAtividadesChips"
                            className="ramosAtividadesChips"
                            close={false}
                            closeIcon={<Icon className="close">close</Icon>}
                            options={{
                              data: ramosAtividadesSelecionados !== undefined ? ramosAtividadesSelecionados : [],
                              onChipAdd: this.onChangeSelectRamosAtividades,
                              onChipDelete: this.onChangeSelectRamosAtividades,
                              autocompleteOptions: {
                                data: ramosAtividadesChips,
                                limit: 1,
                                onAutocomplete: function noRefCheck() {},
                              },
                            }}
                          />
                        </DivDetalhe>
                      </Linha>
                      <Linha withPadding={false} margin="0 10px" width="unset">
                        <Labels className="labelSearch">Pesquisas</Labels>
                        <Linha
                          style={{
                            border: '1px solid #ccc',
                            maxHeight: '150px',
                            overflowY: 'auto',
                            borderRadius: '10px',
                            padding: '10px',
                          }}
                        >
                          {pesquisas !== undefined &&
                            pesquisas.map((item) => (
                              <Fragment key={item.GAP_ID}>
                                <Checkbox
                                  className="checkBoxPesquisa"
                                  id={'checkBox_' + item.GAP_ID}
                                  label={capitalize(item.GAP_DESCRICAO, true)}
                                  value={String(item.GAP_ID)}
                                  checked={item.checked}
                                  onChange={(e) => this.onChangeCheckBox(e, item)}
                                />
                              </Fragment>
                            ))}
                        </Linha>
                      </Linha>
                    </RowFilter>
                  </ContentBodyCollapsible>
                </CollapsibleItem>
              </Collapsible>
            </Linha>

            {newsReports && (
              <div
                style={{
                  border: '1px solid #ccc',
                  marginBottom: '20px',
                  margin: '0 15px 20px',
                }}
              >
                <ContentTitleNewReports style={{ justifyContent: 'flex-start', paddingRight: '20px' }}>
                  <Labels color="#fff">Novos relatórios solicitados</Labels>
                </ContentTitleNewReports>
                <Linha style={{ justifyContent: 'flex-start' }}>
                  {newsReports && (
                    <ContentNewsReports>
                      <table className="reportTables striped">
                        <thead>
                          <tr>
                            <th></th>
                            <th>Solicitante</th>
                            <th>Data/hora</th>
                            <th>Tempo geração</th>
                            <th></th>
                            <th></th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {newsReports !== undefined &&
                            newsReports.length > 0 &&
                            newsReports.map((item) => (
                              <tr key={item.GRE_ID}>
                                <td>
                                  <Dropdown
                                    onClick={() => this.handleDetailsReport(JSON.parse(item.GRE_FILTRO))}
                                    buttonComponent={
                                      <ContentIconMoreInfo>
                                        <Icon>filter_alt</Icon>
                                      </ContentIconMoreInfo>
                                    }
                                    body={
                                      <BodyDropDownInformationReport>
                                        <Ul>
                                          <Li titleLi withOutBorder>
                                            Filtros utilizados para geração do relatório
                                          </Li>

                                          <Li>
                                            Período: {dataReport.dateInitial} a {dataReport.dateFinal}
                                          </Li>

                                          {dataReport.customers?.length > 0 ? (
                                            dataReport.customers.map((customer, i) => (
                                              <Li key={i}>Clientes: {customer.CLI_NOME_FANTASIA}</Li>
                                            ))
                                          ) : (
                                            <Li>Clientes: Todos</Li>
                                          )}

                                          {dataReport.vision && (
                                            <Li>
                                              Visões:
                                              {dataReport.vision === '0'
                                                ? ' Todas'
                                                : dataReport.vision === '1'
                                                ? ' Atendimentos'
                                                : ' Pesquisas'}
                                            </Li>
                                          )}

                                          {dataReport.typeProfessional && (
                                            <Li>Tipo de profissional: {dataReport.typeProfessional}</Li>
                                          )}

                                          {dataReport.managers &&
                                            dataReport.managers.map((manager, i) => (
                                              <Li key={i}>Gerente: {manager.GERENTE}</Li>
                                            ))}

                                          {dataReport.supervisors &&
                                            dataReport.supervisors.map((supervisor, i) => (
                                              <Li key={i}>Supervisor: {supervisor.SUPERVISOR}</Li>
                                            ))}
                                          {dataReport.promoters &&
                                            dataReport.promoters.map((promoter, i) => (
                                              <Li key={i}>Promotor: {promoter.PROMOTOR}</Li>
                                            ))}
                                          {dataReport.activityBranch &&
                                            dataReport.activityBranch.map((activity, i) => (
                                              <Li key={i}>
                                                Ramo: {activity.RAMO_ID} - {activity.RAMO}
                                              </Li>
                                            ))}

                                          {dataReport.searchs && (
                                            <UlOverUl>
                                              <Li withOutPadding withOutBorder>
                                                Pesquisas:
                                              </Li>
                                              {dataReport.searchs.map((search, i) => {
                                                if (i !== dataReport.searchs.length - 1) {
                                                  return (
                                                    <Li withOutBorder key={i}>
                                                      {capitalize(search?.GAP_DESCRICAO?.trimEnd(), true) + ', '}
                                                    </Li>
                                                  );
                                                } else {
                                                  return (
                                                    <Li key={i} withOutBorder>
                                                      {capitalize(search?.GAP_DESCRICAO?.trimEnd(), true)}
                                                    </Li>
                                                  );
                                                }
                                              })}
                                            </UlOverUl>
                                          )}
                                        </Ul>
                                      </BodyDropDownInformationReport>
                                    }
                                  />
                                </td>
                                <td>{item.USR_NOME}</td>
                                <td>{item.GRE_DTA_SOLICITACAO}</td>
                                <td>{item.TEMPO}</td>
                                <td
                                  style={{
                                    backgroundColor:
                                      item.GRE_FLG_STATUS === 1
                                        ? '#2196f3'
                                        : item.GRE_FLG_STATUS === 3
                                        ? '#f44336'
                                        : 'transparent',
                                    color: 'white',
                                  }}
                                >
                                  {item.GRE_FLG_STATUS === 2 && (
                                    <a
                                      className="waves-effect waves-light saib-button is-primary view"
                                      style={{ textDecoration: 'none', width: 'fit-content' }}
                                      href={item.GRE_RELATORIO_URL}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Icon>attach_file</Icon> Download
                                    </a>
                                  )}
                                  {item.GRE_FLG_STATUS === 1 && <span style={{ color: 'white' }}>Processando...</span>}
                                  {item.GRE_FLG_STATUS === 3 && (
                                    <span style={{ color: 'white' }}>
                                      {haveData(item.GRE_LOG_GERACAO) ? item.GRE_LOG_GERACAO : 'Erro/Cancelado.'}
                                    </span>
                                  )}
                                </td>
                                <td></td>
                                <td></td>
                                <td></td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </ContentNewsReports>
                  )}
                </Linha>
              </div>
            )}

            <Linha style={{ justifyContent: 'flex-end', paddingRight: '20px' }}>
              <DivDetalhe className="contentButtonsActions">
                <button
                  className="saib-button is-primary print"
                  onClick={async () => {
                    await this.processReport();
                  }}
                >
                  <Icon>priority_high</Icon>
                  <span>Processar</span>
                </button>
              </DivDetalhe>
              <DivDetalhe className="contentButtonsActions">
                <Question
                  overflowBodyModal="auto"
                  className="modalQuestionExcelReports"
                  iconeBotaoPadrao={<Icon large>cloud_download</Icon>}
                  classeBotaoPadrao="waves-effect waves-light saib-button is-primary"
                  textoBotaoPadrao="Download"
                  titulo="Relatórios disponíveis"
                  tituloBotaoSim=""
                  classeBotaoSim="waves-effect waves-light saib-button is-primary modal-action modal-close hidden"
                  tituloBotaoNao="Fechar"
                  classeBotaoNao="waves-effect waves-light saib-button is-primary modal-action modal-close"
                  message={
                    <ContentListReports>
                      <Linha style={{ justifyContent: 'space-evenly', alignItems: 'baseline' }}>
                        <DivDetalhe style={{ alignItems: 'center' }}>
                          <button
                            className="saib-button is-primary"
                            onClick={async () => {
                              await this.refreshReports();
                            }}
                          >
                            <Icon>refresh</Icon>
                            <span>Atualizar lista</span>
                          </button>
                          {lastUpdateScreen !== undefined && <small>{formatDateTimeToBr(lastUpdateScreen)}</small>}
                        </DivDetalhe>
                        <button
                          className="waves-effect waves-light saib-button is-cancel view"
                          style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                          onClick={async () => {
                            await this.killReportProcess();
                            await this.refreshReports();
                          }}
                        >
                          <Icon>cancel</Icon> Abortar processamento
                        </button>
                      </Linha>
                      <Linha ref={this.refContentModal}>
                        <table className="reportTables striped">
                          <thead>
                            <tr>
                              <th></th>
                              <th>Solicitante</th>
                              <th>Data/hora</th>
                              <th>Tempo geração</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {reports !== undefined &&
                              reports.length > 0 &&
                              reports.map((item) => (
                                <tr key={item.GRE_ID}>
                                  <td>
                                    <Dropdown
                                      onClick={() => this.handleDetailsReport(JSON.parse(item.GRE_FILTRO))}
                                      buttonComponent={
                                        <ContentIconMoreInfo>
                                          <Icon>filter_alt</Icon>
                                        </ContentIconMoreInfo>
                                      }
                                      body={
                                        <BodyDropDownInformationReport
                                          width={this.refContentModal.current?.offsetWidth + 'px'}
                                        >
                                          <Ul>
                                            <Li titleLi withOutBorder>
                                              Filtros utilizados para geração do relatório
                                            </Li>

                                            <Li>
                                              Período: {dataReport.dateInitial} a {dataReport.dateFinal}
                                            </Li>

                                            {dataReport.customers?.length > 0 ? (
                                              dataReport.customers.map((customer, i) => (
                                                <Li key={i}>Clientes: {customer.CLI_NOME_FANTASIA}</Li>
                                              ))
                                            ) : (
                                              <Li>Clientes: Todos</Li>
                                            )}

                                            {dataReport.vision && (
                                              <Li>
                                                Visões:
                                                {dataReport.vision === '0'
                                                  ? ' Todas'
                                                  : dataReport.vision === '1'
                                                  ? ' Atendimentos'
                                                  : ' Pesquisas'}
                                              </Li>
                                            )}

                                            {dataReport.typeProfessional && (
                                              <Li>Tipo de profissional: {dataReport.typeProfessional}</Li>
                                            )}

                                            {dataReport.managers &&
                                              dataReport.managers.map((manager, i) => (
                                                <Li key={i}>Gerente: {manager.GERENTE}</Li>
                                              ))}

                                            {dataReport.supervisors &&
                                              dataReport.supervisors.map((supervisor, i) => (
                                                <Li key={i}>Supervisor: {supervisor.SUPERVISOR}</Li>
                                              ))}
                                            {dataReport.promoters &&
                                              dataReport.promoters.map((promoter, i) => (
                                                <Li key={i}>Promotor: {promoter.PROMOTOR}</Li>
                                              ))}
                                            {dataReport.activityBranch &&
                                              dataReport.activityBranch.map((activity, i) => (
                                                <Li key={i}>
                                                  Ramo: {activity.RAMO_ID} - {activity.RAMO}
                                                </Li>
                                              ))}

                                            {dataReport.searchs && (
                                              <UlOverUl maxWidth={this.refContentModal.current?.offsetWidth + 'px'}>
                                                <Li withOutPadding withOutBorder>
                                                  Pesquisas:
                                                </Li>
                                                {dataReport.searchs.map((search, i) => {
                                                  if (i !== dataReport.searchs.length - 1) {
                                                    return (
                                                      <Li withOutBorder key={i}>
                                                        {capitalize(search?.GAP_DESCRICAO?.trimEnd(), true) + ', '}
                                                      </Li>
                                                    );
                                                  } else {
                                                    return (
                                                      <Li key={i} withOutBorder>
                                                        {capitalize(search?.GAP_DESCRICAO?.trimEnd(), true)}
                                                      </Li>
                                                    );
                                                  }
                                                })}
                                              </UlOverUl>
                                            )}
                                          </Ul>
                                        </BodyDropDownInformationReport>
                                      }
                                    />
                                  </td>
                                  <td>{item.USR_NOME}</td>
                                  <td>{item.GRE_DTA_SOLICITACAO}</td>
                                  <td>{item.TEMPO}</td>
                                  <td
                                    style={{
                                      backgroundColor:
                                        item.GRE_FLG_STATUS === 1
                                          ? '#2196f3'
                                          : item.GRE_FLG_STATUS === 3
                                          ? '#f44336'
                                          : 'transparent',
                                      color: 'white',
                                    }}
                                  >
                                    {item.GRE_FLG_STATUS === 2 && (
                                      <a
                                        className="waves-effect waves-light saib-button is-primary view"
                                        style={{ textDecoration: 'none', width: 'fit-content' }}
                                        href={item.GRE_RELATORIO_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <Icon>attach_file</Icon> Download
                                      </a>
                                    )}
                                    {item.GRE_FLG_STATUS === 1 && (
                                      <span style={{ color: 'white' }}>Processando...</span>
                                    )}
                                    {item.GRE_FLG_STATUS === 3 && (
                                      <span style={{ color: 'white' }}>
                                        {haveData(item.GRE_LOG_GERACAO) ? item.GRE_LOG_GERACAO : 'Erro/Cancelado.'}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </Linha>
                    </ContentListReports>
                  }
                  onNo={() => {}}
                  onYes={() => {}}
                />
              </DivDetalhe>
            </Linha>
          </>
        </Container>
      </div>
    );
  }
}

// class ExcelSearchsReports extends Component {
//   render() {
//     return (
//       <ExcelSearchsReportsProvider>
//         <ExcelSearchsReportsComponent {...this.props} />
//       </ExcelSearchsReportsProvider>
//     );
//   }
// }

export default withRouter(ExcelSearchsReports);
