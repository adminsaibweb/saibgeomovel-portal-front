import React, { Component } from 'react';
import { Checkbox } from 'react-materialize';
import { ContentCheckBox } from './styled';
import { alerta } from '../../../../services/funcoes';
// import { alerta } from '../../../../services/funcoes';
export default class QuestionComponent extends Component {
  state = {
    idQuestionsSelecteds: [],
    questionsDisponibles: [],
    loading: false,
  };

  async componentDidMount() {
    const { questionsDisponible } = this.props;

    let nums = [];
    questionsDisponible.forEach((qst) => {
      if (
        qst.idChecked &&
        qst.idDad &&
        parseInt(qst.idDad) === parseInt(this.props.idQuestionHigher)
      ) {
        nums.push(qst.id);
      }
    });

    this.setState({
      idQuestionsSelecteds: nums,
    });

    questionsDisponible.sort((a, b) => {
      return parseInt(a.GPP_POSICAO) - parseInt(b.GPP_POSICAO);
    });

    questionsDisponible.forEach((qst, i) => {
      if (parseInt(qst.GPP_POSICAO).length > 1) {
        qst.GPP_POSICAO = `0${i + 1}`;
      } else {
        qst.GPP_POSICAO = `00${i + 1}`;
      }
    });

    this.setState({
      questionsDisponibles: questionsDisponible.sort((a, b) => {
        return parseInt(a.GPP_POSICAO) - parseInt(b.GPP_POSICAO);
      }),
    });
  }

  async componentDidUpdate(prevProps, prevState) {
    if (prevProps.questionsDisponibles !== this.props.questionsDisponibles) {
      this.setState({
        questionsDisponibles: this.props.questionsDisponibles,
      });
    }
  }

  returnDescriptionFildsMultiple = (id, question) => {
    let res = false;
    res =
      question.CAMPOS &&
      question.CAMPOS.find((campo) => {
        return campo.GAC_GPP_ID_PROXIMA === id && campo.GAC_DESCRICAO;
      });
    return res[0];
  };

  verifyFieldIfSelectedSomeQuestion = (id) => {
    let retorno = false;
    const { questionsDisponibles } = this.state;
    questionsDisponibles.forEach((qst) => {
      if (qst.idDad && parseInt(qst.idDad) === parseInt(id)) {
        retorno = true;
      }
    });

    return retorno;
  };

  onChangeCheckBox = async (question, ev) => {
    // alert();
    const id = ev.target.value;
    const isChecked = ev.target.checked;
    this.handleUpdateQuestionsDisponible(id);
    const { questionsDisponibles, idQuestionsSelecteds } = this.state;

    let fieldHaveSelectedOneItem = this.verifyFieldIfSelectedSomeQuestion(
      this.props.idQuestionHigher
    );
    // //console.log(fieldHaveSelectedOneItem);

    if (fieldHaveSelectedOneItem && isChecked) {
      alerta(
        'Somente uma pergunta por campo, desmarque uma pergunta para selecionar outra, verifique!',
        2
      );
      // question.idChecked = false;

      const newQuestions = questionsDisponibles.filter((qst) => {
        return parseInt(qst.id) !== parseInt(id) && qst;
      });
      if (question !== undefined) newQuestions.push(question);

      await (async () => {
        this.setState({
          questionsDisponibles: newQuestions.sort((a, b) => {
            return parseInt(a.GPP_POSICAO) - parseInt(b.GPP_POSICAO);
          }),
        });
      })();

      this.props.handleQuestionsSelected(this.state.idQuestionsSelecteds);
    } else {
      const newsId = this.state.idQuestionsSelecteds.filter((id_) => {
        return parseInt(id_) === parseInt(id) && id_;
      });

      if (newsId.length > 0) {
        await (async () => {
          this.setState({
            idQuestionsSelecteds: newsId,
          });
        })();
      } else {
        await (async () => {
          this.setState({
            idQuestionsSelecteds: [...this.state.idQuestionsSelecteds, id],
          });
        })();
      }

      const newQuestions = questionsDisponibles.filter((qst) => {
        return parseInt(qst.id) !== parseInt(id) && qst;
      });

      if (question.idChecked && question.idChecked === true) {
        question.idChecked = false;
        let newsId_ = idQuestionsSelecteds.filter(
          (id_) => parseInt(id_) !== parseInt(id)
        );
        this.setState({
          idQuestionsSelecteds: newsId_,
        });
      } else {
        question.idChecked = await this.verifyIdQuestionIsSelected(id);
      }
      if (!question.idChecked) {
        question.idDad = 0;
      } else {
        question.idDad = this.props.idQuestionHigher;
      }
      if (question !== undefined) newQuestions.push(question);

      await (async () => {
        this.setState({
          questionsDisponibles: newQuestions.sort((a, b) => {
            return parseInt(a.GPP_POSICAO) - parseInt(b.GPP_POSICAO);
          }),
        });
      })();

      this.props.handleQuestionsSelected(this.state.idQuestionsSelecteds);
      setTimeout(() => {
        //console.log(questionsDisponibles);
      }, 2000);
    }
  };

