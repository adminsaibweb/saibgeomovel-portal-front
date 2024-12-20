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
  ContentDetailsItemKanban,
  LabelSituation,
  LinhaBtnsModal,
  LinhaCountSearchs,
  RowFilter,
  ContentItem,
  ContentInputFilter,
  LabelsFilter,
} from './styled';
import DirectTituloJanela from '../../../Components/Globals/DirectTituloJanela';
import WaitScreen from '../../../Components/Globals/WaitScreen';
import Header from '../../../Components/System/Header';
import { Button, Icon, Collapsible, CollapsibleItem } from 'react-materialize';
import { getFromStorage } from '../../../services/auth';
import { alerta, tratarErros } from '../../../services/funcoes';
import api from '../../../services/api';
import { Link } from 'react-router-dom';
import SaibRadioGroup from '../../../Components/Globals/SaibRadioGroup';

export default class Flows extends Component {
  state = {
    loading: false,
    optionFilterSituation: '0',
    optionFilterTypeFlow: '2',
    descriptionToFilter: '',
    optionPerDescrition: true,
    optionPerCod: false,
  };
  componentDidMount = async () => {
    await this.carregarVariaveisEstado();
    this.loadFlows();
    // await this.refreshScreen();
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
      empresaCnpj: sessao.empresaCnpj,
    });
  };

  handleOptionFilter = () => {
    this.state.optionPerCod === true
      ? this.setState({ optionPerDescrition: true, optionPerCod: false })
      : this.setState({ optionPerDescrition: false, optionPerCod: true });
  };

  loadFlows = async () => {
    const { empresaAtiva, usuarioAtivo } = this.state;
    try {
      this.setState({ loading: true });
      let url;
      url = '/v1/flows/' + empresaAtiva + '/' + usuarioAtivo;

      const retorno = await api.post(url, {});
      if (retorno.data && retorno.data.sucess) {
        let flows = retorno.data.data;
        this.setState({ flows, allFlows: flows, loading: false });
        this.prepareLists();
      }
      this.setState({ loading: false });
    } catch (err) {
      alerta('Erro ao carregar o fluxo de pesquisas =>' + err, 2);
      this.setState({ loading: false });
    }
  };

  onChangeRadioSituationFlows = () => {
    this.setFlowsPerFilter();
  };

  onChangeRadioTypeFlows = () => {
    this.setFlowsPerFilter();
  };

  setFlowsPerFilter = () => {
    const { optionFilterSituation, optionFilterTypeFlow, allFlows } =
      this.state;
    let status;
    let type;
    let response = allFlows.map((search) => search);

    this.setState({
      loading: true,
    });

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
    switch (optionFilterTypeFlow) {
      case '0':
        type = 0;
        break;
      case '1':
        type = 1;
        break;
      default:
        break;
    }
    if (status !== undefined) {
      response = allFlows.filter(
        (search) => search.GAF_FLG_STATUS === status && search
      );
    }
    if (type !== undefined) {
      response = response.filter(
        (search) => search.GAF_FLG_TIPO_USUARIO === type && search
      );
    }

    this.setState({
      flows: response,
      loading: false,
    });
  };

  handleFlowsPerFilter = async (ev) => {
    this.setState({
      descriptionToFilter: ev.target.value,
    });
    this.setState({
      loading: true,
    });
    const flows = [];
    if (ev.target.value === '') {
      this.setFlowsPerFilter();
    } else if (this.state.optionPerDescrition === true) {
      this.state.flows.forEach((flow) => {
        if (
          String(flow.GAF_DESCRICAO.toUpperCase()).includes(
            ev.target.value.toUpperCase()
          )
        ) {
          flows.push(flow);
        }
      });

      this.setState({
        flows,
      });
      if (flows.length === 0) {
        this.setFlowsPerFilter();
      }
    } else {
      ev.persist();
      const data_ = {
        codigoFluxo: String(ev.target.value),
      };
      const res = await api.post(
        `v1/flows/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`,
        data_
      );
      const { sucess, data } = res.data;
      const flows = [];

      data.forEach((flow) => {
        if (String(flow.GAF_ID).includes(ev.target.value)) {
          flows.push(flow);
        }
      });

      if (sucess) {
        this.setState({
          flows,
        });
      } else {
        tratarErros(res.data);
      }
      this.setState({
        loading: false,
      });
    }
  };

  changeStatusFlow = async (flow, status) => {
    const { empresaAtiva, usuarioAtivo } = this.state;
    this.setState({
      loading: true,
    });
    try {
      this.setState({ loading: true });
      let url;
      url = '/v1/flows/' + empresaAtiva + '/' + usuarioAtivo;

      let _flow = flow;
      _flow.GAF_FLG_STATUS = status;
      let data = {
        flow: _flow,
        searchs: flow.PESQUISAS,
      };
      // //console.log(url);
      // //console.log(data);
      // return;
      await api.put(url, data);
      this.loadFlows();
      this.setState({ loading: false });
    } catch (err) {
      alerta('Erro ao carregar os fluxos atualizados =>' + err, 2);
      this.setState({ loading: false });
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  prepareLists = () => {
    let { flows } = this.state;
    let supervisor = [];
    let promotor = [];
    let inativo = [];
    // Status agendamento (-1 Cancelado | 0 Novo/Não promotor | 1 Agendado | 2- Executado)

    for (const flow of flows) {
      if (flow.GAF_FLG_STATUS === 0) {
        inativo.push(flow);
      }
      if (flow.GAF_FLG_TIPO_USUARIO === 0 && flow.GAF_FLG_STATUS === 1) {
        supervisor.push(flow);
      }
      if (flow.GAF_FLG_TIPO_USUARIO === 1 && flow.GAF_FLG_STATUS === 1) {
        promotor.push(flow);
      }
    }

    this.setState({ inativo, promotor, supervisor });
  };

  render() {
    const { loading, flows } = this.state;
    return (
      <>
        <Header />
        <WaitScreen loading={loading} />
        <Container className="containerFlows">
          <DirectTituloJanela
            urlVoltar={'/home'}
            urlNovo={'/flow'}
            titulo={
              loading ? (
                'Aguarde...'
              ) : (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon>account_tree</Icon>Fluxo pesquisas
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
              <CollapsibleItem
                expanded={false}
                header="Clique para filtrar"
                icon={<Icon>filter_list</Icon>}
                node="div"
              >
                <RowFilter>
                  <ContentItem>
                    <SaibRadioGroup
                      valueItems={'"1","2","0"'}
                      classNameItems={'"itemActive","itemInative","allItems"'}
                      textItems={'"Ativa","Inativa","Todos"'}
                      idItems={'"active","inactivate","all2"'}
                      classNameRadio="filterSituationFlow"
                      flexDirectionRadio="row"
                      disabledRadio="false"
                      captionRadio="Situação fluxo"
                      defaultCheckedId={'all2'}
                      onChange={(value) => {
                        this.setState(
                          {
                            optionFilterSituation: value,
                          },
                          () => this.onChangeRadioSituationFlows()
                        );
                      }}
                    />
                  </ContentItem>
                  <ContentItem>
                    <SaibRadioGroup
                      valueItems={'"0","1","2"'}
                      classNameItems={'"supervisor","promotor","todos"'}
                      textItems={'"Supervisor","Promotor","Todos"'}
                      idItems={'"supervision","promoter","all"'}
                      classNameRadio="filterTypeFlow"
                      flexDirectionRadio="row"
                      disabledRadio="false"
                      captionRadio="Tipo de fluxo"
                      defaultCheckedId={'all'}
                      onChange={(value) => {
                        this.setState(
                          {
                            descriptionToFilter: '',
                            optionFilterTypeFlow: value,
                          },
                          () => {
                            this.onChangeRadioTypeFlows();
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
                            defaultChecked={this.state.optionPerDescrition}
                          />
                          <span>Nome do fluxo</span>
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
                          <span>Codigo do fluxo</span>
                        </LabelsFilter>
                      </p>
                    </div>
                  </div>
                  <div className="content-input">
                    <input
                      id="search"
                      type={this.state.optionPerCod ? 'number' : 'text'}
                      className="validate"
                      defaultValue={this.state.descriptionToFilter}
                      onChange={this.handleFlowsPerFilter}
                    />
                    <i
                      className="small material-icons"
                      style={{ marginLeft: '10px' }}
                    >
                      search
                    </i>
                  </div>
                </ContentInputFilter>
              </CollapsibleItem>
            </Collapsible>
          </Linha>

          <LinhaKanban>
            <Kanban cor={'#41339E'}>
              <DivBaseKanbanTituloPai cor={'#41339E'}>
                :: Supervisor
              </DivBaseKanbanTituloPai>
              <KanbanContainer>
                {flows !== undefined &&
                  flows.map((flow, i) => {
                    if (flow.GAF_FLG_TIPO_USUARIO === 0) {
                      return (
                        <DivBaseKanban key={i}>
                          <LinhaContentHeaderKanBan
                            style={{ paddingTop: '10px' }}
                          >
                            <DivDetalhe flex={3} description={true}>
                              <Labels upperCase>
                                {flow.GAF_ID + ' - ' + flow.GAF_DESCRICAO}
                              </Labels>
                              <LinhaCountSearchs className="linha">
                                <Labels>
                                  Qtde pesquisa(s): {flow.PESQUISAS.length}
                                </Labels>
                              </LinhaCountSearchs>
                              <ContentDetailsItemKanban>
                                <LabelSituation fontWeight="500">
                                  Ativa
                                  {flow.GAF_FLG_STATUS === 1 ? (
                                    <Icon className="done">done</Icon>
                                  ) : (
                                    <Icon className="close">close</Icon>
                                  )}
                                </LabelSituation>
                                <LabelSituation fontWeight="500">
                                  {flow.GAF_FLG_TIPO_USUARIO === 1 ? (
                                    <>
                                      {' '}
                                      <Icon>person</Icon>promotor
                                    </>
                                  ) : (
                                    <>
                                      {' '}
                                      <Icon>supervisor_account</Icon>Supervisor
                                    </>
                                  )}
                                </LabelSituation>
                              </ContentDetailsItemKanban>
                            </DivDetalhe>
                          </LinhaContentHeaderKanBan>
                          <LinhaBtnsModal>
                            <Link
                              className="waves-effect waves-light saib-button is-primary view"
                              to={{
                                pathname: '/Flow',
                                state: { flow, action: 'editar' },
                              }}
                              // className="view"
                            >
                              <Icon small>pageview</Icon>
                            </Link>
                            <Button
                              node="button"
                              title="Visualizar"
                              className="waves-effect waves-light saib-button is-primary"
                              onClick={() =>
                                this.changeStatusFlow(
                                  flow,
                                  flow.GAF_FLG_STATUS === 1 ? 0 : 1
                                )
                              }
                            >
                              {flow.GAF_FLG_STATUS === 1 ? (
                                <LabelSituation color="#FFF" fontWeight="500">
                                  <Icon large>block</Icon>
                                  Destivar
                                </LabelSituation>
                              ) : (
                                <LabelSituation color="#FFF" fontWeight="500">
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
              <DivBaseKanbanTituloPai cor={'#8E44AD'}>
                :: Promotor
              </DivBaseKanbanTituloPai>
              <KanbanContainer>
                {flows !== undefined &&
                  flows.map((flow, i) => {
                    if (flow.GAF_FLG_TIPO_USUARIO === 1) {
                      return (
                        <DivBaseKanban key={i}>
                          <LinhaContentHeaderKanBan
                            style={{ paddingTop: '10px' }}
                          >
                            <DivDetalhe flex={3} description={true}>
                              <Labels>
                                {flow.GAF_ID + ' - ' + flow.GAF_DESCRICAO}
                              </Labels>
                              <LinhaCountSearchs className="linha">
                                <Labels>
                                  Qtde pesquisa(s): {flow.PESQUISAS.length}
                                </Labels>
                              </LinhaCountSearchs>
                              <ContentDetailsItemKanban>
                                <LabelSituation fontWeight="500">
                                  Ativa
                                  {flow.GAF_FLG_STATUS === 1 ? (
                                    <Icon className="done">done</Icon>
                                  ) : (
                                    <Icon className="close">close</Icon>
                                  )}
                                </LabelSituation>
                                <LabelSituation fontWeight="500">
                                  {flow.GAF_FLG_TIPO_USUARIO === 1 ? (
                                    <>
                                      {' '}
                                      <Icon>person</Icon>promotor
                                    </>
                                  ) : (
                                    <>
                                      {' '}
                                      <Icon>supervisor_account</Icon>Supervisor
                                    </>
                                  )}
                                </LabelSituation>
                              </ContentDetailsItemKanban>
                            </DivDetalhe>
                          </LinhaContentHeaderKanBan>
                          <LinhaBtnsModal>
                            <Link
                              className="waves-effect waves-light saib-button is-primary view"
                              to={{
                                pathname: '/Flow',
                                state: { flow, action: 'editar' },
                              }}
                              // className="view"
                            >
                              <Icon small>pageview</Icon>
                            </Link>
                            <Button
                              node="button"
                              title="Visualizar"
                              className="waves-effect waves-light saib-button is-primary"
                              onClick={() =>
                                this.changeStatusFlow(
                                  flow,
                                  flow.GAF_FLG_STATUS === 1 ? 0 : 1
                                )
                              }
                            >
                              {flow.GAF_FLG_STATUS === 1 ? (
                                <LabelSituation color="#FFF" fontWeight="500">
                                  <Icon large>block</Icon>
                                  Destivar
                                </LabelSituation>
                              ) : (
                                <LabelSituation color="#FFF" fontWeight="500">
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
