import React, { Component } from 'react';
import {
  Container,
  DivDetalhe,
  Labels,
  Linha,
  SubTitulo,
  LinhaRodape,
  DivRodape,
} from './style';
import DirectTituloJanela from '../../../Components/Globals/DirectTituloJanela';
import WaitScreen from '../../../Components/Globals/WaitScreen';
import Header from '../../../Components/System/Header';
import { Icon } from 'react-materialize';
import { getFromStorage } from '../../../services/auth';
import { alerta, capitalize } from '../../../services/funcoes';
import api from '../../../services/api';
import * as Yup from 'yup';

export default class Interruption extends Component {
  state = {
    loading: false,
    description: '',
    typeInterruption: 0,
    statusInterruption: 1,
    errors: {},
  };

  componentDidMount() {
    const { action, interruption } = this.props.location.state;
    this.carregarVariaveisEstado();
    this.setState(
      {
        action,
        interruption,
      },
      () => {
        if (action === 'editar') {
          this.handleDataInInputs();
        }
      }
    );
  }

  componentDidUpdate() {
    const { action } = this.props.location.state;
    if (action !== this.state.action) {
      this.setState({
        action,
      });
    }
  }

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
    });
  };

  handleDataInInputs = () => {
    const { interruption } = this.state;
    this.setState({
      description: interruption.GMI_DESCRICAO,
      typeInterruption: interruption.GMI_TIPO_INTERRUPCAO,
      statusInterruption: interruption.GMI_FLG_STATUS,
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
    description: Yup.string()
      .required('Campo obrigatório')
      .max(50, 'Máximo 50 caracteres'),
  });

  handleSaveInterruption = async () => {
    const {
      description,
      typeInterruption,
      statusInterruption,
      action,
      interruption,
    } = this.state;

    if (action === 'editar') {
      const dataToSend = {
        GMI_ID: interruption.GMI_ID,
        GMI_EMP_ID: interruption.GMI_EMP_ID,
        GMI_DESCRICAO: description && description.toUpperCase(),
        GMI_FLG_STATUS: statusInterruption,
        GMI_TIPO_INTERRUPCAO: typeInterruption,
      };
      try {
        const res = await api.put(
          `v1/interrrupt/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`,
          dataToSend
        );
        const { sucess } = res.data;
        if (sucess) {
          alerta('Interrupção alterada com sucesso!', 1);
          this.props.history.push('/interruptions');
        }
      } catch (err) {
        //console.log(err);
      }
    } else {
      const dataToSend = {
        GMI_DESCRICAO: description && description.toUpperCase(),
        GMI_FLG_STATUS: statusInterruption,
        GMI_TIPO_INTERRUPCAO: typeInterruption,
      };
      try {
        const res = await api.post(
          `v1/interrrupt/add/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`,
          dataToSend
        );
        const { sucess } = res.data;
        if (sucess) {
          alerta('Interrupção salva com sucesso!', 1);
          this.props.history.push('/interruptions');
        }
      } catch (err) {
        //console.log(err);
      }
    }

    // //console.log(description, typeInterruption, statusInterruption);
  };

  render() {
    const {
      loading,
      description,
      typeInterruption,
      statusInterruption,
      errors,
    } = this.state;

    return (
      <>
        <Header />
        <WaitScreen loading={loading} />
        <Container className="containerSearchs">
          <DirectTituloJanela
            urlVoltar={'/interruptions'}
            titulo={
              loading ? (
                'Aguarde...'
              ) : (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon>poll</Icon>Interrupção
                </span>
              )
            }
          />
          <div>
            <Linha>
              <DivDetalhe className="contentSubTitle">
                <SubTitulo>
                  <Icon>label</Icon>Dados da interrupção
                </SubTitulo>
              </DivDetalhe>
            </Linha>

            <Linha className="primeiraLinha">
              <DivDetalhe flex="5">
                <Labels>Descrição interrupção</Labels>
                <input
                  value={capitalize(description, true)}
                  type="text"
                  onChange={(ev) => {
                    this.setState(
                      {
                        description: ev.target.value,
                      },
                      () =>
                        this.handleValidationUnicField('description', 'errors')
                    );
                  }}
                />
                {errors && errors?.description && (
                  <span style={{ color: '#FF0000' }}>{errors.description}</span>
                )}
              </DivDetalhe>
              <DivDetalhe flex="1">
                <Labels>Tipo interrupção</Labels>
                <select
                  style={{ marginTop: '1px' }}
                  value={typeInterruption}
                  onChange={(ev) => {
                    this.setState({
                      typeInterruption: parseInt(ev.target.value),
                    });
                  }}
                  multiple={false}
                >
                  <option disabled defaultChecked value="-1">
                    Selecione um tipo de interrupção
                  </option>
                  <option value="0">Atividade parada/interrompida</option>
                  <option value="1">Atividade iniciada/retomada</option>
                </select>
              </DivDetalhe>
              <DivDetalhe flex="1">
                <Labels>Status interrupção</Labels>
                <select
                  style={{ marginTop: '1px' }}
                  value={statusInterruption}
                  onChange={(ev) => {
                    this.setState({
                      statusInterruption: parseInt(ev.target.value),
                    });
                  }}
                  multiple={false}
                >
                  <option disabled defaultChecked value="-1">
                    Status de interrupção
                  </option>
                  <option value="1">Ativo</option>
                  <option value="0">Inativo</option>
                </select>
              </DivDetalhe>
            </Linha>
            <LinhaRodape>
              <DivRodape>
                <button
                  type="submit"
                  disabled={Object.values(errors).length}
                  className="waves-effect waves-light saib-button is-primary "
                  onClick={() => {
                    this.handleSaveInterruption();
                    // const questions = this.state.perguntasDisponiveis;
                    // await this.props.saveQuestions(questions);
                  }}
                >
                  <Icon>save</Icon> Salvar
                </button>
              </DivRodape>
            </LinhaRodape>
          </div>
        </Container>
      </>
    );
  }
}
