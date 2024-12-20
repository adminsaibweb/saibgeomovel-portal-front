import React, { Component } from 'react';
import {
  Container,
  Linha,
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
} from './style';
import DirectTituloJanela from '../../../Components/Globals/DirectTituloJanela';
import WaitScreen from '../../../Components/Globals/WaitScreen';
import Header from '../../../Components/System/Header';
import { Button, Icon, Collapsible, CollapsibleItem } from 'react-materialize';
import { getFromStorage } from '../../../services/auth';
import { alerta } from '../../../services/funcoes';
import api from '../../../services/api';
import { Link } from 'react-router-dom';
import SaibRadioGroup from '../../../Components/Globals/SaibRadioGroup';

export default class Interruptions extends Component {
  state = {
    loading: false,
    interruptions: [],
    optionFilterSituation: '0',
    optionFilterTypeInterruption: '2',
    descriptionToFilter: '',
    optionPerCod: false,
    optionPerDescription: true,
  };

  componentDidMount = async () => {
    await this.carregarVariaveisEstado();
    await this.loadInterruptions();
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
    });
  };

  setInterruptionsPerFilter = () => {
    const {
      optionFilterSituation,
      optionFilterTypeInterruption,
      allInterruptions,
    } = this.state;

    let status;
    let type;
    let response = allInterruptions.map((interruption) => interruption);

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
    switch (optionFilterTypeInterruption) {
      case '1':
        type = 1;
        break;
      case '0':
        type = 0;
        break;
      default:
        break;
    }

    if (status !== undefined) {
      response = allInterruptions.filter(
        (interruption) => interruption.GMI_FLG_STATUS === status && interruption
      );
    }
    if (type !== undefined) {
      response = response.filter(
        (interruption) =>
          interruption.GMI_TIPO_INTERRUPCAO === type && interruption
      );
    }

    this.setState({
      interruptions: response,
    });
  };

  setSituationsPerDescriptionOrCode = async (ev) => {
    const value = ev.target.value
    this.setState({
      descriptionToFilter: value,
    });
    const { allInterruptions } = this.state;

    let response = allInterruptions.map((interruption) => interruption);

    response = allInterruptions.filter(
      (interruption) => interruption?.GMI_DESCRICAO?.toUpperCase().includes(`${value.toUpperCase()}`) || String(interruption?.GMI_ID)?.toUpperCase().includes(`${value.toUpperCase()}`)
    );
    this.setState({ interruptions: response })
  };

  handleOptionFilter = () => {
    this.state.optionPerCod === true
      ? this.setState({ optionPerDescription: true, optionPerCod: false })
      : this.setState({ optionPerDescription: false, optionPerCod: true });
  };

  onChangeRadioSituationInterruption = () => {
    this.setInterruptionsPerFilter();
  };

  onChangeRadioTypeInterruption = () => {
    this.setInterruptionsPerFilter();
  };

  loadInterruptions = async () => {
    try {
      const res = await api.post(
        `v1/interrrupt/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`
      );
      const { data, sucess } = res.data;
      if (sucess) {
        this.setState({
          interruptions: data,
          allInterruptions: data,
        });
      }
    } catch (err) {
      //console.log(err);
    } finally {
      // this.onChangeRadioSituationInterruption();
      // this.onChangeRadioTypeInterruption();
    }
  };

  handleActiveOrDisableInterruption = async (interruption) => {
    interruption.GMI_FLG_STATUS === 0
      ? (interruption.GMI_FLG_STATUS = 1)
      : (interruption.GMI_FLG_STATUS = 0);
    try {
      const res = await api.put(
        `v1/interrrupt/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`,
        interruption
      );
      const { sucess } = res.data;
      if (sucess) {
        alerta('Interrupção alterada com sucesso!', 1);
        this.loadInterruptions();
      }
    } catch (error) {}
  };

  render() {
    const { loading, interruptions } = this.state;

    return (
      <>
        <Header />
        <WaitScreen loading={loading} />
        <Container className="containerSearchs">
          <DirectTituloJanela
            urlVoltar={'/home'}
            urlNovo={'/interruption'}
            titulo={
              loading ? (
                'Aguarde...'
              ) : (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon>poll</Icon>Interrupções de atividades
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
                      classNameRadio="filterSituation"
                      flexDirectionRadio="row"
                      disabledRadio="false"
                      captionRadio="Situação interrupção"
                      defaultCheckedId={'all2'}
                      onChange={(value) => {
                        this.setState(
                          {
                            optionFilterSituation: value,
                          },
                          () => this.onChangeRadioSituationInterruption()
                        );
                      }}
                    />
                  </ContentItem>
                  <ContentItem>
                    <SaibRadioGroup
                      valueItems={'"0","1","2"'}
                      classNameItems={
                        '"itemTodos","itemAguardando","itemAprovados"'
                      }
                      textItems={
                        '"Parada/interrompida ","Iniciada/retomada","Todos"'
                      }
                      idItems={'"stoped","resumed","all"'}
                      classNameRadio="filterTypeInterruption"
                      flexDirectionRadio="row"
                      disabledRadio="false"
                      captionRadio="Tipo de interrupção"
                      defaultCheckedId={'all'}
                      onChange={(value) => {
                        this.setState(
                          {
                            descriptionToFilter: '',
                            optionFilterTypeInterruption: value,
                          },
                          () => {
                            this.onChangeRadioTypeInterruption();
                          }
                        );
                      }}
                    />
                  </ContentItem>
                </RowFilter>
                <ContentInputFilter className="input-field ">
                  <div>
                    <LabelsFilter fontWeight="500" fontSize="1.0rem">
                      Filtrar por:
                    </LabelsFilter>
                    <div>
                      <p>
                        <LabelsFilter fontWeight="300" fontSize="0.8rem">
                          <input
                            name="group1"
                            className="radioToFilter"
                            type="radio"
                            onChange={this.handleOptionFilter}
                            value={this.state.optionPerCod}
                          />
                          <span>Codigo</span>
                        </LabelsFilter>
                      </p>
                      <p>
                        <LabelsFilter fontWeight="300" fontSize="0.8rem">
                          <input
                            className="radioToFilter"
                            name="group1"
                            type="radio"
                            onChange={this.handleOptionFilter}
                            value={this.state.optionPerDescription}
                            defaultChecked={this.state.optionPerDescription}
                          />
                          <span>Descrição</span>
                        </LabelsFilter>
                      </p>
                    </div>
                  </div>
                  <div className="content-input">
                    <input
                      id="search"
                      type={this.state.optionPerCod ? 'number' : 'text'}
                      className="validate"
                      value={
                        this.state.descriptionToFilter
                          ? this.state.descriptionToFilter
                          : ''
                      }
                      onChange={(ev) => {
                        this.setSituationsPerDescriptionOrCode(ev);
                      }}
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
                Interrupções parada/interrompida
              </DivBaseKanbanTituloPai>
              <KanbanContainer>
                {interruptions !== undefined &&
                  interruptions
                    .sort((a, b) => {
                      return a.GMI_ID - b.GMI_ID;
                    })
                    .map((item, i) => {
                      if (item.GMI_TIPO_INTERRUPCAO === 0) {
                        return (
                          <DivBaseKanban key={i}>
                            <LinhaContentHeaderKanBan>
                              <Labels>
                                {item.GMI_ID + ' - ' + item.GMI_DESCRICAO}
                              </Labels>
                            </LinhaContentHeaderKanBan>
                            <ContentDetailsItemKanban>
                              {item.GMI_FLG_STATUS === 1 ? (
                                <>
                                  <Labels fontWeight="500">
                                    Ativa <Icon className="done">done</Icon>
                                  </Labels>
                                </>
                              ) : (
                                <>
                                  <Labels fontWeight="500">
                                    Inativa<Icon className="close">close</Icon>
                                  </Labels>
                                </>
                              )}
                            </ContentDetailsItemKanban>
                            <LinhaBtnsModal>
                              <Link
                                className="waves-effect waves-light saib-button is-primary view"
                                to={{
                                  pathname: '/Interruption',
                                  state: {
                                    interruption: item,
                                    action: 'editar',
                                  },
                                }}
                              >
                                <Icon small>pageview</Icon>
                              </Link>
                              <Button
                                node="button"
                                title="Visualizar"
                                className="waves-effect waves-light saib-button is-primary"
                                onClick={() => {
                                  this.handleActiveOrDisableInterruption(item);
                                }}
                              >
                                {item.GMI_FLG_STATUS === 1 ? (
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
                      } else {
                        return '';
                      }
                    })}
              </KanbanContainer>
            </Kanban>
            <Kanban cor={'#8e44ad'}>
              <DivBaseKanbanTituloPai cor={'#8e44ad'}>
                Iniciada/retomada
              </DivBaseKanbanTituloPai>
              <KanbanContainer>
                {interruptions !== undefined &&
                  interruptions
                    .sort((a, b) => {
                      return a.GMI_ID - b.GMI_ID;
                    })
                    .map((item, i) => {
                      if (item.GMI_TIPO_INTERRUPCAO === 1) {
                        return (
                          <DivBaseKanban key={i}>
                            <LinhaContentHeaderKanBan>
                              <Labels>
                                {item.GMI_ID + ' - ' + item.GMI_DESCRICAO}
                              </Labels>
                            </LinhaContentHeaderKanBan>
                            <ContentDetailsItemKanban>
                              {item.GMI_FLG_STATUS === 1 ? (
                                <>
                                  <Labels fontWeight="500">
                                    Ativa <Icon className="done">done</Icon>
                                  </Labels>
                                </>
                              ) : (
                                <>
                                  <Labels fontWeight="500">
                                    Inativa
                                    <Icon className="close">close</Icon>
                                  </Labels>
                                </>
                              )}
                            </ContentDetailsItemKanban>
                            <LinhaBtnsModal>
                              <Link
                                className="waves-effect waves-light saib-button is-primary view"
                                to={{
                                  pathname: '/Interruption',
                                  state: {
                                    interruption: item,
                                    action: 'editar',
                                  },
                                }}
                              >
                                <Icon small>pageview</Icon>
                              </Link>
                              <Button
                                node="button"
                                title="Visualizar"
                                className="waves-effect waves-light saib-button is-primary"
                                onClick={() => {
                                  this.handleActiveOrDisableInterruption(item);
                                }}
                              >
                                {item.GMI_FLG_STATUS === 1 ? (
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
                      } else {
                        return '';
                      }
                    })}
              </KanbanContainer>
            </Kanban>
          </LinhaKanban>
        </Container>
      </>
    );
  }
}
