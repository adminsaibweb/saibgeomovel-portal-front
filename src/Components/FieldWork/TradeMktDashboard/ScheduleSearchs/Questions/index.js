import React, { Component, Fragment } from 'react';
import { capitalize } from '../../../../../services/funcoes';
import Photo from '../../BottomMonitoring/PhotosList/Photo';
import { DivDetalhe, Linha } from './styled';

export default class Questions extends Component {
  state = {
    openImage: false,
    positionImg: -1,
  };

  closePhoto = () => {
    this.setState({
      openImage: false,
    });
  };
  render() {
    const { questions } = this.props;
    const { openImage, positionImg } = this.state;
    return (
      <Fragment>
        {questions.length > 0 ? (
          questions.map((question, i) => (
            <Linha key={question.PERGUNTA_ID}>
              <DivDetalhe>
                <p>{capitalize(question.PERGUNTA_DESCRICAO, true)}</p>

                {question.PERGUNTA_TIPO_CAMPO === 7 ? (
                  <img
                    className="photoInList"
                    src={question.PERGUNTA_RESPOSTA}
                    alt="Foto"
                    onClick={() => {
                      this.setState({
                        openImage: true,
                        positionImg: i,
                        pathImage: question.PERGUNTA_RESPOSTA,
                      });
                    }}
                  />
                ) : (
                  <span>{question.PERGUNTA_RESPOSTA}</span>
                )}
                {openImage && positionImg === i && (
                  <Photo closePhoto={this.closePhoto} pathImage={question.PERGUNTA_RESPOSTA} />
                )}
              </DivDetalhe>
            </Linha>
          ))
        ) : (
          <span>Sem perguntas respondidas.</span>
        )}
      </Fragment>
    );
  }
}
