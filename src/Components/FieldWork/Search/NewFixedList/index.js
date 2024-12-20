import React, { Component, Fragment } from 'react';
import { Icon } from 'react-materialize';
import { alerta } from '../../../../services/funcoes';
import * as Yup from 'yup';
import {
  ContainerInterno,
  Linha,
  DivDetalhe,
  Labels,
  ContentItems,
  HeaderList,
  ContentIconsItemList,
  EachIcon,
  Button,
} from './style';
export default class NewFixedList extends Component {
  state = {
    shortDescriptionItem: '',
    longDescriptionItem: '',
    peso: 0,
    items: [],
    addItem: false,
    errors: {},
    question: {},
    typeField: '',
  };

  componentDidMount() {
    const { questionEdit, action, typeField } = this.props;

    this.setState(
      {
        actionQuestion: action,
        typeField,
      },
      () => {
        this.handleCamposInItems(questionEdit);
      }
    );
  }

  componentDidUpdate(prevProps) {
    if (prevProps.questionEdit !== this.props.questionEdit) {
      this.handleCamposInItems(this.props.questionEdit);
    }
  }

  handleCamposInItems = (question) => {
    const { actionQuestion } = this.state;

    actionQuestion === 'editar'
      ? this.setState({
          items: question.CAMPOS.map((campo, i) => {
            return {
              idTemporary: campo.GAC_ID,
              GAC_POSICAO: campo.GAC_POSICAO,
              shortDescriptionItem: campo.GAC_DESCRICAO ? campo.GAC_DESCRICAO : '',
              longDescriptionItem: campo.GAC_DESCRICAO_LONGA ? campo.GAC_DESCRICAO_LONGA : '',
              valueDefault: campo.GAC_VALOR_PADRAO ? campo.GAC_VALOR_PADRAO : '1',
            };
          }),
          question: question,
        })
      : this.setState({
          addItem: true,
        });
  };

  returnPosition = (counter) => {
    if (parseInt(counter) > 9) {
      return `0${counter}`;
    } else {
      return `00${counter}`;
    }
  };

  handleSaveItem = async (inMovePosition = false) => {
    const { shortDescriptionItem, longDescriptionItem, items, itemToEdit, action, peso } = this.state;
    const { handleSave, questionEdit, typeField } = this.props;

    await this.handleValidationData();

    if (!inMovePosition)
      if (!(await this.isValidAddItem())) {
        return;
      }

    if (action === 'editar') {
      items.forEach((item) => {
        if (parseInt(item.idTemporary) === parseInt(itemToEdit?.idTemporary)) {
          item.shortDescriptionItem = shortDescriptionItem;
          item.longDescriptionItem = longDescriptionItem;
          item.valueDefault = typeField === 13 ? peso : '1';
        }

        questionEdit &&
          questionEdit.CAMPOS.forEach((campo_) => {
            if (campo_.GAC_ID === item.idTemporary) {
              campo_.GAC_DESCRICAO = item.shortDescriptionItem;
              campo_.GAC_DESCRICAO_LONGA = item.longDescriptionItem;
              campo_.GAC_POSICAO = item.GAC_POSICAO;
              campo_.GAC_VALOR_PADRAO = item.valueDefault ? item.valueDefault : '1';
            }
          });
      });

      this.setState(
        {
          items,
          addItem: false,
          action: 'novo',
        },
        () => {
          this.clearFields();
          handleSave(this.state.items);
        }
      );
    } else {
      const data = {
        idTemporary: items.length + 1,
        GAC_POSICAO: this.returnPosition(items.length + 1),
        shortDescriptionItem,
        longDescriptionItem,
        valueDefault: typeField === 13 ? peso : '1',
      };
      this.setState(
        {
          items: [...items, data],
          addItem: false,
          action: 'novo',
        },
        () => {
          this.handleSaveFieldInQuestionsReference(data);
          this.clearFields();
          handleSave(this.state.items);
        }
      );
    }
  };

