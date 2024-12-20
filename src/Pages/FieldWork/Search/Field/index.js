import React, { Component } from 'react';
import { Collapsible, CollapsibleItem } from 'react-materialize';
import { ContentHeaderCollaPsible } from './styled';
import QuestionComponent from '../QuestionComponent';

export default class Field extends Component {
  state = {
    onSpanded: false,
    optionSelected: false,
    questionSelected: {},
    positionQuestionSelected: '',
    descriptionQuestionSelected: '',

    handleNextQuesion: false,
    allQuestions: [],
  };

  // componentDidUpdate(prevProps, prevState) {
  //   if (prevProps.allQuestions !== this.props.allQuestions) {
  //     this.setState({
  //       allQuestions: this.props.allQuestions,
  //     });
  //   }
  // }

  verifyNextQuestionIsListOrBool = (idQuestion) => {
    const { allQuestions } = this.props;
    allQuestions &&
      allQuestions.forEach((question) => {
        if (question.id === idQuestion) {
          if (question.CAMPOS.length > 1) {
            return true;
          } else {
            return false;
          }
        }
      });
  };

  returnNextQuestion = (idQuestion) => {
    const { allQuestions } = this.props;
    // //console.log(idQuestion);
    return allQuestions.filter((question) => {
      return question.id === idQuestion && question;
    });
  };

  handleQuestionsSelected = (values) => {
    // this.setState({
    //   idQuestionsSelected: values,
    // });
    // //console.log(values);
  };

  closeCollapsible = () => {
    this.setState({
      onSpanded: false,
    });
    this.props.handleRemoveItemsExpanded();
  };

  saveField = (idQuestionsSelecteds) => {
    this.props.handleQuestionsSelected(idQuestionsSelecteds);
  };

  render() {
    const { descriptionField, isAgruped, allQuestions } = this.props;

    const { onSpanded } = this.state;

    return (
      <>
        <Collapsible
          accordion={false}
          style={{
            width: '100%',
            borderStyle: 'none',
            boxShadow: 'none',
          }}
          options={{
            onOpenStart: () => {
              if (isAgruped !== 1) {
                if (this.props.countExpanded > 0) {
                  this.setState({
                    onSpanded: false,
                  });
                } else {
                  this.setState({
                    onSpanded: true,
                  });
                }
                this.props.handleAddItemsExpanded();
              }
            },
            onCloseEnd: () => {
              this.setState({
                onSpanded: false,
              });
              this.props.handleRemoveItemsExpanded();
            },
          }}
        >
          <CollapsibleItem
            expanded={false}
            header={
              <ContentHeaderCollaPsible backColor="#BF1F7C">
                <div>
                  <p className="material-icons plus">add_circle_outline</p>
                  <p className="material-icons minus">remove_circle_outline</p>
                  <p>{descriptionField}</p>
                </div>
              </ContentHeaderCollaPsible>
            }
            icon={<></>}
          >
            <div>
              {onSpanded ? (
                <>
                  <QuestionComponent
                    closeCollapsible={this.closeCollapsible}
                    idQuestionDad={this.props.idQuestionDad}
                    idQuestionHigher={this.props.idQuestionHigher}
                    handleNewQuestion={this.handleNewQuestion}
                    questionsDisponible={allQuestions}
                    handleQuestionsSelected={this.props.handleQuestionsSelected}
                  />
                </>
              ) : (
                this.props.countExpanded > 0 && (
                  <span>Feche o outro campo aberto</span>
                )
              )}
            </div>
          </CollapsibleItem>
        </Collapsible>
      </>
    );
  }
}
