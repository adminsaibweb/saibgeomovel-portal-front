import React, { Component } from 'react';
import {Labels} from '../NewFixedList/style';

export default class OptionsQuestionImage extends Component {
  state = {
    option: '1',
  };

  componentDidMount() {
    const { question } = this.props;
    question &&
      this.setState({
        option: question.CAMPOS[0].GAC_VALOR_PADRAO,
      });
  }

  onChangeSelect = (ev) => {
    const { onChange } = this.props;
    const { value } = ev.target;

    this.setState(
      {
        option: value,
      },
      () => onChange({ valueDefault: value })
    );
  };

  render() {
    const { option } = this.state;

    return (
      <>
        <Labels>Capturar imagem</Labels>
        <select
          onChange={this.onChangeSelect}
          style={{ marginTop: '5px' }}
          multiple={false}
          value={option}
        >
          <option value="0">Utilizar somente câmeras disponíveis</option>
          <option value="1">Permitir explorar e câmeras disponíveis</option>
        </select>
      </>
    );
  }
}
