import React, { Component, Fragment } from 'react';
import { Checkbox, Chip, Icon, CollapsibleItem, Collapsible, Tabs, Tab } from 'react-materialize';
import DirectTituloJanela from '../../../../Components/Globals/DirectTituloJanela';
import WaitScreen from '../../../../Components/Globals/WaitScreen';
import Header from '../../../../Components/System/Header';
import Calendar from '../../../../Components/Globals/Calendar';
import M from 'materialize-css';
import * as XLSX from 'xlsx';

import {
  Container,
  Linha,
  DivDetalhe,
  ContentBodyCollapsible,
  DataFilter,
  RowFilter,
  Labels,
  ContentList,
  ContentCompanys,
} from './styled';
import { alerta, capitalize } from '../../../../services/funcoes';
import api from '../../../../services/api';
import { getFromStorage } from '../../../../services/auth';
import { withRouter } from 'react-router-dom';
import SelectQuery from '../../../../Components/Globals/SelectQuery';
import imgNotApply from '../../../../assets/images/nao-se-aplica.png';
import { format } from 'date-fns';
import { getLocalObject, setLocalObject } from '../../../../services/databaseLocal';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import SlidePhotos from './SlidePhotos';

pdfMake.vfs = pdfFonts.pdfMake.vfs;
class VariableCalcularion extends Component {
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
    pageActive: 0,
    dataPhotos: [],
    slide: false,
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
        let teams = data.estruturasTrade;

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
        let teamsChips = {};

        for (const team of teams) {
          let item = `${team.ESTRUTURA_ID} - ${team.ESTRUTURA}`;
          teamsChips[item] = null;
        }