  handleSaveFieldInQuestionsReference = (data) => {
    const { questionEdit, search } = this.props;
    search && search.AGRUPAMENTO
      ? search.AGRUPAMENTO.forEach((agrupamento) => {
          agrupamento.ITEMS.forEach((item) => {
            item.PERGUNTAS.forEach((pergunta) => {
              if (parseInt(pergunta?.GPP_POSICAO) === parseInt(questionEdit?.GPP_POSICAO)) {
                pergunta.CAMPOS.push({
                  GAC_POSICAO: data.GAC_POSICAO,
                  GAC_DESCRICAO: data.shortDescriptionItem,
                  GAC_DESCRICAO_LONGA: data.longDescriptionItem ? data.longDescriptionItem : null,
                  GAC_VALOR_PADRAO: data.valueDefault ? data.valueDefault : '1',
                  GAC_FLG_STATUS: 1,
                  GAC_GPP_ID_PROXIMA: null,
                  GAC_GPP_EMP_ID_PROXIMA: null,
                  GAC_VALOR_MAXIMO: null,
                  GAC_VALOR_MINIMO: null,
                });
              }
            });
          });
        })
      : questionEdit &&
        questionEdit.CAMPOS.push({
          GAC_POSICAO: data.GAC_POSICAO,
          GAC_DESCRICAO: data.shortDescriptionItem,
          GAC_DESCRICAO_LONGA: data.longDescriptionItem ? data.longDescriptionItem : null,
          GAC_VALOR_PADRAO: data.valueDefault ? data.valueDefault : '1',
          GAC_FLG_STATUS: 1,
          GAC_GPP_ID_PROXIMA: null,
          GAC_GPP_EMP_ID_PROXIMA: null,
          GAC_VALOR_MAXIMO: null,
          GAC_VALOR_MINIMO: null,
        });
  };

  handleRemoveItemList = (item) => {
    const { items } = this.state;
    const { handleSave } = this.props;

    const newsItems = items.filter((item_) => item.idTemporary !== item_.idTemporary);
    this.setState(
      {
        items: newsItems,
      },
      () => {
        handleSave(this.state.items);
      }
    );
  };

  handleEditItem = (item) => {
    this.setState({
      addItem: true,
      action: 'editar',
      itemToEdit: item,
      shortDescriptionItem: item.shortDescriptionItem,
      longDescriptionItem: item.longDescriptionItem,
      peso: item?.valueDefault,
    });
  };

  handleMovePosition = (id, nextPosition, index) => {
    const { items } = this.state;

    const itemBeMove = items[index - 1];

    if ((index === 1 && nextPosition === index - 1) || nextPosition > items.length) {
      return;
    } else {
      itemBeMove.GAC_POSICAO = nextPosition;
      items.splice(index - 1, 1);
      items.splice(nextPosition - 1, 0, itemBeMove);
    }

    setTimeout(() => {
      items.forEach((item, i) => {
        if (parseInt(item.GAC_POSICAO).length > 1) {
          item.GAC_POSICAO = `0${i + 1}`;
        } else {
          item.GAC_POSICAO = `00${i + 1}`;
        }
      });
      this.setState(
        {
          items,
          action: 'editar',
        },
        () => this.handleSaveItem(true)
      );
    }, 100);
  };

  clearFields = () => {
    this.setState({
      shortDescriptionItem: '',
      longDescriptionItem: '',
      peso: 0,
    });
  };

  isValidAddItem = async () => {
    const { shortDescriptionItem } = this.state;
    if (shortDescriptionItem.trim() === '') {
      alerta('erros');
      return false;
    } else return true;
  };

  handleCancell = () => {
    this.setState({
      action: 'novo',
      shortDescriptionItem: '',
      longDescriptionItem: '',
      peso: 0,
      addItem: false,
    });
  };

  handleValidationData = async () => {
    let retorno = await this.schema
      .validate(this.state, { abortEarly: false })
      .then((res, data) => {
        return true;
      })
      .catch((err) => {
        const errors = this.getValidationErrors(err);
        this.setState({
          errors,
        });
        return false;
      });
    return retorno;
  };

  getValidationErrors = (err) => {
    const validationErrors = {};

    err.inner?.length > 0 &&
      err.inner.forEach((error) => {
        if (error.path) {
          validationErrors[error.path] = error.message;
        }
      });

    return validationErrors;
  };

  handleValidationUnicField = (nameField, errorPage) => {
    this.schema
      .validate(this.state, { abortEarly: false })
      .then((res, data) =>
        this.setState({
          [errorPage]: {},
        })
      )
      .catch((err) => {
        const errors_ = this.getValidationErrors(err);
        for (var error in errors_) {
          if (error !== nameField) {
            delete errors_[error];
          }
          if (errors_[error] === undefined) {
            delete errors_[error];
          }
        }

        this.setState(
          (prevState) => ({
            [errorPage]: {
              ...prevState[errorPage],
              [nameField]: errors_[[nameField]], //[]é para acessar o nome da propriedade do valor, [[]] é para acessar a o valor da propriedade
            },
          }),
          () => {
            if (this.state[errorPage][nameField] === undefined) {
              const errorsAux = this.state[errorPage];
              delete errorsAux[nameField];
              this.setState({
                [errorPage]: errorsAux,
              });
            }
          }
        );
      });
  };

