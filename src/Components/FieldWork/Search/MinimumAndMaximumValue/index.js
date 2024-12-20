import React, { Component } from 'react';
import * as Yup from 'yup';
import { ContainerInterno, Linha, DivDetalhe, Labels } from './style';
import CurrencyFormat from 'react-currency-format';

export default class MinimumAndMaximumValue extends Component {
  state = {
    minimum: null,
    maximum: null,
    longDescriptionItem: '',
    addItem: false,
    errors: {},
    opened: false,
  };

  componentDidMount() {
    const { typeField, action, questionEdit } = this.props;
    this.setState(
      {
        typeField: parseInt(typeField),
        action,
        questionEdit,
        opened: true,
      },
      () => this.handleValues()
    );
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.typeField !== this.props.typeField) {
      this.setState(
        {
          typeField: parseInt(this.props.typeField),
          questionEdit: this.props.questionEdit,
        },
        () => this.handleValues()
      );
    }
    if (prevProps.questionEdit !== this.props.questionEdit) {
      this.setState(
        {
          typeField: parseInt(this.props.typeField),
          questionEdit: this.props.questionEdit,
          errors: {},
        },
        () => this.handleValues()
      );
    }
  }

  handleValues = () => {
    const { action, typeField, questionEdit } = this.state;
    const values = questionEdit && questionEdit.CAMPOS[0];

    if (action === 'editar') {
      switch (typeField) {
        case 2:
          this.setState({
            minimum: values.GAC_VALOR_MINIMO && parseInt(values.GAC_VALOR_MINIMO),
            maximum: values.GAC_VALOR_MAXIMO && parseInt(values.GAC_VALOR_MAXIMO),
          });
          break;
        case 3:
          this.setState({
            minimum: typeof values.GAC_VALOR_MINIMO === 'number' ? values.GAC_VALOR_MINIMO : null,
            maximum: typeof values.GAC_VALOR_MAXIMO === 'number' ? values.GAC_VALOR_MAXIMO : null,
          });
          break;
        case 9:
          this.setState({
            minimum: typeof values.GAC_VALOR_MINIMO === 'number' ? values.GAC_VALOR_MINIMO : null,
            maximum: typeof values.GAC_VALOR_MAXIMO === 'number' ? values.GAC_VALOR_MAXIMO : null,
          });
          break;
        case 12:
          this.setState({
            minimum: values.GAC_VALOR_MINIMO ? values.GAC_VALOR_MINIMO : 0,
            maximum: values.GAC_VALOR_MAXIMO ? values.GAC_VALOR_MAXIMO : 9,
          });
          break;

        default:
          break;
      }
    } else {
      switch (typeField) {
        case 12:
          this.setState(
            {
              minimum: 0,
              maximum: 10,
            },
            () => this.handleSaveValues()
          );
          break;

        default:
          break;
      }
    }
  };

  handleSaveValues = async () => {
    const { minimum, maximum } = this.state;
    const { handleSave } = this.props;

    const isValid = await this.handleValidationData();
    if (!isValid) {
      return;
    }

    handleSave({ minimum, maximum });
    // this.clearFields();
  };

  clearFields = () => {
    this.setState({
      minimum: '',
      maximum: '',
      // opened: false,
    });
  };

  handleCancell = () => {
    this.setState({});
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
      })
      .finally(() => {
        this.props.handleErrors(this.state.errors);
      });
  };

  schema = Yup.object().shape({
    minimum: Yup.number(null, 'Campo obrigatório')
      .nullable()
      .test('len', 'Máximo 12 caracteres', (val) => (val ? val.toString().length < 13 : true)),

    maximum: Yup.number(null, 'Campo obrigatório')
      .min(Yup.ref('minimum'), 'O valor deve ser igual ou maior ao valor mínimo')
      .when('minimum', {
        is: (minimum) => String(minimum).length > 0,
        then: Yup.number(null, 'Campo obrigatório').nullable().required('Campo obrigatório'),
      })
      .test('len', 'Máximo 12 caracteres', (val) => (val ? val.toString().length < 13 : true)),
  });

  render() {
    const { minimum, maximum, typeField, errors, opened } = this.state;

    return (
      <>
        {opened && (
          <ContainerInterno>
            <Linha className="lineDetails">
              {typeField === 2 && (
                <>
                  <DivDetalhe flex="3" className="detail1">
                    <Labels>Valor mínimo</Labels>
                    <input
                      type="number"
                      value={minimum !== null ? minimum : ''}
                      onChange={(ev) => {
                        this.setState(
                          {
                            minimum: ev.target.value ? parseInt(ev.target.value) : null,
                          },
                          async () => {
                            this.handleValidationUnicField('minimum', 'errors');
                            await this.handleSaveValues();
                          }
                        );
                      }}
                    />
                    {errors && errors?.minimum && <span style={{ color: '#FF0000' }}>{errors.minimum}</span>}
                  </DivDetalhe>
                  <DivDetalhe flex="3" className="detail2">
                    <Labels>Valor máximo</Labels>
                    <input
                      type="number"
                      value={maximum !== null ? maximum : ''}
                      onChange={(ev) => {
                        this.setState(
                          {
                            maximum: ev.target.value ? parseInt(ev.target.value) : null,
                          },
                          async () => {
                            this.handleValidationUnicField('maximum', 'errors');
                            await this.handleSaveValues();
                          }
                        );
                      }}
                    />
                    {errors && errors?.maximum && <span style={{ color: '#FF0000' }}>{errors.maximum}</span>}
                  </DivDetalhe>
                </>
              )}

              {typeField === 3 && (
                <>
                  <DivDetalhe flex="3" className="detail1">
                    <Labels>Valor mínimo</Labels>
                    <CurrencyFormat
                      name="monthyInvoicing"
                      value={minimum !== null ? minimum : ''}
                      thousandSeparator="."
                      decimalSeparator=","
                      fixedDecimalScale={true}
                      decimalScale={2}
                      // prefix={'R$'}
                      maxLength={20}
                      onValueChange={(ev) => {
                        this.setState(
                          {
                            minimum: ev.floatValue !== null && !isNaN(ev.floatValue) ? ev.floatValue : null,
                          },
                          async () => {
                            this.handleValidationUnicField('minimum', 'errors');
                            await this.handleSaveValues();
                          }
                        );
                      }}
                    />
                    {errors && errors?.minimum && <span style={{ color: '#FF0000' }}>{errors.minimum}</span>}
                  </DivDetalhe>
                  <DivDetalhe flex="3" className="detail2">
                    <Labels>Valor máximo</Labels>
                    <CurrencyFormat
                      name="monthyInvoicing"
                      value={maximum !== null ? maximum : ''}
                      thousandSeparator="."
                      decimalSeparator=","
                      fixedDecimalScale={true}
                      decimalScale={2}
                      // prefix={'R$'}
                      maxLength={20}
                      onValueChange={(ev) => {
                        this.setState(
                          {
                            maximum: ev.floatValue !== null && !isNaN(ev.floatValue) ? ev.floatValue : null,
                          },
                          async () => {
                            this.handleValidationUnicField('maximum', 'errors');
                            await this.handleSaveValues();
                          }
                        );
                      }}
                    />
                    {errors && errors?.maximum && <span style={{ color: '#FF0000' }}>{errors.maximum}</span>}
                  </DivDetalhe>
                </>
              )}

              {typeField === 9 && (
                <>
                  <DivDetalhe flex="1" className="detail1">
                    <Labels>Valor mínimo</Labels>
                    <CurrencyFormat
                      name="monthyInvoicing"
                      value={minimum !== null ? minimum : ''}
                      thousandSeparator="."
                      decimalSeparator=","
                      fixedDecimalScale={true}
                      decimalScale={2}
                      prefix={'R$'}
                      maxLength={20}
                      onValueChange={(ev) => {
                        this.setState(
                          {
                            minimum: ev.floatValue !== null && !isNaN(ev.floatValue) ? ev.floatValue : null,
                          },
                          async () => {
                            this.handleValidationUnicField('minimum', 'errors');
                            await this.handleSaveValues();
                          }
                        );
                      }}
                    />
                    {errors && errors?.minimum && <span style={{ color: '#FF0000' }}>{errors.minimum}</span>}
                  </DivDetalhe>
                  <DivDetalhe flex="1" className="detail2">
                    <Labels>Valor máximo</Labels>
                    <CurrencyFormat
                      name="monthyInvoicing"
                      value={maximum !== null ? maximum : ''}
                      thousandSeparator="."
                      decimalSeparator=","
                      fixedDecimalScale={true}
                      decimalScale={2}
                      prefix={'R$'}
                      maxLength={20}
                      onValueChange={(ev) => {
                        this.setState(
                          {
                            maximum: ev.floatValue !== null && !isNaN(ev.floatValue) ? ev.floatValue : null,
                          },
                          async () => {
                            this.handleValidationUnicField('maximum', 'errors');
                            await this.handleSaveValues();
                          }
                        );
                      }}
                    />
                    {errors && errors?.maximum && <span style={{ color: '#FF0000' }}>{errors.maximum}</span>}
                  </DivDetalhe>
                </>
              )}

              {typeField === 12 && (
                <>
                  <DivDetalhe flex="3" className="detail1">
                    <Labels>Valor mínimo</Labels>
                    <input
                      type="number"
                      value={minimum !== null ? String(minimum) : ''}
                      disabled
                      onChange={(ev) => {
                        this.setState(
                          {
                            minimum: ev.target.value ? parseInt(ev.target.value) : null,
                          },
                          async () => {
                            this.handleValidationUnicField('minimum', 'errors');
                            await this.handleSaveValues();
                          }
                        );
                      }}
                    />
                    {errors && errors?.minimum && <span style={{ color: '#FF0000' }}>{errors.minimum}</span>}
                  </DivDetalhe>
                  <DivDetalhe flex="3" className="detail2">
                    <Labels>Valor máximo</Labels>
                    <input
                      type="number"
                      value={maximum ? maximum : ''}
                      disabled
                      onChange={(ev) => {
                        this.setState(
                          {
                            maximum: ev.target.value ? parseInt(ev.target.value) : null,
                          },
                          async () => {
                            this.handleValidationUnicField('maximum', 'errors');
                            await this.handleSaveValues();
                          }
                        );
                      }}
                    />
                    {errors && errors?.maximum && <span style={{ color: '#FF0000' }}>{errors.maximum}</span>}
                  </DivDetalhe>
                </>
              )}
            </Linha>
          </ContainerInterno>
        )}
      </>
    );
  }
}