  verifyIdQuestionIsSelected = async (id) => {
    const { idQuestionsSelecteds } = this.state;
    let res = idQuestionsSelecteds.find((id_) => {
      return parseInt(id_) === parseInt(id) ? true : false;
    });

    // setTimeout(() => {
    //   //console.log(res);
    // }, 2000);

    return res >= 0 && true;
  };

  handleMovePosition = async (id, index, nextPosition) => {
    const { questionsDisponibles, idQuestionsSelecteds } = this.state;
    let nums = [];
    questionsDisponibles.forEach((qst) => {
      if (
        qst.idChecked &&
        qst.idDad &&
        parseInt(qst.idDad) === parseInt(this.props.idQuestionHigher)
      ) {
        nums.push(qst.id);
      }
    });

    this.setState({
      idQuestionsSelecteds: nums,
    });
    const questionBeMove = questionsDisponibles[index - 1];

    questionBeMove.idChecked = await this.verifyIdQuestionIsSelected(
      questionBeMove.id
    );

    // //console.log(questionBeMove.idChecked);

    if (
      (index === 0) & (nextPosition === index - 1) ||
      nextPosition > questionsDisponibles.length
    ) {
    } else {
      parseInt((questionBeMove.GPP_POSICAO = nextPosition));
      questionsDisponibles.splice(index - 1, 1);
      questionsDisponibles.splice(nextPosition - 1, 0, questionBeMove);

      setTimeout(() => {
        questionsDisponibles.forEach((qst, i) => {
          if (parseInt(qst.GPP_POSICAO).length > 1) {
            qst.GPP_POSICAO = `0${i + 1}`;
          } else {
            qst.GPP_POSICAO = `00${i + 1}`;
          }
        });
      }, 100);
      this.setState({
        questionsDisponibles: questionsDisponibles,
      });
    }

    let newsIdOrdenate = [];
    questionsDisponibles.forEach((qst) => {
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
    this.props.handleQuestionsSelected(newsIdOrdenate);
  };

  handleUpdateQuestionsDisponible = (id) => {
    // const { questionsDisponibles } = this.state;
    // let newQuestions = [];
    // newQuestions = questionsDisponibles.filter((qst) => {
    //   return parseInt(qst.id) !== parseInt(id) && qst;
    // });
    // //console.log(newQuestions);
    setTimeout(() => {
      this.setState({
        // questionsDisponibles: newQuestions,
      });
    }, 100);
  };

  render() {
    const { questionsDisponibles } = this.state;

    return (
      <div
        // className="striped"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        {questionsDisponibles &&
          questionsDisponibles
            .sort((a, b) => {
              return parseInt(a.GPP_POSICAO) - parseInt(b.GPP_POSICAO);
            })
            .map((question, i) => {
              // this.props.idQuestionDad === parseInt(question.id

              return (
                <ContentCheckBox
                  key={i}
                  // isPurple={i % 2 === 0 ? true : false}
                  displayNone={
                    question.idChecked !== undefined
                      ? question.idChecked &&
                        question.idDad &&
                        question.idDad !== this.props.idQuestionHigher &&
                        true
                      : parseInt(this.props.idQuestionDad) ===
                        parseInt(question.id)
                      ? true
                      : false
                  }
                >
                  <Checkbox
                    checked={
                      question.idChecked !== undefined
                        ? question.idChecked
                        : false
                    }
                    onChange={(ev) => this.onChangeCheckBox(question, ev)}
                    disabled={
                      question.idChecked !== undefined
                        ? question.idChecked &&
                          question.idDad &&
                          question.idDad !== this.props.idQuestionHigher &&
                          true
                        : false
                    }
                    id={question.id.toString()}
                    label={question.GPP_PERGUNTA}
                    value={question.id.toString()}
                  />
                </ContentCheckBox>
              );
            })}
      </div>
    );
  }
}
