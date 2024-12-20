import React, { Component } from 'react';
import { Button } from 'react-materialize';
import { getFromStorage } from '../../../services/auth';
import { alerta } from '../../../services/funcoes';
import WaitScreen from '../../Globals/WaitScreen';
import api from '../../../services/api';
import SelectQuery from '../../Globals/SelectQuery';
import { Labels } from '../../../Pages/FieldWork/SupervisorSchedules/style';
import { ContentDialog } from './styled';

export class SelectNewClient extends Component {
  state = {
    clientes: [],
    loading: false,
    client: null,
    fluxo: null,
  };

  handleFilterCustomers = async (text) => {
    try {
      const sessao = getFromStorage();

      const empresaAtiva = sessao.empresaId;
      const usuarioAtivo = sessao.codigoUsuario;

      this.setState({ loading: true });
      let url = `v1/schedule/clientes/${empresaAtiva}/${usuarioAtivo}`;
      const dataToSend = {
        filtro: String(text?.toUpperCase()),
      };

      const retorno = await api.post(url, dataToSend);
      const { sucess, data } = retorno.data;

      if (sucess) {
        this.setState({ clientes: data });
        return data;
      }
    } catch (err) {
      alerta('Erro ao carregar os clientes =>' + err, 2);
      return [];
    } finally {
      this.setState({ loading: false });
    }
  };

  promiseOptions = (inputValue) => {
    if (inputValue.length >= 3) {
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.handleFilterCustomers(inputValue));
        }, 1000);
      });
    }
  };

  render() {
    const { closeModal, resultSearch, flowsData } = this.props;
    const { clientes, loading, client, fluxo } = this.state;

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          position: 'fixed',
          left: '0',
          top: '0',
          width: '100%',
          height: '100%',
          marginTop: '2rem',
        }}
      >
        <div
          onClick={() => {
            closeModal();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'fixed',
            left: '0',
            top: '0',
            width: '100%',
            height: '100%',
            background: 'rgb(0, 0, 0, 0.45)',
          }}
        />
        <ContentDialog>
          <div>
            <WaitScreen loading={loading} />
            <div
              style={{
                background: '#fff',
                padding: '1.5rem 1rem',
              }}
            >
              {flowsData && (
                <>
                  <Labels>Fluxo atividade</Labels>
                  <SelectQuery
                    colorPrimary
                    query={flowsData}
                    keys={['GAF_ID', 'GAF_DESCRICAO']}
                    label="GAF_DESCRICAO"
                    onSelect={(item) => {
                      this.setState({ fluxo: item.GAF_ID });
                    }}
                    onDelete={() => {
                      this.setState({ fluxo: null });
                    }}
                  />
                </>
              )}
              <Labels>Cliente</Labels>
              <SelectQuery
                onChangeComponentIsExternal
                loading={loading}
                colorPrimary
                query={clientes}
                keys={['CLI_ID', 'CLI_NOME_FANTASIA', 'CLI_RAZAO_SOCIAL', 'CLI_CODIGO']}
                label="CLI_NOME_FANTASIA"
                onChange={async (text) => {
                  await this.handleFilterCustomers(isNaN(text) ? text?.toUpperCase() : Number(text));
                }}
                onSelect={async (item) => {
                  this.setState({ client: item });
                }}
                onDelete={() => {
                  // console.log("here")
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                width: '100%',
                gap: '0.3rem',
              }}
            >
              <Button
                className="waves-effect waves-light saib-button is-primary modal-action modal-close"
                onClick={() => {
                  closeModal();
                }}
                color="primary"
              >
                Cancelar
              </Button>
              {client && (
                <Button
                  className="waves-effect waves-light saib-button is-primary modal-action modal-close"
                  onClick={async () => await resultSearch(client, fluxo)}
                  color="primary"
                >
                  Salvar
                </Button>
              )}
            </div>
          </div>
        </ContentDialog>
      </div>
    );
  }
}
