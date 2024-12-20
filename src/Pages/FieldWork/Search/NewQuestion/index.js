import React, { Component } from 'react';
import { SubTitulo, ContainerInterno, Linha, DivDetalhe, Labels } from '../style';

import { Checkbox, Icon } from 'react-materialize';
import NewFixedList from '../../../../Components/FieldWork/Search/NewFixedList';
import MinimumAndMaximumValue from '../../../../Components/FieldWork/Search/MinimumAndMaximumValue';
import OptionsQuestionImage from '../../../../Components/FieldWork/Search/OptionsQuestionImage';

export default class NewQuestion extends Component {
  state = {
    itemsListFix: [],
    questionTypeMoney: false,
    isMobile: false,
    errors: {},
    optionTypeImage: { valueDefault: '1' },
  };

  componentDidMount() {
    this.verifyWhatTypeQuestion();
    window.addEventListener('resize', this.resize.bind(this));
    this.resize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize.bind(this));
  }

  resize() {
    this.setState({ isMobile: window.innerWidth <= 760 });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.data.questionType !== this.props.data.questionType) {
      this.verifyWhatTypeQuestion();
    }
  }

  handleChangeQuestionType = (e) => {
    this.setState({ questionType: e.target.value });
  };

  handleSaveNewFixedList = (data) => {
    this.setState({
      itemsListFix: data,
    });
  };

  handleSaveValueMinAndMax = (values) => {
    const { action } = this.props;
    const { question } = action === 'editar' ? this.props.dataToEdit : this.props.data;
    if (action === 'editar') {
      question.CAMPOS[0].GAC_VALOR_MINIMO = values.minimum;
      question.CAMPOS[0].GAC_VALOR_MAXIMO = values.maximum;
    }

    this.setState({
      minimum: values.minimum,
      maximum: values.maximum,
    });
  };

  verifyWhatTypeQuestion = () => {
    const { action } = this.props;

    let { questionType } = action === 'editar' ? this.props.dataToEdit : this.props.data;

    questionType = parseInt(questionType);

    if ([2, 3, 9, 12].includes(questionType)) {
      this.setState({
        questionTypeMoney: true,
      });
    } else {
      this.setState({
        questionTypeMoney: false,
      });
    }
  };

  handleErrorsMinimumAndMaxValues = (errors_) => {
    const { errors } = this.state;
    if (Object.values(errors_).length) {
      this.setState({
        errors: {
          ...this.state.errors,
          ...errors_,
        },
      });
    } else {
      for (let err in errors) {
        if (err === 'maximum') {
          delete errors.maximum;
        } else if (err === 'minimum') {
          delete errors.minimum;
        }
        this.setState({
          errors,
        });
      }
    }
  };

  onChangeOptionTypeImage = (value) => {
    const { action } = this.props;
    const { question } = action === 'editar' ? this.props.dataToEdit : this.props.data;
    if (action === 'editar') {
      this.setState({
        optionTypeImage: value,
      });
      question.CAMPOS[0].GAC_VALOR_PADRAO = value.valueDefault;
    }

    this.setState({
      optionTypeImage: value,
    });
  };

  render() {
    const { action } = this.props;
    const { itemsListFix, minimum, maximum, questionTypeMoney, isMobile, errors, optionTypeImage } =
      this.state;
    const {
      typeResult,
      questionRequired,
      handleChangeNewQuestionRequired,
      handleChangeQuestionRequired,
      active,
      questionType,
      descriptionQuestion,
      handleDescriptionQuestion,
      handleChangeNewQuestionActive,
      handleTypeResultQuestion,
      handleChangeQuestionType,
      handleSaveQuestion,
      handleDeleteQuestion,
      question,
      handleCancellQuestion,
    } = action === 'editar' ? this.props.dataToEdit : this.props.data;

    return (
      <ContainerInterno
        questionTypeMoney={questionTypeMoney}
        id="contentIntern"
        style={{ border: '1px solid #ccc', borderRadius: '10px' }}
      >
        <Linha
          style={{
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <SubTitulo>{action === 'editar' ? 'Editando a pergunta...' : 'Nova pergunta'}</SubTitulo>
          <button
            style={{ marginTop: '10px' }}
            disabled={!!Object.values(errors).length || !!Object.values(this.props.errors).length}
            className="saib-button is-primary"
            onClick={() => {
              handleDeleteQuestion(itemsListFix, { minimum, maximum }, optionTypeImage);
            }}
          >
            <Icon>clear</Icon>
          </button>
        </Linha>
        <div className="containerQuestion">
          <Linha className="primeiraLinha">
            <DivDetalhe flex={3}>
              <Labels>Pergunta</Labels>
              <input type="text" value={descriptionQuestion} onChange={handleDescriptionQuestion} />
              {this.props.errors && this.props.errors?.descriptionQuestion && (
                <span style={{ color: '#FF0000' }}>{this.props.errors.descriptionQuestion}</span>
              )}
            </DivDetalhe>
            {isMobile && questionTypeMoney && (
              <>
                <MinimumAndMaximumValue
                  handleErrors={this.handleErrorsMinimumAndMaxValues}
                  typeField={parseInt(questionType)}
                  handleSave={this.handleSaveValueMinAndMax}
                  questionEdit={action === 'editar' ? question : null}
                  action={action}
                />
              </>
            )}
            {isMobile && parseInt(questionType) === 11 && (
              <>
                <NewFixedList
                  search={this.props.search}
                  typeField={parseInt(questionType)}
                  handleSave={this.handleSaveNewFixedList}
                  questionEdit={action === 'editar' ? question : null}
                  action={action}
                />
              </>
            )}

            <DivDetalhe flex={3}>
              <Labels>Tipo campo</Labels>
              <select
                onChange={handleChangeQuestionType}
                style={{ marginTop: '1px' }}
                // id="selectTipoCampo"
                disabled={action === 'editar' ? true : false}
                multiple={false}
                value={questionType ? questionType : ''}
                options={{
                  classes: '',
                  dropdownOptions: {
                    alignment: 'left',
                    autoTrigger: true,
                    closeOnClick: true,
                    constrainWidth: true,
                    coverTrigger: true,
                    hover: false,
                    inDuration: 150,
                    onCloseEnd: null,
                    onCloseStart: null,
                    onOpenEnd: null,
                    onOpenStart: null,
                    outDuration: 250,
                  },
                }}
              >
                <option value="0">Texto (até 255 caracteres)</option>
                <option value="1">Texto grande (até 1000 caracteres)</option>
                <option value="2">Inteiro</option>
                <option value="3">Decimal (até 3 casas)</option>
                <option value="4">Data</option>
                <option value="5">Data/hora</option>
                <option value="6">Hora</option>
                <option value="7">Imagem (caminho da imagem)</option>
                <option value="8">Booleano (Verdadeiro/Falso)</option>
                <option value="9">Moeda</option>
                <option value="10">Lista fixa (apenas uma escolha)</option>
                <option value="11">Lista fixa (multipla escolha)</option>
                <option value="12">NPS (simples)</option>
                <option value="13">Peso</option>
              </select>
            </DivDetalhe>
            <DivDetalhe flex={3}>
              <Labels>Tipo resultado</Labels>
              <select
                disabled={[12, 13].includes(parseInt(questionType))}
                style={{ marginTop: '1px' }}
                value={typeResult && typeResult}
                onChange={handleTypeResultQuestion}
                id="selectTipoResultado"
                multiple={false}
                options={{
                  classes: '',
                  dropdownOptions: {
                    alignment: 'left',
                    autoTrigger: true,
                    closeOnClick: true,
                    constrainWidth: true,
                    coverTrigger: true,
                    hover: false,
                    inDuration: 150,
                    onCloseEnd: null,
                    onCloseStart: null,
                    onOpenEnd: null,
                    onOpenStart: null,
                    outDuration: 250,
                  },
                }}
              >
                <option value="0">Não atua</option>
                <option value="1">Somatório</option>
                <option value="2">Média aritmética</option>
                <option value="3">Média ponderada</option>
                <option value="4">Mediana</option>
                <option value="5">Valor máximo</option>
                <option value="6">Valor mínimo</option>
                <option value="7">Contagem</option>
                <option value="8">Contagem restrita</option>
              </select>
            </DivDetalhe>
            <DivDetalhe>
              {parseInt(questionType) === 7 && (
                <>
                  <Labels>Opções</Labels>
                  <select
                    onChange={(e) => handleChangeQuestionRequired(e.target.value)}
                    style={{ marginTop: '1px' }}
                    multiple={false}
                    value={questionRequired && questionRequired}
                    options={{
                      classes: '',
                      dropdownOptions: {
                        alignment: 'left',
                        autoTrigger: true,
                        closeOnClick: true,
                        constrainWidth: true,
                        coverTrigger: true,
                        hover: false,
                        inDuration: 150,
                        onCloseEnd: null,
                        onCloseStart: null,
                        onOpenEnd: null,
                        onOpenStart: null,
                        outDuration: 250,
                      },
                    }}
                  >
                    <option value="1">Obrigatória</option>
                    <option value="0">Não obrigatória</option>
                    <option value="-1">Obrigatoriedade não se aplica</option>
                  </select>
                </>
              )}
              {parseInt(questionType) !== 7 && (
                <Checkbox
                  id="check2"
                  label="Obrigatória"
                  checked={questionRequired && questionRequired === 1 ? true : false}
                  value=""
                  onChange={async (ev) => {
                    await handleChangeNewQuestionRequired(ev);
                  }}
                />
              )}
              <Checkbox
                id="check1"
                label="Ativa"
                value=""
                checked={active && active === 1 ? true : false}
                onChange={async (ev) => {
                  await handleChangeNewQuestionActive(ev);
                }}
              />
            </DivDetalhe>
            {isMobile && parseInt(questionType) === 7 && (
              <DivDetalhe flex="1">
                <OptionsQuestionImage onChange={this.onChangeOptionTypeImage} question={question} />
              </DivDetalhe>
            )}

            {isMobile && parseInt(questionType) === 10 && (
              <>
                <NewFixedList
                  search={this.props.search}
                  typeField={parseInt(questionType)}
                  handleSave={this.handleSaveNewFixedList}
                  questionEdit={action === 'editar' ? question : null}
                  action={action}
                />
              </>
            )}
            <DivDetalhe>
              <button
                disabled={!!Object.values(errors).length || !!Object.values(this.props.errors).length}
                className="saib-button is-primary"
                onClick={() => {
                  handleSaveQuestion(itemsListFix, { minimum, maximum }, optionTypeImage);
                }}
              >
                Salvar
              </button>
              <button
                className="waves-effect waves-light saib-button is-primary"
                onClick={() => handleCancellQuestion()}
              >
                Cancelar
              </button>
            </DivDetalhe>
          </Linha>
          <Linha>
            {!isMobile && parseInt(questionType) === 7 && (
              <DivDetalhe flex="1">
                <OptionsQuestionImage onChange={this.onChangeOptionTypeImage} question={question} />
              </DivDetalhe>
            )}
            {!isMobile && questionTypeMoney && (
              <>
                <MinimumAndMaximumValue
                  handleErrors={this.handleErrorsMinimumAndMaxValues}
                  typeField={parseInt(questionType)}
                  handleSave={this.handleSaveValueMinAndMax}
                  questionEdit={action === 'editar' ? question : null}
                  action={action}
                />
              </>
            )}
            {!isMobile && parseInt(questionType) === 10 && (
              <>
                <NewFixedList
                  search={this.props.search}
                  typeField={parseInt(questionType)}
                  handleSave={this.handleSaveNewFixedList}
                  questionEdit={action === 'editar' ? question : null}
                  action={action}
                />
              </>
            )}
            {!isMobile && parseInt(questionType) === 11 && (
              <>
                <NewFixedList
                  search={this.props.search}
                  typeField={parseInt(questionType)}
                  handleSave={this.handleSaveNewFixedList}
                  questionEdit={action === 'editar' ? question : null}
                  action={action}
                />
              </>
            )}
            {!isMobile && parseInt(questionType) === 13 && (
              <>
                <NewFixedList
                  search={this.props.search}
                  typeField={parseInt(questionType)}
                  handleSave={this.handleSaveNewFixedList}
                  questionEdit={action === 'editar' ? question : null}
                  action={action}
                />
              </>
            )}
          </Linha>
        </div>
      </ContainerInterno>
    );
  }
}
