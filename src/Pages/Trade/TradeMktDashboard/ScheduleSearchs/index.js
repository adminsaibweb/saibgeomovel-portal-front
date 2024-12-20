/* eslint-disable array-callback-return */
import React, { Component } from 'react';
import { Fragment } from 'react';
import { Icon } from 'react-materialize';
import Photo from '../../../../Components/FieldWork/TradeMktDashboard/BottomMonitoring/PhotosList/Photo';

import DirectTituloJanela from '../../../../Components/Globals/DirectTituloJanela';
import WaitScreen from '../../../../Components/Globals/WaitScreen';
import Header from '../../../../Components/System/Header';
import api from '../../../../services/api';
import { getFromStorage } from '../../../../services/auth';
import { capitalize, isImageValid } from '../../../../services/funcoes';

import { Container, Linha, ContentDataSearchs, DivDetalhe, Th, Tr, Td, Table } from './styled';
import PanelMonitoringContext from '../../../../providers/monitoringPanel';

export default class ScheduleSearchs extends Component {
  static contextType = PanelMonitoringContext;

  state = {
    loading: true,
    openImage: false,
    pathImage: '',
    scheduleSearchsData: [],
    itemsExpanded: [-1],
    descricaoImage: '',
  };

  constructor(props) {
    super(props);
    this.tableRef = React.createRef(null);
  }

  async componentDidMount() {
    ScheduleSearchs.contextType = PanelMonitoringContext;
    const { GAT_ID } = this.props.location.state[0];
    const { statePrevius, urlPrevius } = this.props.location.state[1];
    //console.log('ScheduleSearchs -> lineClicked', lineClicked);

    await this.carregarVariaveisEstado();
    await this.handleScheduleSearchsData(GAT_ID);

    this.setState({
      statePrevius,
      urlPrevius,
    });
    this.setLineClicked();
  }

  componentDidUpdate(prevProps) {
    const { openImage } = this.state;

    if (this.state.openImage) {
      document.addEventListener('keydown', this.eventKeyEsc);
    }
    if (this.props.forceLoading !== prevProps.forceLoading) {
      !openImage &&
        this.setState({
          loading: this.props.forceLoading,
        });
    }
  }

  eventKeyEsc = (e) => {
    if (!this.state.openImage) {
      document.removeEventListener('keydown', this.eventKeyEsc);
    }
    if (e.key === 'Escape') {
      this.handleClosePhoto();
    }
  };

  handleClosePhoto = () => {
    this.setState({
      openImage: false,
      pathImage: '',
    });
    // document.removeEventListener('keydown', arguments.callee,false);
  };

  setLineClicked = async () => {
    const { setStatePanelMonitoring, statePanelMonitoring } = this.context;
    let { lineClicked } = this.state;
    await setStatePanelMonitoring({
      ...statePanelMonitoring,
      filtering: false,
      lineClicked: lineClicked,
    });
  };