  schema = Yup.object().shape({
    shortDescriptionItem: Yup.string().required('Campo obrigatório').max(30, 'Máximo 30 caracteres'),
    longDescriptionItem: Yup.string().max(100, 'Máximo 100 caracteres'),
    typeField: Yup.string(),
    peso: Yup.number().when('typeField', {
      is: (type) => parseInt(type) === 13,
      then: Yup.number('Campo obrigatório')
        .min(0, 'Mínimo 0')
        .max(10, 'Máximo 10')
        .nullable()
        .required('Campo obrigatório'),
    }),
  });

  render() {
    const { shortDescriptionItem, longDescriptionItem, items, addItem, errors, peso, action } = this.state;
    const { questionEdit, typeField } = this.props;

    return (
      <ContainerInterno>
        <Linha>
          <ContentItems flex="1">
            {
              <>
                <HeaderList>
                  <Labels>Itens da lista</Labels>
                  <EachIcon
                    isDisabled={action === 'editar'}
                    onClick={() =>
                      action !== 'editar' &&
                      this.setState({
                        addItem: true,
                        action: 'novo',
                      })
                    }
                  >
                    <Icon>add</Icon>
                  </EachIcon>
                </HeaderList>
              </>
            }
            {items.length > 0 &&
              items.map((item, i) => (
                <Fragment key={i}>
                  <ul>
                    <li>
                      <label>{item.shortDescriptionItem}</label>
                      <div>
                        <ContentIconsItemList>
                          <EachIcon
                            isDisabled={questionEdit}
                            onClick={() => !questionEdit && this.handleRemoveItemList(item)}
                          >
                            <Icon>delete</Icon>
                          </EachIcon>
                          <EachIcon onClick={() => this.handleEditItem(item)}>
                            <Icon>edit</Icon>
                          </EachIcon>
                          <EachIcon
                            onClick={() =>
                              this.handleMovePosition(
                                item.idTemporary,
                                parseInt(item.GAC_POSICAO) - 1,
                                parseInt(item.GAC_POSICAO)
                              )
                            }
                          >
                            <Icon>arrow_upward</Icon>
                          </EachIcon>
                          <EachIcon
                            onClick={() =>
                              this.handleMovePosition(
                                item.idTemporary,
                                parseInt(item.GAC_POSICAO) + 1,
                                parseInt(item.GAC_POSICAO)
                              )
                            }
                          >
                            <Icon>arrow_downward</Icon>
                          </EachIcon>
                        </ContentIconsItemList>
                      </div>
                    </li>
                  </ul>
                </Fragment>
              ))}
          </ContentItems>
        </Linha>
        <Linha className="lineDetails">
          {addItem && (
            <>
              <DivDetalhe flex="1">
                <Labels>Descrição do item</Labels>
                <input
                  type="text"
                  value={shortDescriptionItem}
                  onChange={(ev) => {
                    this.setState(
                      {
                        shortDescriptionItem: ev.target.value,
                      },
                      () => this.handleValidationUnicField('shortDescriptionItem', 'errors')
                    );
                  }}
                />
                {errors && errors?.shortDescriptionItem && (
                  <span style={{ color: '#FF0000' }}>{errors.shortDescriptionItem}</span>
                )}
              </DivDetalhe>

              <DivDetalhe flex="2">
                <Labels>Descrição longa do item</Labels>
                <input
                  value={longDescriptionItem}
                  type="text"
                  onChange={(ev) => {
                    this.setState(
                      {
                        longDescriptionItem: ev.target.value,
                      },
                      () => this.handleValidationUnicField('longDescriptionItem', 'errors')
                    );
                  }}
                />
                {errors && errors?.longDescriptionItem && (
                  <span style={{ color: '#FF0000' }}>{errors.longDescriptionItem}</span>
                )}
              </DivDetalhe>

              {typeField && parseInt(typeField) === 13 && (
                <DivDetalhe flex="1">
                  <Labels>Peso</Labels>
                  <input
                    type="number"
                    value={peso !== null ? peso : ''}
                    onChange={(ev) => {
                      this.setState(
                        {
                          peso: ev.target.value ? ev.target.value : null,
                        },
                        () => this.handleValidationUnicField('peso', 'errors')
                      );
                    }}
                  />
                  {errors && errors?.peso && <span style={{ color: '#FF0000' }}>{errors.peso}</span>}
                </DivDetalhe>
              )}

              <DivDetalhe flex="1" className="detailsButton">
                <Button
                  disabled={Object.values(errors).length}
                  className="waves-effect waves-light saib-button is-primary"
                  onClick={() => this.handleSaveItem()}
                >
                  Salvar
                </Button>
                <Button
                  className="waves-effect waves-light saib-button is-primary"
                  onClick={() => this.handleCancell()}
                >
                  Cancelar
                </Button>
              </DivDetalhe>
            </>
          )}
        </Linha>
      </ContainerInterno>
    );
  }
}
