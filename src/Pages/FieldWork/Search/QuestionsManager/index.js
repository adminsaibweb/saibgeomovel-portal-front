import React, { Component } from 'react';
import { Collapsible, CollapsibleItem, Icon } from 'react-materialize';
import {
  QuestionDescription,
  ContentOrdenation,
  LinhaRodape,
  ContentCollapsible,
  DivRodape,
  QuestionPosition,
  ContainerParagrapghs,
  ContainerCollapsibleAndBtns,
} from './styled';
// import QuestionComponent from '../QuestionComponent';
import Field from '../Field';
export default class QuestionsManager extends Component {
  state = {
    handleNextQuestion: false,
    idQuestionsSelected: [],
    perguntas: [],
    perguntasDisponiveis: [],
    todasPerguntas: [],

    itemsExpanded: [],
    idQuestionInitial: 0,
    idQuestionOpened: 0,
    onSpanded: false,
  };

  componentDidMount() {
    const { questionsDisponible } = this.props;
    this.setState({
      perguntas: questionsDisponible !== undefined && questionsDisponible,
      todasPerguntas: questionsDisponible !== undefined && questionsDisponible,
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.questionsDisponible !== this.props.questionsDisponible) {
      this.setState({
        perguntas: this.props.questionsDisponible,
        perguntasDisponiveis: this.props.questionsDisponible,
        todasPerguntas: this.props.questionsDisponible !== undefined && this.props.questionsDisponible,
      });

      let nums = [];
      this.props.questionsDisponible &&
        this.props.questionsDisponible.forEach((qst) => {
          if (qst.idChecked) {
            nums.push(qst.id);
          }
        });

      this.setState({
        idQuestionsSelecteds: nums,
      });
    }
  }

  handleNewQuestionInField = async (newQuestion, id) => {
    const { perguntas } = this.props;

    await perguntas.forEach((question) => {
      if (question.id === id) {
        if (question.CAMPOS === undefined) {
          question.CAMPOS = newQuestion.CAMPOS;
        }
      }
    });
    perguntas.push(newQuestion);

    setTimeout(async () => {
      await (async () => {})();
    }, 1000);
  };

  handleNewQuestion = async (idQuestionToAdd, idQuestion) => {
    const { perguntas } = this.props;
    await perguntas.forEach((question) => {
      if (parseInt(question.id) === parseInt(idQuestion)) {
        question.CAMPOS.forEach((field) => {
          field.GAC_GPP_ID_PROXIMA = parseInt(idQuestionToAdd);
        });
      }
    });
    this.setState({
      perguntas,
    });
  };

  handleQuestionsSelectedInField = (question, positionField, idQuestionsSelected) => {
    this.state.perguntasDisponiveis.forEach((pergunta) => {
      if (parseInt(pergunta.id) === parseInt(question.id)) {
        question.CAMPOS &&
          question.CAMPOS.forEach((campo) => {
            if (campo.GAC_POSICAO === positionField) {
              campo.GAC_GPP_ID_PROXIMA = parseInt(idQuestionsSelected);
            }
          });
      }
    });

    const questionInitial = this.state.todasPerguntas.filter(
      (qst) => parseInt(qst.id) === parseInt(this.state.idQuestionInitial)
    );

    // //console.log(questionInitial);
    questionInitial[0].idChecked = true;

    this.state.perguntasDisponiveis.slice(0, 0, questionInitial[0]);

    this.state.perguntasDisponiveis.filter((pergunta) => pergunta.idChecked === true);
    // this.setState({
    //   perguntasDisponiveis: this.state.perguntasDisponiveis,
    // });
    // //console.log(pgt);

    // //console.log(question, positionField, idQuestionsSelected);
  };

  handleQuestionsSelectedInQuestion = (question, positionField, idQuestionsSelected) => {
    this.state.perguntasDisponiveis.forEach((pergunta) => {
      if (parseInt(pergunta.id) === parseInt(question.id)) {
        question.CAMPOS &&
          question.CAMPOS.forEach((campo) => {
            if (campo.GAC_POSICAO === positionField) {
              campo.GAC_GPP_ID_PROXIMA = parseInt(idQuestionsSelected);
            }
          });
      }
    });

    const questionInitial = this.state.todasPerguntas.filter(
      (qst) => parseInt(qst.id) === parseInt(this.state.idQuestionInitial)
    );

    // //console.log(questionInitial);
    questionInitial[0].idChecked = true;

    this.state.perguntasDisponiveis.slice(0, 0, questionInitial[0]);

    // this.setState({
    //   perguntasDisponiveis: this.state.perguntasDisponiveis,
    // });
  };

  handleAddItemsExpanded = () => {
    const { itemsExpanded } = this.state;
    itemsExpanded.push(itemsExpanded.length + 1);
    // setTimeout(() => {
    this.setState({ itemsExpanded });
    // }, 2000);
  };

  handleRemoveItemsExpanded = () => {
    const { itemsExpanded } = this.state;

    let count = [];
    itemsExpanded.forEach((item, i) => {
      if (i !== itemsExpanded.length - 1) {
        count.push(i);
      }
    });

    this.setState({
      itemsExpanded: count,
    });
  };

  verifyIdQuestionIsSelected = async (id) => {
    const { idQuestionsSelecteds } = this.state;
    let res = idQuestionsSelecteds.find((id_) => {
      return parseInt(id_) === parseInt(id) ? true : false;
    });

    return res >= 0 && true;
  };

  verifyQuestionIsBoolOrList = (id) => {
    const { perguntas } = this.state;

    let retorno = false;
    perguntas &&
      perguntas.forEach((qst) => {
        qst.CAMPOS &&
          qst.CAMPOS.forEach((campo) => {
            if (parseInt(campo.GAC_ID) === parseInt(id)) {
              if (qst.GPP_TIPO_CAMPO === 8 || qst.GPP_TIPO_CAMPO === 10) {
                retorno = true;
              }
            }
          });
      });

    return retorno;
  };

  handleMovePosition = async (id, index, nextPosition) => {
    const { perguntas, idQuestionsSelecteds } = this.state;

    const questionBeMove = perguntas[index - 1];

    let positionOld = questionBeMove.GPP_POSICAO;

    questionBeMove.idChecked = await this.verifyIdQuestionIsSelected(questionBeMove.id);

    // //console.log(questionBeMove.idChecked);

    if ((index === 0) & (nextPosition === index - 1) || nextPosition > perguntas.length) {
    } else {
      parseInt((questionBeMove.GPP_POSICAO = nextPosition));
      perguntas.splice(index - 1, 1);
      perguntas.splice(nextPosition - 1, 0, questionBeMove);

      perguntas.forEach((qst, i) => {
        if (parseInt(qst.GPP_POSICAO).length > 1) {
          qst.GPP_POSICAO = `0${i + 1}`;
        } else {
          qst.GPP_POSICAO = `00${i + 1}`;
        }
      });
      this.setState({
        perguntas,
      });
    }

    let newsIdOrdenate = [];
    perguntas.forEach((qst) => {
      idQuestionsSelecteds.forEach((id) => {
        // //console.log(id);
        if (parseInt(qst.id) === parseInt(id)) {
          newsIdOrdenate.push(id);
        }
      });
    });

    this.setState({
      idQuestionsSelecteds: newsIdOrdenate,
    });
    this.props.updatePositionQuestionSearchAgruped(positionOld, questionBeMove.GPP_POSICAO);
  };

  render() {
    const { perguntas, perguntasDisponiveis, handleNextQuestion } = this.state;
    const { isAgruped } = this.props;

    return (
      <div
        style={{
          display: 'flex',
          width: '100%',
          flexDirection: 'column',
        }}
      >
        {perguntas &&
          perguntas
            .sort((a, b) => {
              return a.GPP_POSICAO - b.GPP_POSICAO;
            })
            .map((question, i) => {
              let dadIsListOrBool = question.idDad && this.verifyQuestionIsBoolOrList(question.idDad);

              return (
                <ContainerCollapsibleAndBtns key={i}>
                  <ContentCollapsible className="collapsibleQuestionManager">
                    <Collapsible
                      accordion={false}
                      style={{
                        width: '100%',
                        borderStyle: 'none',
                        boxShadow: 'none',
                      }}
                      options={{
                        onOpenStart: () => {
                          if (this.state.idQuestionOpened === 0) {
                            this.setState({
                              idQuestionOpened: question.id,
                              idQuestionInitial: question.id,
                              handleNextQuestion: true,
                              onSpanded: true,
                            });
                          }
                        },
                        onCloseEnd: () => {
                          if (this.state.idQuestionOpened === question.id) {
                            this.setState({
                              idQuestionOpened: 0,
                            });
                          }
                          this.setState({
                            perguntas: perguntasDisponiveis,
                            handleNextQuestion: true,
                            onSpanded: true,

                            // itemsExpanded: [],
                          });

                          question.GPP_TIPO_CAMPO && this.handleRemoveItemsExpanded();
                        },
                      }}
                    >
                      <CollapsibleItem
                        className="collapsibleQuestionManagerItem"
                        expanded={false}
                        header={
                          <ContainerParagrapghs>
                            <QuestionDescription>{question.GPP_PERGUNTA}</QuestionDescription>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '10px',
                              }}
                            >
                              <QuestionPosition onClick={() => this.props.handleDataToEditQuestion(question)}>
                                {question.GPP_POSICAO}
                              </QuestionPosition>
                            </div>
                          </ContainerParagrapghs>
                        }
                        icon={
                          <>
                            <p className="material-icons plus">add_circle_outline</p>

                            <p className="material-icons minus">remove_circle_outline</p>
                          </>
                        }
                        node="div"
                      >
                        {parseInt(question.GPP_TIPO_CAMPO) === 8 ||
                        parseInt(question.GPP_TIPO_CAMPO) === 10 ||
                        parseInt(question.GPP_TIPO_CAMPO) === 11 ? (
                          <>
                            {handleNextQuestion &&
                              question.CAMPOS &&
                              question.CAMPOS.map((field, index) => {
                                // //console.log(question.CAMPOS);
                                // //console.log(question);
                                return (
                                  <Field
                                    key={index * index}
                                    allQuestions={perguntasDisponiveis}
                                    isAgruped={isAgruped}
                                    idQuestionHigher={field.GAC_ID}
                                    countExpanded={this.state.itemsExpanded.length}
                                    handleAddItemsExpanded={this.handleAddItemsExpanded}
                                    handleRemoveItemsExpanded={this.handleRemoveItemsExpanded}
                                    // idNextQuestion={field.GAC_GPP_ID_PROXIMA}
                                    handleNewQuestion={this.handleNewQuestion}
                                    handleQuestionsSelected={(value) =>
                                      this.handleQuestionsSelectedInField(question, field.GAC_POSICAO, value)
                                    }
                                    // questionsDisponible={perguntas}
                                    idQuestionDad={question.id}
                                    descriptionField={field.GAC_DESCRICAO}
                                  />
                                );
                              })}
                          </>
                        ) : (
                          ''
                        )}
                      </CollapsibleItem>
                    </Collapsible>
                  </ContentCollapsible>
                  <ContentOrdenation
                    displayNone={dadIsListOrBool !== undefined && dadIsListOrBool}
                    disabled={this.props.disabled}
                  >
                    <div
                      className="contentIconEdit"
                      onClick={() => {
                        !this.props.disabled && this.props.handleDataToEditQuestion(question);
                        const [containerRef, containerHeaderRef] = this.props.refs;
                        containerRef.current.scrollTop = containerHeaderRef.current.clientHeight + 40;
                      }}
                    >
                      <Icon>edit</Icon>
                    </div>
                    <div style={{ display: 'flex' }}>
                      <div
                        onClick={() => {
                          !this.props.disabled &&
                            this.handleMovePosition(
                              question.id,
                              parseInt(question.GPP_POSICAO),
                              parseInt(question.GPP_POSICAO) - 1
                            );
                        }}
                      >
                        <Icon className="arrows">arrow_upward</Icon>
                      </div>
                      <div
                        onClick={async () => {
                          // setTimeout(() => {
                          !this.props.disabled &&
                            this.handleMovePosition(
                              question.id,
                              parseInt(question.GPP_POSICAO),
                              parseInt(question.GPP_POSICAO) + 1
                            );
                          // }, 2000);
                        }}
                      >
                        <Icon className="arrows">arrow_downward</Icon>
                      </div>
                    </div>
                  </ContentOrdenation>
                </ContainerCollapsibleAndBtns>
              );
            })}

        <LinhaRodape>
          <DivRodape>
            <button
              type="submit"
              disabled={this.props.disabled}
              className="waves-effect waves-light saib-button is-primary "
              onClick={async () => {
                const questions = this.state.perguntasDisponiveis;

                await this.props.saveQuestions(questions);
              }}
            >
              <Icon>save</Icon> Salvar
            </button>
          </DivRodape>
        </LinhaRodape>
      </div>
    );
  }
}