        this.setState({
          pesquisas,
          gerentes,
          gerentesChips,
          supervisores,
          supervisoresChips,
          teamsChips,
          promotores,
          promotoresChips,
        });
        return;
      } else {
        alerta('Erro ao carregar os filtros');
      }
    } catch (errors) {
      alerta(`Erro ao carregar os filtros => ${String(errors)}`);
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
      empresaId: sessao.empresaId,
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
      empresaCnpj: sessao.empresaCnpj,
      nomeUsuario: sessao.nomeUsuario,
      empresaRazaoSocial: sessao.empresaRazaoSocial,
      empresaNomeFantasia: sessao.empresaNomeFantasia,
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

  onChangeSelectTeam = () => {
    if (document.getElementById('teamsChips') !== undefined) {
      let dados = M.Chips.getInstance(document.getElementById('teamsChips'));
      let teamsSelecionados;
      let idsTeams = [];

      if (dados !== undefined) {
        teamsSelecionados = dados.chipsData;
        if (teamsSelecionados && teamsSelecionados?.length > 0) {
          for (let team of teamsSelecionados) {
            let idTeam = team.tag.split('-')[0].replace(' ', '');
            idsTeams.push(Number(idTeam));
          }
        }
        this.setState({
          teamsSelecionados,
          idsTeams,
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

  onChangeImageActive = async (e, id, indexAgrup, idItens, indexImage) => {
    const { dataPhotos, idLocal } = this.state;

    const companyPos = dataPhotos.findIndex((e) => e.id === id);

    if (companyPos !== -1) {
      const posItens = dataPhotos[companyPos].AGRUPAMENTOS[indexAgrup].ITENS.findIndex((e) => e.id === idItens);
      if (posItens !== -1) {
        dataPhotos[companyPos].AGRUPAMENTOS[indexAgrup].ITENS[posItens].IMAGES[indexImage].checked = e.target.checked;

        const reportDataLocal = await getLocalObject('reportVariables');
        const itemCurrentPos = reportDataLocal.findIndex((e) => e.id === idLocal);

        if (typeof itemCurrentPos === 'number' && itemCurrentPos !== -1) {
          const itemUpdate =
            dataPhotos[companyPos].AGRUPAMENTOS[indexAgrup].ITENS[posItens].IMAGES[indexImage].PERGUNTA_ID;

          if (!e.target.checked) {
            reportDataLocal[itemCurrentPos].marcados = [
              ...(reportDataLocal[itemCurrentPos]?.marcados || []),
              itemUpdate,
            ];
          } else {
            const newArray = reportDataLocal[itemCurrentPos]?.marcados.filter((e) => e !== itemUpdate) || [];
            reportDataLocal[itemCurrentPos].marcados = [...newArray];
          }

          await setLocalObject('reportVariables', reportDataLocal);
        }
      }
    }

    this.setState({
      dataPhotos,
    });
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

  handlePagePerTabs = (ev) => {
    const linkOfPageElement = ev.target;
    const numberPage = linkOfPageElement.href.substr(linkOfPageElement.href.length - 1, linkOfPageElement.href.length);

    if (parseInt(numberPage) === this.titlesPages.length - 1) {
      // if (isEnabledButtonNext) {
      this.setState({
        pageActive: parseInt(numberPage),
      });
      // } else {
      // this.setState({
      //   pageActive: parseInt(numberPage) - 1,
      // });
      // }
    } else {
      this.setState({
        pageActive: parseInt(numberPage),
      });
    }
  };

  handleDataReport = async () => {
    this.setState({
      loading: true,
    });
    const { dateInitial, dateFinal, pesquisas, customerSelected, idsTeams, idsPromoters, idsGerentes, idsSupervisors } =
      this.state;

    let codigoPesquisas = pesquisas?.filter((e) => e.checked);
    codigoPesquisas = codigoPesquisas.map((item) => {
      return item.GAP_ID;
    });

    const dataPesquisaInicial = format(dateInitial, 'dd/MM/yyyy');
    const dataPesquisaFinal = format(dateFinal, 'dd/MM/yyyy');

    try {
      const payload = {
        dataPesquisaInicial,
        dataPesquisaFinal,
        codigoPesquisas,
        promotores: idsPromoters,
        supervisores: idsSupervisors,
        gerentes: idsGerentes,
        estruturasTrade: idsTeams,
        cliente: customerSelected ? String(customerSelected?.CLI_ID) : '',
      };

      const res = await api.post(
        `v1/tradereport/excelexport/variablecalculation/customers/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`,
        payload
      );
      const { sucess, data } = res.data;

      if (sucess) {
        if (data?.length === 0) {
          alerta('Nenhum resultado encontrado', 1);
        }

        this.setState({
          dataReport: data,
        });
      } else {
        alerta('Erro ao carregar os dados');
      }
    } catch (error) {
      alerta('Erro ao carregar os dados');
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  handleDetailReport = async (photos) => {
    try {
      const { pesquisas } = this.state;
      let codigoPesquisas = pesquisas?.filter((e) => e.checked);
      codigoPesquisas = codigoPesquisas?.map((item) => {
        return item.GAP_ID;
      });

      this.setState({
        loading: true,
      });
      const gaaIdArray = [];
      photos.CLIENTES.forEach((item) => {
        item.GAA_ID.forEach((el) => {
          gaaIdArray.push(el);
        });
      });

      const payload = {
        gaaId: gaaIdArray,
        codigoPesquisas,
      };

      const res = await api.post(
        `v1/tradereport/excelexport/variablecalculation/photos/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`,
        payload
      );

      const { sucess, data } = res.data;

      if (sucess) {
        const companys = [];
        const marcados = [];

        const reportDataLocal = await getLocalObject('reportVariables');
        let idLocal = reportDataLocal ? reportDataLocal?.length : 0;

        let newPayloadLocal = {
          payload,
          id: idLocal,
          marcados: [...marcados],
        };
        let flag = true;

        if (reportDataLocal) {
          reportDataLocal.forEach((element) => {
            const parse = JSON.stringify(element.payload);

            if (parse === JSON.stringify(payload)) {
              newPayloadLocal = element;
              idLocal = element.id;
              flag = false;
            }
          });
        }

        if (flag) {
          await setLocalObject('reportVariables', [...(reportDataLocal || []), newPayloadLocal]);
        }

        for (const item of data) {
          const existCompany = companys.findIndex((e) => Number(e.id) === Number(item.CLI_ID));
          if (existCompany === -1) {
            companys.push({
              AGRUPAMENTOS: [],
              id: Number(item?.CLI_ID),
              name: item?.CLI_NOME_FANTASIA,
              checked: true,
            });
          }
        }

        for (const [index, itemCompany] of companys.entries()) {
          const dataFilter = data.filter((e) => Number(e.CLI_ID) === itemCompany.id);

          const agrups = [];

          for (const item of dataFilter) {
            const itemCheck = item.AGRUPA_ID || item.PERGUNTA_ID;
            const posExist = agrups.findIndex((e) => e.id === itemCheck);
            if (posExist === -1) {
              const obj = {
                id: itemCheck,
                ITENS: [
                  {
                    id: item.ITEM_ID || item.PERGUNTA_ID,
                    IMAGES: [],
                    name: item.ITEM_DESCRICAO ? `${item.ITEM_DESCRICAO}` : `${item.PERGUNTA_DESCRICAO}`,
                    EXIST_IMAGE: false,
                  },
                ],
                name: item.AGRUPA_DESCRICAO ? `${item.AGRUPA_DESCRICAO}` : `${item.PERGUNTA_DESCRICAO}`,
                checked: true,
                EXIST_IMAGE: false,
              };
              agrups.push(obj);
            } else {
              const existItem = agrups[posExist].ITENS.findIndex(
                (e) => e.id === item.ITEM_ID || e.id === item.PERGUNTA_ID
              );
              if (existItem === -1) {
                agrups[posExist].ITENS.push({
                  id: item.ITEM_ID || item.PERGUNTA_ID,
                  IMAGES: [],
                  name: item.ITEM_DESCRICAO ? `${item.ITEM_DESCRICAO}` : `${item.PERGUNTA_DESCRICAO}`,
                  EXIST_IMAGE: false,
                });
              }
            }
          }
          companys[index].AGRUPAMENTOS = agrups;
        }

        for (const [index, item] of companys.entries()) {
          const dataParse = data.filter((e) => Number(e.CLI_ID) === item.id);

          for (const [indexAgp, agpItem] of item.AGRUPAMENTOS.entries()) {
            const parseAgrup = dataParse.filter((e) => e.AGRUPA_ID === agpItem.id || e.PERGUNTA_ID === agpItem.id);

            for (const [indexItens, itensImg] of agpItem.ITENS.entries()) {
              const dataFilter = parseAgrup.filter((e) => e.ITEM_ID === itensImg.id || e.PERGUNTA_ID === agpItem.id);

              const arrayImg = [];
              for (const itemData of dataFilter) {
                if (
                  itemData.PERGUNTA_RESPOSTA &&
                  !itemData.PERGUNTA_RESPOSTA.includes('nao-se-aplica') &&
                  !itemData.PERGUNTA_RESPOSTA.includes('imagem-indisponivel')
                ) {
                  const existLocal = reportDataLocal
                    ? newPayloadLocal?.marcados?.some((e) => e === itemData.PERGUNTA_ID)
                    : false;
                  const newAdd = {
                    img: itemData.PERGUNTA_RESPOSTA,
                    checked: !existLocal,
                    PERGUNTA_ID: itemData.PERGUNTA_ID,
                    render: null,
                    name: itemData.ITEM_DESCRICAO,
                    DATA: format(new Date(itemData.DATA_HORA), 'dd/MM/yyyy'),
                  };

                  arrayImg.push(newAdd);
                }
              }
              if (arrayImg.length > 0) {
                companys[index].AGRUPAMENTOS[indexAgp].ITENS[indexItens].IMAGES = [...arrayImg];
                companys[index].AGRUPAMENTOS[indexAgp].ITENS[indexItens].EXIST_IMAGE = true;
              }
            }
          }
        }

        this.setState({
          dataPhotos: companys,
          idLocal,
          pageActive: 1,
          promotorName: photos.USR_NOME,
        });
      } else {
        alerta('Não foi possível obter os dados');
      }
    } catch (error) {
      alerta('Não foi possível obter os dados das fotos');
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  onSelectAllImagesCompany = async (e, items, pos) => {
    const { dataPhotos, idLocal } = this.state;
    this.setState({
      loading: true,
    });

    const updateData = [];
    items = items.map((element) => {
      element.ITENS = element.ITENS.map((itens) => {
        itens.IMAGES = itens.IMAGES.map((item) => {
          item.checked = e.target.checked;
          updateData.push(item.PERGUNTA_ID);
          return item;
        });
        return itens;
      });
      element.checked = e.target.checked;
      return element;
    });

    dataPhotos[pos].AGRUPAMENTOS = items;
    dataPhotos[pos].checked = e.target.checked;

    const reportDataLocal = await getLocalObject('reportVariables');
    const itemCurrentPos = reportDataLocal.findIndex((e) => e.id === idLocal);

    if (itemCurrentPos !== -1) {
      if (!e.target.checked) {
        reportDataLocal[itemCurrentPos].marcados = [...reportDataLocal[itemCurrentPos].marcados, ...updateData];
      } else {
        const arrayUpdate = [];
        reportDataLocal[itemCurrentPos].marcados.forEach((el) => {
          const itemCheck = updateData.find((e) => e === el);
          if (!itemCheck) {
            arrayUpdate.push(el);
          }
        });
        reportDataLocal[itemCurrentPos].marcados = [...arrayUpdate];
      }
    }

    await setLocalObject('reportVariables', reportDataLocal);

    this.setState({
      loading: false,
      dataPhotos,
    });
  };

  onSelectAllImages = async (e, id, indexAgrup, items) => {
    const { dataPhotos, idLocal } = this.state;

    this.setState({
      loading: true,
    });

    const updateData = [];
    const update = items.map((element) => {
      element.IMAGES = element.IMAGES.map((img) => {
        img.checked = e.target.checked;
        updateData.push(img.PERGUNTA_ID);
        return img;
      });
      return element;
    });

    const companyPos = dataPhotos.findIndex((e) => e.id === id);

    if (companyPos !== -1) {
      const posAgrup = dataPhotos[companyPos].AGRUPAMENTOS.findIndex((e) => e.id === indexAgrup);
      if (posAgrup !== -1) {
        dataPhotos[companyPos].AGRUPAMENTOS[posAgrup].ITENS = update;

        const reportDataLocal = await getLocalObject('reportVariables');
        const itemCurrentPos = reportDataLocal.findIndex((e) => Number(e.id) === Number(idLocal));

        if (itemCurrentPos !== -1) {
          if (!e.target.checked) {
            reportDataLocal[itemCurrentPos].marcados = [...reportDataLocal[itemCurrentPos].marcados, ...updateData];
          } else {
            const arrayUpdate = [];
            reportDataLocal[itemCurrentPos].marcados.forEach((el) => {
              const itemCheck = updateData.find((e) => e === el);
              if (!itemCheck) {
                arrayUpdate.push(el);
              }
            });
            reportDataLocal[itemCurrentPos].marcados = [...arrayUpdate];
          }
        }

        await setLocalObject('reportVariables', reportDataLocal);
      }
    }

    this.setState({
      dataPhotos,
      loading: false,
    });
  };

  handleDownloadPdf = async () => {
    const { empresaId, empresaNomeFantasia, nomeUsuario, usuarioAtivo, dataPhotos, dateInitial, dateFinal } =
      this.state;
    this.setState({ loading: true });

    for (const [index, company] of dataPhotos.entries()) {
      for (const [indexCompany, data] of company.AGRUPAMENTOS.entries()) {
        let flagChecked = false;
        for (const [indexItens, dataItens] of data.ITENS.entries()) {
          const imagesChecked = dataItens.IMAGES.filter((e) => e.checked);
          for (const [indexImg, img] of imagesChecked.entries()) {
            flagChecked = true;
            if (img.img.includes('nao-se-aplica') || img.img.includes('imagem-indisponivel')) {
              dataPhotos[index].AGRUPAMENTOS[indexCompany].ITENS[indexItens].IMAGES[indexImg].render = imgNotApply;
            } else {
              const imageRender = await this.renderImageToBase64(img.img);
              dataPhotos[index].AGRUPAMENTOS[indexCompany].ITENS[indexItens].IMAGES[
                indexImg
              ].render = `data:image/png;base64,${imageRender}`;
            }
          }
        }
        dataPhotos[index].AGRUPAMENTOS[indexCompany].checked = flagChecked;
      }
    }

    const docDefinition = {
      content: [
        {
          table: {
            headerRows: 1,
            widths: ['*', 220],
            body: [
              [
                {
                  text: [
                    {
                      text: 'Relatório de apuração de variáveis',
                      bold: true,
                      fontSize: 16,
                    },
                    '\n',
                    `${empresaId} - ${empresaNomeFantasia.toUpperCase()}`,
                  ],
                  alignment: 'left',
                },
                {
                  text: [
                    {
                      text: `USUÁRIO: ${`${nomeUsuario}`.toUpperCase()} (${`${usuarioAtivo}`.toUpperCase()})`,
                      bold: true,
                    },
                    '\n',
                    { text: `DATA: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, bold: true },
                  ],
                  alignment: 'right',
                },
              ],
            ],
          },
          layout: 'noBorders',
        },
        {
          text: `Período: ${format(dateInitial, 'dd/MM/yyyy')} até ${format(dateFinal, 'dd/MM/yyyy')}`,
          alignment: 'left',
          color: '#262626',
          margin: [0, 12, 0, 12],
          bold: true,
        },
        dataPhotos.map((company, iCompany) => {
          if (company.AGRUPAMENTOS && company.AGRUPAMENTOS.length > 0 && company.AGRUPAMENTOS.some((e) => e.checked)) {
            return [
              {
                text: `${company.name}`,
                alignment: 'left',
                bold: true,
                fontSize: 16,
                margin: iCompany !== 0 && [0, 20, 0, 0],
              },
              {
                text: '_______________________________________________________________________________________________',
                margin: [0, -10, 0, 0],
                color: '#262626',
              },
              company.AGRUPAMENTOS?.map((item, index) => {
                const columnRes = [];
                let flag = false;
                item.ITENS.forEach((element) => {
                  const imagesFilter = element.IMAGES.filter((e) => e.render);

                  if (imagesFilter && imagesFilter.length > 0) {
                    for (let i = 0; i < imagesFilter.length; i += 3) {
                      const linha = imagesFilter.slice(i, i + 3);

                      const colunasLinha = linha.map((img) => {
                        return {
                          type: 'none',
                          ol: [
                            {
                              text: img.name,
                              alignment: 'left',
                              fontSize: 12,
                              bold: true,
                              margin: [0, 2, 0, 0],
                            },
                            {
                              image: `${img.render}`,
                              width: 165,
                              height: 165,
                            },
                            {
                              text: img.DATA,
                              alignment: 'left',
                              fontSize: 12,
                              bold: true,
                            },
                          ],
                        };
                      });

                      columnRes.push(colunasLinha);
                    }
                    flag = true;
                  }
                });

                if (flag) {
                  return [
                    {
                      text: `${item.name}`,
                      alignment: 'left',
                      bold: true,
                      fontSize: 14,
                      color: '#1a1a1a',
                      margin: index === 0 ? [0, 5, 0, 3] : [0, 15, 0, 3],
                      decoration: 'underline',
                      decorationStyle: 'dotted',
                    },
                    columnRes.map((img, indexColumn) => {
                      return [
                        {
                          columns: img,
                          margin: indexColumn !== 0 && [0, 6, 0, 0],
                        },
                      ];
                    }),
                  ];
                } else {
                  return [];
                }
              }),
            ];
          } else {
            return [];
          }
        }),
        {
          text: [
            { text: `Eu______________________________________________________________`, color: '#000' },
            '\n',
            {
              text: `declaro no dia __/__/____ que as informações acimas foram devidamente validadas.`,
              color: '#000',
            },
          ],
          alignment: 'left',
          margin: [0, 70, 0, 0],
        },
        {
          text: [
            { text: `____________________________________________________________________`, color: '#000' },
            '\n',
            { text: `Assinatura supervisor`, color: '#000' },
          ],
          alignment: 'center',
          margin: [0, 40, 0, 0],
        },
      ],
      defaultStyle: {
        columnGap: 2,
      },
    };

    this.setState({ loading: false });
    pdfMake.createPdf(docDefinition).open();
  };

  renderImageToBase64 = async (url) => {
    try {
      const payload = {
        compress: false,
        url,
      };

      const res = await api.post('v1/upload/download/base64', payload);

      const { sucess, data } = res.data;

      if (sucess) {
        return data;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  handleDownloadSheet = async () => {
    const { dataPhotos, promotorName } = this.state;
    const file = [];
    if (dataPhotos?.length === 0) {
      alerta('Não há dados para exportar', 3);
      return;
    }

    dataPhotos.forEach((item) => {
      item.AGRUPAMENTOS.forEach((company) => {
        if (company) {
          company.ITENS.forEach((itens) => {
            itens.IMAGES.forEach((img) => {
              if (img.checked) {
                const newObj = {
                  DATA: img.DATA,
                  'NOME DO PROMOTOR': promotorName,
                  CLIENTE: `${item.id} - ${item.name}`,
                  PESQUISA: `${company?.name}`,
                  PRODUTO: itens.name,
                  'LINK DA FOTO': img.img,
                };
                file.push(newObj);
              }
            });
          });
        }
      });
    });

    let wb = XLSX.utils.book_new();
    let ws = XLSX.utils.json_to_sheet(file);
    var wscols = [{ wch: 15 }, { wch: 50 }, { wch: 50 }, { wch: 45 }, { wch: 50 }, { wch: 60 }];

    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, 'Relatório de váriaveis');

    XLSX.writeFile(wb, 'RelatorioVariaveis.xlsx');
  };

  titlesPages = ['Pesquisar', 'Dados'];

  render() {
    const {
      loading,
      dateInitial,
      dateFinal,
      promotoresChips,
      promotoresSelecionados,
      supervisoresSelecionados,
      gerentesSelecionados,
      supervisoresChips,
      gerentesChips,
      clientes,
      pesquisas,
      dataReport,
      pageActive,
      dataPhotos,
      teamsSelecionados,
      teamsChips,
      slide,
      photosToSlide,
    } = this.state;

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
                  <Icon>print</Icon>Relatório de apuração de variáveis
                </span>
              )
            }
          />
          <Tabs
            scope="tabs"
            className="tabs-content"
            onChange={(ev) => {
              this.handlePagePerTabs(ev);
            }}
          >
            <Tab
              tabWidth={200}
              className="element"
              disabled={false}
              active={pageActive === 0}
              options={{
                duration: 300,
                onShow: null,
                responsiveThreshold: Infinity,
                swipeable: true,
              }}
              title={'Pesquisar'}
            >
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
                        </Linha>
                        <Linha withPadding={false}>
                          <DivDetalhe flex={3} className="divDetailGerente">
                            <Labels>Equipes</Labels>
                            <Chip
                              id="teamsChips"
                              className="teamsChips"
                              close={false}
                              closeIcon={<Icon className="close">close</Icon>}
                              options={{
                                data: teamsSelecionados !== undefined ? teamsSelecionados : [],
                                onChipAdd: this.onChangeSelectTeam,
                                onChipDelete: this.onChangeSelectTeam,
                                autocompleteOptions: {
                                  data: teamsChips,
                                  limit: 1,
                                  onAutocomplete: function noRefCheck() {},
                                },
                              }}
                            />
                          </DivDetalhe>
                        </Linha>
                        <Linha withPadding={false}>
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
                        </Linha>
                        <Linha withPadding={false}>
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
                    <Linha style={{ justifyContent: 'flex-end' }}>
                      <button
                        className="saib-button is-primary print"
                        onClick={async () => {
                          await this.handleDataReport();
                        }}
                      >
                        <Icon>find_in_page</Icon>
                        <span>Pesquisar</span>
                      </button>
                    </Linha>
                  </CollapsibleItem>
                </Collapsible>
              </Linha>
              <Linha style={{ gap: '1rem' }}>
                {dataReport.map((item) => (
                  <ContentList key={item.USR_ID}>
                    <h2>Promotor {item.USR_NOME}</h2>
                    <button
                      className="saib-button is-primary"
                      style={{ height: '32px', margin: '0.8rem 0 0 0' }}
                      onClick={async () => {
                        await this.handleDetailReport(item);
                      }}
                    >
                      <span>Selecionar promotor</span>
                    </button>
                    <table className="striped findSchedule">
                      <thead>
                        <tr>
                          <th>Seq.</th>
                          <th>Nome</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.CLIENTES &&
                          item.CLIENTES.map((cli, i) => (
                            <tr key={`${cli.CLI_ID}_${i}`}>
                              <td>
                                <Labels color="#000">{i + 1}</Labels>
                              </td>
                              <td style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                  <Labels color="#000">{cli.CLI_NOME_FANTASIA}</Labels>
                                  <Labels
                                    color="#000"
                                    fontSize={'0.8rem'}
                                    fontWeight="600"
                                    style={{ marginTop: '-0.7rem' }}
                                  >
                                    ({cli.CLI_RAZAO_SOCIAL})
                                  </Labels>
                                </div>
                              </td>
                              {cli.TEM_FOTO !== 'Sim' && (
                                <td>
                                  <button
                                    className="saib-button is-primary"
                                    style={{ height: '32px', margin: '0.8rem 0 0 0' }}
                                    disabled={true}
                                  >
                                    <span>Sem fotos</span>
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </ContentList>
                ))}
              </Linha>
            </Tab>
            <Tab
              tabWidth={200}
              className="element"
              disabled={!dataPhotos || dataPhotos.length === 0}
              active={pageActive === 1}
              options={{
                duration: 300,
                onShow: null,
                responsiveThreshold: Infinity,
                swipeable: true,
              }}
              title={'Dados'}
            >
              <Linha style={{ justifyContent: 'flex-end' }}>
                <Linha
                  width="max-content"
                  style={{
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '0.5rem',
                    padding: '0.5rem',
                  }}
                >
                  <Labels color="#8e44ad" fontSize={'1.2rem'} fontWeight="600">
                    Baixar arquivo
                  </Labels>
                  <div style={{ display: 'flex', gap: '0.8rem' }}>
                    <button
                      className="saib-button is-primary print"
                      onClick={async () => {
                        await this.handleDownloadPdf();
                      }}
                    >
                      <Icon>picture_as_pdf</Icon>
                      <span>Gerar PDF</span>
                    </button>
                    <button
                      className="saib-button is-primary print"
                      onClick={async () => {
                        await this.handleDownloadSheet();
                      }}
                    >
                      <Icon>file_download</Icon>
                      <span>Baixar planilha</span>
                    </button>
                  </div>
                </Linha>
              </Linha>
              {dataPhotos?.length === 0 && (
                <Labels color="#000" fontSize={'1.2rem'} fontWeight="700">
                  Não há imagens para serem mostradas
                </Labels>
              )}

              <ContentCompanys>
                {dataPhotos.map((item, indexPht) => (
                  <Collapsible
                    key={item.id}
                    accordion
                    style={{
                      width: '100%',
                      borderStyle: 'none',
                      boxShadow: 'none',
                    }}
                  >
                    <CollapsibleItem
                      expanded={false}
                      header={item?.name}
                      icon={
                        <>
                          <Icon className="plus1">expand_more</Icon>

                          <Icon className="minus1">navigate_next</Icon>
                        </>
                      }
                      node="div"
                    >
                      <div style={{ margin: '1rem 0 1rem 0.5rem' }}>
                        <Checkbox
                          id={`${item?.name}-${item?.id}`}
                          label={item.checked ? 'Desmarcar tudo' : 'Selecionar tudo'}
                          value="1"
                          checked={item.checked}
                          onChange={(e) => this.onSelectAllImagesCompany(e, item.AGRUPAMENTOS, indexPht)}
                        />
                      </div>

                      {item.AGRUPAMENTOS?.map(
                        (el, agrupIndex) =>
                          el.ITENS.some((e) => e.EXIST_IMAGE) && (
                            <Linha
                              key={`${el.id}_${el.name}`}
                              accordion
                              style={{
                                flexDirection: 'column',
                                gap: '0.5rem',
                              }}
                            >
                              <Labels
                                color="#000"
                                fontSize={'1.1rem'}
                                fontWeight="700"
                                style={{ borderBottom: '1px solid #737373' }}
                              >
                                {`${el.name}`}
                              </Labels>
                              <Checkbox
                                id={`${el?.name}_${el?.id}`}
                                label={el?.checked ? 'Desmarcar todas' : 'Selecionar todas'}
                                value={el?.checked ? '1' : '0'}
                                checked={el?.checked ? true : false}
                                onChange={(e) => this.onSelectAllImages(e, item.id, el.id, el?.ITENS)}
                              />
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                {el.ITENS.filter((e) => e.EXIST_IMAGE)?.map((itens) => (
                                  <div
                                    key={`${itens.id}_${itens.name}`}
                                    style={{ display: 'flex', flexDirection: 'column' }}
                                  >
                                    <Labels
                                      color="#333333"
                                      fontSize={'1rem'}
                                      fontWeight="500"
                                      style={{ textDecoration: 'underline' }}
                                    >
                                      {`${itens.name}`}
                                    </Labels>
                                    <div
                                      style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1rem' }}
                                    >
                                      {itens?.IMAGES.length > 0 &&
                                        itens?.IMAGES?.map((itemItens, indexItens) => (
                                          <div
                                            key={`${itemItens.PERGUNTA_ID}`}
                                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                                          >
                                            <Checkbox
                                              id={`${itemItens.PERGUNTA_ID}_${item?.id}`}
                                              label="Autenticado"
                                              value={itemItens.checked ? '1' : '0'}
                                              checked={itemItens.checked ? true : false}
                                              onChange={(e) =>
                                                this.onChangeImageActive(e, item.id, agrupIndex, itens.id, indexItens)
                                              }
                                            />
                                            <img
                                              src={itemItens.img}
                                              alt={itemItens.PERGUNTA_ID}
                                              style={{ width: '9rem', height: '9rem' }}
                                              onClick={() =>
                                                this.setState({ slide: {
                                                  img: itemItens.img,
                                                  alt: itens.name,
                                                  index: 0,
                                                }, photosToSlide: item.AGRUPAMENTOS })
                                              }
                                            />
                                            {itemItens.DATA && (
                                              <span
                                                style={{
                                                  marginTop: '0.1rem',
                                                  fontWeight: '600',
                                                  color: '#000',
                                                  fontSize: '13px',
                                                }}
                                              >
                                                {itemItens.DATA}
                                              </span>
                                            )}
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </Linha>
                          )
                      )}
                    </CollapsibleItem>
                  </Collapsible>
                ))}
                {slide && <SlidePhotos photos={photosToSlide} closed={() => this.setState({ slide: false })} actualPhoto={slide} />}
              </ContentCompanys>
            </Tab>
          </Tabs>
        </Container>
      </div>
    );
  }
}

export default withRouter(VariableCalcularion);