  carregarVariaveisEstado = async () => {
    const sessao = getFromStorage();
    // //console.log(sessao);
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
    });
  };

  verifyMoreNumberOfQuestionsInItems = (searchs) => {
    searchs.forEach((search) => {
      const allQuestionsAnswered = [];
      search.AGRUPAMENTOS &&
        search.AGRUPAMENTOS.forEach((agrupamento) => {
          // const res = agrupamento.ITEMS.sort((a, b) => {
          //   return b.PERGUNTAS.length - a.PERGUNTAS.length;
          // });
          const all = [];
          agrupamento.ITEMS.forEach((item) => {
            item.PERGUNTAS.forEach((pergunta) => {
              all.push(pergunta);
              const questionAdded = this.verifyIsAddedQuestion(allQuestionsAnswered, pergunta);
              if (!questionAdded) allQuestionsAnswered.push(pergunta);
            });
          });
          // agrupamento.allQuestions = allQuestionsAnswered; //o maior numero de pesquisas respondidas
        });
      // //console.log(allQuestionsAnswered);
      if (allQuestionsAnswered.length > 0) {
        allQuestionsAnswered.forEach((question, i) => {
          question.position = i;
        });
      }
      if (search.AGRUPAMENTOS) {
        this.setPositionQuestionsAnswered(search, allQuestionsAnswered);
        search.allQuestionsAnswered = allQuestionsAnswered;
      }
    });
  };

  setPositionQuestionsAnswered = (search, allQuestionsAnswered) => {
    search.AGRUPAMENTOS.forEach((agrupamento) => {
      agrupamento.ITEMS.forEach((item) => {
        item.PERGUNTAS.forEach((pergunta) => {
          //verificar posição dessa pergunta nas perguntas perguntas respondidas
          pergunta.position = this.returnPositionQuestionInQuestionsAnswered(pergunta, allQuestionsAnswered);
        });
        item.PERGUNTAS.sort((a, b) => {
          return a.position - b.position;
        });

        while (item.PERGUNTAS.length < allQuestionsAnswered.length) {
          item.PERGUNTAS.push({
            active: false,
            PERGUNTA_RESPOSTA: '',
          });
        }
      });
    });
  };

  returnPositionQuestionInQuestionsAnswered = (question, allQuestionsAnswered) => {
    const qst = allQuestionsAnswered.find((question_) => question_.PERGUNTA_DESCRICAO === question.PERGUNTA_DESCRICAO);

    return qst.position;
  };

  verifyIsAddedQuestion = (arrQuestions, question) => {
    if (arrQuestions.length > 0) {
      return !arrQuestions.every((question_) =>
        question_.PERGUNTA_DESCRICAO === question.PERGUNTA_DESCRICAO ? false : true
      );
    } else {
      return false;
    }
  };

  handleScheduleSearchsData = async (idActivity) => {
    try {
      const dataToSend = {
        gatId: idActivity,
      };
      const res = await api.post(
        `v1/tradedashboard/responses/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`,
        dataToSend
      );
      const { data, sucess } = res.data;

      data.CLIENTE?.PESQUISAS &&
        data.CLIENTE.PESQUISAS.forEach((item) => {
          item.descricao = item.PESQUISA_DESCRICAO.split('>')[0];
        });

      this.verifyMoreNumberOfQuestionsInItems(data.CLIENTE.PESQUISAS);

      for (let pesquisa of data.CLIENTE.PESQUISAS) {
        if (pesquisa.AGRUPAMENTOS) {
          for (let agrouped of pesquisa.AGRUPAMENTOS) {
            for (let item of agrouped.ITEMS) {
              for (let pergunta of item.PERGUNTAS) {
                this.verifyIFieldIsNumber(pergunta);
              }
            }
          }
        }
      }
      if (sucess) {
        this.setState({
          scheduleSearchsData: data,
        });
      }
    } catch (error) {
      // //console.log(error);
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  verifyItemsExpanded = (id) => {
    const { itemsExpanded } = this.state;
    const id_ = itemsExpanded.find((id_) => id === id_);
    return id_ !== undefined ? true : false;
  };

  verifyIFieldIsNumber = (item) => {
    if ([2, 3, 9].includes(parseInt(item.PERGUNTA_TIPO_CAMPO))) {
      item.isNumber = true;
    }
  };

  removeIdExpanded = (id) => {
    const { itemsExpanded } = this.state;

    const newsIds = itemsExpanded.filter((id_) => id !== id_);

    this.setState({
      itemsExpanded: newsIds,
    });
  };

  render() {
    const { scheduleSearchsData, loading, openImage, pathImage, descricaoImage } = this.state;
    const { forceBack } = this.props;
    const { isMobile } = this.context;
    //console.log(scheduleSearchsData);
    let indexAux = 0;

    return (
      <div>
        <Header />
        <WaitScreen loading={loading} />
        {!loading && (
          <Container isMobile={isMobile}>
            <DirectTituloJanela
              classNameTitulo="professionalScheduleTitle"
              style={{ paddingLeft: '64px' }}
              // urlVoltar={this.props.history.location.urlPrevius}
              state={this.state.statePrevius ? this.state.statePrevius : this.props.location.statePrevius}
              stateUrl={this.state.urlPrevius ? this.state.urlPrevius : this.props.location.urlPrevius}
              forceBack={forceBack}
              titulo={
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon>calendar_today</Icon>Pesquisas
                </span>
              }
            />

            {scheduleSearchsData?.CLIENTE?.CLI_NOME_FANTASIA && (
              <h5 className="title">{capitalize(scheduleSearchsData?.CLIENTE?.CLI_NOME_FANTASIA, true)}</h5>
            )}

            {scheduleSearchsData.CLIENTE?.PESQUISAS.length > 0 ? (
              <ContentDataSearchs>
                <Linha className="contentSearchs">
                  {scheduleSearchsData.CLIENTE?.PESQUISAS.map((search, i) => (
                    <Fragment key={search.PESQUISA_ID}>
                      <p className="titleSearch">{search.PESQUISA_DESCRICAO}</p>
                      <DivDetalhe>
                        {search.AGRUPAMENTOS ? (
                          <Table
                            ref={this.tableRef}
                            componentRef={this.tableRef}
                            className="table-scroll small-first-col"
                          >
                            {search?.AGRUPAMENTOS.map(({ AGRUPA_DESCRICAO, ITEMS }, j) => (
                              <Fragment key={j}>
                                <thead>
                                  <tr>
                                    <Th data-field="id">{capitalize(AGRUPA_DESCRICAO, true)}</Th>
                                    {search.allQuestionsAnswered.map((pergunta) => (
                                      <Fragment key={pergunta.PERGUNTA_ID}>
                                        <Th data-field="name" withMinWidth>
                                          {capitalize(pergunta.PERGUNTA_DESCRICAO, true)}
                                        </Th>
                                      </Fragment>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="body-half-screen">
                                  {ITEMS.map((item, i, arr) => {
                                    indexAux = 0;
                                    return (
                                      <Fragment key={i}>
                                        <Tr
                                          key={item.ITEM_ID}
                                          onClick={() => {
                                            this.setState({
                                              clicked: true,
                                              lineClicked: i,
                                            });
                                          }}
                                        >
                                          <Td>{capitalize(item.ITEM_DESCRICAO, true)}</Td>
                                          {item.PERGUNTAS.map((pergunta, f) => {
                                            if (f < indexAux && f < pergunta.position) f = indexAux;
                                            if (pergunta.PERGUNTA_TIPO_CAMPO === 7 && pergunta.position === f) {
                                              return (
                                                <Td key={f}>
                                                  <div>
                                                    <img
                                                      src={pergunta.PERGUNTA_RESPOSTA}
                                                      onClick={() =>
                                                        this.setState({
                                                          openImage: true,
                                                          pathImage: pergunta.PERGUNTA_RESPOSTA,
                                                          descricaoImage: item.ITEM_DESCRICAO
                                                        })
                                                      }
                                                      alt=""
                                                    />
                                                  </div>
                                                </Td>
                                              );
                                            } else {
                                              let tdPushs = [];
                                              if (pergunta.PERGUNTA_RESPOSTA) {
                                                while (f < pergunta.position) {
                                                  f++;
                                                  indexAux = f;
                                                  indexAux++;
                                                  tdPushs.push(<Td key={indexAux} />);
                                                }

                                                if (f === pergunta.position) {
                                                  if (isImageValid(pergunta.PERGUNTA_RESPOSTA)) {
                                                    tdPushs.push(
                                                      <Td key={pergunta.PERGUNTA_ID}>
                                                        <div>
                                                          <img
                                                            src={pergunta.PERGUNTA_RESPOSTA}
                                                            onClick={() =>
                                                              this.setState({
                                                                openImage: true,
                                                                pathImage: pergunta.PERGUNTA_RESPOSTA,
                                                              })
                                                            }
                                                            alt=""
                                                          />
                                                        </div>
                                                      </Td>
                                                    );
                                                  } else {
                                                    tdPushs.push(
                                                      <Td key={pergunta.PERGUNTA_ID}>{pergunta.PERGUNTA_RESPOSTA}</Td>
                                                    );
                                                  }
                                                }

                                                return tdPushs;
                                              } else {
                                                return <></>;
                                              }
                                            }
                                          })}
                                        </Tr>
                                        {i !== 0 && i + 1 === arr.length && <Tr />}
                                      </Fragment>
                                    );
                                  })}
                                </tbody>
                              </Fragment>
                            ))}
                          </Table>
                        ) : (
                          <Table className="table-scroll small-first-col">
                            <Fragment>
                              <thead>
                                <tr>
                                  {search.PERGUNTAS.map((pergunta) => (
                                    <Fragment key={pergunta.PERGUNTA_ID}>
                                      <Th data-field="name" withMinWidth>
                                        {capitalize(pergunta.PERGUNTA_DESCRICAO, true)}
                                      </Th>
                                    </Fragment>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="body-half-screen">
                                <Tr
                                  // clicked={clicked && lineClicked === i}
                                  onClick={() => {
                                    this.setState({
                                      clicked: true,
                                      lineClicked: i,
                                    });
                                    // onClickTable(schedulesData[i]);
                                  }}
                                >
                                  {search.PERGUNTAS.map((pergunta, f) => {
                                    if (pergunta.PERGUNTA_TIPO_CAMPO === 7) {
                                      return (
                                        <Td key={f} buttonsIndicator>
                                          <div
                                            onClick={() =>
                                              this.setState({
                                                openImage: true,
                                                pathImage: pergunta.PERGUNTA_RESPOSTA,
                                                descricaoImage: pergunta.PERGUNTA_DESCRICAO
                                              })
                                            }
                                          >
                                            <img src={pergunta.PERGUNTA_RESPOSTA} alt="foto" />
                                          </div>
                                        </Td>
                                      );
                                    } else {
                                      if (isImageValid(pergunta.PERGUNTA_RESPOSTA)) {
                                        return (
                                          <Td key={f} buttonsIndicator>
                                            <div>
                                              <img src={pergunta.PERGUNTA_RESPOSTA} alt="foto" />
                                            </div>
                                          </Td>
                                        );
                                      } else {
                                        return <Td key={f}>{capitalize(pergunta.PERGUNTA_RESPOSTA, true)}</Td>;
                                      }
                                    }
                                  })}
                                </Tr>
                              </tbody>
                            </Fragment>
                          </Table>
                        )}
                      </DivDetalhe>
                    </Fragment>
                  ))}
                </Linha>
              </ContentDataSearchs>
            ) : (
              <span>Sem pesquisas respondidas</span>
            )}

            {openImage && (
              <div>
                <Icon tiny>close</Icon>
                <div style={{ height: '70vh' }}>
                  <Photo
                    pathImage={pathImage}
                    singleImg={true}
                    withNavigation={true}
                    descriptionPhoto={descricaoImage}
                    closePhoto={this.handleClosePhoto}
                  />
                </div>
              </div>
            )}
          </Container>
        )}
      </div>
    );
  }
}
