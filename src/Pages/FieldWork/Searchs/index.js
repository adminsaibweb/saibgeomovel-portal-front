import React, { Component } from 'react';
import {
  Container,
  Linha,
  DivDetalhe,
  LinhaKanban,
  DivBaseKanbanTituloPai,
  Labels,
  KanbanContainer,
  DivBaseKanban,
  Kanban,
  LinhaContentHeaderKanBan,
  RowFilter,
  ContentInputFilter,
  LabelsFilter,
  ContentDetailsItemKanban,
  ContentItem,
  LinhaBtnsModal,
  LabelSituation,
  ContentBtnDeleteSearch,
} from './style';
import DirectTituloJanela from '../../../Components/Globals/DirectTituloJanela';
import WaitScreen from '../../../Components/Globals/WaitScreen';
import Header from '../../../Components/System/Header';
import noSearchImage from '../../../assets/images/noimagequadrada.jpg';
import { Button, Icon, Collapsible, CollapsibleItem } from 'react-materialize';
import M from 'materialize-css';
import { getFromStorage } from '../../../services/auth';
import { alerta, tratarErros } from '../../../services/funcoes';
import api from '../../../services/api';
import { Link } from 'react-router-dom';
import SaibRadioGroup from '../../../Components/Globals/SaibRadioGroup';

