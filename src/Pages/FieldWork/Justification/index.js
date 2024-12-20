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

export default class Justification extends Component {
  state = {
    loading: false,
    description: '',
    statusJustification: 1,
    errors: {},
  };

  componentDidMount() {
    const { action, justification } = this.props.location.state;
    this.carregarVariaveisEstado();
    this.setState(
      {
        action,
        justification,
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
    const { justification } = this.state;
    this.setState({
      description: justification.GAJ_DESCRICAO,
      statusJustification: justification.GAJ_FLG_STATUS,
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

  handleSaveJustification = async () => {
    const { description, statusJustification, action, justification } =
      this.state;

    if (action === 'editar') {
      const dataToSend = {
        GAJ_ID: justification.GAJ_ID,
        GAJ_EMP_ID: justification.GAJ_EMP_ID,
        GAJ_DESCRICAO: description && description.toUpperCase(),
        GAJ_FLG_STATUS: statusJustification,
      };
      try {
        const res = await api.put(
          `v1/justification/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`,
          dataToSend
        );
        const { sucess } = res.data;
        if (sucess) {
          alerta('Justificativa alterada com sucesso!', 1);
          this.props.history.push('/justifications');
        }
      } catch (err) {
        //console.log(err);
      }
    } else {
      const dataToSend = {
        GAJ_DESCRICAO: description && description.toUpperCase(),
        GAJ_FLG_STATUS: statusJustification,
      };
      try {
        const res = await api.post(
          `v1/justification/add/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`,
          dataToSend
        );
        const { sucess } = res.data;
        if (sucess) {
          alerta('Justificativa salva com sucesso!', 1);
          this.props.history.push('/justifications');
        }
      } catch (err) {
        //console.log(err);
      }
    }
  };

  render() {
    const { loading, description, statusJustification, errors } = this.state;

    return (
      <>
        <Header />
        <WaitScreen loading={loading} />
        <Container className="containerSearchs">
          <DirectTituloJanela
            urlVoltar={'/justifications'}
            titulo={
              loading ? (
                'Aguarde...'
              ) : (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon>poll</Icon>Justificativa
                </span>
              )
            }
          />
          <div>
            <Linha>
              <DivDetalhe className="contentSubTitle">
                <SubTitulo>
                  <Icon>label</Icon>Dados da justificativa
                </SubTitulo>
              </DivDetalhe>
            </Linha>

            <Linha className="primeiraLinha">
              <DivDetalhe flex="5">
                <Labels>Justificativa</Labels>
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
                <Labels>Status justificação</Labels>
                <select
                  style={{ marginTop: '1px' }}
                  value={statusJustification}
                  onChange={(ev) => {
                    this.setState({
                      statusJustification: parseInt(ev.target.value),
                    });
                  }}
                  multiple={false}
                >
                  <option disabled defaultChecked value="-1">
                    Status da justificação
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
                    this.handleSaveJustification();
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