export default class Searchs extends Component {
  state = {
    loading: false,
    selectedSearchs: [],
    searchs: [],
    chipsSearchs: {},
    descriptionToFilter: '',
    optionPerCod: false,
    optionPerDescrition: true,
    optionFilterSituation: '0',
    optionFilterTypeSearch: '0',
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

  getSearchsList = async (_searchs) => {
    const { searchs } = this.state;
    let result = '';
    for (const search of _searchs) {
      let _search = searchs.find((item) => item.GAP_ID + ' - ' + item.GAP_DESCRICAO === search.tag);
      if (_search !== undefined) {
        result += _search.GAP_ID + ',';
      }
    }

    if (result !== '') {
      result = result.substr(0, result.length - 1);
    }

    return result;
  };

  setSearchsPerFilter = () => {
    const { optionFilterSituation, optionFilterTypeSearch, allSearchs } = this.state;
    let status;
    let type;
    let response = allSearchs?.map((search) => search);

    switch (optionFilterSituation) {
      case '1':
        status = 1;
        break;
      case '2':
        status = 0;
        break;
      default:
        break;
    }
    switch (optionFilterTypeSearch) {
      case '1':
        type = 1;
        break;
      case '2':
        type = 0;
        break;
      default:
        break;
    }
    if (status !== undefined) {
      response = allSearchs.filter((search) => search.GAP_FLG_STATUS === status && search);
    }
    if (type !== undefined) {
      response = response.filter((search) => search.GAP_FLG_AGRUPA === type && search);
    }

    this.setState({
      searchs: response,
    });
  };

  onChangeRadioSituationSearchs = () => {
    this.setSearchsPerFilter();
  };

  onChangeRadioTypeSearchs = () => {
    this.setSearchsPerFilter();
  };

  loadSearchs = async () => {
    const { empresaAtiva } = this.state;
    this.setState({
      loading: true,
    });
    try {
      const { usuarioAtivo, optionFilterTypeSearch } = this.state;

      let url;
      url = '/v1/searchs/' + empresaAtiva + '/' + usuarioAtivo;

      const retorno = await api.post(url);
      if (retorno.data && retorno.data.sucess) {
        let searchs = retorno.data.data;
        let searchsChips = {};
        for (const search of searchs) {
          searchsChips[search.GAP_ID + ' - ' + search.GAP_DESCRICAO] = null;
        }
        const searchs_ = [];
        retorno.data.data.forEach((search) => {
          if (optionFilterTypeSearch !== '0') {
            let agruped;
            optionFilterTypeSearch === '1' ? (agruped = 1) : (agruped = 0);
            if (search.GAP_FLG_AGRUPA === agruped) {
              searchs_.push(search);
            }
          } else {
            searchs_.push(search);
          }
        });

        this.setState({
          allSearchs: retorno.data.data,
          searchs: searchs_,
          searchsChips,
        });
      }
    } catch (err) {
      alerta('Erro ao carregar as pesquisas =>' + err, 2);
    } finally {
      this.onChangeRadioSituationSearchs();
      this.setState({
        loading: false,
      });
    }
  };

  handleManipulaPesquisas = async () => {
    let searchSelected = M.Chips.getInstance(document.getElementById('chipsSearchs')).chipsData;
    const idSupervisor = searchSelected[0] && searchSelected[0].tag.split('-')[0];
    const dataToSend = {
      codigoPesquisa: idSupervisor && idSupervisor.replace(' ', ''),
      descricaoPesquisa: '',
    };

    try {
      const res = await api.post(`v1/searchs/${this.state.empresaAtiva}/${this.state.usuarioAtivo} `, dataToSend);
      const { data, sucess } = res.data;

      const searchsActived = [];
      const searchsInativate = [];
      data.forEach((search) => {
        if (search.GAP_FLG_STATUS === 1) {
          searchsActived.push(search);
        } else {
          searchsInativate.push(search);
        }
      });

      if (sucess) {
        this.setState({
          searchs: data,
          searchsActived: searchsActived,
          searchsInativate,
          selectedSearchs: searchSelected,
        });
      }
    } catch (error) {}
  };

  handleOptionFilter = () => {
    this.state.optionPerCod === true
      ? this.setState({ optionPerDescrition: true, optionPerCod: false })
      : this.setState({ optionPerDescrition: false, optionPerCod: true });
  };

  handleSearchsPerFilter = async (ev) => {
    this.setState({
      descriptionToFilter: ev.target.value,
    });
    const searchs = [];
    const searchsInativate = [];
    if (ev.target.value === '') {
      this.setSearchsPerFilter();
    } else if (this.state.optionPerDescrition === true) {
      this.state.searchs.forEach((search) => {
        if (String(search.GAP_DESCRICAO) !== 'null') {
          if (String(search.GAP_DESCRICAO).includes(ev.target.value.toUpperCase())) {
            searchs.push(search);
          }
        }
      });

      this.setState({
        searchs,
      });
      if (searchs.length === 0 && searchsInativate.length === 0) this.setSearchsPerFilter();
    } else {
      ev.persist();
      const data_ = {
        codigoPesquisa: String(ev.target.value),
      };
      const res = await api.post(`v1/searchs/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`, data_);
      const { sucess, data } = res.data;
      const searchs = [];

      data.forEach((search) => {
        if (String(search.GAP_DESCRICAO) !== 'null') {
          if (String(search.GAP_ID).includes(ev.target.value)) {
            searchs.push(search);
          }
        }
      });

      if (sucess) {
        this.setState({
          searchs,
        });
      } else {
        tratarErros(res.data);
      }
    }
  };

  refreshScreen = async () => {
    this.setState({ loading: true });
    await this.loadSearchs();
    this.setState({ loading: false });
  };

  handleActiveOrDisableSearch = async (search) => {
    this.setState({
      loading: true,
    });
    search.GAP_FLG_STATUS === 0 ? (search.GAP_FLG_STATUS = 1) : (search.GAP_FLG_STATUS = 0);
    try {
      const res = await api.put(`v1/searchs/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`, search);
      const { sucess } = res.data;
      if (sucess) {
        alerta('Pesquisa alterada com sucesso!', 1);
        this.setSearchsPerFilter();
      }
    } catch (error) {
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  deleteSearch = async (id) => {
    try {
      if (id) {
        this.setState({
          loading: true,
        });
        const res = await api.delete(`v1/searchs/${this.state.empresaAtiva}/${this.state.usuarioAtivo}/${id}`);
        const { sucess } = res.data;

        if (sucess) {
          alerta('Pesquisa excluida com sucesso', 1);
          this.refreshScreen();
        } else {
          alerta('Não foi possível excluir a pesquisa, verifique', 2);
        }
      }
    } catch (error) {
      alerta('Erro ao salvar pesquisa, verifique', 2);
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  render() {
    const { loading, searchs } = this.state;

    return (
      <>
        <Header />
        <WaitScreen loading={loading} />
        <Container className="containerSearchs">
          <DirectTituloJanela
            urlVoltar={'/home'}
            urlNovo={'/search'}
            titulo={
              loading ? (
                'Aguarde...'
              ) : (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon>poll</Icon>Pesquisas
                </span>
              )
            }
          />
          <Linha className="filter">
            <Collapsible
              accordion={false}
              style={{
                width: '100%',
                borderStyle: 'none',
                boxShadow: 'none',
              }}
            >
              <CollapsibleItem expanded={false} header="Clique para filtrar" icon={<Icon>filter_list</Icon>} node="div">
                <RowFilter>
                  <ContentItem>
                    <SaibRadioGroup
                      valueItems={'"1","2","0"'}
                      classNameItems={'"itemActive","itemInative","allItems"'}
                      textItems={'"Ativa","Inativa","Todos"'}
                      idItems={'"active","inactivate","all2"'}
                      classNameRadio="filterSituationSearch"
                      flexDirectionRadio="row"
                      disabledRadio="false"
                      captionRadio="Situação pesquisa"
                      defaultCheckedId={'all2'}
                      onChange={(value) => {
                        this.setState(
                          {
                            optionFilterSituation: value,
                          },
                          () => this.onChangeRadioSituationSearchs()
                        );
                      }}
                    />
                  </ContentItem>
                  <ContentItem>
                    <SaibRadioGroup
                      valueItems={'"1","2","0"'}
                      classNameItems={'"itemTodos","itemAguardando","itemAprovados"'}
                      textItems={'"Agrupada","Não agrupada","Todos"'}
                      idItems={'"agrupa","notGrouped","all"'}
                      classNameRadio="filterTypeSearch"
                      flexDirectionRadio="row"
                      disabledRadio="false"
                      captionRadio="Tipo de pesquisas"
                      defaultCheckedId={'all'}
                      onChange={(value) => {
                        this.setState(
                          {
                            descriptionToFilter: '',
                            optionFilterTypeSearch: value,
                          },
                          () => {
                            this.onChangeRadioTypeSearchs();
                          }
                        );
                      }}
                    />
                  </ContentItem>
                </RowFilter>
                <ContentInputFilter className="input-field ">
                  <div>
                    <LabelsFilter fontWeight="500" fontSize="1.0rem">
                      Filtro por:
                    </LabelsFilter>
                    <div>
                      <p>
                        <LabelsFilter fontWeight="300" fontSize="0.8rem">
                          <input
                            className="radioToFilter"
                            name="group1"
                            type="radio"
                            onChange={this.handleOptionFilter}
                            value={this.state.optionPerDescrition}
                            checked={this.state.optionPerDescrition}
                          />
                          <span>Nome da pesquisa</span>
                        </LabelsFilter>
                      </p>
                      <p>
                        <LabelsFilter fontWeight="300" fontSize="0.8rem">
                          <input
                            name="group1"
                            className="radioToFilter"
                            type="radio"
                            onChange={this.handleOptionFilter}
                            value={this.state.optionPerCod}
                          />
                          <span>Codigo da pesquisa</span>
                        </LabelsFilter>
                      </p>
                    </div>
                  </div>
                  <div className="content-input">
                    <input
                      id="search"
                      type={this.state.optionPerCod ? 'number' : 'text'}
                      className="validate"
                      value={this.state.descriptionToFilter}
                      onChange={this.handleSearchsPerFilter}
                    />
                    <i className="small material-icons" style={{ marginLeft: '10px' }}>
                      search
                    </i>
                  </div>
                </ContentInputFilter>
              </CollapsibleItem>
            </Collapsible>
          </Linha>

          <LinhaKanban>
            <Kanban cor={'#41339E'}>
              <DivBaseKanbanTituloPai cor={'#41339E'}>Pesquisas agrupadas</DivBaseKanbanTituloPai>
              <KanbanContainer>
                {searchs !== undefined &&
                  searchs.map((item, i) => {
                    if (item.GAP_FLG_AGRUPA === 1) {
                      return (
                        <DivBaseKanban key={i}>
                          <LinhaContentHeaderKanBan style={{ paddingTop: '10px' }}>
                            <DivDetalhe flex={3} description={true}>
                              <ContentBtnDeleteSearch>
                                <Labels>{item.GAP_ID + ' - ' + item.GAP_DESCRICAO}</Labels>
                                <Button
                                  disabled={!item.EXCLUIR}
                                  node="button"
                                  title="Apagar"
                                  className="waves-effect waves-light saib-button is-primary"
                                  onClick={() => {
                                    this.deleteSearch(item.GAP_ID);
                                  }}
                                >
                                  <Icon small>delete</Icon>
                                </Button>
                              </ContentBtnDeleteSearch>
                              <ContentDetailsItemKanban>
                                <img src={item.GAP_ICONE ? item.GAP_ICONE : noSearchImage} alt="Icone pesquisa" />
                                <LabelSituation fontWeight="500">
                                  Ativa
                                  {item.GAP_FLG_STATUS === 1 ? (
                                    <Icon className="done">done</Icon>
                                  ) : (
                                    <Icon className="close">close</Icon>
                                  )}
                                </LabelSituation>
                              </ContentDetailsItemKanban>
                            </DivDetalhe>
                          </LinhaContentHeaderKanBan>
                          <LinhaBtnsModal>
                            <Link
                              className="waves-effect waves-light saib-button is-primary view"
                              to={{
                                pathname: '/search',
                                state: {
                                  search: item,
                                  action: 'editar',
                                },
                              }}
                              // className="view"
                            >
                              <Icon small>pageview</Icon>
                            </Link>
                            <Button
                              node="button"
                              title={item.GAP_FLG_STATUS === 1 ? 'Desativar' : 'Ativar'}
                              className="waves-effect waves-light saib-button is-primary"
                              onClick={() => {
                                this.handleActiveOrDisableSearch(item);
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              {item.GAP_FLG_STATUS === 1 ? (
                                <LabelSituation color="#FFF" fontWeight="500" style={{ cursor: 'pointer' }}>
                                  <Icon large>block</Icon>
                                  Desativar
                                </LabelSituation>
                              ) : (
                                <LabelSituation color="#FFF" fontWeight="500" style={{ cursor: 'pointer' }}>
                                  <Icon large>done</Icon>
                                  Ativar
                                </LabelSituation>
                              )}
                            </Button>
                          </LinhaBtnsModal>
                        </DivBaseKanban>
                      );
                    } else return '';
                  })}
              </KanbanContainer>
            </Kanban>
            <Kanban cor={'#8E44AD'}>
              <DivBaseKanbanTituloPai cor={'#8E44AD'}>Pesquisas não agrupadas</DivBaseKanbanTituloPai>
              <KanbanContainer>
                {searchs !== undefined &&
                  searchs.map((item, i) => {
                    if (item.GAP_FLG_AGRUPA === 0) {
                      return (
                        <DivBaseKanban key={i}>
                          <LinhaContentHeaderKanBan style={{ paddingTop: '10px' }}>
                            <DivDetalhe flex={3} description={true}>
                              <ContentBtnDeleteSearch>
                                <Labels>{item.GAP_ID + ' - ' + item.GAP_DESCRICAO}</Labels>
                                <Button
                                  disabled={!item.EXCLUIR}
                                  node="button"
                                  title="Apagar"
                                  className="waves-effect waves-light saib-button is-primary"
                                  onClick={() => {
                                    this.deleteSearch(item.GAP_ID);
                                  }}
                                >
                                  <Icon small>delete</Icon>
                                </Button>
                              </ContentBtnDeleteSearch>
                              <ContentDetailsItemKanban>
                                <img src={item.GAP_ICONE ? item.GAP_ICONE : noSearchImage} alt="Icone pesquisa" />
                                <LabelSituation fontWeight="500">
                                  Ativa
                                  {item.GAP_FLG_STATUS === 1 ? (
                                    <Icon className="done">done</Icon>
                                  ) : (
                                    <Icon className="close">close</Icon>
                                  )}
                                </LabelSituation>
                              </ContentDetailsItemKanban>
                            </DivDetalhe>
                          </LinhaContentHeaderKanBan>
                          <LinhaBtnsModal>
                            <Link
                              className="waves-effect waves-light saib-button is-primary view"
                              to={{
                                pathname: '/search',
                                state: {
                                  search: item,
                                  action: 'editar',
                                },
                              }}
                              // className="view"
                            >
                              <Icon small>pageview</Icon>
                            </Link>
                            <Button
                              node="button"
                              title={item.GAP_FLG_STATUS === 1 ? 'Desativar' : 'Ativar'}
                              className="waves-effect waves-light saib-button is-primary"
                              onClick={() => {
                                this.handleActiveOrDisableSearch(item);
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              {item.GAP_FLG_STATUS === 1 ? (
                                <LabelSituation color="#FFF" fontWeight="500" style={{ cursor: 'pointer' }}>
                                  <Icon large>block</Icon>
                                  Desativar
                                </LabelSituation>
                              ) : (
                                <LabelSituation color="#FFF" fontWeight="500" style={{ cursor: 'pointer' }}>
                                  <Icon large>done</Icon>
                                  Ativar
                                </LabelSituation>
                              )}
                            </Button>
                          </LinhaBtnsModal>
                        </DivBaseKanban>
                      );
                    } else return '';
                  })}
              </KanbanContainer>
            </Kanban>
          </LinhaKanban>
        </Container>
      </>
    );
  }
}
